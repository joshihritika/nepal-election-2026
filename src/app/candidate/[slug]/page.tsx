import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CANDIDATES, CandidateData } from "@/data/candidates-scraped";
import { getEnrichment } from "@/data/candidate-enrichments";
import { getIdFromSlug, getAllSlugs } from "@/lib/slug";
import CandidateProfileClient from "./CandidateProfileClient";

// Candidate photos mapping (from key battles and other sources)
const CANDIDATE_PHOTOS: Record<string, string> = {
  // KP Oli
  "के.पी शर्मा ओली": "https://upload.wikimedia.org/wikipedia/commons/d/dd/The_Prime_Minister_of_Nepal%2C_Shri_KP_Sharma_Oli_at_Bangkok%2C_in_Thailand_on_April_04%2C_2025_%28cropped%29.jpg",
  "केपी शर्मा ओली": "https://upload.wikimedia.org/wikipedia/commons/d/dd/The_Prime_Minister_of_Nepal%2C_Shri_KP_Sharma_Oli_at_Bangkok%2C_in_Thailand_on_April_04%2C_2025_%28cropped%29.jpg",
  // Balen Shah
  "बालेन शाह": "https://annapurnaexpress.prixacdn.net/media/albums/Balen_Shah_iuTWcK0zlE.jpg",
  "बालेन्द्र शाह": "https://annapurnaexpress.prixacdn.net/media/albums/Balen_Shah_iuTWcK0zlE.jpg",
  // Ranju Neupane
  "रन्‍जु न्‍यौपाने": "https://en.setopati.com/uploads/posts/1656815531RanjuDarshana.jpg",
  "रन्जु न्यौपाने": "https://en.setopati.com/uploads/posts/1656815531RanjuDarshana.jpg",
  // Rabindra Mishra
  "रवीन्द्र मिश्र": "https://assets-api.kathmandupost.com/thumb.php?src=https://assets-cdn.kathmandupost.com/uploads/source/news/2022/third-party/thumb-1653465369.jpg&w=900&height=601",
  // Gagan Thapa
  "गगन थापा": "https://enlokaantar.prixacdn.net/media/gallery_folder/Gagan_Thapa_5Hcxj6DB0H.jpg",
  // Amresh Kumar Singh
  "अमरेश कुमार सिंह": "https://upload.wikimedia.org/wikipedia/commons/0/08/Dr._Amresh_Kumar_Singh.jpg",
  // Harka Raj Rai
  "हर्क राज राई": "https://wegeexfuvagvyntbtcyu.supabase.co/storage/v1/object/public/user-content/politicians/808ac4bd-087f-4a1a-b036-7ade6351d1a7-5wdm6md4q9o.jpg",
};

// Get all candidates as a flat array
function getAllCandidates(): CandidateData[] {
  return Object.values(CANDIDATES).flat();
}

// Find candidate by ID
function findCandidateById(id: string): CandidateData | undefined {
  return getAllCandidates().find((c) => c.id === id);
}

// Get candidate photo by name
function getCandidatePhoto(name: string): string | undefined {
  return CANDIDATE_PHOTOS[name];
}

// Generate static params for all candidates using slugs
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map(({ slug }) => ({
    slug,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const id = getIdFromSlug(slug);
  const candidate = id ? findCandidateById(id) : undefined;

  if (!candidate) {
    return {
      title: "उम्मेदवार फेला परेन | नेपाल निर्वाचन २०८२",
      description: "यो उम्मेदवार फेला परेन।",
    };
  }

  const enrichment = getEnrichment(candidate.id);
  const photo = getCandidatePhoto(candidate.name);

  const title = `${candidate.name} - निर्वाचन २०८२ प्रोफाइल र इतिहास | नेपाल निर्वाचन`;
  const description = enrichment?.summary
    ? enrichment.summary
    : `${candidate.district} ${candidate.constituency} निर्वाचन क्षेत्रबाट ${candidate.party}का उम्मेदवार ${candidate.name}को विस्तृत निर्वाचन इतिहास, पार्टी इतिहास र २०७४/२०७९ को परिणाम हेर्नुहोस्। नेपाल निर्वाचन २०८२ को लागि जानकारी।`;

  const metadata: Metadata = {
    title,
    description,
    keywords: [
      candidate.name,
      candidate.party,
      candidate.district,
      `${candidate.district} ${candidate.constituency}`,
      "नेपाल निर्वाचन २०८२",
      "Nepal election 2026",
      "उम्मेदवार प्रोफाइल",
    ],
    openGraph: {
      title,
      description,
      type: "profile",
      locale: "ne_NP",
      siteName: "नेपाल निर्वाचन २०८२",
    },
    twitter: {
      card: photo ? "summary_large_image" : "summary",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };

  // Add og:image if candidate has a photo
  if (photo) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [
        {
          url: photo,
          width: 800,
          height: 800,
          alt: `${candidate.name} - ${candidate.party}`,
        },
      ],
    };
    metadata.twitter = {
      ...metadata.twitter,
      images: [photo],
    };
  }

  return metadata;
}

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const id = getIdFromSlug(slug);
  const candidate = id ? findCandidateById(id) : undefined;

  if (!candidate) {
    notFound();
  }

  const photo = getCandidatePhoto(candidate.name);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">लोड हुँदैछ...</div>
        </div>
      }
    >
      <CandidateProfileClient candidate={candidate} photo={photo} />
    </Suspense>
  );
}
