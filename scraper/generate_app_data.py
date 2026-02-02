"""
Generate TypeScript data files from scraped candidates.json
This will create the data files needed by the Next.js app
"""

import json
from pathlib import Path
from collections import defaultdict

# District name normalization map
DISTRICT_NAME_MAP = {
    'a fake': None,  # Remove invalid
    'calicut': 'kalikot',
    'nawalparasi (east of bardghat susta)': 'nawalpur',
    'nawalparasi west': 'nawalparasi-west',
    'nawalparasi (west of bardghat susta)': 'nawalparasi-west',
    'rukum east': 'rukum-east',
    'rukum west': 'rukum-west',
    'tehrathum': 'terhathum',
}

def normalize_district(district_name):
    """Normalize district name to match map IDs"""
    if not district_name:
        return None

    normalized = district_name.lower().strip()

    # Check for known mappings
    if normalized in DISTRICT_NAME_MAP:
        return DISTRICT_NAME_MAP[normalized]

    # Standard normalization
    return normalized.replace(' ', '-').replace("'", "")


def load_candidates(filename: str = 'candidates.json') -> list:
    """Load processed candidates from JSON"""
    filepath = Path('scraper') / filename
    if not filepath.exists():
        print(f"File not found: {filepath}")
        return []

    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def generate_candidates_ts(candidates: list):
    """Generate TypeScript candidates data file"""

    # Group candidates by district and constituency
    by_district_const = defaultdict(list)

    for candidate in candidates:
        district = normalize_district(candidate.get('district', ''))
        if not district:
            continue

        constituency = candidate.get('constituency', '1')
        if not constituency:
            constituency = '1'

        key = f"{district}-{constituency}"

        by_district_const[key].append({
            'id': candidate.get('id', ''),
            'name': candidate.get('name', ''),
            'name_nepali': candidate.get('name_nepali', ''),
            'party': candidate.get('party', ''),
            'party_nepali': candidate.get('party_nepali', ''),
            'age': int(candidate.get('age', 0)) if str(candidate.get('age', '')).isdigit() else 0,
            'education': candidate.get('education', ''),
            'votes': candidate.get('votes', ''),
            'elected': candidate.get('elected', False),
        })

    # Generate TypeScript
    output_lines = [
        '// Auto-generated from Election Commission data',
        '// Source: https://result.election.gov.np/',
        '// Total candidates: ' + str(len(candidates)),
        '',
        'export interface CandidateData {',
        '  id: string;',
        '  name: string;',
        '  name_nepali: string;',
        '  party: string;',
        '  party_nepali: string;',
        '  age: number;',
        '  education: string;',
        '  votes: string;',
        '  elected: boolean;',
        '}',
        '',
        '// Candidates indexed by "district-constituency" key',
        'export const CANDIDATES: Record<string, CandidateData[]> = {',
    ]

    for key in sorted(by_district_const.keys()):
        candidates_list = by_district_const[key]
        # Sort by votes (elected first, then by vote count)
        candidates_list.sort(key=lambda x: (not x['elected'], -int(x['votes']) if x['votes'].isdigit() else 0))

        output_lines.append(f'  "{key}": [')
        for c in candidates_list:
            name_escaped = c['name'].replace('"', '\\"')
            name_np_escaped = c['name_nepali'].replace('"', '\\"')
            party_escaped = c['party'].replace('"', '\\"')
            party_np_escaped = c['party_nepali'].replace('"', '\\"')
            edu_escaped = c['education'].replace('"', '\\"')

            output_lines.append('    {')
            output_lines.append(f'      id: "{c["id"]}",')
            output_lines.append(f'      name: "{name_escaped}",')
            output_lines.append(f'      name_nepali: "{name_np_escaped}",')
            output_lines.append(f'      party: "{party_escaped}",')
            output_lines.append(f'      party_nepali: "{party_np_escaped}",')
            output_lines.append(f'      age: {c["age"]},')
            output_lines.append(f'      education: "{edu_escaped}",')
            output_lines.append(f'      votes: "{c["votes"]}",')
            output_lines.append(f'      elected: {"true" if c["elected"] else "false"},')
            output_lines.append('    },')
        output_lines.append('  ],')

    output_lines.append('};')
    output_lines.append('')
    output_lines.append('// Helper function to get candidates for a district-constituency')
    output_lines.append('export function getCandidates(districtId: string, constituency: number | string): CandidateData[] {')
    output_lines.append('  const key = `${districtId.toLowerCase()}-${constituency}`;')
    output_lines.append('  return CANDIDATES[key] || [];')
    output_lines.append('}')
    output_lines.append('')
    output_lines.append('// Get all candidates for a district')
    output_lines.append('export function getDistrictCandidates(districtId: string): Record<number, CandidateData[]> {')
    output_lines.append('  const result: Record<number, CandidateData[]> = {};')
    output_lines.append('  const prefix = `${districtId.toLowerCase()}-`;')
    output_lines.append('  ')
    output_lines.append('  Object.keys(CANDIDATES).forEach(key => {')
    output_lines.append('    if (key.startsWith(prefix)) {')
    output_lines.append('      const constNum = parseInt(key.replace(prefix, ""), 10);')
    output_lines.append('      if (!isNaN(constNum)) {')
    output_lines.append('        result[constNum] = CANDIDATES[key];')
    output_lines.append('      }')
    output_lines.append('    }')
    output_lines.append('  });')
    output_lines.append('  ')
    output_lines.append('  return result;')
    output_lines.append('}')
    output_lines.append('')
    output_lines.append('// Get list of constituencies for a district')
    output_lines.append('export function getConstituencies(districtId: string): number[] {')
    output_lines.append('  const candidates = getDistrictCandidates(districtId);')
    output_lines.append('  return Object.keys(candidates).map(Number).sort((a, b) => a - b);')
    output_lines.append('}')

    # Write to file
    output_path = Path('src/data/candidates-scraped.ts')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))

    print(f"Generated {output_path}")
    print(f"Total district-constituency combinations: {len(by_district_const)}")

    # Count unique districts
    districts = set(key.rsplit('-', 1)[0] for key in by_district_const.keys())
    print(f"Total districts: {len(districts)}")


def generate_stats(candidates: list):
    """Generate statistics about the candidates"""

    stats = {
        'total_candidates': len(candidates),
        'by_party': defaultdict(int),
        'by_district': defaultdict(int),
        'elected_count': 0,
    }

    for c in candidates:
        stats['by_party'][c.get('party', 'Unknown')] += 1
        district = normalize_district(c.get('district', ''))
        if district:
            stats['by_district'][district] += 1
        if c.get('elected'):
            stats['elected_count'] += 1

    stats['by_party'] = dict(sorted(stats['by_party'].items(), key=lambda x: -x[1]))
    stats['by_district'] = dict(sorted(stats['by_district'].items(), key=lambda x: -x[1]))

    # Save stats
    stats_path = Path('scraper') / 'candidate_stats.json'
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    print(f"\nStatistics saved to {stats_path}")
    print(f"Total elected: {stats['elected_count']}")


def main():
    print("=" * 60)
    print("Generating App Data from Scraped Candidates")
    print("=" * 60)

    candidates = load_candidates()
    if not candidates:
        print("No candidates found. Run the scraper first.")
        return

    print(f"Loaded {len(candidates)} candidates")
    generate_candidates_ts(candidates)
    generate_stats(candidates)


if __name__ == '__main__':
    main()
