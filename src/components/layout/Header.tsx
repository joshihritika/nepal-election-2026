"use client";

import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="truncate">निर्वाचन दिन: २०८२ फागुन २१ <span className="hidden sm:inline">(मार्च ५, २०२६)</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="https://election.gov.np"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              निर्वाचन आयोग
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                नेपाल निर्वाचन २०८२
              </h1>
              <p className="text-xs text-gray-500">आम निर्वाचन</p>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">७</div>
              <div className="text-xs text-gray-500">प्रदेश</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">७७</div>
              <div className="text-xs text-gray-500">जिल्ला</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">१६५</div>
              <div className="text-xs text-gray-500">निर्वाचन क्षेत्र</div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="mt-4">
          <Breadcrumbs />
        </div>
      </div>
    </header>
  );
}
