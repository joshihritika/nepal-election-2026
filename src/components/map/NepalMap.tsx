"use client";

import { useState, useCallback, useRef, memo, useEffect } from "react";
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

interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
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

  // Mobile pinch-to-zoom and pan state
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });
  const touchStateRef = useRef({
    lastDistance: 0,
    lastX: 0,
    lastY: 0,
    isPinching: false,
    isDragging: false,
  });

  // Sync ref with state
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Handle pinch zoom and pan on mobile
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const getDistance = (t1: Touch, t2: Touch) => {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const ts = touchStateRef.current;

      if (e.touches.length === 2) {
        ts.isPinching = true;
        ts.isDragging = false;
        ts.lastDistance = getDistance(e.touches[0], e.touches[1]);
        ts.lastX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        ts.lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        e.preventDefault();
      } else if (e.touches.length === 1 && zoomRef.current.scale > 1) {
        ts.isDragging = true;
        ts.isPinching = false;
        ts.lastX = e.touches[0].clientX;
        ts.lastY = e.touches[0].clientY;
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const ts = touchStateRef.current;
      const currentZoom = zoomRef.current;

      if (e.touches.length === 2 && ts.isPinching) {
        e.preventDefault();

        const newDistance = getDistance(e.touches[0], e.touches[1]);
        const newX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const newY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        const scaleDelta = newDistance / ts.lastDistance;
        let newScale = Math.min(Math.max(currentZoom.scale * scaleDelta, 1), 3);

        // Calculate new translation
        let newTranslateX = currentZoom.translateX + (newX - ts.lastX);
        let newTranslateY = currentZoom.translateY + (newY - ts.lastY);

        // Reset if zoomed out
        if (newScale <= 1.05) {
          newScale = 1;
          newTranslateX = 0;
          newTranslateY = 0;
        } else {
          // Limit pan based on zoom - allow more movement
          const maxX = (newScale - 1) * 150;
          const maxY = (newScale - 1) * 80;
          newTranslateX = Math.max(-maxX, Math.min(maxX, newTranslateX));
          newTranslateY = Math.max(-maxY, Math.min(maxY, newTranslateY));
        }

        ts.lastDistance = newDistance;
        ts.lastX = newX;
        ts.lastY = newY;

        setZoom({ scale: newScale, translateX: newTranslateX, translateY: newTranslateY });
      } else if (e.touches.length === 1 && ts.isDragging && currentZoom.scale > 1) {
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = touch.clientX - ts.lastX;
        const deltaY = touch.clientY - ts.lastY;

        let newTranslateX = currentZoom.translateX + deltaX;
        let newTranslateY = currentZoom.translateY + deltaY;

        // Limit pan based on zoom
        const maxX = (currentZoom.scale - 1) * 150;
        const maxY = (currentZoom.scale - 1) * 80;
        newTranslateX = Math.max(-maxX, Math.min(maxX, newTranslateX));
        newTranslateY = Math.max(-maxY, Math.min(maxY, newTranslateY));

        ts.lastX = touch.clientX;
        ts.lastY = touch.clientY;

        setZoom(prev => ({ ...prev, translateX: newTranslateX, translateY: newTranslateY }));
      }
    };

    const handleTouchEnd = () => {
      touchStateRef.current.isPinching = false;
      touchStateRef.current.isDragging = false;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  const handleDistrictClick = useCallback(
    (district: typeof DISTRICT_PATHS[0]) => {
      // On desktop, click opens immediately
      // On touch devices, the tooltip is clickable
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
      {/* Zoom controls for mobile */}
      {zoom.scale > 1 && (
        <button
          onClick={() => setZoom({ scale: 1, translateX: 0, translateY: 0 })}
          className="absolute top-2 right-2 z-10 sm:hidden bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-600 shadow-md border border-gray-200"
        >
          Reset Zoom
        </button>
      )}
      <div
        ref={mapContainerRef}
        className="overflow-hidden touch-none"
        style={{ borderRadius: "inherit" }}
      >
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full"
          style={{
            minWidth: "580px",
            minHeight: "280px",
            transform: `translate(${zoom.translateX}px, ${zoom.translateY}px) scale(${zoom.scale})`,
            transformOrigin: "center center",
            willChange: zoom.scale > 1 ? "transform" : "auto",
          }}
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
      </div>

      {/* Zoom hint for mobile */}
      <div className="sm:hidden text-center text-xs text-gray-400 py-1">
        Pinch to zoom
      </div>

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
          <div className="text-base sm:text-xs text-blue-600 mt-1 font-medium">
            हेर्नुहोस् →
          </div>
        </button>
      )}


    </div>
  );
});

export default NepalMap;
