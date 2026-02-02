"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import ElectionCountdown from "@/components/ui/ElectionCountdown";
import DistrictPanel from "@/components/ui/DistrictPanel";
import CandidateModal from "@/components/ui/CandidateModal";
import NepalMap from "@/components/map/NepalMap";
import BattleCard from "@/components/ui/BattleCard";
import BattleDossierModal from "@/components/ui/BattleDossierModal";
import { KEY_BATTLES, KeyBattle } from "@/data/key-battles";
import { CandidateData } from "@/data/candidates-scraped";

function HomeContent() {
  const searchParams = useSearchParams();
  const selectedProvince = searchParams.get("prov") || undefined;

  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [selectedConstituency, setSelectedConstituency] = useState<string | undefined>();
  const [selectedBattle, setSelectedBattle] = useState<KeyBattle | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  const handleDistrictClick = useCallback((districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedConstituency(undefined);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedDistrict(undefined);
    setSelectedConstituency(undefined);
  }, []);

  const handleBackPanel = useCallback(() => {
    if (selectedConstituency) {
      setSelectedConstituency(undefined);
    } else {
      setSelectedDistrict(undefined);
    }
  }, [selectedConstituency]);

  const handleSelectConstituency = useCallback((num: string) => {
    setSelectedConstituency(num);
  }, []);

  // Listen for search selection events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.districtId) {
        setSelectedDistrict(detail.districtId);
        if (detail.constituencyNum) {
          setSelectedConstituency(String(detail.constituencyNum));
        } else {
          setSelectedConstituency(undefined);
        }
      }
    };
    window.addEventListener("search-select", handler);

    const candidateHandler = (e: Event) => {
      const candidate = (e as CustomEvent).detail as CandidateData;
      setSelectedCandidate(candidate);
    };
    window.addEventListener("candidate-detail", candidateHandler);

    return () => {
      window.removeEventListener("search-select", handler);
      window.removeEventListener("candidate-detail", candidateHandler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Introduction */}
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            अन्तरक्रियात्मक निर्वाचन नक्सा
          </h2>
          <p className="text-gray-600 max-w-2xl">
            २०८२ फागुन २१ गतेको आम निर्वाचनमा प्रतिस्पर्धा गर्ने उम्मेदवारहरू हेर्न कुनै पनि जिल्लामा क्लिक गर्नुहोस्।
          </p>
        </div>

        {/* Election Countdown */}
        <div className="mb-4">
          <ElectionCountdown />
        </div>

        {/* Map */}
        <div className="relative">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
              <NepalMap
                selectedProvince={selectedProvince}
                selectedDistrict={selectedDistrict}
                onDistrictClick={handleDistrictClick}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* District Panel Popup */}
          {selectedDistrict && (
            <DistrictPanel
              districtId={selectedDistrict}
              constituencyNum={selectedConstituency}
              onClose={handleClosePanel}
              onBack={handleBackPanel}
              onSelectConstituency={handleSelectConstituency}
            />
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">७</div>
            <div className="text-sm text-gray-500">प्रदेश</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-green-600">७७</div>
            <div className="text-sm text-gray-500">जिल्ला</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">१६५</div>
            <div className="text-sm text-gray-500">निर्वाचन क्षेत्र</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">१.८९ कराेड</div>
            <div className="text-sm text-gray-500">मतदाता</div>
          </div>
        </div>

        {/* Voter Demographics */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">मतदाता विवरण</h3>
            <span className="text-lg font-bold text-gray-900">१,८९,०३,६८९</span>
          </div>

          {/* Stacked bar */}
          <div className="flex rounded-full overflow-hidden h-2.5">
            <div className="bg-blue-500" style={{ width: "51.1%" }} />
            <div className="bg-pink-500" style={{ width: "48.9%" }} />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />पुरुष ५१.१%</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500" />महिला ४८.९%</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" />अन्य २००</span>
          </div>
        </div>

        {/* Key Battles Section */}
        <section className="mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            हेर्नुपर्ने प्रमुख प्रतिस्पर्धा
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KEY_BATTLES.map((battle) => (
              <BattleCard
                key={battle.id}
                battle={battle}
                onOpen={() => setSelectedBattle(battle)}
              />
            ))}
          </div>
        </section>

        {/* Data Source Notice */}
        <footer className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
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
            । उम्मेदवार सम्बन्धी जानकारी प्रारम्भिक हो र आधिकारिक मनोनयन पछि परिवर्तन हुन सक्छ।
          </p>
          <p className="mt-2">
            &copy; २०८२ नेपाल निर्वाचन मतदाताको नक्सा। शैक्षिक उद्देश्यका लागि।
          </p>
        </footer>
      </main>

      {selectedBattle && (
        <BattleDossierModal
          battle={selectedBattle}
          onClose={() => setSelectedBattle(null)}
        />
      )}

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">लोड हुँदैछ...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
