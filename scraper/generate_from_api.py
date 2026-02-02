"""
Generate TypeScript data from Election Commission API JSON data.
Uses the 2082 election data directly from result.election.gov.np
"""

import json
from pathlib import Path
from collections import defaultdict

# Nepali district name -> our district ID mapping
DISTRICT_NEPALI_TO_ID = {
    'ताप्लेजुङ': 'taplejung',
    'पाँचथर': 'panchthar',
    'इलाम': 'ilam',
    'झापा': 'jhapa',
    'संखुवासभा': 'sankhuwasabha',
    'तेह्रथुम': 'terhathum',
    'भोजपुर': 'bhojpur',
    'धनकुटा': 'dhankuta',
    'मोरङ': 'morang',
    'सुनसरी': 'sunsari',
    'सोलुखुम्बु': 'solukhumbu',
    'खोटाङ': 'khotang',
    'ओखलढुंगा': 'okhaldhunga',
    'उदयपुर': 'udayapur',
    'सप्तरी': 'saptari',
    'सिराहा': 'siraha',
    'दोलखा': 'dolakha',
    'रामेछाप': 'ramechhap',
    'सिन्धुली': 'sindhuli',
    'धनुषा': 'dhanusha',
    'महोत्तरी': 'mahottari',
    'सर्लाही': 'sarlahi',
    'रसुवा': 'rasuwa',
    'धादिङ': 'dhading',
    'नुवाकोट': 'nuwakot',
    'काठमाडौं': 'kathmandu',
    'भक्तपुर': 'bhaktapur',
    'ललितपुर': 'lalitpur',
    'काभ्रेपलाञ्चोक': 'kavrepalanchok',
    'सिन्धुपाल्चोक': 'sindhupalchok',
    'मकवानपुर': 'makwanpur',
    'रौतहट': 'rautahat',
    'बारा': 'bara',
    'पर्सा': 'parsa',
    'चितवन': 'chitwan',
    'गोरखा': 'gorkha',
    'मनाङ': 'manang',
    'लमजुङ': 'lamjung',
    'कास्की': 'kaski',
    'तनहुँ': 'tanahu',
    'स्याङजा': 'syangja',
    'गुल्मी': 'gulmi',
    'पाल्पा': 'palpa',
    'अर्घाखाँची': 'arghakhanchi',
    'नवलपरासी (बर्दघाट सुस्ता पूर्व)': 'nawalpur',
    'रूपन्देही': 'rupandehi',
    'कपिलबस्तु': 'kapilvastu',
    'मुस्ताङ': 'mustang',
    'म्याग्दी': 'myagdi',
    'बाग्लुङ': 'baglung',
    'पर्वत': 'parbat',
    'रुकुम (पूर्वी भाग)': 'rukum-east',
    'रोल्पा': 'rolpa',
    'प्यूठान': 'pyuthan',
    'सल्यान': 'salyan',
    'दाङ': 'dang',
    'डोल्पा': 'dolpa',
    'मुगु': 'mugu',
    'जुम्ला': 'jumla',
    'कालिकोट': 'kalikot',
    'हुम्ला': 'humla',
    'जाजरकोट': 'jajarkot',
    'दैलेख': 'dailekh',
    'सुर्खेत': 'surkhet',
    'बाँके': 'banke',
    'बर्दिया': 'bardiya',
    'बाजुरा': 'bajura',
    'अछाम': 'achham',
    'बझाङ': 'bajhang',
    'डोटी': 'doti',
    'कैलाली': 'kailali',
    'दार्चुला': 'darchula',
    'बैतडी': 'baitadi',
    'डडेलधुरा': 'dadeldhura',
    'कञ्चनपुर': 'kanchanpur',
    'नवलपरासी (बर्दघाट सुस्ता पश्चिम)': 'nawalparasi-west',
    'रुकुम (पश्चिम भाग)': 'rukum-west',
}


def main():
    # Load candidate data
    with open('scraper/candidates_2082.json', encoding='utf-8-sig') as f:
        candidates = json.load(f)

    print(f"Loaded {len(candidates)} candidates")

    # Group by district-constituency
    by_key = defaultdict(list)
    unmapped = set()

    for c in candidates:
        district_nepali = c.get('DistrictName', '').strip()
        district_id = DISTRICT_NEPALI_TO_ID.get(district_nepali)

        if not district_id:
            unmapped.add(district_nepali)
            continue

        const_num = c.get('SCConstID', 1)
        key = f"{district_id}-{const_num}"

        votes = c.get('TotalVoteReceived', 0) or 0
        elected = c.get('E_STATUS')
        is_elected = elected is not None and str(elected).strip() != ''

        by_key[key].append({
            'id': str(c.get('CandidateID', '')),
            'name': c.get('CandidateName', ''),
            'party': c.get('PoliticalPartyName', ''),
            'symbol': c.get('SymbolName', ''),
            'age': c.get('AGE_YR', 0) or 0,
            'gender': c.get('Gender', ''),
            'education': c.get('QUALIFICATION', ''),
            'institution': c.get('NAMEOFINST', ''),
            'father': c.get('FATHER_NAME', ''),
            'address': c.get('ADDRESS', ''),
            'votes': votes,
            'elected': is_elected,
            'province': c.get('StateName', ''),
            'district': district_nepali,
            'constituency': const_num,
        })

    if unmapped:
        print(f"Unmapped districts: {unmapped}")

    # Sort candidates within each constituency: elected first, then by votes desc
    for key in by_key:
        by_key[key].sort(key=lambda x: (not x['elected'], -x['votes']))

    # Generate TypeScript
    lines = [
        '// Auto-generated from Election Commission Nepal API',
        '// Source: https://result.election.gov.np/',
        f'// Total candidates: {len(candidates)}',
        f'// Districts: 77, Constituencies: 165',
        '',
        'export interface CandidateData {',
        '  id: string;',
        '  name: string;',
        '  party: string;',
        '  symbol: string;',
        '  age: number;',
        '  gender: string;',
        '  education: string;',
        '  institution: string;',
        '  father: string;',
        '  address: string;',
        '  votes: number;',
        '  elected: boolean;',
        '  province: string;',
        '  district: string;',
        '  constituency: number;',
        '}',
        '',
        '// Candidates indexed by "district-constituency" key',
        'export const CANDIDATES: Record<string, CandidateData[]> = {',
    ]

    for key in sorted(by_key.keys()):
        cands = by_key[key]
        lines.append(f'  "{key}": [')
        for c in cands:
            def esc(s):
                return str(s).replace('\\', '\\\\').replace('"', '\\"')

            lines.append('    {')
            lines.append(f'      id: "{esc(c["id"])}",')
            lines.append(f'      name: "{esc(c["name"])}",')
            lines.append(f'      party: "{esc(c["party"])}",')
            lines.append(f'      symbol: "{esc(c["symbol"])}",')
            lines.append(f'      age: {c["age"]},')
            lines.append(f'      gender: "{esc(c["gender"])}",')
            lines.append(f'      education: "{esc(c["education"])}",')
            lines.append(f'      institution: "{esc(c["institution"])}",')
            lines.append(f'      father: "{esc(c["father"])}",')
            lines.append(f'      address: "{esc(c["address"])}",')
            lines.append(f'      votes: {c["votes"]},')
            lines.append(f'      elected: {"true" if c["elected"] else "false"},')
            lines.append(f'      province: "{esc(c["province"])}",')
            lines.append(f'      district: "{esc(c["district"])}",')
            lines.append(f'      constituency: {c["constituency"]},')
            lines.append('    },')
        lines.append('  ],')

    lines.append('};')
    lines.append('')
    lines.append('export function getCandidates(districtId: string, constituency: number | string): CandidateData[] {')
    lines.append('  const key = `${districtId.toLowerCase()}-${constituency}`;')
    lines.append('  return CANDIDATES[key] || [];')
    lines.append('}')
    lines.append('')
    lines.append('export function getDistrictCandidates(districtId: string): Record<number, CandidateData[]> {')
    lines.append('  const result: Record<number, CandidateData[]> = {};')
    lines.append('  const prefix = `${districtId.toLowerCase()}-`;')
    lines.append('  Object.keys(CANDIDATES).forEach(key => {')
    lines.append('    if (key.startsWith(prefix)) {')
    lines.append('      const constNum = parseInt(key.replace(prefix, ""), 10);')
    lines.append('      if (!isNaN(constNum)) result[constNum] = CANDIDATES[key];')
    lines.append('    }')
    lines.append('  });')
    lines.append('  return result;')
    lines.append('}')
    lines.append('')
    lines.append('export function getConstituencies(districtId: string): number[] {')
    lines.append('  const candidates = getDistrictCandidates(districtId);')
    lines.append('  return Object.keys(candidates).map(Number).sort((a, b) => a - b);')
    lines.append('}')

    output_path = Path('src/data/candidates-scraped.ts')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"\nGenerated {output_path}")
    print(f"Total keys: {len(by_key)}")
    districts = set(k.rsplit('-', 1)[0] for k in by_key)
    print(f"Districts: {len(districts)}")

    # Save stats
    party_counts = defaultdict(int)
    for c in candidates:
        party_counts[c.get('PoliticalPartyName', 'Unknown')] += 1
    stats = {
        'total_candidates': len(candidates),
        'by_party': dict(sorted(party_counts.items(), key=lambda x: -x[1])),
        'districts': len(districts),
        'constituencies': len(by_key),
    }
    with open('scraper/candidate_stats_2082.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"Stats saved to scraper/candidate_stats_2082.json")


if __name__ == '__main__':
    main()
