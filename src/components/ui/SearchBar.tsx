"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { districts } from "@/data/districts";
import { CANDIDATES, CandidateData } from "@/data/candidates-scraped";
import { getSlugFromId } from "@/lib/slug";

interface SearchResult {
  type: "district" | "candidate";
  id: string;
  name: string;
  subtitle: string;
  districtId: string;
  constituencyNum?: number;
}

// Roman to Devanagari phonetic map for Nepali transliteration
const TRANSLITERATION: [string, string][] = [
  // Multi-char combos first (order matters)
  ["shree", "श्री"], ["shr", "श्र"],
  ["ksh", "क्ष"], ["tra", "त्र"], ["gya", "ज्ञ"],
  ["chh", "छ"], ["dhh", "ढ"],
  ["kha", "खा"], ["khe", "खे"], ["khi", "खि"], ["kho", "खो"], ["khu", "खु"],
  ["gha", "घा"], ["ghe", "घे"], ["ghi", "घि"], ["gho", "घो"], ["ghu", "घु"],
  ["cha", "चा"], ["che", "चे"], ["chi", "चि"], ["cho", "चो"], ["chu", "चु"],
  ["jha", "झा"], ["jhe", "झे"], ["jhi", "झि"], ["jho", "झो"], ["jhu", "झु"],
  ["tha", "था"], ["the", "थे"], ["thi", "थि"], ["tho", "थो"], ["thu", "थु"],
  ["dha", "धा"], ["dhe", "धे"], ["dhi", "धि"], ["dho", "धो"], ["dhu", "धु"],
  ["pha", "फा"], ["phe", "फे"], ["phi", "फि"], ["pho", "फो"], ["phu", "फु"],
  ["bha", "भा"], ["bhe", "भे"], ["bhi", "भि"], ["bho", "भो"], ["bhu", "भु"],
  ["sha", "शा"], ["she", "शे"], ["shi", "शि"], ["sho", "शो"], ["shu", "शु"],
  ["sh", "श"],
  ["kh", "ख"], ["gh", "घ"], ["ch", "च"], ["jh", "झ"],
  ["th", "थ"], ["dh", "ध"], ["ph", "फ"], ["bh", "भ"],
  ["ka", "का"], ["ke", "के"], ["ki", "कि"], ["ko", "को"], ["ku", "कु"],
  ["ga", "गा"], ["ge", "गे"], ["gi", "गि"], ["go", "गो"], ["gu", "गु"],
  ["ja", "जा"], ["je", "जे"], ["ji", "जि"], ["jo", "जो"], ["ju", "जु"],
  ["ta", "ता"], ["te", "ते"], ["ti", "ति"], ["to", "तो"], ["tu", "तु"],
  ["da", "दा"], ["de", "दे"], ["di", "दि"], ["do", "दो"], ["du", "दु"],
  ["na", "ना"], ["ne", "ने"], ["ni", "नि"], ["no", "नो"], ["nu", "नु"],
  ["pa", "पा"], ["pe", "पे"], ["pi", "पि"], ["po", "पो"], ["pu", "पु"],
  ["ba", "बा"], ["be", "बे"], ["bi", "बि"], ["bo", "बो"], ["bu", "बु"],
  ["ma", "मा"], ["me", "मे"], ["mi", "मि"], ["mo", "मो"], ["mu", "मु"],
  ["ya", "या"], ["ye", "ये"], ["yi", "यि"], ["yo", "यो"], ["yu", "यु"],
  ["ra", "रा"], ["re", "रे"], ["ri", "रि"], ["ro", "रो"], ["ru", "रु"],
  ["la", "ला"], ["le", "ले"], ["li", "लि"], ["lo", "लो"], ["lu", "लु"],
  ["wa", "वा"], ["we", "वे"], ["wi", "वि"], ["wo", "वो"], ["wu", "वु"],
  ["sa", "सा"], ["se", "से"], ["si", "सि"], ["so", "सो"], ["su", "सु"],
  ["ha", "हा"], ["he", "हे"], ["hi", "हि"], ["ho", "हो"], ["hu", "हु"],
  ["k", "क"], ["g", "ग"], ["j", "ज"], ["t", "त"], ["d", "द"],
  ["n", "न"], ["p", "प"], ["b", "ब"], ["m", "म"], ["y", "य"],
  ["r", "र"], ["l", "ल"], ["w", "व"], ["s", "स"], ["h", "ह"],
  ["a", "अ"], ["e", "ए"], ["i", "इ"], ["o", "ओ"], ["u", "उ"],
];

// Well-known English-to-Nepali name mappings for popular figures
const NAME_ALIASES: Record<string, string[]> = {
  // Key political figures - full names and variations (matching actual data)
  "kp": ["के.पी", "केपी", "के पी"],
  "kp oli": ["के.पी शर्मा ओली", "केपी शर्मा ओली", "के.पी. शर्मा ओली", "ओली"],
  "kp sharma oli": ["के.पी शर्मा ओली", "केपी शर्मा ओली", "के.पी. शर्मा ओली"],
  "kp sharma": ["के.पी शर्मा", "केपी शर्मा"],
  "oli": ["ओली"],
  "deuba": ["देउवा"],
  "sher bahadur deuba": ["शेरबहादुर देउवा", "शेर बहादुर देउवा"],
  "sher bahadur": ["शेरबहादुर", "शेर बहादुर"],
  "prachanda": ["प्रचण्ड", "प्रचन्ड", "पुष्प कमल दाहाल", "पुष्प कमल दाहाल प्रचण्ड"],
  "pushpa": ["पुष्प"],
  "pushpa kamal": ["पुष्प कमल"],
  "pushpa kamal dahal": ["पुष्प कमल दाहाल", "पुष्प कमल दाहाल प्रचण्ड"],
  "pushpa kamal dahal prachanda": ["पुष्प कमल दाहाल प्रचण्ड"],
  "balen": ["बालेन"],
  "balen shah": ["बालेन शाह"],
  "rabi lamichhane": ["रवि लामिछाने", "रबि लामिछाने"],
  "rabi": ["रवि", "रवी", "रबि"],
  "lamichhane": ["लामिछाने"],
  "gagan": ["गगन"],
  "gagan thapa": ["गगन थापा", "गगन कुमार थापा"],
  "gagan kumar thapa": ["गगन कुमार थापा"],
  "thapa": ["थापा"],
  "ghising": ["घिसिङ", "घिसिं"],
  "kulman": ["कुलमान"],
  "kulman ghising": ["कुलमान घिसिङ"],
  "baburam": ["बाबुराम"],
  "baburam bhattarai": ["बाबुराम भट्टराई"],
  "bhattarai": ["भट्टराई"],
  "madhav": ["माधव"],
  "madhav nepal": ["माधव कुमार नेपाल", "माधव नेपाल"],
  "nepal": ["नेपाल"],
  "jhalanath": ["झलनाथ"],
  "jhalanath khanal": ["झलनाथ खनाल"],
  "khanal": ["खनाल"],
  "kamal": ["कमल"],
  "renu": ["रेणु"],
  "renu dahal": ["रेणु दाहाल"],
  "upendra": ["उपेन्द्र"],
  "upendra yadav": ["उपेन्द्र यादव"],
  "yadav": ["यादव"],
  "bishnu": ["विष्णु"],
  "bishnu poudel": ["विष्णु पौडेल"],
  "poudel": ["पौडेल", "पौडल"],
  "paudel": ["पौडेल", "पौडल"],
  "ram chandra": ["रामचन्द्र", "राम चन्द्र"],
  "ram chandra poudel": ["रामचन्द्र पौडेल"],
  "ranju": ["रन्जु", "रञ्जु"],
  "ranju darshan": ["रन्जु दर्शना"],
  "rabindra": ["रवीन्द्र", "रविन्द्र"],
  "rabindra mishra": ["रवीन्द्र मिश्र"],
  "mishra": ["मिश्र"],
  "amresh": ["अमरेश"],
  "amresh singh": ["अमरेश कुमार सिंह"],
  "harka": ["हर्क"],
  "harka rai": ["हर्क राज राई"],

  // Common surnames/last names (top 50 most common)
  "shah": ["शाह"],
  "shahi": ["शाही"],
  "singh": ["सिंह", "सिँह", "सिह"],
  "sharma": ["शर्मा"],
  "kc": ["केसी", "के.सी"],
  "khadka": ["खड्का"],
  "gurung": ["गुरुङ", "गुरुं", "गुरुङ्ग"],
  "tamang": ["तामाङ", "तामांग", "तामाङ्ग"],
  "rai": ["राई", "राय"],
  "ray": ["राय", "राई"],
  "limbu": ["लिम्बु", "लिम्बू"],
  "magar": ["मगर"],
  "shrestha": ["श्रेष्ठ", "श्रेष्‍ठ"],
  "sah": ["साह"],
  "mahato": ["महतो"],
  "maharjan": ["महर्जन"],
  "pradhan": ["प्रधान"],
  "joshi": ["जोशी"],
  "dharmananda": ["धर्मानन्द"],
  "dharmananda joshi": ["धर्मानन्द जोशी"],
  "adhikari": ["अधिकारी"],
  "pokharel": ["पोखरेल"],
  "pokhrel": ["पोखरेल"],
  "koirala": ["कोइराला"],
  "rijal": ["रिजाल"],
  "basnet": ["बस्नेत"],
  "karki": ["कार्की"],
  "chaudhary": ["चौधरी"],
  "chaudhari": ["चौधरी"],
  "choudhary": ["चौधरी"],
  "mandal": ["मण्डल", "मंडल"],
  "lama": ["लामा"],
  "sherpa": ["शेर्पा"],
  "tharu": ["थारु"],
  "budha": ["बुढा"],
  "buda": ["बुढा"],
  "pun": ["पुन"],
  "bhandari": ["भण्डारी", "भंडारी"],
  "pandey": ["पाण्डे", "पाण्डेय"],
  "pandit": ["पण्डित"],
  "regmi": ["रेग्मी"],
  "bhusal": ["भुसाल"],
  "acharya": ["आचार्य"],
  "subedi": ["सुवेदी"],
  "khatri": ["खत्री"],
  "neupane": ["न्यौपाने", "न्युपाने"],
  "nyaupane": ["न्यौपाने"],
  "gautam": ["गौतम"],
  "ghimire": ["घिमिरे"],
  "sapkota": ["सापकोटा"],
  "agni": ["अग्नि"],
  "kharel": ["खरेल"],
  "dhakal": ["ढकाल"],
  "thakur": ["ठाकुर"],
  "rana": ["राना"],
  "bhatt": ["भट्ट"],
  "jha": ["झा"],
  "kushwaha": ["कुशवाहा"],
  "sunar": ["सुनार"],
  "rajbanshi": ["राजवंशी"],
  "nepali": ["नेपाली"],
  "ansari": ["अंसारी", "अन्सारी"],
  "mahara": ["महरा"],
  "paswan": ["पासवान"],
  "kshetri": ["क्षेत्री"],

  // Common first names (top 50 most common)
  "ram": ["राम"],
  "shyam": ["श्याम"],
  "hari": ["हरि"],
  "krishna": ["कृष्ण"],
  "gopal": ["गोपाल"],
  "kumar": ["कुमार"],
  "bahadur": ["बहादुर"],
  "prasad": ["प्रसाद"],
  "lal": ["लाल"],
  "man": ["मान"],
  "bir": ["बीर", "वीर"],
  "narayan": ["नारायण"],
  "ganesh": ["गणेश"],
  "balendra": ["वालेन्द्र", "बालेन्द्र"],
  "balendra shah": ["वालेन्द्र शाह", "बालेन्द्र शाह"],
  "suresh": ["सुरेश"],
  "mahesh": ["महेश"],
  "rajesh": ["राजेश"],
  "dinesh": ["दिनेश"],
  "ramesh": ["रमेश"],
  "bikash": ["विकास", "बिकाश"],
  "bikram": ["विक्रम", "बिक्रम"],
  "deepak": ["दीपक", "दिपक"],
  "dipak": ["दीपक", "दिपक"],
  "sunil": ["सुनिल"],
  "anil": ["अनिल"],
  "sanjay": ["सञ्जय", "संजय"],
  "manoj": ["मनोज"],
  "bijay": ["विजय", "बिजय"],
  "vijay": ["विजय"],
  "ajay": ["अजय"],
  "nabin": ["नबिन", "नविन"],
  "prabin": ["प्रबिन", "प्रविन"],
  "sabin": ["सबिन", "सविन"],
  "prakash": ["प्रकाश"],
  "lokendra": ["लोकेन्द्र"],
  "surendra": ["सुरेन्द्र"],
  "rajendra": ["राजेन्द्र"],
  "narendra": ["नरेन्द्र"],
  "mahendra": ["महेन्द्र"],
  "jeevan": ["जीवन"],
  "jiwan": ["जीवन"],
  "sita": ["सीता"],
  "gita": ["गीता"],
  "rita": ["रीता"],
  "anita": ["अनिता"],
  "sunita": ["सुनिता"],
  "sabina": ["सबिना"],
  "kabita": ["कविता"],
  "raj": ["राज"],
  "prem": ["प्रेम"],
  "bharat": ["भरत"],
  "vinod": ["विनोद"],
  "santosh": ["सन्तोष", "संतोष"],
  "chandra": ["चन्द्र"],
  "shiv": ["शिव"],
  "arjun": ["अर्जुन"],
  "jay": ["जय"],
  "dhan": ["धन"],
  "raju": ["राजु"],
  "rakesh": ["राकेश"],
  "tek": ["टेक"],
  "kiran": ["किरण"],
  "indra": ["इन्द्र"],
  "rajan": ["राजन"],
  "pradip": ["प्रदिप", "प्रदीप"],
  "dev": ["देव"],
  "keshav": ["केशव"],
  "umesh": ["उमेश"],
  "surya": ["सुर्य", "सूर्य"],
  "suman": ["सुमन"],
  "saroj": ["सरोज"],
  "laxmi": ["लक्ष्मी"],
  "mohan": ["मोहन"],
  "mukesh": ["मुकेश"],
  "pramod": ["प्रमोद"],
  "binod": ["विनोद", "बिनोद"],
  "kamala": ["कमला"],
  "parbati": ["पार्वती"],
  "saraswati": ["सरस्वती"],
  "durga": ["दुर्गा"],
  "mina": ["मिना"],
  "bina": ["बिना"],
  "tika": ["टिका"],
  "devi": ["देवी"],

  // Titles and prefixes
  "dr": ["डा.", "डाक्टर"],
  "doctor": ["डा.", "डाक्टर"],
};

// Generate transliteration fragments from English input
function transliterate(input: string): string[] {
  const lower = input.toLowerCase().trim();
  const results: string[] = [];

  // Check direct alias matches - both full and partial
  for (const [eng, nepVariants] of Object.entries(NAME_ALIASES)) {
    // Exact match or input contains the alias
    if (lower === eng || lower.includes(eng)) {
      results.push(...nepVariants);
    }
    // Alias contains the input (for partial searches like "bal" matching "balen")
    if (eng.includes(lower) && lower.length >= 2) {
      results.push(...nepVariants);
    }
  }

  // Also check each word separately for multi-word queries
  const words = lower.split(/\s+/);
  for (const word of words) {
    if (word.length < 2) continue;
    for (const [eng, nepVariants] of Object.entries(NAME_ALIASES)) {
      if (eng === word || eng.startsWith(word) || word.startsWith(eng)) {
        results.push(...nepVariants);
      }
    }
  }

  // Generate phonetic transliteration
  let remaining = lower.replace(/\s+/g, "");
  let nepali = "";
  while (remaining.length > 0) {
    let matched = false;
    for (const [roman, dev] of TRANSLITERATION) {
      if (remaining.startsWith(roman)) {
        nepali += dev;
        remaining = remaining.slice(roman.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      remaining = remaining.slice(1);
    }
  }
  if (nepali) {
    results.push(nepali);
  }

  // Return unique results
  return [...new Set(results)];
}

// Build a flat searchable list of all candidates
let allCandidatesCache: CandidateData[] | null = null;
function getAllCandidates(): CandidateData[] {
  if (allCandidatesCache) return allCandidatesCache;
  allCandidatesCache = Object.values(CANDIDATES).flat();
  return allCandidatesCache;
}

function isEnglish(str: string): boolean {
  return /^[a-zA-Z\s]+$/.test(str);
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback((searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    const queryParts = lowerQuery.split(/\s+/);

    // Determine if English input and generate Nepali equivalents
    const englishInput = isEnglish(searchQuery.trim());
    const nepaliFragments = englishInput ? transliterate(lowerQuery) : [];

    // Search districts (English name or Nepali name)
    districts.forEach((district) => {
      const matchesEnglish = district.name.toLowerCase().includes(lowerQuery);
      const matchesNepali = district.nameNepali?.includes(searchQuery);
      const matchesTransliterated = nepaliFragments.some(frag =>
        district.nameNepali?.includes(frag)
      );

      if (matchesEnglish || matchesNepali || matchesTransliterated) {
        searchResults.push({
          type: "district",
          id: district.id,
          name: district.nameNepali || district.name,
          subtitle: `${district.name} · ${district.constituencies} निर्वाचन क्षेत्र`,
          districtId: district.id,
        });
      }
    });

    // Search candidates
    const allCandidates = getAllCandidates();
    const seen = new Set<string>();
    const scoredResults: { candidate: CandidateData; score: number }[] = [];

    // For English input, also get transliterations for each word separately
    const perWordFragments: string[] = [];
    if (englishInput) {
      for (const part of queryParts) {
        perWordFragments.push(...transliterate(part));
      }
    }
    const allFragments = [...new Set([...nepaliFragments, ...perWordFragments])];

    for (const candidate of allCandidates) {
      if (seen.has(candidate.id)) continue;

      let score = 0;
      const candidateNameLower = candidate.name.toLowerCase();

      // Direct Nepali match
      if (!englishInput) {
        if (candidate.name.includes(searchQuery)) score += 10;
        if (candidate.party.includes(searchQuery)) score += 5;
      }

      // English transliteration match
      if (englishInput) {
        // Try all fragments (both full query and per-word)
        for (const frag of allFragments) {
          if (candidate.name.includes(frag)) {
            // Higher score for longer fragment matches
            score += 5 + frag.length;
          }
        }

        // Also try a simple substring match with transliterated fragments
        if (score === 0) {
          for (const frag of allFragments) {
            // Check if any part of the fragment appears in the name
            if (frag.length >= 2) {
              for (let i = 0; i <= frag.length - 2; i++) {
                const subFrag = frag.substring(i, i + 2);
                if (candidate.name.includes(subFrag)) {
                  score += 1;
                }
              }
            }
          }
        }

        // Bonus for matching multiple fragments
        const matchedParts = allFragments.filter(frag => candidate.name.includes(frag));
        if (matchedParts.length > 1) {
          score += matchedParts.length * 5;
        }
      }

      if (score > 0) {
        seen.add(candidate.id);
        scoredResults.push({ candidate, score });
      }
    }

    // Sort by score (highest first) and take top results
    scoredResults.sort((a, b) => b.score - a.score);

    for (const { candidate } of scoredResults.slice(0, 12 - searchResults.length)) {
      searchResults.push({
        type: "candidate",
        id: candidate.id,
        name: candidate.name,
        subtitle: `${candidate.party} · ${candidate.district}-${candidate.constituency}`,
        districtId: candidate.district,
        constituencyNum: candidate.constituency,
      });
    }

    setResults(searchResults.slice(0, 12));
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");

    if (result.type === "candidate") {
      // Navigate to candidate page using slug
      const slug = getSlugFromId(result.id) || result.id;
      router.push(`/candidate/${slug}`);
    } else {
      // For districts, dispatch event so the page can open the district panel
      window.dispatchEvent(new CustomEvent("search-select", { detail: result }));
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="आफ्नो क्षेत्र वा उम्मेदवार खोज्नुहोस्..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
          <ul className="max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <li key={`${result.type}-${result.id}`}>
                <button
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                    ${selectedIndex === index ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${result.type === "district" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    {result.type === "district" ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{result.name}</div>
                    <div className="text-sm text-gray-500 truncate">{result.subtitle}</div>
                  </div>

                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0
                      ${result.type === "district" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {result.type === "district" ? "जिल्ला" : "उम्मेदवार"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-6 text-center z-50">
          <p className="text-gray-500">&quot;{query}&quot; को नतिजा फेला परेन</p>
        </div>
      )}
    </div>
  );
}
