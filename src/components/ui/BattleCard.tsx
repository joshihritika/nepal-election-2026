"use client";

import { KeyBattle } from "@/data/key-battles";

interface BattleCardProps {
  battle: KeyBattle;
  onOpen: () => void;
}

export default function BattleCard({ battle, onOpen }: BattleCardProps) {
  return (
    <button
      onClick={onOpen}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all text-left group w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600">
          {battle.constituency}
        </span>
        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          विवरण हेर्नुहोस्
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4">{battle.tagline}</p>

      {/* Candidate face-off */}
      <div className="flex items-center gap-2">
        <div className="flex-1 text-center">
          <div
            className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: battle.candidates[0].partyColor }}
          >
            {battle.candidates[0].name.charAt(0)}
          </div>
          <div className="text-sm font-semibold text-gray-900 mt-1.5 truncate">
            {battle.candidates[0].name}
          </div>
          <div className="text-xs text-gray-500">{battle.candidates[0].partyShort}</div>
        </div>

        <div className="flex-shrink-0 text-xs font-bold text-gray-300 uppercase">vs</div>

        <div className="flex-1 text-center">
          <div
            className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: battle.candidates[1].partyColor }}
          >
            {battle.candidates[1].name.charAt(0)}
          </div>
          <div className="text-sm font-semibold text-gray-900 mt-1.5 truncate">
            {battle.candidates[1].name}
          </div>
          <div className="text-xs text-gray-500">{battle.candidates[1].partyShort}</div>
        </div>
      </div>
    </button>
  );
}
