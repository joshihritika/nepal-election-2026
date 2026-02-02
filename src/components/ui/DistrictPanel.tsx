"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { getDistrictById, getProvinceById } from "@/data/districts";
import { getCandidates, getConstituencies, CandidateData } from "@/data/candidates-scraped";
import ScrapedCandidateCard from "./ScrapedCandidateCard";
import CandidateModal from "./CandidateModal";

function getVoterId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("nepal_election_voter_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("nepal_election_voter_id", id);
  }
  return id;
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
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [userVote, setUserVote] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

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

  const constituencyKey = constituencyNum ? `${districtId}-${constituencyNum}` : "";

  // Fetch votes when constituency changes
  const fetchVotes = useCallback(async () => {
    if (!constituencyKey) return;
    const voterId = getVoterId();
    try {
      const res = await fetch(`/api/votes?constituency=${constituencyKey}&voterId=${voterId}`);
      if (res.ok) {
        const data = await res.json();
        setVoteCounts(data.votes || {});
        setUserVote(data.userVote || null);
      }
    } catch {
      // Silently fail
    }
  }, [constituencyKey]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const handleVote = async (candidateId: string) => {
    if (voting) return;
    setVoting(true);
    const voterId = getVoterId();
    // Toggle: if already voted for this candidate, remove the vote
    const isUnvote = userVote === candidateId;
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ constituency: constituencyKey, candidateId: isUnvote ? null : candidateId, voterId }),
      });
      if (res.ok) {
        const data = await res.json();
        setVoteCounts(data.votes || {});
        setUserVote(data.userVote || null);
      }
    } catch {
      // Silently fail
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);

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
              {/* Voting prompt */}
              {selectedCandidates.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗳️</span>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800">कसले जित्ला? आफ्नो भोट दिनुहोस्</h4>
                      {totalVotes > 0 && (
                        <p className="text-xs text-blue-600 mt-0.5">कुल {totalVotes} जनाले भोट दिएका छन्</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {selectedCandidates.map((candidate, index) => (
                  <ScrapedCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    onClick={() => setSelectedCandidate(candidate)}
                    onVote={() => handleVote(candidate.id)}
                    isVoted={userVote === candidate.id}
                    voteCount={voteCounts[candidate.id] || 0}
                    totalVotes={totalVotes}
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
      </div>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </>
  );
}
