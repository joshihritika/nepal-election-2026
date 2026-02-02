"use client";

import { useEffect, useState } from "react";
import { KeyBattle } from "@/data/key-battles";

interface BattleDossierModalProps {
  battle: KeyBattle;
  onClose: () => void;
}

function getStorageKey(battleId: string) {
  return `poll-${battleId}`;
}

function getVotes(battleId: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getStorageKey(battleId) + "-votes");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function hasVoted(battleId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getStorageKey(battleId) + "-voted") === "true";
}

function castVote(battleId: string, candidateName: string) {
  const votes = getVotes(battleId);
  votes[candidateName] = (votes[candidateName] || 0) + 1;
  localStorage.setItem(getStorageKey(battleId) + "-votes", JSON.stringify(votes));
  localStorage.setItem(getStorageKey(battleId) + "-voted", "true");
}

export default function BattleDossierModal({ battle, onClose }: BattleDossierModalProps) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setVoted(hasVoted(battle.id));
    setVotes(getVotes(battle.id));
    return () => {
      document.body.style.overflow = "";
    };
  }, [battle.id]);

  const handleVote = (candidateName: string) => {
    if (voted) return;
    castVote(battle.id, candidateName);
    setVoted(true);
    setVotes(getVotes(battle.id));
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-3 sm:inset-6 md:inset-y-8 md:inset-x-[8%] lg:inset-y-8 lg:inset-x-[15%] z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-[10px] sm:text-xs font-medium bg-white/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                  प्रमुख प्रतिस्पर्धा
                </span>
                <h2 className="text-base sm:text-xl font-bold truncate">{battle.constituency}</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 truncate">{battle.tagline}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Candidate Face-off */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-[1fr_auto_1fr] items-stretch max-w-2xl mx-auto">
              {/* Candidate 1 */}
              <div className="p-3 sm:p-6 text-center">
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg"
                  style={{ backgroundColor: battle.candidates[0].partyColor }}
                >
                  {battle.candidates[0].name.charAt(0)}
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 mt-2 sm:mt-3">
                  {battle.candidates[0].name}
                </h3>
                <span
                  className="inline-block mt-1 sm:mt-1.5 text-[10px] sm:text-xs font-medium text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                  style={{ backgroundColor: battle.candidates[0].partyColor }}
                >
                  {battle.candidates[0].partyShort}
                </span>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 leading-relaxed hidden sm:block">
                  {battle.candidates[0].description}
                </p>
              </div>

              {/* VS divider */}
              <div className="flex items-center justify-center px-1 sm:px-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg">
                  VS
                </div>
              </div>

              {/* Candidate 2 */}
              <div className="p-3 sm:p-6 text-center">
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg"
                  style={{ backgroundColor: battle.candidates[1].partyColor }}
                >
                  {battle.candidates[1].name.charAt(0)}
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 mt-2 sm:mt-3">
                  {battle.candidates[1].name}
                </h3>
                <span
                  className="inline-block mt-1 sm:mt-1.5 text-[10px] sm:text-xs font-medium text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                  style={{ backgroundColor: battle.candidates[1].partyColor }}
                >
                  {battle.candidates[1].partyShort}
                </span>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 leading-relaxed hidden sm:block">
                  {battle.candidates[1].description}
                </p>
              </div>
            </div>
            {/* Descriptions below face-off on mobile */}
            <div className="sm:hidden px-4 pb-3 space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed"><span className="font-semibold">{battle.candidates[0].name}:</span> {battle.candidates[0].description}</p>
              <p className="text-xs text-gray-600 leading-relaxed"><span className="font-semibold">{battle.candidates[1].name}:</span> {battle.candidates[1].description}</p>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-2xl mx-auto">
            {/* Context */}
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                पृष्ठभूमि
              </h4>
              <div className="space-y-3">
                {battle.context.split("\n\n").map((para, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">{para}</p>
                ))}
              </div>
            </section>

            {/* Rivalry */}
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                किन महत्त्वपूर्ण?
              </h4>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-gray-800 leading-relaxed">{battle.rivalry}</p>
              </div>
            </section>

            {/* Stakes */}
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                दाउमा के छ?
              </h4>
              <ul className="space-y-2">
                {battle.stakes.map((stake, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {stake}
                  </li>
                ))}
              </ul>
            </section>

            {/* Voter Sentiment Poll */}
            <section className="pb-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                तपाईंको मत
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-600 mb-4">
                  यो प्रतिस्पर्धामा कसले जित्छ जस्तो लाग्छ?
                </p>

                {!voted ? (
                  <div className="grid grid-cols-2 gap-3">
                    {battle.candidates.map((candidate) => (
                      <button
                        key={candidate.name}
                        onClick={() => handleVote(candidate.name)}
                        className="py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all text-center hover:shadow-md"
                      >
                        <div
                          className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: candidate.partyColor }}
                        >
                          {candidate.name.charAt(0)}
                        </div>
                        <div className="font-semibold text-gray-900 mt-2 text-sm">
                          {candidate.name}
                        </div>
                        <div className="text-xs text-gray-500">{candidate.partyShort}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {battle.candidates.map((candidate) => {
                      const count = votes[candidate.name] || 0;
                      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      return (
                        <div key={candidate.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {candidate.name}
                              <span className="text-gray-400 ml-1">({candidate.partyShort})</span>
                            </span>
                            <span className="text-sm font-bold text-gray-900">{pct}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: candidate.partyColor,
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{count} मत</div>
                        </div>
                      );
                    })}
                    <p className="text-xs text-gray-400 text-center pt-2">
                      कुल {totalVotes} जनाले मत दिनुभएको छ
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
