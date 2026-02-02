"""
Translate candidate data from Nepali to English
Uses Google Translate API (free tier via googletrans)
"""

import json
import time
from pathlib import Path
from typing import Optional

try:
    from googletrans import Translator
    HAS_GOOGLETRANS = True
except ImportError:
    HAS_GOOGLETRANS = False
    print("googletrans not installed. Install with: pip install googletrans==4.0.0-rc1")

# Known translations for common terms (to reduce API calls)
KNOWN_TRANSLATIONS = {
    # Parties
    'नेपाली कांग्रेस': 'Nepali Congress',
    'नेकपा एमाले': 'CPN-UML',
    'नेकपा (एकीकृत समाजवादी)': 'CPN (Unified Socialist)',
    'नेकपा माओवादी केन्द्र': 'CPN (Maoist Centre)',
    'राष्ट्रिय स्वतन्त्र पार्टी': 'Rastriya Swatantra Party',
    'राष्ट्रिय प्रजातन्त्र पार्टी': 'Rastriya Prajatantra Party',
    'जनता समाजवादी पार्टी': 'Janata Samajwadi Party',
    'लोकतान्त्रिक समाजवादी पार्टी': 'Loktantrik Samajwadi Party',
    'नेपाल मजदुर किसान पार्टी': 'Nepal Workers Peasants Party',
    'स्वतन्त्र': 'Independent',

    # Districts (all 77)
    'झापा': 'Jhapa',
    'मोरङ': 'Morang',
    'सुनसरी': 'Sunsari',
    'धनकुटा': 'Dhankuta',
    'तेह्रथुम': 'Terhathum',
    'संखुवासभा': 'Sankhuwasabha',
    'भोजपुर': 'Bhojpur',
    'सोलुखुम्बु': 'Solukhumbu',
    'ओखलढुङ्गा': 'Okhaldhunga',
    'खोटाङ': 'Khotang',
    'उदयपुर': 'Udayapur',
    'सप्तरी': 'Saptari',
    'सिराहा': 'Siraha',
    'धनुषा': 'Dhanusha',
    'महोत्तरी': 'Mahottari',
    'सर्लाही': 'Sarlahi',
    'रौतहट': 'Rautahat',
    'बारा': 'Bara',
    'पर्सा': 'Parsa',
    'सिन्धुपाल्चोक': 'Sindhupalchok',
    'दोलखा': 'Dolakha',
    'रसुवा': 'Rasuwa',
    'नुवाकोट': 'Nuwakot',
    'काठमाडौं': 'Kathmandu',
    'भक्तपुर': 'Bhaktapur',
    'ललितपुर': 'Lalitpur',
    'काभ्रेपलाञ्चोक': 'Kavrepalanchok',
    'रामेछाप': 'Ramechhap',
    'सिन्धुली': 'Sindhuli',
    'मकवानपुर': 'Makwanpur',
    'चितवन': 'Chitwan',
    'मुस्ताङ': 'Mustang',
    'मनाङ': 'Manang',
    'गोरखा': 'Gorkha',
    'लमजुङ': 'Lamjung',
    'कास्की': 'Kaski',
    'तनहुँ': 'Tanahu',
    'म्याग्दी': 'Myagdi',
    'बागलुङ': 'Baglung',
    'पर्वत': 'Parbat',
    'स्याङ्जा': 'Syangja',
    'नवलपुर': 'Nawalpur',
    'रुकुम पूर्व': 'Rukum East',
    'रोल्पा': 'Rolpa',
    'प्युठान': 'Pyuthan',
    'गुल्मी': 'Gulmi',
    'अर्घाखाँची': 'Arghakhanchi',
    'पाल्पा': 'Palpa',
    'रुपन्देही': 'Rupandehi',
    'कपिलवस्तु': 'Kapilvastu',
    'नवलपरासी (बर्दघाट सुस्ता पश्चिम)': 'Nawalparasi West',
    'दाङ': 'Dang',
    'बाँके': 'Banke',
    'बर्दिया': 'Bardiya',
    'हुम्ला': 'Humla',
    'मुगु': 'Mugu',
    'डोल्पा': 'Dolpa',
    'जुम्ला': 'Jumla',
    'कालीकोट': 'Kalikot',
    'दैलेख': 'Dailekh',
    'जाजरकोट': 'Jajarkot',
    'रुकुम पश्चिम': 'Rukum West',
    'सल्यान': 'Salyan',
    'सुर्खेत': 'Surkhet',
    'दार्चुला': 'Darchula',
    'बझाङ': 'Bajhang',
    'बाजुरा': 'Bajura',
    'बैतडी': 'Baitadi',
    'डडेलधुरा': 'Dadeldhura',
    'डोटी': 'Doti',
    'अछाम': 'Achham',
    'कैलाली': 'Kailali',
    'कञ्चनपुर': 'Kanchanpur',
    'ताप्लेजुङ': 'Taplejung',
    'पाँचथर': 'Panchthar',
    'इलाम': 'Ilam',

    # Education levels
    'स्नातक': 'Bachelor\'s Degree',
    'स्नातकोत्तर': 'Master\'s Degree',
    'विद्यावारिधि': 'PhD',
    'एसएलसी': 'SLC',
    'प्लस टु': 'Plus Two',
    '+२': 'Plus Two',
    'साक्षर': 'Literate',
    'निरक्षर': 'Illiterate',
}


def translate_with_cache(text: str, translator: Optional['Translator'], cache: dict) -> str:
    """Translate text using cache first, then API"""
    if not text:
        return ""

    text = text.strip()

    # Check known translations first
    if text in KNOWN_TRANSLATIONS:
        return KNOWN_TRANSLATIONS[text]

    # Check cache
    if text in cache:
        return cache[text]

    # Use Google Translate
    if translator and HAS_GOOGLETRANS:
        try:
            result = translator.translate(text, src='ne', dest='en')
            translated = result.text
            cache[text] = translated
            time.sleep(0.5)  # Rate limiting
            return translated
        except Exception as e:
            print(f"Translation error for '{text[:30]}...': {e}")
            return text

    return text


def transliterate_name(nepali_name: str) -> str:
    """
    Basic transliteration of Nepali names to Roman script
    This is a simplified version - for production, use a proper library
    """
    # Common Nepali character to Roman mappings
    char_map = {
        'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
        'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah',
        'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
        'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
        'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
        'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
        'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
        'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'wa', 'श': 'sha',
        'ष': 'sha', 'स': 'sa', 'ह': 'ha', 'क्ष': 'ksha', 'त्र': 'tra',
        'ज्ञ': 'gya',
        # Vowel marks
        'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
        'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
        '्': '', 'ं': 'm', 'ः': 'h', 'ँ': 'n',
        ' ': ' ', '.': '.', ',': ','
    }

    result = []
    i = 0
    while i < len(nepali_name):
        char = nepali_name[i]
        if char in char_map:
            result.append(char_map[char])
        else:
            result.append(char)
        i += 1

    return ''.join(result).title()


def process_candidates(input_file: str = 'candidates_raw.json', output_file: str = 'candidates.json'):
    """Process and translate candidate data"""

    input_path = Path('scraper') / input_file
    output_path = Path('scraper') / output_file

    if not input_path.exists():
        print(f"Input file not found: {input_path}")
        return

    with open(input_path, 'r', encoding='utf-8') as f:
        candidates = json.load(f)

    print(f"Processing {len(candidates)} candidates...")

    translator = Translator() if HAS_GOOGLETRANS else None
    translation_cache = {}

    processed = []
    for i, candidate in enumerate(candidates):
        if i % 100 == 0:
            print(f"Processing candidate {i + 1}/{len(candidates)}...")

        processed_candidate = {
            'id': f"candidate-{i + 1}",
            'name': transliterate_name(candidate.get('name_nepali', '')),
            'name_nepali': candidate.get('name_nepali', ''),
            'party': translate_with_cache(candidate.get('party_nepali', ''), translator, translation_cache),
            'party_nepali': candidate.get('party_nepali', ''),
            'district': translate_with_cache(candidate.get('district_nepali', ''), translator, translation_cache),
            'district_nepali': candidate.get('district_nepali', ''),
            'constituency': candidate.get('constituency', ''),
            'age': candidate.get('age', ''),
            'education': translate_with_cache(candidate.get('education_nepali', ''), translator, translation_cache),
            'education_nepali': candidate.get('education_nepali', ''),
        }

        processed.append(processed_candidate)

    # Save processed data
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(processed)} processed candidates to {output_path}")

    # Also save translation cache for future use
    cache_path = Path('scraper') / 'translation_cache.json'
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(translation_cache, f, ensure_ascii=False, indent=2)
    print(f"Saved translation cache to {cache_path}")


if __name__ == '__main__':
    process_candidates()
