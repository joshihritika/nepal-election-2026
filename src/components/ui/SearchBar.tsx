"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { districts } from "@/data/districts";
import { CANDIDATES, CandidateData } from "@/data/candidates-scraped";

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
  "oli": ["ओली"],
  "deuba": ["देउवा"],
  "prachanda": ["प्रचण्ड", "प्रचन्ड"],
  "balen": ["बालेन"],
  "rabi lamichhane": ["रवि लामिछाने"],
  "rabi": ["रवि"],
  "lamichhane": ["लामिछाने"],
  "gagan": ["गगन"],
  "thapa": ["थापा"],
  "ghising": ["घिसिङ"],
  "kulman": ["कुलमान"],
  "sher bahadur": ["शेरबहादुर", "शेर बहादुर"],
  "baburam": ["बाबुराम"],
  "bhattarai": ["भट्टराई"],
  "madhav": ["माधव"],
  "nepal": ["नेपाल"],
  "jhalanath": ["झलनाथ"],
  "khanal": ["खनाल"],
  "pushpa": ["पुष्प"],
  "kamal": ["कमल"],
  "dahal": ["दाहाल"],
  "upendra": ["उपेन्द्र"],
  "yadav": ["यादव"],
  "bishnu": ["विष्णु"],
  "poudel": ["पौडेल", "पौडल"],
  "ram chandra": ["रामचन्द्र", "राम चन्द्र"],
  "shah": ["शाह"],
  "singh": ["सिंह", "सिँह"],
  "sharma": ["शर्मा"],
  "kc": ["केसी", "के.सी"],
  "gurung": ["गुरुङ"],
  "tamang": ["तामाङ"],
  "rai": ["राई"],
  "limbu": ["लिम्बु", "लिम्बू"],
  "magar": ["मगर"],
  "shrestha": ["श्रेष्ठ"],
  "maharjan": ["महर्जन"],
  "pradhan": ["प्रधान"],
  "joshi": ["जोशी"],
  "adhikari": ["अधिकारी"],
  "pokharel": ["पोखरेल"],
  "koirala": ["कोइराला"],
  "rijal": ["रिजाल"],
  "basnet": ["बस्नेत"],
  "karki": ["कार्की"],
  "chaudhary": ["चौधरी"],
  "mandal": ["मण्डल"],
};

// Generate transliteration fragments from English input
function transliterate(input: string): string[] {
  const lower = input.toLowerCase();
  const results: string[] = [];

  // Check direct alias matches
  for (const [eng, nepVariants] of Object.entries(NAME_ALIASES)) {
    if (lower.includes(eng)) {
      results.push(...nepVariants);
    }
  }

  // Generate phonetic transliteration
  let remaining = lower;
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

  return results;
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

    for (const candidate of allCandidates) {
      if (searchResults.length >= 12) break;
      if (seen.has(candidate.id)) continue;

      let matches = false;

      // Direct Nepali match
      if (!englishInput) {
        matches = candidate.name.includes(searchQuery) ||
          candidate.party.includes(searchQuery);
      }

      // English transliteration match
      if (englishInput && nepaliFragments.length > 0) {
        matches = nepaliFragments.some(frag => candidate.name.includes(frag));

        // Also try matching each query word separately (e.g., "kp oli" → "केपी" + "ओली")
        if (!matches && queryParts.length > 1) {
          const partFragments = queryParts.map(part => transliterate(part)).flat();
          matches = partFragments.some(frag => candidate.name.includes(frag));
        }
      }

      if (matches) {
        seen.add(candidate.id);
        searchResults.push({
          type: "candidate",
          id: candidate.id,
          name: candidate.name,
          subtitle: `${candidate.party} · ${candidate.district}-${candidate.constituency}`,
          districtId: candidate.district,
          constituencyNum: candidate.constituency,
        });
      }
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
    // Dispatch a custom event so the page can handle navigation via state
    window.dispatchEvent(new CustomEvent("search-select", { detail: result }));

    // For candidate results, also dispatch candidate-detail with full data
    if (result.type === "candidate") {
      const allCandidates = getAllCandidates();
      const fullCandidate = allCandidates.find(c => c.id === result.id);
      if (fullCandidate) {
        window.dispatchEvent(new CustomEvent("candidate-detail", { detail: fullCandidate }));
      }
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
          placeholder="आफ्नो क्षेत्र खोज्नुहोस्..."
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
