import Link from "next/link";
import Header from "@/components/layout/Header";

export default function CandidateNotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            उम्मेदवार फेला परेन
          </h1>
          <p className="text-gray-600 mb-6">
            माफ गर्नुहोस्, तपाईंले खोज्नुभएको उम्मेदवार हाम्रो डाटाबेसमा फेला परेन।
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            गृहपृष्ठमा फर्कनुहोस्
          </Link>
        </div>
      </main>
    </div>
  );
}
