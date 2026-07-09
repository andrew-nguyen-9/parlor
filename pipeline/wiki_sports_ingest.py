"""
wiki_sports_ingest.py
---------------------
Wikipedia REST summaries for WELL-KNOWN sports subjects (famous franchises,
champions, records, star athletes across NFL/NBA/MLB/soccer/Olympics) → facts.

Replaces the retired fantasy-adds ingest (Sleeper/ESPN). Difficulty target is
BROADLY KNOWN: these are household-name subjects, so high popularity lands their
facts in the EASY band (difficulty = popularity percentile in question_forge).

Scrape FACTS only, each with `source_url` provenance (CLAUDE.md: never store
questions without a fact trail); the forge is the sole question-maker. Appends
to the committed bronze layer (data/raw/sports.jsonl) like every ingest.

Run:
    python wiki_sports_ingest.py
    python wiki_sports_ingest.py --limit 10     # cap subjects (dev)

Schedule: daily via etl_daily.yml
"""

from __future__ import annotations

import argparse
import urllib.parse

from common import console, dump_raw, get_db, get_json, make_fact, upsert_facts

API = "https://en.wikipedia.org/api/rest_v1"

# Household-name sports subjects — franchises + athletes across the major leagues
# and the Olympics. Deliberately famous so the forged questions read as EASY.
SUBJECTS: list[str] = [
    # NFL franchises
    "Dallas Cowboys", "New England Patriots", "Green Bay Packers", "Pittsburgh Steelers",
    # NBA franchises
    "Los Angeles Lakers", "Boston Celtics", "Chicago Bulls", "Golden State Warriors",
    # MLB franchises
    "New York Yankees", "Boston Red Sox", "Los Angeles Dodgers",
    # Soccer clubs
    "Real Madrid CF", "FC Barcelona", "Manchester United F.C.",
    # Star athletes
    "Michael Jordan", "LeBron James", "Tom Brady", "Lionel Messi", "Cristiano Ronaldo",
    "Serena Williams", "Usain Bolt", "Muhammad Ali", "Babe Ruth", "Wayne Gretzky",
    # Olympians
    "Michael Phelps", "Simone Biles",
]


def fetch_summary_facts(subjects: list[str]) -> list[dict]:
    """One fact per subject from its Wikipedia summary — the lead sentence, which
    forge_clues masks into a BOARD clue (subject = answer). Facts only."""
    facts = []
    for title in subjects:
        slug = urllib.parse.quote(title.replace(" ", "_"), safe="")
        try:
            s = get_json(f"{API}/page/summary/{slug}")
        except Exception as e:  # one flaky title must not kill the sweep
            console.print(f"[yellow]sports summary miss '{title}': {type(e).__name__}[/yellow]")
            continue
        extract = (s.get("extract") or "").strip()
        if len(extract) < 60 or s.get("type") != "standard":
            continue
        facts.append(
            make_fact(
                source="wikipedia",
                category="sports",
                subject=(s.get("title") or title).replace("_", " "),
                fact_text=extract.split(". ")[0] + ".",
                image_url=(s.get("thumbnail") or {}).get("source"),
                source_url=(s.get("content_urls", {}).get("desktop", {}) or {}).get("page")
                or f"https://en.wikipedia.org/wiki/{slug}",
                popularity=88.0,  # broadly known ⇒ easy difficulty band
                meta={"sport_topic": True},
            )
        )
    return facts


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="cap subjects (0 = all)")
    args = ap.parse_args()

    subjects = SUBJECTS[: args.limit] if args.limit else SUBJECTS
    console.rule(f"[bold]Wikipedia sports ingest — {len(subjects)} well-known subjects")
    facts = fetch_summary_facts(subjects)
    dump_raw("sports", facts)
    n = upsert_facts(get_db(), facts)
    console.print(f"[green]✓ {len(facts)} facts collected, {n} upserted[/green]")


if __name__ == "__main__":
    main()
