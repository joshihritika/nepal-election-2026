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

  // Use a ref to track active tooltip district to avoid closure issues
  const activeTooltipDistrictRef = useRef<string | null>(null);

  // Track last touch time to ignore simulated mouse events
  const lastTouchTimeRef = useRef<number>(0);

  // Open district details
  const openDistrict = useCallback((districtId: string) => {
    if (onDistrictClick) {
      onDistrictClick(districtId);
    }
    activeTooltipDistrictRef.current = null;
    setHoveredDistrict(null);
    setTooltip(prev => ({ ...prev, show: false }));
  }, [onDistrictClick]);

  // Show tooltip for a district
  const showTooltip = useCallback((district: typeof DISTRICT_PATHS[0], x: number, y: number) => {
    setHoveredDistrict(district.id);
    activeTooltipDistrictRef.current = district.id;
    setTooltip({
      show: true,
      x,
      y,
      districtId: district.id,
      content: {
        name: district.name,
        province: provinceNames[district.province],
        hq: district.hq,
      },
    });
  }, []);

  // Handle touch start - record the time
  const handleTouchStart = useCallback(() => {
    lastTouchTimeRef.current = Date.now();
  }, []);

  // Handle click on district
  const handleDistrictClick = useCallback(
    (district: typeof DISTRICT_PATHS[0], evt: React.MouseEvent) => {
      evt.stopPropagation();

      // Check if this click came from a touch (within 500ms of last touch)
      const isFromTouch = Date.now() - lastTouchTimeRef.current < 500;

      if (isFromTouch) {
        // Touch device: first tap shows tooltip, second tap on same opens
        if (activeTooltipDistrictRef.current === district.id) {
          openDistrict(district.id);
        } else {
          showTooltip(district, evt.clientX, evt.clientY);
        }
      } else {
        // Desktop: click opens directly
        openDistrict(district.id);
      }
    },
    [openDistrict, showTooltip]
  );

  // Handle mouse enter (desktop hover for tooltip)
  const handleMouseEnter = useCallback(
    (district: typeof DISTRICT_PATHS[0], evt: React.MouseEvent) => {
      // Ignore simulated mouse events from touch (within 500ms of last touch)
      const isFromTouch = Date.now() - lastTouchTimeRef.current < 500;
      if (isFromTouch) return;

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

  // Handle mouse leave (desktop)
  const handleMouseLeave = useCallback(() => {
    // Ignore if we have an active touch tooltip
    if (activeTooltipDistrictRef.current) return;

    setHoveredDistrict(null);
    setTooltip((prev) => ({ ...prev, show: false }));
  }, []);

  // Handle mouse move (desktop)
  const handleMouseMove = useCallback((evt: React.MouseEvent) => {
    // Ignore if we have an active touch tooltip
    if (activeTooltipDistrictRef.current) return;

    setTooltip((prev) => ({
      ...prev,
      x: evt.clientX,
      y: evt.clientY,
    }));
  }, []);

  // Handle click on SVG background to close tooltip
  const handleBackgroundClick = useCallback(() => {
    activeTooltipDistrictRef.current = null;
    setHoveredDistrict(null);
    setTooltip((prev) => ({ ...prev, show: false }));
  }, []);

  // Handle tooltip button click
  const handleTooltipClick = useCallback(() => {
    if (tooltip.districtId) {
      openDistrict(tooltip.districtId);
    }
  }, [tooltip.districtId, openDistrict]);

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
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full"
        style={{ minWidth: "580px", minHeight: "280px" }}
        preserveAspectRatio="xMidYMid meet"
        onClick={handleBackgroundClick}
        onTouchStart={handleTouchStart}
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
                onClick={(e) => handleDistrictClick(district, e)}
                onMouseEnter={(e) => handleMouseEnter(district, e)}
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
          onClick={handleTooltipClick}
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y - 10,
          }}
        >
          <div className="font-bold text-gray-900">{tooltip.content.name}</div>
          <div className="text-sm text-gray-600">{tooltip.content.province} प्रदेश</div>
          <div className="text-base sm:text-xs text-blue-600 mt-1 font-medium">
            हेर्नुहोस् →
          </div>
        </button>
      )}
    </div>
  );
});

export default NepalMap;
