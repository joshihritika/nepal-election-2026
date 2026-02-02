"""
Enrich candidate data using Claude API (Haiku).
Generates summaries, achievements, controversies, and election history in Nepali.
"""

import json
import time
import os
from pathlib import Path

import anthropic

TOP_PARTIES = [
    "नेपाली काँग्रेस",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)",
    "राष्ट्रिय स्वतन्त्र पार्टी",
    "नेपाली कम्युनिष्ट पार्टी",
    "राष्ट्रिय प्रजातन्त्र पार्टी",
    "नेकपा (एकीकृत समाजवादी)",
]

PROMPT_TEMPLATE = """You are a Nepal politics expert. Given a candidate from Nepal's 2082 BS election, provide enrichment data in Nepali (Devanagari script).

Candidate:
- Name: {name}
- Party: {party}
- District: {district}, Constituency: {constituency}
- Province: {province}
- Age: {age}
- Education: {education}
- Elected: {elected}

Respond with valid JSON only (no markdown, no explanation). Use this exact structure:
{{
  "summary": "1-2 sentence bio in Nepali",
  "achievements": ["achievement 1 in Nepali", "achievement 2"],
  "controversies": ["controversy 1 in Nepali"],
  "electionHistory": [
    {{
      "year": "२०७९",
      "district": "district name in Nepali",
      "constituency": "constituency in Nepali",
      "party": "party name in Nepali",
      "result": "विजयी or पराजित"
    }}
  ],
  "firstTimeCandidate": true or false
}}

Rules:
- All text must be in Nepali (Devanagari)
- Only include verified, well-known facts. If unsure, use empty arrays.
- For lesser-known candidates, keep summary brief and use empty arrays for achievements/controversies/electionHistory.
- electionHistory should only include past elections (before 2082), not the current one.
- Years should be in Bikram Sambat (e.g. २०७९, २०७४, २०७०)
"""


def filter_candidates(candidates: list[dict]) -> list[dict]:
    """Filter to elected candidates + candidates from top 6 parties."""
    filtered = []
    seen_ids = set()
    for c in candidates:
        cid = str(c.get("CandidateID", ""))
        if cid in seen_ids:
            continue
        is_elected = c.get("E_STATUS") is not None and str(c.get("E_STATUS", "")).strip() != ""
        is_top_party = c.get("PoliticalPartyName", "") in TOP_PARTIES
        if is_elected or is_top_party:
            seen_ids.add(cid)
            filtered.append(c)
    return filtered


def enrich_candidate(client: anthropic.Anthropic, c: dict) -> dict | None:
    """Call Claude API to get enrichment for a single candidate."""
    prompt = PROMPT_TEMPLATE.format(
        name=c.get("CandidateName", ""),
        party=c.get("PoliticalPartyName", ""),
        district=c.get("DistrictName", ""),
        constituency=c.get("SCConstID", ""),
        province=c.get("StateName", ""),
        age=c.get("AGE_YR", ""),
        education=c.get("QUALIFICATION", ""),
        elected="Yes" if (c.get("E_STATUS") is not None and str(c.get("E_STATUS", "")).strip() != "") else "No",
    )

    try:
        response = client.messages.create(
            model="claude-haiku-4-20250414",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        # Parse JSON from response
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        data = json.loads(text)
        data["id"] = str(c.get("CandidateID", ""))
        return data
    except (json.JSONDecodeError, Exception) as e:
        print(f"  Error for {c.get('CandidateName', '?')}: {e}")
        return None


def main():
    output_path = Path("scraper/candidate_enrichments.json")

    # Load existing progress
    existing = {}
    if output_path.exists():
        with open(output_path, encoding="utf-8") as f:
            for item in json.load(f):
                existing[item["id"]] = item
        print(f"Loaded {len(existing)} existing enrichments")

    # Load candidates
    with open("scraper/candidates_2082.json", encoding="utf-8-sig") as f:
        candidates = json.load(f)

    filtered = filter_candidates(candidates)
    print(f"Total candidates: {len(candidates)}, Filtered: {len(filtered)}")

    # Skip already enriched
    to_process = [c for c in filtered if str(c.get("CandidateID", "")) not in existing]
    print(f"Remaining to process: {len(to_process)}")

    if not to_process:
        print("All candidates already enriched.")
        return

    client = anthropic.Anthropic()
    enrichments = list(existing.values())

    BATCH_SIZE = 10
    for i in range(0, len(to_process), BATCH_SIZE):
        batch = to_process[i : i + BATCH_SIZE]
        print(f"\nBatch {i // BATCH_SIZE + 1} ({i+1}-{min(i+BATCH_SIZE, len(to_process))} of {len(to_process)})")

        for c in batch:
            name = c.get("CandidateName", "?")
            print(f"  Enriching: {name}...", end=" ", flush=True)
            result = enrich_candidate(client, c)
            if result:
                enrichments.append(result)
                existing[result["id"]] = result
                print("OK")
            else:
                print("FAILED")

        # Save progress after each batch
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(enrichments, f, ensure_ascii=False, indent=2)
        print(f"  Saved {len(enrichments)} enrichments")

        # Rate limit pause between batches
        if i + BATCH_SIZE < len(to_process):
            time.sleep(1)

    print(f"\nDone. Total enrichments: {len(enrichments)}")


if __name__ == "__main__":
    main()
