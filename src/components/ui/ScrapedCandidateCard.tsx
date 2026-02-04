"use client";

import Link from "next/link";
import { CandidateData } from "@/data/candidates-scraped";
import { useCompare } from "@/contexts/CompareContext";
import { getSlugFromId } from "@/lib/slug";

// Party color mapping for major Nepali parties
const PARTY_COLORS: Record<string, string> = {
  "नेपाली काँग्रेस": "#2563EB",
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "#DC2626",
  "राष्ट्रिय स्वतन्त्र पार्टी": "#0EA5E9",
  "नेपाली कम्युनिष्ट पार्टी": "#059669",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "#F59E0B",
};

// Get short party name
function getPartyShort(party: string): string {
  const shortcuts: Record<string, string> = {
    "नेपाली काँग्रेस": "काँग्रेस",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "एमाले",
    "राष्ट्रिय स्वतन्त्र पार्टी": "रास्वपा",
    "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "माओवादी",
    "जनता समाजवादी पार्टी, नेपाल": "जसपा",
    "राष्ट्रिय प्रजातन्त्र पार्टी": "राप्रपा",
    "नेपाली कम्युनिष्ट पार्टी": "नेकपा",
    "स्वतन्त्र": "स्वतन्त्र",
    "लोकतान्त्रिक समाजवादी पार्टी, नेपाल": "लोसपा",
    "नागरिक उन्मुक्ति पार्टी": "नाउपा",
    "जनमत पार्टी": "जनमत",
    "नेपाल कम्युनिष्ट पार्टी (एकिकृत समाजवादी)": "एकिसमा",
    "राष्ट्रिय प्रजातन्त्र पार्टी नेपाल": "राप्रपा ने",
  };
  return shortcuts[party] || (party.length > 15 ? party.slice(0, 12) + '…' : party);
}

function getPartyColor(party: string): string {
  return PARTY_COLORS[party] || "#6B7280";
}

// Election symbol emoji mapping
const SYMBOL_MAP: Record<string, string> = {
  "रुख": "/symbols/rukh.svg",
  "सुर्य": "/symbols/surya.svg",
  "पाँचकुने तारा": "☭",
  "घण्टी": "/symbols/ghanti.svg",
  "हलो": "/symbols/halo.svg",
};

function getSymbolDisplay(symbol: string): string | null {
  return SYMBOL_MAP[symbol] || null;
}

interface ScrapedCandidateCardProps {
  candidate: CandidateData;
  rank?: number;
  onClick?: () => void;
  asLink?: boolean;
}

export default function ScrapedCandidateCard({
  candidate,
  rank,
  onClick,
  asLink = true,
}: ScrapedCandidateCardProps) {
  const partyColor = getPartyColor(candidate.party);
  const partyShort = getPartyShort(candidate.party);
  const symbolDisplay = candidate.symbol ? getSymbolDisplay(candidate.symbol) : null;

  const { isSelected, addCandidate, removeCandidate, canAdd } = useCompare();
  const compared = isSelected(candidate.id);

  const cardContent = (
    <>
      {/* Rank */}
      {rank && (
        <span className="relative text-base font-bold text-gray-400 w-6 text-right flex-shrink-0">
          {rank}
        </span>
      )}

      {/* Symbol */}
      {symbolDisplay && (
        <div
          className="relative flex-shrink-0 w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center"
          title={candidate.symbol}
        >
          {symbolDisplay.startsWith("/") ? (
            <img src={symbolDisplay} alt={candidate.symbol} className="w-7 h-7 object-contain" />
          ) : (
            <span className="text-xl leading-none">{symbolDisplay}</span>
          )}
        </div>
      )}

      {/* Name + Party */}
      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{candidate.name}</h3>
          {candidate.elected && (
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded flex-shrink-0">
              विजेता
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: partyColor }}
          />
          <span className="text-sm text-gray-500 truncate">{partyShort}</span>
          {candidate.symbol && (
            <span className="text-xs text-gray-400 truncate">· {candidate.symbol}</span>
          )}
        </div>
      </div>

      {/* Stats chips */}
      <div className="relative hidden sm:flex items-center gap-4 flex-shrink-0 text-sm text-gray-500">
        {candidate.age > 0 && (
          <span title="उमेर">{candidate.age} वर्ष</span>
        )}
        {candidate.gender && (
          <span title="लिङ्ग">{candidate.gender}</span>
        )}
      </div>

      {/* Official votes */}
      {candidate.votes > 0 && (
        <div className="relative flex-shrink-0 text-right">
          <div className="text-base font-bold text-gray-900">{candidate.votes.toLocaleString()}</div>
          <div className="text-xs text-gray-400">मत</div>
        </div>
      )}

      {/* Compare checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (compared) removeCandidate(candidate.id);
          else addCandidate(candidate.id);
        }}
        disabled={!compared && !canAdd}
        title={compared ? "तुलनाबाट हटाउनुहोस्" : "तुलनामा थप्नुहोस्"}
        className={`absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded flex items-center justify-center transition-colors text-xs
          ${compared
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-white/80 border border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-600"
          } disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        {compared ? "✓" : "+"}
      </button>
    </>
  );

  const baseClassName = `relative flex items-center gap-2 sm:gap-4 px-2.5 sm:px-4 py-3 sm:py-3.5 rounded-xl border transition-colors overflow-hidden cursor-pointer hover:bg-gray-50
    ${candidate.elected ? "border-green-500 bg-green-50/50" : "border-gray-200 bg-white"}`;

  if (asLink) {
    const slug = getSlugFromId(candidate.id) || candidate.id;
    return (
      <Link
        href={`/candidate/${slug}`}
        className={baseClassName}
        style={{ borderLeft: `4px solid ${partyColor}` }}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      className={baseClassName}
      style={{ borderLeft: `4px solid ${partyColor}` }}
      onClick={onClick}
    >
      {cardContent}
    </div>
  );
}
