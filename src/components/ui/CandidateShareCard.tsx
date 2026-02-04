"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { CandidateData } from "@/data/candidates-scraped";

const PARTY_COLORS: Record<string, string> = {
  "नेपाली काँग्रेस": "#2563EB",
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "#DC2626",
  "राष्ट्रिय स्वतन्त्र पार्टी": "#0EA5E9",
  "नेपाली कम्युनिष्ट पार्टी": "#059669",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "#F59E0B",
  "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "#991B1B",
  "जनता समाजवादी पार्टी, नेपाल": "#7C3AED",
};

const PARTY_SHORT: Record<string, string> = {
  "नेपाली काँग्रेस": "काँग्रेस",
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "एमाले",
  "राष्ट्रिय स्वतन्त्र पार्टी": "रास्वपा",
  "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "माओवादी",
  "जनता समाजवादी पार्टी, नेपाल": "जसपा",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "राप्रपा",
  "नेपाली कम्युनिष्ट पार्टी": "नेकपा",
};

function getPartyColor(party: string): string {
  return PARTY_COLORS[party] || "#6B7280";
}

function getPartyShort(party: string): string {
  return PARTY_SHORT[party] || party.slice(0, 15);
}

interface CandidateShareCardProps {
  candidate: CandidateData;
  photo?: string;
  isFirstTime?: boolean;
}

export default function CandidateShareCard({
  candidate,
  photo,
  isFirstTime = false,
}: CandidateShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const partyColor = getPartyColor(candidate.party);
  const partyShort = getPartyShort(candidate.party);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `${candidate.name}-nepal-election-2082.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Download Button */}
      <button
        onClick={() => setShowCard(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Share Card बनाउनुहोस्
      </button>

      {/* Modal with Card Preview */}
      {showCard && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-sm"
            onClick={() => setShowCard(false)}
          />
          <div className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-y-8 lg:inset-x-[25%] z-[90] flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full max-h-full overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Share Card Preview</h3>
                <button
                  onClick={() => setShowCard(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* The actual card to be captured */}
              <div
                ref={cardRef}
                className="relative w-full aspect-square overflow-hidden rounded-xl"
                style={{ maxWidth: "400px", margin: "0 auto" }}
              >
                {/* Very light yellow/cream background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(145deg, #FFFEF5 0%, #FEF9E7 50%, #FFFEF5 100%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center pt-8 pb-10 px-6">
                  {/* Election Badge */}
                  <div className="bg-amber-800/80 text-white rounded-full px-4 py-1 mb-4">
                    <span className="text-xs font-semibold">निर्वाचन २०८२</span>
                  </div>

                  {/* Photo or Initial */}
                  <div className="mb-3">
                    {photo ? (
                      <img
                        src={photo}
                        alt={candidate.name}
                        className="w-24 h-24 rounded-full object-cover shadow-lg"
                        style={{ border: `4px solid ${partyColor}` }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg text-white"
                        style={{ backgroundColor: partyColor }}
                      >
                        {candidate.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    {candidate.name}
                  </h2>

                  {/* Party Badge */}
                  <div
                    className="px-4 py-1.5 rounded-full text-sm font-semibold text-white shadow-md mb-3"
                    style={{ backgroundColor: partyColor }}
                  >
                    {partyShort}
                  </div>

                  {/* Election Symbol */}
                  {candidate.symbol && (
                    <div className="flex items-center gap-2 bg-white/70 rounded-full px-3 py-1 mb-3">
                      <span className="text-xs text-gray-600">चुनाव चिन्ह:</span>
                      <span className="text-sm font-semibold text-gray-800">{candidate.symbol}</span>
                    </div>
                  )}

                  {/* Constituency */}
                  <div className="text-center mb-auto">
                    <div className="text-xs text-amber-800 font-medium">निर्वाचन क्षेत्र</div>
                    <div className="text-xl font-bold text-gray-900">
                      {candidate.district}-{candidate.constituency}
                    </div>
                  </div>

                  {/* Website URL - at bottom, not overlaying */}
                  <div className="mt-auto pt-3 text-center">
                    <span className="text-[10px] text-amber-700/70">nepalelections.vercel.app</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isGenerating ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Image
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Download गरी Instagram, Facebook वा Twitter मा share गर्नुहोस्
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
