"use client";

import { useState, useCallback, useRef, memo } from "react";
import { DISTRICT_PATHS } from "@/data/district-paths";

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  districtId: string | null;
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
    districtId: null,
    content: null,
  });

  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [tappedDistrict, setTappedDistrict] = useState<{
    id: string;
    name: string;
    province: string;
    hq: string;
  } | null>(null);
  const isTouchRef = useRef(false);

  const handleDistrictClick = useCallback(
    (district: typeof DISTRICT_PATHS[0]) => {
      // On touch devices: first tap shows label, second tap on same district opens panel
      if (isTouchRef.current) {
        if (tappedDistrict?.id === district.id) {
          // Second tap on same district — open the panel
          if (onDistrictClick) {
            onDistrictClick(district.id);
          }
        } else {
          // First tap or different district — just show the label
          setTappedDistrict({
            id: district.id,
            name: district.name,
            province: provinceNames[district.province],
            hq: district.hq,
          });
        }
      } else {
        // Desktop click — open immediately
        setTappedDistrict({
          id: district.id,
          name: district.name,
          province: provinceNames[district.province],
          hq: district.hq,
        });
        if (onDistrictClick) {
          onDistrictClick(district.id);
        }
      }
    },
    [onDistrictClick, tappedDistrict?.id]
  );

  const handleTouchStart = useCallback(() => {
    isTouchRef.current = true;
  }, []);

  const handleDistrictMouseEnter = useCallback(
    (district: typeof DISTRICT_PATHS[0], evt: React.MouseEvent) => {
      setHoveredDistrict(district.id);
      setTooltip({
        show: true,
        x: evt.clientX,
        y: evt.clientY,
        districtId: district.id,
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
      {/* Fixed label for touch devices - clickable to open district details */}
      {tappedDistrict && (
        <button
          onClick={() => {
            if (onDistrictClick) {
              onDistrictClick(tappedDistrict.id);
            }
          }}
          className="w-full flex items-center justify-between gap-2 bg-blue-50 border-b border-blue-200 rounded-t-xl px-3 py-2 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-gray-900">{tappedDistrict.name}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{tappedDistrict.province}</span>
          </div>
          <span className="text-blue-600 text-sm font-medium flex-shrink-0">हेर्नुहोस् →</span>
        </button>
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
                onTouchStart={handleTouchStart}
                onClick={() => handleDistrictClick(district)}
                onMouseEnter={(e) => handleDistrictMouseEnter(district, e)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
              />
            );
          })}
        </g>


      </svg>

      {/* Tooltip - clickable to open district details */}
      {tooltip.show && tooltip.content && (
        <button
          onClick={() => {
            if (tooltip.districtId && onDistrictClick) {
              onDistrictClick(tooltip.districtId);
            }
          }}
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y - 10,
          }}
        >
          <div className="font-bold text-gray-900">{tooltip.content.name}</div>
          <div className="text-sm text-gray-600">{tooltip.content.province} प्रदेश</div>
          <div className="text-xs text-blue-600 mt-1 font-medium">
            हेर्नुहोस् →
          </div>
        </button>
      )}


    </div>
  );
});

export default NepalMap;
