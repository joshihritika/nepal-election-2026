"use client";

import { useState, useEffect } from "react";

// Election date: March 5, 2026 (2082 Falgun 21)
const ELECTION_DATE = "2026-03-05T00:00:00+05:45";

const calculateTimeLeft = () => {
  const difference = +new Date(ELECTION_DATE) - +new Date();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export default function ElectionCountdown() {
  const [hasMounted, setHasMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setHasMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!hasMounted) {
    return (
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-xl border border-blue-700 p-3 sm:p-5 text-white">
        <div className="text-center">
          <h3 className="text-xs sm:text-sm font-medium text-blue-200 tracking-wide mb-2 sm:mb-3">
            निर्वाचनमा बाँकी समय
          </h3>
          <div className="flex justify-center gap-2 sm:gap-5 h-10 sm:h-12 items-center">
            <span className="text-blue-300 text-xs sm:text-sm animate-pulse">गणना सुरु हुँदैछ...</span>
          </div>
          <div className="text-[10px] sm:text-xs text-blue-300 mt-2 sm:mt-3">
            २०८२ फागुन २१ गते (मार्च ५, २०२६) · आम निर्वाचन
          </div>
        </div>
      </div>
    );
  }

  const isElectionDay = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-xl border border-blue-700 p-3 sm:p-5 text-white">
      <div className="text-center">
        <h3 className="text-xs sm:text-sm font-medium text-blue-200 tracking-wide mb-2 sm:mb-3">
          {isElectionDay ? "आज निर्वाचन दिन हो!" : "निर्वाचनमा बाँकी समय"}
        </h3>

        {!isElectionDay && (
          <div className="flex justify-center gap-2 sm:gap-5">
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-4xl font-bold tabular-nums">
                {timeLeft.days}
              </div>
              <div className="text-[10px] sm:text-xs text-blue-300 mt-0.5 sm:mt-1">दिन</div>
            </div>
            <div className="text-xl sm:text-3xl font-light text-blue-400 self-start mt-0.5 sm:mt-1">:</div>
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-4xl font-bold tabular-nums">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-blue-300 mt-0.5 sm:mt-1">घण्टा</div>
            </div>
            <div className="text-xl sm:text-3xl font-light text-blue-400 self-start mt-0.5 sm:mt-1">:</div>
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-4xl font-bold tabular-nums">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-blue-300 mt-0.5 sm:mt-1">मिनेट</div>
            </div>
            <div className="text-xl sm:text-3xl font-light text-blue-400 self-start mt-0.5 sm:mt-1">:</div>
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-4xl font-bold tabular-nums">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-blue-300 mt-0.5 sm:mt-1">सेकेन्ड</div>
            </div>
          </div>
        )}

        <div className="text-[10px] sm:text-xs text-blue-300 mt-2 sm:mt-3">
          २०८२ फागुन २१ गते (मार्च ५, २०२६) · आम निर्वाचन
        </div>
      </div>
    </div>
  );
}
