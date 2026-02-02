"""
Generate TypeScript enrichment data from candidate_enrichments.json.
Output: src/data/candidate-enrichments.ts
"""

import json
from pathlib import Path


def esc(s: str) -> str:
    """Escape string for TypeScript."""
    return str(s).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def main():
    with open("scraper/candidate_enrichments.json", encoding="utf-8") as f:
        enrichments = json.load(f)

    print(f"Loaded {len(enrichments)} enrichments")

    lines = [
        "// Auto-generated candidate enrichment data",
        "// Source: Claude API enrichment of Election Commission 2082 data",
        f"// Total enriched candidates: {len(enrichments)}",
        "",
        "export interface ElectionHistoryEntry {",
        '  year: string;',
        '  district: string;',
        '  constituency: string;',
        '  party: string;',
        '  result: string;',
        "}",
        "",
        "export interface CandidateEnrichment {",
        "  id: string;",
        "  summary: string;",
        "  achievements: string[];",
        "  controversies: string[];",
        "  electionHistory: ElectionHistoryEntry[];",
        "  firstTimeCandidate: boolean;",
        "}",
        "",
        "const ENRICHMENTS: Record<string, CandidateEnrichment> = {",
    ]

    for e in enrichments:
        cid = esc(e.get("id", ""))
        summary = esc(e.get("summary", ""))
        achievements = e.get("achievements", [])
        controversies = e.get("controversies", [])
        history = e.get("electionHistory", [])
        first_time = "true" if e.get("firstTimeCandidate", False) else "false"

        lines.append(f'  "{cid}": {{')
        lines.append(f'    id: "{cid}",')
        lines.append(f'    summary: "{summary}",')

        # achievements
        lines.append("    achievements: [")
        for a in achievements:
            lines.append(f'      "{esc(a)}",')
        lines.append("    ],")

        # controversies
        lines.append("    controversies: [")
        for c in controversies:
            lines.append(f'      "{esc(c)}",')
        lines.append("    ],")

        # electionHistory
        lines.append("    electionHistory: [")
        for h in history:
            lines.append("      {")
            lines.append(f'        year: "{esc(h.get("year", ""))}",')
            lines.append(f'        district: "{esc(h.get("district", ""))}",')
            lines.append(f'        constituency: "{esc(h.get("constituency", ""))}",')
            lines.append(f'        party: "{esc(h.get("party", ""))}",')
            lines.append(f'        result: "{esc(h.get("result", ""))}",')
            lines.append("      },")
        lines.append("    ],")

        lines.append(f"    firstTimeCandidate: {first_time},")
        lines.append("  },")

    lines.append("};")
    lines.append("")
    lines.append("export function getEnrichment(id: string): CandidateEnrichment | undefined {")
    lines.append("  return ENRICHMENTS[id];")
    lines.append("}")
    lines.append("")

    output_path = Path("src/data/candidate-enrichments.ts")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Generated {output_path} ({len(enrichments)} entries)")


if __name__ == "__main__":
    main()
