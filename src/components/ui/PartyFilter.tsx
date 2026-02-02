"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { parties } from "@/data/parties";

export default function PartyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedParty = searchParams.get("party");

  const handlePartySelect = (partyId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (partyId === null || selectedParty === partyId) {
      params.delete("party");
    } else {
      params.set("party", partyId);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">दल अनुसार छान्नुहोस्</h3>

      <div className="flex flex-wrap gap-2">
        {/* All Parties Option */}
        <button
          onClick={() => handlePartySelect(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${!selectedParty
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          सबै दल
        </button>

        {/* Party Buttons */}
        {parties.map((party) => (
          <button
            key={party.id}
            onClick={() => handlePartySelect(party.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${selectedParty === party.id
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            style={selectedParty === party.id ? { backgroundColor: party.color } : {}}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: party.color }}
            />
            {party.shortName}
          </button>
        ))}
      </div>
    </div>
  );
}
