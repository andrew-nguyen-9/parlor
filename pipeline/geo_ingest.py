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

from common import CACHE_DIR, console, dump_raw, get_json_conditional, get_db, make_fact, upsert_facts

# restcountries v3 data published in their open-source GitHub repo — zero auth.
API = "https://raw.githubusercontent.com/restcountries/restcountries/master/src/main/resources/countriesV3.json"
_GEO_CACHE = CACHE_DIR / "restcountries_github_cache.json"


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


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-population", type=int, default=1_000_000,
                    help="skip microstates below this population (distractor quality)")
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
    for c in countries:
        if (c.get("population") or 0) < args.min_population:
            continue
        try:
            facts.extend(facts_for_country(c))
        except Exception as e:
            console.print(f"[yellow]skip {(c.get('name') or {}).get('common')}: {e}[/yellow]")

    dump_raw("geography", facts)
    n = upsert_facts(get_db(), facts)
    console.print(f"[green]✓ {len(facts)} facts collected, {n} upserted[/green]")


if __name__ == "__main__":
    main()
