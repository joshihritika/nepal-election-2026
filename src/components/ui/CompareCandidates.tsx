"use client";

import { useState } from "react";
import { CANDIDATES, CandidateData } from "@/data/candidates-scraped";
import CandidateSelector from "./CandidateSelector";
import CompareModal from "./CompareModal";

let allCandidatesCache: CandidateData[] | null = null;
function getAllCandidates(): CandidateData[] {
  if (allCandidatesCache) return allCandidatesCache;
  allCandidatesCache = Object.values(CANDIDATES).flat();
  return allCandidatesCache;
}

const MAX_SLOTS = 4;
const MIN_SLOTS = 2;

export default function CompareCandidates() {
  const [slots, setSlots] = useState<(CandidateData | null)[]>([null, null]);
  const [showModal, setShowModal] = useState(false);

  const selectedIds = slots.filter(Boolean).map((c) => c!.id);
  const filledCount = slots.filter(Boolean).length;

  const handleSelect = (index: number, candidate: CandidateData) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = candidate;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const addSlot = () => {
    if (slots.length < MAX_SLOTS) {
      setSlots((prev) => [...prev, null]);
    }
  };

  const removeSlot = (index: number) => {
    if (slots.length <= MIN_SLOTS) return;
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const candidates = slots.filter(Boolean) as CandidateData[];

  return (
    <section className="mt-6 bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        उम्मेदवार तुलना गर्नुहोस्
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {slots.map((slot, i) => (
          <div key={i} className="relative">
            {slot ? (
              <div className="flex items-center gap-2 px-3 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-gray-900 truncate">{slot.name}</div>
                  <div className="text-sm text-gray-500 truncate">{slot.district}-{slot.constituency}</div>
                </div>
                <button
                  onClick={() => handleRemove(i)}
                  className="p-1 hover:text-red-600 text-gray-400 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <CandidateSelector
                onSelect={(c) => handleSelect(i, c)}
                excludeIds={selectedIds}
                placeholder={`उम्मेदवार ${i + 1} खोज्नुहोस्...`}
              />
            )}
            {slots.length > MIN_SLOTS && !slot && (
              <button
                onClick={() => removeSlot(i)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 hover:bg-red-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {slots.length < MAX_SLOTS && (
          <button
            onClick={addSlot}
            className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-gray-300 rounded-lg text-base text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            थप्नुहोस्
          </button>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          disabled={filledCount < 2}
          className="px-5 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          तुलना गर्नुहोस्
        </button>
      </div>

      {showModal && candidates.length >= 2 && (
        <CompareModal candidates={candidates} onClose={() => setShowModal(false)} />
      )}
    </section>
  );
}
