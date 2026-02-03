"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CANDIDATES, CandidateData } from "@/data/candidates-scraped";

// Reuse transliteration logic inline (same as SearchBar)
const TRANSLITERATION: [string, string][] = [
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

const NAME_ALIASES: Record<string, string[]> = {
  // Key political figures
  "kp": ["के.पी", "केपी", "के पी"],
  "kp oli": ["के.पी शर्मा ओली", "केपी शर्मा ओली", "ओली"],
  "oli": ["ओली"], "deuba": ["देउवा"],
  "prachanda": ["प्रचण्ड", "प्रचन्ड", "पुष्प कमल दाहाल", "पुष्प कमल दाहाल प्रचण्ड"],
  "pushpa": ["पुष्प"], "pushpa kamal": ["पुष्प कमल"],
  "pushpa kamal dahal": ["पुष्प कमल दाहाल", "पुष्प कमल दाहाल प्रचण्ड"],
  "pushpa kamal dahal prachanda": ["पुष्प कमल दाहाल प्रचण्ड"],
  "balen": ["बालेन"], "rabi": ["रवि", "रवी", "रबि"], "lamichhane": ["लामिछाने"],
  "gagan": ["गगन"], "gagan thapa": ["गगन थापा", "गगन कुमार थापा"],
  // Common surnames (top 50)
  "thapa": ["थापा"], "sharma": ["शर्मा"], "shah": ["शाह"], "shahi": ["शाही"],
  "singh": ["सिंह", "सिँह", "सिह"], "kc": ["केसी", "के.सी"], "khadka": ["खड्का"],
  "gurung": ["गुरुङ", "गुरुं", "गुरुङ्ग"], "tamang": ["तामाङ", "तामांग", "तामाङ्ग"],
  "rai": ["राई", "राय"], "ray": ["राय", "राई"], "limbu": ["लिम्बु", "लिम्बू"],
  "magar": ["मगर"], "shrestha": ["श्रेष्ठ", "श्रेष्‍ठ"], "sah": ["साह"],
  "mahato": ["महतो"], "maharjan": ["महर्जन"], "yadav": ["यादव"],
  "chaudhary": ["चौधरी"], "adhikari": ["अधिकारी"], "bhandari": ["भण्डारी", "भंडारी"],
  "dahal": ["दाहाल"], "renu": ["रेणु"], "renu dahal": ["रेणु दाहाल"],
  "dharmananda": ["धर्मानन्द"], "dharmananda joshi": ["धर्मानन्द जोशी"],
  "joshi": ["जोशी"], "neupane": ["न्यौपाने", "न्युपाने"], "lama": ["लामा"],
  "poudel": ["पौडेल", "पौडल"], "paudel": ["पौडेल", "पौडल"], "koirala": ["कोइराला"],
  "basnet": ["बस्नेत"], "karki": ["कार्की"], "tharu": ["थारु"],
  "ghimire": ["घिमिरे"], "acharya": ["आचार्य"], "thakur": ["ठाकुर"],
  "rana": ["राना"], "bhattarai": ["भट्टराई"], "khatri": ["खत्री"],
  "dhakal": ["ढकाल"], "khanal": ["खनाल"], "bhatt": ["भट्ट"],
  "jha": ["झा"], "mishra": ["मिश्र"], "kushwaha": ["कुशवाहा"],
  "rajbanshi": ["राजवंशी"], "ansari": ["अंसारी", "अन्सारी"], "paswan": ["पासवान"],
  "kshetri": ["क्षेत्री"], "pokharel": ["पोखरेल"], "gautam": ["गौतम"],
  // Common first names (top 50)
  "ram": ["राम"], "hari": ["हरि"], "krishna": ["कृष्ण"], "raj": ["राज"],
  "prem": ["प्रेम"], "manoj": ["मनोज"], "bharat": ["भरत"], "dipak": ["दीपक", "दिपक"],
  "deepak": ["दीपक", "दिपक"], "ramesh": ["रमेश"], "vinod": ["विनोद"], "binod": ["विनोद", "बिनोद"],
  "prakash": ["प्रकाश"], "santosh": ["सन्तोष", "संतोष"], "rajendra": ["राजेन्द्र"],
  "chandra": ["चन्द्र"], "ganesh": ["गणेश"], "surendra": ["सुरेन्द्र"],
  "ajay": ["अजय"], "shiv": ["शिव"], "lal": ["लाल"], "kamal": ["कमल"],
  "arjun": ["अर्जुन"], "bishnu": ["विष्णु"], "rajesh": ["राजेश"], "raju": ["राजु"],
  "dhan": ["धन"], "jay": ["जय"], "sanjay": ["सञ्जय", "संजय"], "madhav": ["माधव"],
  "mahesh": ["महेश"], "suresh": ["सुरेश"], "sunil": ["सुनिल"], "rakesh": ["राकेश"],
  "dinesh": ["दिनेश"], "tek": ["टेक"], "kiran": ["किरण"], "indra": ["इन्द्र"],
  "rajan": ["राजन"], "pradip": ["प्रदिप", "प्रदीप"], "dev": ["देव"],
  "keshav": ["केशव"], "umesh": ["उमेश"], "surya": ["सुर्य", "सूर्य"],
  "suman": ["सुमन"], "saroj": ["सरोज"], "shyam": ["श्याम"], "laxmi": ["लक्ष्मी"],
  "mohan": ["मोहन"], "mukesh": ["मुकेश"], "pramod": ["प्रमोद"],
  "kumar": ["कुमार"], "bahadur": ["बहादुर"], "prasad": ["प्रसाद"],
  "bikash": ["विकास", "बिकाश"], "balendra": ["वालेन्द्र", "बालेन्द्र"],
  "balendra shah": ["वालेन्द्र शाह", "बालेन्द्र शाह"],
  "lokendra": ["लोकेन्द्र"], "narendra": ["नरेन्द्र"], "mahendra": ["महेन्द्र"],
  "upendra": ["उपेन्द्र"], "gopal": ["गोपाल"], "narayan": ["नारायण"],
};

function transliterate(input: string): string[] {
  const lower = input.toLowerCase().trim();
  const results: string[] = [];

  // Check direct alias matches - both full and partial
  for (const [eng, nepVariants] of Object.entries(NAME_ALIASES)) {
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
    if (!matched) remaining = remaining.slice(1);
  }
  if (nepali) results.push(nepali);

  return [...new Set(results)];
}

function isEnglish(str: string): boolean {
  return /^[a-zA-Z\s]+$/.test(str);
}

let allCandidatesCache: CandidateData[] | null = null;
function getAllCandidates(): CandidateData[] {
  if (allCandidatesCache) return allCandidatesCache;
  allCandidatesCache = Object.values(CANDIDATES).flat();
  return allCandidatesCache;
}

interface CandidateSelectorProps {
  onSelect: (candidate: CandidateData) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export default function CandidateSelector({ onSelect, excludeIds = [], placeholder = "उम्मेदवार खोज्नुहोस्..." }: CandidateSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<CandidateData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback((q: string) => {
    if (q.length < 2) { setResults([]); return; }
    const all = getAllCandidates();
    const english = isEnglish(q.trim());
    const queryParts = q.toLowerCase().trim().split(/\s+/);

    // Get transliterations for full query and each word separately
    const fragments = english ? transliterate(q.toLowerCase().trim()) : [];
    const perWordFragments: string[] = [];
    if (english) {
      for (const part of queryParts) {
        perWordFragments.push(...transliterate(part));
      }
    }
    const allFragments = [...new Set([...fragments, ...perWordFragments])];

    const scored: { candidate: CandidateData; score: number }[] = [];

    for (const c of all) {
      if (excludeIds.includes(c.id)) continue;
      let score = 0;

      if (!english) {
        if (c.name.includes(q)) score += 10;
        if (c.party.includes(q)) score += 5;
      } else if (allFragments.length > 0) {
        for (const frag of allFragments) {
          if (c.name.includes(frag)) {
            score += 5 + frag.length;
          }
        }

        // Bonus for matching multiple fragments
        const matchedParts = allFragments.filter(frag => c.name.includes(frag));
        if (matchedParts.length > 1) {
          score += matchedParts.length * 5;
        }
      }

      if (score > 0) {
        scored.push({ candidate: c, score });
      }
    }

    // Sort by score and take top 8
    scored.sort((a, b) => b.score - a.score);
    setResults(scored.slice(0, 8).map(s => s.candidate));
  }, [excludeIds]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 200);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (c: CandidateData) => {
    onSelect(c);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, -1)); }
    else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) { e.preventDefault(); handleSelect(results[selectedIndex]); }
    else if (e.key === "Escape") { setIsOpen(false); }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setSelectedIndex(-1); }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
          <ul className="max-h-60 overflow-y-auto">
            {results.map((c, i) => (
              <li key={c.id}>
                <button
                  onClick={() => handleSelect(c)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full px-3 py-3 text-left transition-colors ${selectedIndex === i ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="text-base font-medium text-gray-900 truncate">{c.name}</div>
                  <div className="text-sm text-gray-500 truncate">{c.party} · {c.district}-{c.constituency}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center z-50">
          <p className="text-sm text-gray-500">फेला परेन</p>
        </div>
      )}
    </div>
  );
}
