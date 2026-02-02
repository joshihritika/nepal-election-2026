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
  "oli": ["ओली"], "deuba": ["देउवा"], "prachanda": ["प्रचण्ड", "प्रचन्ड"],
  "balen": ["बालेन"], "rabi": ["रवि"], "lamichhane": ["लामिछाने"],
  "gagan": ["गगन"], "thapa": ["थापा"], "sharma": ["शर्मा"],
  "kc": ["केसी"], "gurung": ["गुरुङ"], "tamang": ["तामाङ"],
  "rai": ["राई"], "shrestha": ["श्रेष्ठ"], "adhikari": ["अधिकारी"],
};

function transliterate(input: string): string[] {
  const lower = input.toLowerCase();
  const results: string[] = [];
  for (const [eng, nepVariants] of Object.entries(NAME_ALIASES)) {
    if (lower.includes(eng)) results.push(...nepVariants);
  }
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
    if (!matched) remaining = remaining.slice(1);
  }
  if (nepali) results.push(nepali);
  return results;
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
    const fragments = english ? transliterate(q.toLowerCase().trim()) : [];
    const matched: CandidateData[] = [];

    for (const c of all) {
      if (matched.length >= 8) break;
      if (excludeIds.includes(c.id)) continue;
      let hit = false;
      if (!english) {
        hit = c.name.includes(q) || c.party.includes(q);
      } else if (fragments.length > 0) {
        hit = fragments.some((f) => c.name.includes(f));
        if (!hit) {
          const parts = q.toLowerCase().trim().split(/\s+/);
          if (parts.length > 1) {
            const partFrags = parts.flatMap((p) => transliterate(p));
            hit = partFrags.some((f) => c.name.includes(f));
          }
        }
      }
      if (hit) matched.push(c);
    }
    setResults(matched);
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
        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
          <ul className="max-h-60 overflow-y-auto">
            {results.map((c, i) => (
              <li key={c.id}>
                <button
                  onClick={() => handleSelect(c)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full px-3 py-2.5 text-left transition-colors ${selectedIndex === i ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="text-sm font-medium text-gray-900 truncate">{c.name}</div>
                  <div className="text-xs text-gray-500 truncate">{c.party} · {c.district}-{c.constituency}</div>
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
