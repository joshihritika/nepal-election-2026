"use client";

import { useState, useCallback, memo } from "react";
import { DISTRICT_PATHS } from "@/data/district-paths";

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  content: {
    name: string;
    province: string;
    hq: string;
  } | null;
}

interface NepalMapProps {
  selectedProvince?: string;
  selectedDistrict?: string;
  onDistrictClick?: (districtId: string) => void;
  partyFilter?: string;
  className?: string;
}

// Province colors matching the reference map
const provinceColors: Record<number, string> = {
  1: "#DC2626", // कोशी - Red
  2: "#EC4899", // मधेश - Pink
  3: "#2563EB", // बागमती - Blue
  4: "#7C3AED", // गण्डकी - Purple
  5: "#F97316", // लुम्बिनी - Orange
  6: "#16A34A", // कर्णाली - Green
  7: "#0891B2", // सुदूरपश्चिम - Cyan
};

// Province names in Nepali
const provinceNames: Record<number, string> = {
  1: "कोशी",
  2: "मधेश",
  3: "बागमती",
  4: "गण्डकी",
  5: "लुम्बिनी",
  6: "कर्णाली",
  7: "सुदूरपश्चिम",
};

const NepalMap = memo(function NepalMap({
  selectedProvince,
  selectedDistrict,
  onDistrictClick,
  className = "",
}: NepalMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    content: null,
  });

  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [tappedDistrict, setTappedDistrict] = useState<{
    name: string;
    province: string;
    hq: string;
  } | null>(null);

  const handleDistrictClick = useCallback(
    (district: typeof DISTRICT_PATHS[0]) => {
      // Show fixed label on tap (works for touch and click)
      setTappedDistrict({
        name: district.name,
        province: provinceNames[district.province],
        hq: district.hq,
      });
      if (onDistrictClick) {
        onDistrictClick(district.id);
      }
    },
    [onDistrictClick]
  );

  const handleDistrictMouseEnter = useCallback(
    (district: typeof DISTRICT_PATHS[0], evt: React.MouseEvent) => {
      setHoveredDistrict(district.id);
      setTooltip({
        show: true,
        x: evt.clientX,
        y: evt.clientY,
        content: {
          name: district.name,
          province: provinceNames[district.province],
          hq: district.hq,
        },
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredDistrict(null);
    setTooltip((prev) => ({ ...prev, show: false }));
  }, []);

  const handleMouseMove = useCallback((evt: React.MouseEvent) => {
    setTooltip((prev) => ({
      ...prev,
      x: evt.clientX,
      y: evt.clientY,
    }));
  }, []);

  const getDistrictColor = (district: typeof DISTRICT_PATHS[0]) => {
    const pId = `p${district.province}`;
    if (selectedProvince && selectedProvince !== pId) {
      return "#D1D5DB";
    }
    return provinceColors[district.province];
  };

  const getDistrictOpacity = (district: typeof DISTRICT_PATHS[0]) => {
    const pId = `p${district.province}`;
    if (selectedProvince && selectedProvince !== pId) {
      return 0.3;
    }
    if (hoveredDistrict === district.id) {
      return 0.75;
    }
    if (selectedDistrict === district.id) {
      return 1;
    }
    return 0.9;
  };

  return (
    <div className={`relative bg-white rounded-xl ${className}`}>
      {/* Fixed label for touch devices */}
      {tappedDistrict && (
        <div className="flex items-center justify-between bg-blue-50 border-b border-blue-200 px-4 py-2 rounded-t-xl">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-gray-900">{tappedDistrict.name}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{tappedDistrict.province} प्रदेश</span>
            {tappedDistrict.hq && (
              <>
                <span className="text-gray-500 hidden sm:inline">•</span>
                <span className="text-gray-500 hidden sm:inline text-xs">सदरमुकाम: {tappedDistrict.hq}</span>
              </>
            )}
          </div>
          <button
            onClick={() => setTappedDistrict(null)}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full"
        style={{ minWidth: "580px", minHeight: "280px" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect x="0" y="0" width="800" height="400" fill="#f8fafc" />

        {/* District shapes - colored by province */}
        <g>
          {DISTRICT_PATHS.map((district) => {
            const isHovered = hoveredDistrict === district.id;
            const isSelected = selectedDistrict === district.id;

            return (
              <path
                key={district.id}
                d={district.d}
                fill={getDistrictColor(district)}
                opacity={getDistrictOpacity(district)}
                stroke={isSelected ? "#1E40AF" : isHovered ? "#ffffff" : "rgba(255,255,255,0.6)"}
                strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.5}
                className="cursor-pointer"
                onClick={() => handleDistrictClick(district)}
                onMouseEnter={(e) => handleDistrictMouseEnter(district, e)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
              />
            );
          })}
        </g>


      </svg>

      {/* Tooltip */}
      {tooltip.show && tooltip.content && (
        <div
          className="fixed z-50 pointer-events-none bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-3"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y - 10,
          }}
        >
          <div className="font-bold text-gray-900">{tooltip.content.name}</div>
          <div className="text-sm text-gray-600">{tooltip.content.province} प्रदेश</div>
          {tooltip.content.hq && (
            <div className="text-xs text-gray-500 mt-1">सदरमुकाम: {tooltip.content.hq}</div>
          )}
          <div className="text-xs text-blue-600 mt-1">
            निर्वाचन क्षेत्र हेर्न क्लिक गर्नुहोस्
          </div>
        </div>
      )}

      {/* Election Info */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-3 border border-gray-100">
        <div className="text-xs text-gray-500 uppercase tracking-wide">आम निर्वाचन</div>
        <div className="text-lg font-bold text-blue-900">२०८२ फागुन २१</div>
        <div className="text-xs text-gray-500 mt-1">७७ जिल्ला • १६५ निर्वाचन क्षेत्र</div>
      </div>

    </div>
  );
});

export default NepalMap;
