"use client";

import { useState, useMemo } from "react";
import { provinces, districts } from "@/data/districts";

interface LocationFilterProps {
  onSelect: (districtId: string, constituencyNum?: string) => void;
}

export default function LocationFilter({ onSelect }: LocationFilterProps) {
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [constituency, setConstituency] = useState("");

  const filteredDistricts = useMemo(
    () => (provinceId ? districts.filter(d => d.provinceId === provinceId) : []),
    [provinceId]
  );

  const selectedDistrict = useMemo(
    () => districts.find(d => d.id === districtId),
    [districtId]
  );

  const constituencyOptions = useMemo(() => {
    if (!selectedDistrict) return [];
    return Array.from({ length: selectedDistrict.constituencies }, (_, i) => i + 1);
  }, [selectedDistrict]);

  const handleProvinceChange = (val: string) => {
    setProvinceId(val);
    setDistrictId("");
    setConstituency("");
  };

  const handleDistrictChange = (val: string) => {
    setDistrictId(val);
    setConstituency("");
  };

  const handleGo = () => {
    if (districtId) {
      onSelect(districtId, constituency || undefined);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">वा फिल्टर गर्नुहोस्</h3>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
        {/* Province */}
        <select
          value={provinceId}
          onChange={e => handleProvinceChange(e.target.value)}
          className="w-full sm:flex-1 min-h-[48px] px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">प्रदेश छान्नुहोस्</option>
          {provinces.map(p => (
            <option key={p.id} value={p.id}>{p.nameNepali}</option>
          ))}
        </select>

        {/* District */}
        <select
          value={districtId}
          onChange={e => handleDistrictChange(e.target.value)}
          disabled={!provinceId}
          className="w-full sm:flex-1 min-h-[48px] px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
        >
          <option value="">जिल्ला छान्नुहोस्</option>
          {filteredDistricts.map(d => (
            <option key={d.id} value={d.id}>{d.nameNepali}</option>
          ))}
        </select>

        {/* Constituency */}
        <select
          value={constituency}
          onChange={e => setConstituency(e.target.value)}
          disabled={!districtId}
          className="w-full sm:flex-1 min-h-[48px] px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
        >
          <option value="">निर्वाचन क्षेत्र</option>
          {constituencyOptions.map(n => (
            <option key={n} value={String(n)}>क्षेत्र नं. {n}</option>
          ))}
        </select>

        {/* Go button */}
        <button
          onClick={handleGo}
          disabled={!districtId}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-blue-600 text-white text-base sm:text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          हेर्नुहोस्
        </button>
      </div>
    </div>
  );
}
