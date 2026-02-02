"use client";

import { useState } from "react";
import {
  RETURNING_WINNERS,
  PARTY_SWITCHERS,
  TWO_TIME_CONTESTANTS,
  ReturningCandidate,
} from "@/data/returning-candidates";
import { CANDIDATES } from "@/data/candidates-scraped";

const TOTAL = 559;

const BOTH_WINNERS = TWO_TIME_CONTESTANTS.filter((c) => {
  const won2074 = c.history.some((h) => h.year === "२०७४" && h.result === "विजयी");
  const won2079 = c.history.some((h) => h.year === "२०७९" && h.result === "विजयी");
  return won2074 && won2079;
});

const STATS = [
  {
    key: "switchers",
    label: "यसपालि पार्टी परिवर्तन गरेका",
    data: PARTY_SWITCHERS,
    color: "#f97316",
    bg: "#fff7ed",
  },
  {
    key: "twotime",
    label: "२०७४ र २०७९ दुवै निर्वाचन लडेका",
    data: TWO_TIME_CONTESTANTS,
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    key: "bothwon",
    label: "२०७४ र २०७९ दुवैमा विजयी",
    data: BOTH_WINNERS,
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    key: "winners",
    label: "२०७९ मा विजयी भएका",
    data: RETURNING_WINNERS,
    color: "#22c55e",
    bg: "#f0fdf4",
  },
];

function toNepali(n: number): string {
  const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(n)
    .split("")
    .map((d) => digits[parseInt(d)] ?? d)
    .join("");
}

function Donut({ count, color }: { count: number; color: string }) {
  const pct = count / TOTAL;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const filled = circ * pct;
  const gap = circ - filled;

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="flex-shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${filled} ${gap}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
      />
      <text
        x="28"
        y="29"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="700"
        fill={color}
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function openCandidate(c: ReturningCandidate) {
  const allCandidates = Object.values(CANDIDATES).flat();
  const full = allCandidates.find((x) => x.id === c.id);
  if (full) {
    window.dispatchEvent(
      new CustomEvent("candidate-detail", { detail: full })
    );
  }
}

export default function ReturningCandidates() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const expandedStat = STATS.find((s) => s.key === expanded);

  return (
    <section className="mt-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">
          उम्मेदवार हाइलाइट्स
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.key}>
              <div
                className="flex items-center gap-3 rounded-lg p-3"
                style={{ backgroundColor: s.bg }}
              >
                <Donut count={s.data.length} color={s.color} />
                <div className="min-w-0">
                  <div className="text-2xl font-bold" style={{ color: s.color }}>
                    {toNepali(s.data.length)}
                  </div>
                  <div className="text-xs text-gray-700 leading-tight">
                    {s.label}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    ५५९ मध्ये
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExpanded(expanded === s.key ? null : s.key)}
                className="mt-1.5 text-[11px] font-medium w-full text-center py-1 rounded hover:underline"
                style={{ color: s.color }}
              >
                {expanded === s.key ? "बन्द गर्नुहोस् ✕" : "विस्तृत सूची हेर्नुहोस् →"}
              </button>
            </div>
          ))}
        </div>

        {expandedStat && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                {expandedStat.label}
                <span className="ml-1.5 font-normal text-gray-400">
                  ({toNepali(expandedStat.data.length)} जना)
                </span>
              </h4>
              <button
                onClick={() => setExpanded(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {expandedStat.data.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCandidate(c)}
                  className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-xs"
                >
                  <span className="font-medium text-gray-800 truncate">
                    {c.name}
                  </span>
                  <span className="text-gray-400 flex-shrink-0 ml-2 truncate max-w-[40%] text-right">
                    {c.district}-{c.constituency}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
