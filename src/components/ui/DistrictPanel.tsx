"use client";

import { useMemo, useEffect, useState } from "react";
import { getDistrictById, getProvinceById } from "@/data/districts";
import { getCandidates, getConstituencies, CANDIDATES, CandidateData } from "@/data/candidates-scraped";
import ScrapedCandidateCard from "./ScrapedCandidateCard";
import CandidateModal from "./CandidateModal";
import CompareModal from "./CompareModal";
import { useCompare } from "@/contexts/CompareContext";

let allCandidatesCache: CandidateData[] | null = null;
function getAllCandidates(): CandidateData[] {
  if (allCandidatesCache) return allCandidatesCache;
  allCandidatesCache = Object.values(CANDIDATES).flat();
  return allCandidatesCache;
}

function findCandidate(id: string): CandidateData | undefined {
  return getAllCandidates().find((c) => c.id === id);
}

interface DistrictPanelProps {
  districtId: string;
  constituencyNum?: string;
  onClose: () => void;
  onBack: () => void;
  onSelectConstituency: (num: string) => void;
}

export default function DistrictPanel({ districtId, constituencyNum, onClose, onBack, onSelectConstituency }: DistrictPanelProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const { selectedIds, removeCandidate, clearAll } = useCompare();

  const district = useMemo(() => getDistrictById(districtId), [districtId]);
  const province = useMemo(
    () => (district ? getProvinceById(district.provinceId) : null),
    [district]
  );

  const constituencies = useMemo(() => {
    return getConstituencies(districtId);
  }, [districtId]);

  const selectedCandidates = useMemo(() => {
    if (!constituencyNum) return [];
    return getCandidates(districtId, constituencyNum);
  }, [districtId, constituencyNum]);

  // Lock body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!district) return null;

  const handleConstituencySelect = (num: number) => {
    onSelectConstituency(num.toString());
  };

  const handleBack = () => {
    onBack();
  };

  const handleClose = () => {
    onClose();
  };

  const totalCandidates = constituencies.reduce(
    (sum, c) => sum + getCandidates(districtId, c).length,
    0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-2 sm:inset-8 md:inset-y-12 md:inset-x-[10%] lg:inset-y-12 lg:inset-x-[20%] z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0"
          style={{ backgroundColor: province?.color + "15" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {constituencyNum && (
                <button
                  onClick={handleBack}
                  className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                  {district.nameNepali || district.name}
                  {constituencyNum && `-${constituencyNum}`}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {province?.nameNepali || province?.name} प्रदेश
                  {!constituencyNum && (
                    <>
                      {" · "}{constituencies.length > 0 ? constituencies.length : district.constituencies} निर्वाचन क्षेत्र
                      {totalCandidates > 0 && ` · ${totalCandidates} उम्मेदवार`}
                    </>
                  )}
                  {constituencyNum && ` · ${selectedCandidates.length} उम्मेदवार`}
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {!constituencyNum ? (
            /* Constituency List */
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 tracking-wide">
                निर्वाचन क्षेत्र छान्नुहोस्
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {constituencies.map((constNum) => {
                  const candidates = getCandidates(districtId, constNum);
                  const electedCandidate = candidates.find(c => c.elected);

                  return (
                    <button
                      key={constNum}
                      onClick={() => handleConstituencySelect(constNum)}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-left group"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: province?.color }}
                      >
                        {constNum}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {district.nameNepali || district.name}-{constNum}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {candidates.length} उम्मेदवार
                          {electedCandidate && (
                            <span className="text-green-600 ml-1">
                              · विजेता: {electedCandidate.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}

                {constituencies.length === 0 && district.constituencies > 0 && (
                  Array.from({ length: district.constituencies }, (_, i) => i + 1).map((constNum) => (
                    <button
                      key={constNum}
                      onClick={() => handleConstituencySelect(constNum)}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-left group"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: province?.color }}
                      >
                        {constNum}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {district.nameNepali || district.name}-{constNum}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          उम्मेदवार तथ्याङ्क उपलब्ध छैन
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Candidate List */
            <div>
              {selectedCandidates.length > 0 && (
                <h3 className="text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                  उम्मेदवारहरूको तुलना गर्न <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/80 border border-gray-300 text-gray-400 text-xs align-middle mx-0.5">+</span> मा थिच्नुहोस्
                </h3>
              )}

              <div className="space-y-2">
                {selectedCandidates.map((candidate, index) => (
                  <ScrapedCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    onClick={() => setSelectedCandidate(candidate)}
                  />
                ))}

                {selectedCandidates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>यो निर्वाचन क्षेत्रको उम्मेदवार तथ्याङ्क अझै उपलब्ध छैन।</p>
                    <p className="text-sm mt-1">आधिकारिक मनोनयन पछि तथ्याङ्क अपडेट गरिनेछ।</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Compare bar inside the panel */}
        {constituencyNum && selectedIds.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-blue-600 text-white px-4 py-3">
            {selectedIds.length === 1 && (
              <div className="text-center text-blue-100 text-xs mb-2">
                अर्को उम्मेदवारको <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-white/20 text-white text-[10px] align-middle mx-0.5">+</span> मा थिच्नुहोस्
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                {selectedIds.map((id) => {
                  const c = findCandidate(id);
                  if (!c) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      <span className="truncate max-w-[80px]">{c.name}</span>
                      <button onClick={() => removeCandidate(id)} className="hover:text-red-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
                <span className="text-xs text-blue-200">{selectedIds.length}/4</span>
              </div>
              <button onClick={clearAll} className="text-xs text-blue-200 hover:text-white px-1.5 py-1">
                हटाउनुहोस्
              </button>
              <button
                onClick={() => setShowCompareModal(true)}
                disabled={selectedIds.length < 2}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  selectedIds.length >= 2
                    ? "bg-white text-blue-700 hover:bg-blue-50 shadow-lg"
                    : "bg-white/20 text-blue-200 cursor-not-allowed"
                }`}
              >
                तुलना गर्नुहोस्
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {showCompareModal && selectedIds.length >= 2 && (
        <CompareModal
          candidates={selectedIds.map(findCandidate).filter(Boolean) as CandidateData[]}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </>
  );
}
