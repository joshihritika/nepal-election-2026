"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CandidateData } from "@/data/candidates-scraped";
import { getEnrichment } from "@/data/candidate-enrichments";
import { getHistory } from "@/data/candidate-history";
import Header from "@/components/layout/Header";
import CandidateShareCard from "@/components/ui/CandidateShareCard";

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

interface CandidateProfileClientProps {
  candidate: CandidateData;
  photo?: string;
}

export default function CandidateProfileClient({
  candidate,
  photo,
}: CandidateProfileClientProps) {
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          गृहपृष्ठमा फर्कनुहोस्
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div
            className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200"
            style={{ backgroundColor: partyColor + "15" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Photo or Symbol */}
              {photo ? (
                <img
                  src={photo}
                  alt={candidate.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-4"
                  style={{ borderColor: partyColor }}
                />
              ) : symbolDisplay ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  {symbolDisplay.startsWith("/") ? (
                    <img src={symbolDisplay} alt={candidate.symbol} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
                  ) : (
                    <span className="text-4xl sm:text-5xl leading-none">{symbolDisplay}</span>
                  )}
                </div>
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-white text-3xl sm:text-4xl font-bold"
                  style={{ backgroundColor: partyColor }}
                >
                  {candidate.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{candidate.name}</h1>
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
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: partyColor }}
                  />
                  <span className="text-sm sm:text-base text-gray-600">{candidate.party}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {candidate.district} निर्वाचन क्षेत्र नं. {candidate.constituency}
                </div>

                {/* Share Card Button */}
                <div className="mt-3">
                  <CandidateShareCard
                    candidate={candidate}
                    photo={photo}
                    isFirstTime={history.length === 0}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Vote count */}
            {candidate.votes > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <div className="text-3xl font-bold text-gray-900">{candidate.votes.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">प्राप्त मत</div>
              </div>
            )}

            {/* Summary */}
            {enrichment?.summary && history.length > 0 && (
              <div className="mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">सारांश</h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{enrichment.summary}</p>
              </div>
            )}

            {/* Details grid */}
            <div className="mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">व्यक्तिगत विवरण</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {details.map(([label, value]) => (
                  <div key={label} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
                    <div className="text-sm font-medium text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* First-time candidate note */}
            {history.length === 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  {candidate.name}ले पहिलो पटक प्रतिनिधि सभा चुनावको लागि आफ्नो उम्मेदवारी {candidate.gender === "महिला" ? "दिएकी हुन्" : "दिएका हुन्"}।
                </p>
                <p className="text-xs text-blue-600 mt-1">* विगत दुई निर्वाचन (२०७४ र २०७९) को तथ्यांकमा आधारित</p>
              </div>
            )}

            {/* Election History */}
            {history.length > 0 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">निर्वाचन इतिहास</h2>
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
                        <th className="px-3 py-2 font-medium text-gray-500 text-xs">वर्ष</th>
                        <th className="px-3 py-2 font-medium text-gray-500 text-xs">क्षेत्र</th>
                        <th className="px-3 py-2 font-medium text-gray-500 text-xs">पार्टी</th>
                        <th className="px-3 py-2 font-medium text-gray-500 text-xs">नतिजा</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-900">{h.year}</td>
                          <td className="px-3 py-2 text-gray-600">{h.district} {h.constituency}</td>
                          <td className="px-3 py-2 text-gray-600">{h.party}</td>
                          <td className="px-3 py-2">
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

        {/* Data source notice */}
        <footer className="mt-6 text-center text-sm text-gray-500">
          <p>
            तथ्याङ्क स्रोत:{" "}
            <a
              href="https://election.gov.np"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              नेपाल निर्वाचन आयोग
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
