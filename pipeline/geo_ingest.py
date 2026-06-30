"""
geo_ingest.py
-------------
restcountries (GitHub mirror) → facts (geography). Zero auth.

Uses the restcountries v3 dataset published in their open-source GitHub repo
as a static JSON file. The restcountries.com hosted API was deprecated and
now requires a paid API key; the GitHub mirror is functionally identical and
freely available.

One API sweep yields three kinds of game fuel per country:
- population / area      → higher_lower (THE STREAK)
- capital (answer_field) → multiple_choice (THE WEDGES)
- country centroid       → where (THE MAP)

Note: the GitHub mirror omits capitalInfo.latlng; we use the country's own
latlng centroid instead — equally valid for "which country is this?" questions.

API efficiency: restcountries is essentially static data. The response is
cached with ETag/If-Modified-Since, refreshed at most once per week.

Run:
    python geo_ingest.py
    python geo_ingest.py --min-population 5000000

Schedule: daily via etl_daily.yml
"""

from __future__ import annotations

import argparse
import math

from common import CACHE_DIR, console, dump_raw, get_json, get_json_conditional, get_db, make_fact, upsert_facts

# restcountries v3 data published in their open-source GitHub repo — zero auth.
API = "https://raw.githubusercontent.com/restcountries/restcountries/master/src/main/resources/countriesV3.json"
_GEO_CACHE = CACHE_DIR / "restcountries_github_cache.json"

# MediaWiki geosearch — keyless, finds the nearest notable Wikipedia article to
# a coordinate. Used to enrich a capital's bare "X is the capital of Y" fact
# with an actual landmark + Wikipedia prose (forge_where just needs lat/lng on
# any fact, regardless of category, so this flows straight into THE MAP).
WIKI_API = "https://en.wikipedia.org/w/api.php"


def _popularity(population: int) -> float:
    # log-scale population → 0-100 (1B people ≈ 100); mirrors the Deezer proxy
    return min(100.0, math.log10(max(1, population)) / math.log10(1_000_000_000) * 100)


def facts_for_country(c: dict) -> list[dict]:
    name = (c.get("name") or {}).get("common")
    if not name:
        return []
    population = c.get("population") or 0
    area = c.get("area") or 0
    capital = (c.get("capital") or [None])[0]
    # GitHub mirror omits capitalInfo; use country centroid — valid for map questions.
    latlng = c.get("latlng") or []
    # flags is a list [svg_url, png_url] in the GitHub mirror (not a dict).
    flags = c.get("flags") or []
    flag = flags[0] if isinstance(flags, list) else flags.get("svg")
    url = (c.get("maps") or {}).get("openStreetMaps")
    pop_score = _popularity(population)
    region = c.get("region")

    out = [
        make_fact(
            source="restcountries", category="geography", subject=name,
            fact_text=f"{name} has a population of {population:,}.",
            numeric_value=float(population), numeric_unit="population",
            image_url=flag, source_url=url, popularity=pop_score,
            meta={"region": region},  # region kept for Ladder distance fn
        ),
        make_fact(
            source="restcountries", category="geography", subject=name,
            fact_text=f"{name} covers {int(area):,} km².",
            numeric_value=float(area), numeric_unit="area (km²)",
            image_url=flag, source_url=url, popularity=pop_score,
            meta={"region": region},
        ),
    ]
    if capital and len(latlng) == 2:
        out.append(
            make_fact(
                source="restcountries", category="geography", subject=name,
                fact_text=f"{capital} is the capital of {name}.",
                lat=float(latlng[0]), lng=float(latlng[1]),
                image_url=flag, source_url=url, popularity=pop_score,
                meta={"answer_field": "capital", "answer": capital, "region": region},
            )
        )
    return out


def wiki_landmark_fact(near: str, lat: float, lng: float) -> dict | None:
    """Nearest notable Wikipedia article to a coordinate, as a richer `where`
    fact: real prose + the landmark's own (more precise) coordinates, instead
    of the bare "X is the capital of Y" line. Returns None on any miss — the
    capital fact from facts_for_country() already covers the country, so a
    landmark is a bonus, never a requirement."""
    try:
        geo = get_json(WIKI_API, params={
            "action": "query", "format": "json", "list": "geosearch",
            "gscoord": f"{lat}|{lng}", "gsradius": "10000", "gslimit": "1",
        })
        hits = geo.get("query", {}).get("geosearch", [])
        if not hits:
            return None
        hit = hits[0]
        title = hit["title"]
        page = get_json(WIKI_API, params={
            "action": "query", "format": "json", "titles": title,
            "prop": "extracts|pageimages", "exintro": True, "explaintext": True,
            "piprop": "thumbnail", "pithumbsize": "300",
        })
    except Exception as e:
        console.print(f"[dim]wiki landmark miss near {near}: {type(e).__name__}[/dim]")
        return None

    pages = page.get("query", {}).get("pages", {})
    if not pages:
        return None
    p = next(iter(pages.values()))
    extract = (p.get("extract") or "").strip()
    if len(extract) < 40:
        return None
    return make_fact(
        source="wikipedia", category="geography", subject=title,
        fact_text=extract.split(". ")[0] + ".",
        lat=hit.get("lat", lat), lng=hit.get("lon", lng),
        image_url=(p.get("thumbnail") or {}).get("source"),
        source_url=f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}",
        popularity=50.0,
        meta={"answer_field": "landmark", "answer": title, "near": near},
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-population", type=int, default=1_000_000,
                    help="skip microstates below this population (distractor quality)")
    ap.add_argument("--wiki-landmarks", type=int, default=15,
                    help="number of capitals to enrich with a Wikipedia landmark "
                         "fact (0 disables; capped to keep the geosearch sweep cheap)")
    args = ap.parse_args()

    console.rule("[bold]Geography ingest — restcountries (GitHub mirror)")
    countries = get_json_conditional(
        API,
        cache_path=_GEO_CACHE,
        max_age_seconds=7 * 86400,  # static dataset; weekly refresh is plenty
    )

    if not isinstance(countries, list):
        raise RuntimeError(
            f"Expected a list of country objects but got {type(countries).__name__}. "
            "Check that the API URL is still valid and returning the correct response."
        )

    facts: list[dict] = []
    capitals: list[tuple[str, float, float, int]] = []  # name, lat, lng, population
    for c in countries:
        population = c.get("population") or 0
        if population < args.min_population:
            continue
        try:
            facts.extend(facts_for_country(c))
        except Exception as e:
            console.print(f"[yellow]skip {(c.get('name') or {}).get('common')}: {e}[/yellow]")
            continue
        latlng = c.get("latlng") or []
        capital = (c.get("capital") or [None])[0]
        if capital and len(latlng) == 2:
            capitals.append((capital, float(latlng[0]), float(latlng[1]), population))

    if args.wiki_landmarks:
        console.rule(f"[bold]Wikipedia landmark enrichment — top {args.wiki_landmarks} capitals")
        capitals.sort(key=lambda t: t[3], reverse=True)
        for capital, lat, lng, _pop in capitals[: args.wiki_landmarks]:
            fact = wiki_landmark_fact(capital, lat, lng)
            if fact:
                facts.append(fact)

    dump_raw("geography", facts)
    n = upsert_facts(get_db(), facts)
    console.print(f"[green]✓ {len(facts)} facts collected, {n} upserted[/green]")


if __name__ == "__main__":
    main()
