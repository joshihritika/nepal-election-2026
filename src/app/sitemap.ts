import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/slug";

const BASE_URL = "https://nepalelections.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // Get all candidate slugs
  const allSlugs = getAllSlugs();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Dynamic candidate pages with slugs
  const candidatePages: MetadataRoute.Sitemap = allSlugs.map(({ slug }) => ({
    url: `${BASE_URL}/candidate/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...candidatePages];
}
