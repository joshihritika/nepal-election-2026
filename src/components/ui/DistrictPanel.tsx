"use client";

import { useMemo, useEffect, useState } from "react";
import { getDistrictById, getProvinceById } from "@/data/districts";
import { getCandidates, getConstituencies, CANDIDATES, CandidateData } from "@/data/candidates-scraped";
import { getEnrichment } from "@/data/candidate-enrichments";
import { getHistory } from "@/data/candidate-history";
import ScrapedCandidateCard from "./ScrapedCandidateCard";
import CompareModal from "./CompareModal";
import CandidateShareCard from "./CandidateShareCard";
import { useCompare } from "@/contexts/CompareContext";

// Candidate photos mapping
const CANDIDATE_PHOTOS: Record<string, string> = {
  "के.पी शर्मा ओली": "https://upload.wikimedia.org/wikipedia/commons/d/dd/The_Prime_Minister_of_Nepal%2C_Shri_KP_Sharma_Oli_at_Bangkok%2C_in_Thailand_on_April_04%2C_2025_%28cropped%29.jpg",
  "केपी शर्मा ओली": "https://upload.wikimedia.org/wikipedia/commons/d/dd/The_Prime_Minister_of_Nepal%2C_Shri_KP_Sharma_Oli_at_Bangkok%2C_in_Thailand_on_April_04%2C_2025_%28cropped%29.jpg",
  "बालेन शाह": "https://annapurnaexpress.prixacdn.net/media/albums/Balen_Shah_iuTWcK0zlE.jpg",
  "बालेन्द्र शाह": "https://annapurnaexpress.prixacdn.net/media/albums/Balen_Shah_iuTWcK0zlE.jpg",
  "वालेन्द्र शाह": "https://annapurnaexpress.prixacdn.net/media/albums/Balen_Shah_iuTWcK0zlE.jpg",
  "रन्‍जु न्‍यौपाने": "https://en.setopati.com/uploads/posts/1656815531RanjuDarshana.jpg",
  "रन्जु न्यौपाने": "https://en.setopati.com/uploads/posts/1656815531RanjuDarshana.jpg",
  "रवीन्द्र मिश्र": "https://assets-api.kathmandupost.com/thumb.php?src=https://assets-cdn.kathmandupost.com/uploads/source/news/2022/third-party/thumb-1653465369.jpg&w=900&height=601",
  "गगन थापा": "https://enlokaantar.prixacdn.net/media/gallery_folder/Gagan_Thapa_5Hcxj6DB0H.jpg",
  "गगन कुमार थापा": "https://enlokaantar.prixacdn.net/media/gallery_folder/Gagan_Thapa_5Hcxj6DB0H.jpg",
  "अमरेश कुमार सिंह": "https://upload.wikimedia.org/wikipedia/commons/0/08/Dr._Amresh_Kumar_Singh.jpg",
  "अमरेश कुमार सिह": "https://upload.wikimedia.org/wikipedia/commons/0/08/Dr._Amresh_Kumar_Singh.jpg",
  "हर्क राज राई": "https://wegeexfuvagvyntbtcyu.supabase.co/storage/v1/object/public/user-content/politicians/808ac4bd-087f-4a1a-b036-7ade6351d1a7-5wdm6md4q9o.jpg",
};

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

let allCandidatesCache: CandidateData[] | null = null;
function getAllCandidates(): CandidateData[] {
  if (allCandidatesCache) return allCandidatesCache;
  allCandidatesCache = Object.values(CANDIDATES).flat();
  return allCandidatesCache;
}

function findCandidate(id: string): CandidateData | undefined {
  return getAllCandidates().find((c) => c.id === id);
}

function findCandidateBySlug(slug: string, districtId: string, constituencyNum: string): CandidateData | undefined {
  const candidates = getCandidates(districtId, constituencyNum);
  return candidates.find((c) => c.id === slug || c.id.includes(slug));
}

interface DistrictPanelProps {
  districtId: string;
  constituencyNum?: string;
  candidateSlug?: string;
  onClose: () => void;
  onBack: () => void;
  onSelectConstituency: (num: string) => void;
  onSelectCandidate: (slug: string) => void;
}

export default function DistrictPanel({ districtId, constituencyNum, candidateSlug, onClose, onBack, onSelectConstituency, onSelectCandidate }: DistrictPanelProps) {
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

  // Get selected candidate for detail view
  const selectedCandidate = useMemo(() => {
    if (!candidateSlug || !constituencyNum) return null;
    return selectedCandidates.find((c) => c.id === candidateSlug) || null;
  }, [candidateSlug, constituencyNum, selectedCandidates]);

  const candidateHistory = useMemo(() => {
    if (!selectedCandidate) return [];
    return getHistory(selectedCandidate.id);
  }, [selectedCandidate]);

  const candidateEnrichment = useMemo(() => {
    if (!selectedCandidate) return null;
    return getEnrichment(selectedCandidate.id);
  }, [selectedCandidate]);

  const candidatePhoto = selectedCandidate ? CANDIDATE_PHOTOS[selectedCandidate.name] : undefined;

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
          style={{ backgroundColor: selectedCandidate ? getPartyColor(selectedCandidate.party) + "15" : province?.color + "15" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(constituencyNum || candidateSlug) && (
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
                  {selectedCandidate ? selectedCandidate.name : (
                    <>
                      {district.nameNepali || district.name}
                      {constituencyNum && `-${constituencyNum}`}
                    </>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {selectedCandidate ? (
                    <>
                      {selectedCandidate.party}
                      {" · "}{district.nameNepali || district.name}-{constituencyNum}
                    </>
                  ) : (
                    <>
                      {province?.nameNepali || province?.name} प्रदेश
                      {!constituencyNum && (
                        <>
                          {" · "}{constituencies.length > 0 ? constituencies.length : district.constituencies} निर्वाचन क्षेत्र
                          {totalCandidates > 0 && ` · ${totalCandidates} उम्मेदवार`}
                        </>
                      )}
                      {constituencyNum && !candidateSlug && ` · ${selectedCandidates.length} उम्मेदवार`}
                    </>
                  )}
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
          {selectedCandidate ? (
            /* Candidate Details */
            <div className="space-y-4">
              {/* Photo and basic info */}
              <div className="flex items-start gap-4">
                {candidatePhoto ? (
                  <img
                    src={candidatePhoto}
                    alt={selectedCandidate.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2"
                    style={{ borderColor: getPartyColor(selectedCandidate.party) }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: getPartyColor(selectedCandidate.party) }}
                  >
                    {selectedCandidate.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {selectedCandidate.elected && (
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        विजेता
                      </span>
                    )}
                    {candidateHistory.length === 0 && (
                      <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        पहिलो पटक
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{selectedCandidate.party}</div>
                  <CandidateShareCard
                    candidate={selectedCandidate}
                    photo={candidatePhoto}
                    isFirstTime={candidateHistory.length === 0}
                  />
                </div>
              </div>

              {/* Vote count */}
              {selectedCandidate.votes > 0 && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedCandidate.votes.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">प्राप्त मत</div>
                </div>
              )}

              {/* Summary */}
              {candidateEnrichment?.summary && candidateHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">सारांश</h3>
                  <p className="text-sm text-gray-600">{candidateEnrichment.summary}</p>
                </div>
              )}

              {/* Personal Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">व्यक्तिगत विवरण</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCandidate.age > 0 && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">उमेर</div>
                      <div className="text-sm font-medium text-gray-900">{selectedCandidate.age} वर्ष</div>
                    </div>
                  )}
                  {selectedCandidate.gender && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">लिङ्ग</div>
                      <div className="text-sm font-medium text-gray-900">{selectedCandidate.gender}</div>
                    </div>
                  )}
                  {selectedCandidate.education && (
                    <div className="p-2 bg-gray-50 rounded-lg col-span-2">
                      <div className="text-xs text-gray-500">शिक्षा</div>
                      <div className="text-sm font-medium text-gray-900">{selectedCandidate.education}</div>
                    </div>
                  )}
                  {selectedCandidate.father && (
                    <div className="p-2 bg-gray-50 rounded-lg col-span-2">
                      <div className="text-xs text-gray-500">बाबुको नाम</div>
                      <div className="text-sm font-medium text-gray-900">{selectedCandidate.father}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* First-time candidate note */}
              {candidateHistory.length === 0 && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800">
                    {selectedCandidate.name}ले पहिलो पटक प्रतिनिधि सभा चुनावको लागि उम्मेदवारी दिएका हुन्।
                  </p>
                  <p className="text-xs text-blue-600 mt-1">* विगत दुई निर्वाचन (२०७४ र २०७९) को तथ्यांकमा आधारित</p>
                </div>
              )}

              {/* Election History */}
              {candidateHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">निर्वाचन इतिहास</h3>
                  <div className="space-y-2">
                    {candidateHistory.map((h, i) => (
                      <div key={i} className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{h.year}</span>
                          <span className={h.result === "विजयी" ? "text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full" : "text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full"}>
                            {h.result}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{h.district} {h.constituency}</div>
                        <div className="text-xs text-gray-500">{h.party}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">* विगत दुई निर्वाचन (२०७४ र २०७९) को तथ्यांकमा आधारित</p>
                </div>
              )}
            </div>
          ) : !constituencyNum ? (
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
                    asLink={false}
                    onClick={() => onSelectCandidate(candidate.id)}
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

      {showCompareModal && selectedIds.length >= 2 && (
        <CompareModal
          candidates={selectedIds.map(findCandidate).filter(Boolean) as CandidateData[]}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </>
  );
}
