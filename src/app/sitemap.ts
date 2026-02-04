import { MetadataRoute } from "next";
import { CANDIDATES } from "@/data/candidates-scraped";

const BASE_URL = "https://nepalelections.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // Get all candidate IDs
  const allCandidates = Object.values(CANDIDATES).flat();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Dynamic candidate pages
  const candidatePages: MetadataRoute.Sitemap = allCandidates.map((candidate) => ({
    url: `${BASE_URL}/candidate/${candidate.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...candidatePages];
}
