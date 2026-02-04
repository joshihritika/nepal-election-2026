"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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

// Pre-computed searchable candidate with both Nepali and English names
interface SearchableCandidate {
  candidate: CandidateData;
  nepaliName: string;
  englishName: string;
  searchText: string; // Combined lowercase searchable text
}

// Well-known English name mappings for better search
const ENGLISH_NAME_OVERRIDES: Record<string, string> = {
  "के.पी शर्मा ओली": "kp sharma oli",
  "के.पी. शर्मा ओली": "kp sharma oli",
  "केपी शर्मा ओली": "kp sharma oli",
  "शेरबहादुर देउवा": "sher bahadur deuba",
  "शेर बहादुर देउवा": "sher bahadur deuba",
  "पुष्प कमल दाहाल": "pushpa kamal dahal prachanda",
  "पुष्प कमल दाहाल प्रचण्ड": "pushpa kamal dahal prachanda",
  "बालेन शाह": "balen shah balendra",
  "बालेन्द्र शाह": "balen shah balendra",
  "गगन थापा": "gagan thapa",
  "गगन कुमार थापा": "gagan kumar thapa",
  "रवि लामिछाने": "rabi lamichhane",
  "रवीन्द्र मिश्र": "rabindra mishra",
  "अमरेश कुमार सिंह": "amresh kumar singh",
  "हर्क राज राई": "harka raj rai harke dai",
  "रन्जु न्यौपाने": "ranju neupane darshana",
  "रन्‍जु न्‍यौपाने": "ranju neupane darshana",
  "माधव कुमार नेपाल": "madhav kumar nepal",
  "झलनाथ खनाल": "jhalanath khanal",
  "बाबुराम भट्टराई": "baburam bhattarai",
  "रामचन्द्र पौडेल": "ramchandra poudel paudel",
  "विष्णु पौडेल": "bishnu poudel paudel",
  "उपेन्द्र यादव": "upendra yadav",
  "रेणु दाहाल": "renu dahal",
};

// Nepali to English transliteration map for name conversion
const NEPALI_TO_ENGLISH: Record<string, string> = {
  // Vowels
  "अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऋ": "ri",
  // Consonants
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "w", "श": "sh",
  "ष": "sh", "स": "s", "ह": "h",
  // Matras
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ृ": "ri",
  // Special
  "्": "", "ं": "n", "ँ": "n", "ः": "h",
};

// Convert Nepali name to English (for pre-processing)
function nepaliToEnglish(name: string): string {
  // Check override first
  if (ENGLISH_NAME_OVERRIDES[name]) {
    return ENGLISH_NAME_OVERRIDES[name];
  }

  let result = "";
  const chars = [...name];

  for (const char of chars) {
    if (NEPALI_TO_ENGLISH[char]) {
      result += NEPALI_TO_ENGLISH[char];
    } else if (char === " ") {
      result += " ";
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
    }
    // Skip other characters
  }

  return result.replace(/\s+/g, " ").trim();
}

// Build searchable candidates cache
let searchableCandidatesCache: SearchableCandidate[] | null = null;

function getSearchableCandidates(): SearchableCandidate[] {
  if (searchableCandidatesCache) return searchableCandidatesCache;

  const allCandidates = Object.values(CANDIDATES).flat();
  searchableCandidatesCache = allCandidates.map((candidate) => {
    const nepaliName = candidate.name;
    const englishName = nepaliToEnglish(nepaliName);

    // Combine all searchable text: nepali name, english name, party, district
    const searchText = [
      nepaliName.toLowerCase(),
      englishName.toLowerCase(),
      candidate.party.toLowerCase(),
      candidate.district.toLowerCase(),
    ].join(" ");

    return {
      candidate,
      nepaliName,
      englishName,
      searchText,
    };
  });

  return searchableCandidatesCache;
}

function isEnglish(str: string): boolean {
  return /^[a-zA-Z\s.]+$/.test(str);
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-load searchable candidates on mount
  const searchableCandidates = useMemo(() => getSearchableCandidates(), []);

  const performSearch = useCallback((searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    const queryParts = lowerQuery.split(/\s+/).filter(p => p.length > 0);
    const englishInput = isEnglish(searchQuery.trim());

    // Search districts
    districts.forEach((district) => {
      const districtEnglish = district.name.toLowerCase();
      const districtNepali = district.nameNepali?.toLowerCase() || "";

      const matches =
        districtEnglish.includes(lowerQuery) ||
        districtNepali.includes(lowerQuery) ||
        queryParts.every(part => districtEnglish.includes(part) || districtNepali.includes(part));

      if (matches) {
        searchResults.push({
          type: "district",
          id: district.id,
          name: district.nameNepali || district.name,
          subtitle: `${district.name} · ${district.constituencies} निर्वाचन क्षेत्र`,
          districtId: district.id,
        });
      }
    });

    // Search candidates using pre-computed searchable text
    const scoredResults: { searchable: SearchableCandidate; score: number }[] = [];

    for (const searchable of searchableCandidates) {
      let score = 0;
      const { nepaliName, englishName, searchText } = searchable;

      // Exact name match (highest priority)
      if (nepaliName.toLowerCase() === lowerQuery || englishName.toLowerCase() === lowerQuery) {
        score += 100;
      }
      // Name starts with query
      else if (nepaliName.toLowerCase().startsWith(lowerQuery) || englishName.toLowerCase().startsWith(lowerQuery)) {
        score += 50;
      }
      // Query appears in name
      else if (nepaliName.toLowerCase().includes(lowerQuery) || englishName.toLowerCase().includes(lowerQuery)) {
        score += 30;
      }
      // All query parts match somewhere in searchable text
      else if (queryParts.length > 0 && queryParts.every(part => searchText.includes(part))) {
        score += 20 + queryParts.length * 5;
      }
      // Any query part matches
      else {
        const matchingParts = queryParts.filter(part => searchText.includes(part));
        if (matchingParts.length > 0) {
          score += matchingParts.length * 10;
        }
      }

      // Bonus for matching the beginning of words (e.g., "kp" matches "kp sharma")
      if (englishInput) {
        const englishWords = englishName.split(" ");
        for (const part of queryParts) {
          for (const word of englishWords) {
            if (word.startsWith(part)) {
              score += 15;
            }
          }
        }
      }

      if (score > 0) {
        scoredResults.push({ searchable, score });
      }
    }

    // Sort by score and take top results
    scoredResults.sort((a, b) => b.score - a.score);

    const maxCandidates = 12 - searchResults.length;
    for (const { searchable } of scoredResults.slice(0, maxCandidates)) {
      const { candidate, englishName } = searchable;
      searchResults.push({
        type: "candidate",
        id: candidate.id,
        name: candidate.name,
        subtitle: `${englishName} · ${candidate.district}-${candidate.constituency}`,
        districtId: candidate.district,
        constituencyNum: candidate.constituency,
      });
    }

    setResults(searchResults.slice(0, 12));
  }, [searchableCandidates]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);
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
      const slug = getSlugFromId(result.id) || result.id;
      router.push(`/candidate/${slug}`);
    } else {
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
          placeholder="Search candidates (e.g., KP Oli, Gagan Thapa)..."
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
