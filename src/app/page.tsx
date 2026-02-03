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
import CommentSection from "@/components/ui/CommentSection";
import LocationFilter from "@/components/ui/LocationFilter";
import SearchBar from "@/components/ui/SearchBar";
import { KEY_BATTLES, KeyBattle } from "@/data/key-battles";
import ReturningCandidates from "@/components/ui/ReturningCandidates";
import CompareCandidates from "@/components/ui/CompareCandidates";
import { CompareProvider } from "@/contexts/CompareContext";
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
    <CompareProvider>
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Title */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            प्रतिनिधि सभा सदस्य निर्वाचन २०८२
          </h1>
          <p className="text-base sm:text-lg italic text-blue-700/80 mb-4">प्रत्येक मत महत्त्वपूर्ण छ। मतदान गर्न नभुल्नुहोला।</p>
          {/* Key Stats */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">७</div>
              <div className="text-xs sm:text-sm text-gray-500">प्रदेश</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">७७</div>
              <div className="text-xs sm:text-sm text-gray-500">जिल्ला</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">१६५</div>
              <div className="text-xs sm:text-sm text-gray-500">निर्वाचन क्षेत्र</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">१.८९ कराेड</div>
              <div className="text-xs sm:text-sm text-gray-500">मतदाता</div>
            </div>
          </div>
        </div>

        {/* Election Countdown */}
        <div className="mb-4">
          <ElectionCountdown />
        </div>

        {/* Search & Filter */}
        <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
          <div>
            <SearchBar />
          </div>
          <LocationFilter onSelect={(districtId, constituencyNum) => {
            setSelectedDistrict(districtId);
            setSelectedConstituency(constituencyNum);
          }} />
        </div>

        {/* Map */}
        <div className="relative">
          <p className="text-sm font-bold text-gray-700 mb-2 text-center">नक्सामा क्लिक गरी उम्मेदवारहरूको विवरण हेर्नुहोस्</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative">
            {/* Election Info — fixed to top-right corner, doesn't scroll with map */}
            <div className="absolute top-0 right-0 z-10 bg-white/90 backdrop-blur rounded-bl-lg rounded-tr-xl shadow-sm px-1.5 py-1 md:px-4 md:py-3 border-b border-l border-gray-100 pointer-events-none">
              <div className="text-[8px] md:text-xs text-gray-500 uppercase tracking-wide leading-tight">आम निर्वाचन</div>
              <div className="text-[10px] md:text-lg font-bold text-blue-900 leading-tight">२०८२ फागुन २१</div>
              <div className="text-[8px] md:text-xs text-gray-500 leading-tight">७७ जिल्ला • १६५ <span className="hidden md:inline">निर्वाचन </span>क्षेत्र</div>
            </div>
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

        {/* Compare Candidates */}
        <CompareCandidates />

        {/* Returning Candidates */}
        <ReturningCandidates />

        {/* Voter Demographics */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700">मतदाता विवरण</h3>
            <span className="text-sm sm:text-lg font-bold text-gray-900">१,८९,०३,६८९</span>
          </div>

          {/* Stacked bar */}
          <div className="flex rounded-full overflow-hidden h-2.5">
            <div className="bg-blue-500" style={{ width: "51.1%" }} />
            <div className="bg-pink-500" style={{ width: "48.9%" }} />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 text-xs sm:text-sm text-gray-500">
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

        {/* Comments */}
        <CommentSection />

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
    </CompareProvider>
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
