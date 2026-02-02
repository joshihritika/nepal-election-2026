"use client";

import { useState, useEffect } from "react";
import { useCompare } from "@/contexts/CompareContext";
import { CANDIDATES, CandidateData } from "@/data/candidates-scraped";
import CompareModal from "./CompareModal";

let allCandidatesCache: CandidateData[] | null = null;
function getAllCandidates(): CandidateData[] {
  if (allCandidatesCache) return allCandidatesCache;
  allCandidatesCache = Object.values(CANDIDATES).flat();
  return allCandidatesCache;
}

function findCandidate(id: string): CandidateData | undefined {
  return getAllCandidates().find((c) => c.id === id);
}

export default function CompareBar() {
  const { selectedIds, removeCandidate, clearAll } = useCompare();
  const [showModal, setShowModal] = useState(false);
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (selectedIds.length > 0) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [selectedIds.length]);

  if (selectedIds.length === 0 && !visible) return null;

  const candidates = selectedIds
    .map(findCandidate)
    .filter(Boolean) as CandidateData[];

  const canCompare = candidates.length >= 2;

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-out ${
          visible && selectedIds.length > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-blue-600 text-white shadow-2xl border-t border-blue-500">
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Hint when only 1 selected */}
            {candidates.length === 1 && (
              <div className="text-center text-blue-100 text-xs mb-2 animate-pulse">
                तुलना गर्न कम्तिमा २ उम्मेदवार छान्नुहोस् — अर्को उम्मेदवारको <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-white/20 text-white text-[10px] align-middle mx-0.5">+</span> मा थिच्नुहोस्
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Pills */}
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                {candidates.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm px-3 py-1.5 rounded-full"
                  >
                    <span className="truncate max-w-[120px]">{c.name}</span>
                    <button
                      onClick={() => removeCandidate(c.id)}
                      className="hover:text-red-200 flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {candidates.length < 4 && (
                  <span className="text-xs text-blue-200">
                    {candidates.length}/4
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={clearAll}
                  className="text-sm text-blue-200 hover:text-white px-2 py-1"
                >
                  हटाउनुहोस्
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  disabled={!canCompare}
                  className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all
                    ${canCompare
                      ? "bg-white text-blue-700 hover:bg-blue-50 shadow-lg"
                      : "bg-white/20 text-blue-200 cursor-not-allowed"
                    }`}
                >
                  तुलना गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && canCompare && (
        <CompareModal
          candidates={candidates}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
