"use client";

import { useEffect, useMemo } from "react";
import { CandidateData } from "@/data/candidates-scraped";
import { getEnrichment } from "@/data/candidate-enrichments";
import { getHistory } from "@/data/candidate-history";

const PARTY_COLORS: Record<string, string> = {
  "नेपाली काँग्रेस": "#2563EB",
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "#DC2626",
  "राष्ट्रिय स्वतन्त्र पार्टी": "#0EA5E9",
  "नेपाली कम्युनिष्ट पार्टी": "#059669",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "#F59E0B",
};

const SYMBOL_MAP: Record<string, string> = {
  "रुख": "/symbols/rukh.svg",
  "सुर्य": "/symbols/surya.svg",
  "पाँचकुने तारा": "☭",
  "घण्टी": "/symbols/ghanti.svg",
  "हलो": "/symbols/halo.svg",
};

function getPartyColor(party: string): string {
  return PARTY_COLORS[party] || "#6B7280";
}

interface CandidateModalProps {
  candidate: CandidateData;
  onClose: () => void;
}

export default function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const partyColor = getPartyColor(candidate.party);
  const symbolDisplay = candidate.symbol ? SYMBOL_MAP[candidate.symbol] || null : null;
  const enrichment = useMemo(() => getEnrichment(candidate.id), [candidate.id]);
  const history = useMemo(() => getHistory(candidate.id), [candidate.id]);

  const details: [string, string][] = [
    ["उमेर", candidate.age > 0 ? `${candidate.age} वर्ष` : ""],
    ["लिङ्ग", candidate.gender],
    ["शिक्षा", candidate.education],
    ["संस्था", candidate.institution],
    ["ठेगाना", candidate.address],
    ["बाबुको नाम", candidate.father],
    ["प्रदेश", candidate.province],
    ["जिल्ला", candidate.district],
    ["निर्वाचन क्षेत्र", candidate.constituency ? String(candidate.constituency) : ""],
  ].filter(([, val]) => val && val.length > 0) as [string, string][];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-2 sm:inset-6 md:inset-y-14 md:inset-x-[15%] lg:inset-y-14 lg:inset-x-[25%] z-[70] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0"
          style={{ backgroundColor: partyColor + "15" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              {/* Symbol */}
              {symbolDisplay && (
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  {symbolDisplay.startsWith("/") ? (
                    <img src={symbolDisplay} alt={candidate.symbol} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-2xl leading-none">{symbolDisplay}</span>
                  )}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">{candidate.name}</h2>
                  {candidate.elected && (
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full flex-shrink-0">
                      विजेता
                    </span>
                  )}
                  {history.length === 0 && (
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full flex-shrink-0">
                      पहिलो पटक उम्मेदवार
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: partyColor }}
                  />
                  <span className="text-sm text-gray-600 truncate">{candidate.party}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Vote count */}
          {candidate.votes > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <div className="text-3xl font-bold text-gray-900">{candidate.votes.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">प्राप्त मत</div>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.map(([label, value]) => (
              <div key={label} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
                <div className="text-sm font-medium text-gray-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Enrichment sections */}
          {enrichment && (
            <div className="mt-6 space-y-5">
              {/* Summary (hide for first-time candidates since they get the dedicated note) */}
              {enrichment.summary && history.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">सारांश</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{enrichment.summary}</p>
                </div>
              )}


            </div>
          )}

          {/* First-time candidate note */}
          {history.length === 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800">
                {candidate.name}ले पहिलो पटक प्रतिनिधि सभा चुनावको लागि आफ्नो उम्मेदवारी {candidate.gender === "महिला" ? "दिएकी हुन्" : "दिएका हुन्"}।
              </p>
              <p className="text-xs text-blue-600 mt-1">* विगत दुई निर्वाचन (२०७४ र २०७९) को तथ्यांकमा आधारित</p>
            </div>
          )}

          {/* Election History (from 2074/2079 data) */}
          {history.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">निर्वाचन इतिहास</h3>
              {/* Card layout for mobile */}
              <div className="space-y-3 sm:hidden">
                {history.map((h, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-900">{h.year}</span>
                      <span className={h.result === "विजयी" ? "text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full" : "text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full"}>
                        {h.result}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{h.district} {h.constituency}</div>
                    <div className="text-xs text-gray-500 mt-1">{h.party}</div>
                  </div>
                ))}
              </div>
              {/* Table layout for larger screens */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 py-1.5 font-medium text-gray-500 text-xs">वर्ष</th>
                      <th className="px-3 py-1.5 font-medium text-gray-500 text-xs">क्षेत्र</th>
                      <th className="px-3 py-1.5 font-medium text-gray-500 text-xs">पार्टी</th>
                      <th className="px-3 py-1.5 font-medium text-gray-500 text-xs">नतिजा</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-3 py-1.5 text-gray-900">{h.year}</td>
                        <td className="px-3 py-1.5 text-gray-600">{h.district} {h.constituency}</td>
                        <td className="px-3 py-1.5 text-gray-600">{h.party}</td>
                        <td className="px-3 py-1.5">
                          <span className={h.result === "विजयी" ? "text-green-700 font-medium" : "text-gray-600"}>
                            {h.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">* विगत दुई निर्वाचन (२०७४ र २०७९) को तथ्यांकमा आधारित</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
