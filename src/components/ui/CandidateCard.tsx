"use client";

import { Candidate } from "@/types/election";
import Image from "next/image";

interface CandidateCardProps {
  candidate: Candidate;
  constituencyName?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function CandidateCard({
  candidate,
  constituencyName,
  isExpanded = false,
  onToggle,
}: CandidateCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300
        ${isExpanded ? "ring-2 ring-blue-500" : "hover:shadow-md"}`}
    >
      {/* Header with party color stripe */}
      <div className="h-1.5" style={{ backgroundColor: candidate.partyColor }} />

      <div className="p-5">
        {/* Candidate Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: candidate.partyColor }}
          >
            {candidate.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{candidate.name}</h3>

            {/* Party badge */}
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: candidate.partyColor }}
              >
                {candidate.partyShort}
              </span>
              {candidate.isIncumbent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Incumbent
                </span>
              )}
            </div>

            {constituencyName && (
              <p className="text-sm text-gray-500 mt-1">{constituencyName}</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Age</span>
            <p className="text-sm font-medium text-gray-900">{candidate.age} years</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Education</span>
            <p className="text-sm font-medium text-gray-900 truncate">{candidate.education}</p>
          </div>
        </div>

        {/* Previous Position */}
        {candidate.previousPosition && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Previous Role</span>
            <p className="text-sm font-medium text-gray-900">{candidate.previousPosition}</p>
          </div>
        )}

        {/* Expand/Collapse Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors"
          >
            {isExpanded ? "Show less" : "View manifesto & details"}
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-in slide-in-from-top-2">
            {/* Manifesto */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Promises</h4>
              <ul className="space-y-2">
                {candidate.manifesto_summary.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: candidate.partyColor }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media Links */}
            {Object.keys(candidate.social_media_links).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Connect</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.social_media_links.facebook && (
                    <a
                      href={candidate.social_media_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </a>
                  )}
                  {candidate.social_media_links.twitter && (
                    <a
                      href={candidate.social_media_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X
                    </a>
                  )}
                  {candidate.social_media_links.instagram && (
                    <a
                      href={candidate.social_media_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      Instagram
                    </a>
                  )}
                  {candidate.social_media_links.youtube && (
                    <a
                      href={candidate.social_media_links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      YouTube
                    </a>
                  )}
                  {candidate.social_media_links.website && (
                    <a
                      href={candidate.social_media_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
