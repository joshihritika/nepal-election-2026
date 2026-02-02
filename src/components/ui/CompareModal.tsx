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

function getPartyColor(party: string): string {
  return PARTY_COLORS[party] || "#6B7280";
}

const PARTY_SHORTS: Record<string, string> = {
  "नेपाली काँग्रेस": "काँग्रेस",
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "एमाले",
  "राष्ट्रिय स्वतन्त्र पार्टी": "रास्वपा",
  "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "माओवादी",
  "जनता समाजवादी पार्टी, नेपाल": "जसपा",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "राप्रपा",
  "नेपाली कम्युनिष्ट पार्टी": "नेकपा",
};

function getPartyShort(party: string): string {
  return PARTY_SHORTS[party] || (party.length > 15 ? party.slice(0, 12) + "…" : party);
}

interface CompareModalProps {
  candidates: CandidateData[];
  onClose: () => void;
}

export default function CompareModal({ candidates, onClose }: CompareModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const enrichments = useMemo(
    () => candidates.map((c) => getEnrichment(c.id)),
    [candidates]
  );
  const histories = useMemo(
    () => candidates.map((c) => getHistory(c.id)),
    [candidates]
  );

  const rows: { label: string; render: (c: CandidateData, i: number) => React.ReactNode }[] = [
    {
      label: "पार्टी",
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getPartyColor(c.party) }} />
          <span>{getPartyShort(c.party)}</span>
        </div>
      ),
    },
    { label: "उमेर", render: (c) => c.age > 0 ? `${c.age} वर्ष` : "—" },
    { label: "लिङ्ग", render: (c) => c.gender || "—" },
    { label: "शिक्षा", render: (c) => c.education || "—" },
    { label: "जिल्ला", render: (c) => `${c.district}-${c.constituency}` },
    { label: "प्रदेश", render: (c) => c.province || "—" },
    {
      label: "निर्वाचन इतिहास",
      render: (_c, i) => {
        const h = histories[i];
        if (h.length === 0) return <span className="text-blue-600 text-xs">पहिलो पटक</span>;
        return (
          <div className="space-y-1">
            {h.map((entry, j) => (
              <div key={j} className="text-xs">
                <span className="font-medium">{entry.year}</span>{" "}
                <span className={entry.result === "विजयी" ? "text-green-700" : "text-gray-500"}>
                  {entry.result}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-2 sm:inset-4 md:inset-6 z-[70] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">उम्मेदवार तुलना</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[600px]">
            {/* Candidate name headers */}
            <div className="grid border-b border-gray-200 sticky top-0 bg-white z-10" style={{ gridTemplateColumns: `140px repeat(${candidates.length}, 1fr)` }}>
              <div className="px-3 py-3 bg-gray-50 font-medium text-sm text-gray-500">विवरण</div>
              {candidates.map((c) => (
                <div key={c.id} className="px-3 py-3 border-l border-gray-200" style={{ backgroundColor: getPartyColor(c.party) + "10" }}>
                  <div className="font-semibold text-sm text-gray-900 truncate">{c.name}</div>
                  <div className="text-xs text-gray-500 truncate">{getPartyShort(c.party)}</div>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid border-b border-gray-100"
                style={{ gridTemplateColumns: `140px repeat(${candidates.length}, 1fr)` }}
              >
                <div className="px-3 py-3 bg-gray-50 text-sm font-medium text-gray-600">{row.label}</div>
                {candidates.map((c, i) => (
                  <div key={c.id} className="px-3 py-3 border-l border-gray-100 text-sm text-gray-700">
                    {row.render(c, i)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
