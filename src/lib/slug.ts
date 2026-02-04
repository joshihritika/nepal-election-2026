import { CANDIDATES, CandidateData } from "@/data/candidates-scraped";

// Nepali to English transliteration map
const TRANSLITERATION_MAP: Record<string, string> = {
  // Vowels
  "अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऋ": "ri",
  // Consonants
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "w", "श": "sh",
  "ष": "sh", "स": "s", "ह": "h",
  // Matras (vowel signs)
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ृ": "ri",
  // Special characters
  "्": "", "ं": "n", "ँ": "n", "ः": "h",
  "।": "", "॥": "",
  // Numbers
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
  // Common conjuncts - handle special cases
  "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gy", "श्र": "shr",
};

// Well-known name overrides for better URLs
const NAME_OVERRIDES: Record<string, string> = {
  "के.पी शर्मा ओली": "kp-sharma-oli",
  "के.पी. शर्मा ओली": "kp-sharma-oli",
  "केपी शर्मा ओली": "kp-sharma-oli",
  "शेरबहादुर देउवा": "sher-bahadur-deuba",
  "शेर बहादुर देउवा": "sher-bahadur-deuba",
  "पुष्प कमल दाहाल": "pushpa-kamal-dahal",
  "पुष्प कमल दाहाल प्रचण्ड": "pushpa-kamal-dahal-prachanda",
  "बालेन शाह": "balen-shah",
  "बालेन्द्र शाह": "balendra-shah",
  "गगन थापा": "gagan-thapa",
  "गगन कुमार थापा": "gagan-kumar-thapa",
  "रवि लामिछाने": "rabi-lamichhane",
  "रवीन्द्र मिश्र": "rabindra-mishra",
  "अमरेश कुमार सिंह": "amresh-kumar-singh",
  "हर्क राज राई": "harka-raj-rai",
  "रन्जु न्यौपाने": "ranju-neupane",
  "रन्‍जु न्‍यौपाने": "ranju-neupane",
  "माधव कुमार नेपाल": "madhav-kumar-nepal",
  "झलनाथ खनाल": "jhalanath-khanal",
  "बाबुराम भट्टराई": "baburam-bhattarai",
  "रामचन्द्र पौडेल": "ramchandra-poudel",
  "विष्णु पौडेल": "bishnu-poudel",
  "उपेन्द्र यादव": "upendra-yadav",
  "रेणु दाहाल": "renu-dahal",
};

/**
 * Transliterate Nepali text to English
 */
function transliterateNepali(text: string): string {
  let result = "";
  const chars = [...text]; // Handle multi-byte characters properly

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Check for two-character conjuncts first
    if (i < chars.length - 1) {
      const twoChar = char + chars[i + 1];
      if (TRANSLITERATION_MAP[twoChar]) {
        result += TRANSLITERATION_MAP[twoChar];
        i++;
        continue;
      }
    }

    if (TRANSLITERATION_MAP[char]) {
      result += TRANSLITERATION_MAP[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
    } else if (char === " " || char === "-") {
      result += "-";
    } else if (char === "." || char === "।") {
      // Skip periods
    } else {
      // Skip unknown characters
    }
  }

  return result;
}

/**
 * Generate a URL-friendly slug from a candidate name
 */
export function generateSlug(name: string): string {
  // Check for override first
  if (NAME_OVERRIDES[name]) {
    return NAME_OVERRIDES[name];
  }

  // Transliterate and clean up
  let slug = transliterateNepali(name);

  // Clean up the slug
  slug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/-+/g, "-")          // Replace multiple hyphens with single
    .replace(/^-|-$/g, "");       // Remove leading/trailing hyphens

  return slug || "candidate";
}

// Build slug mappings
let slugToIdMap: Map<string, string> | null = null;
let idToSlugMap: Map<string, string> | null = null;

function buildSlugMappings() {
  if (slugToIdMap && idToSlugMap) return;

  slugToIdMap = new Map();
  idToSlugMap = new Map();

  const allCandidates = Object.values(CANDIDATES).flat();
  const slugCounts: Record<string, number> = {};

  // First pass: count slug occurrences
  for (const candidate of allCandidates) {
    const baseSlug = generateSlug(candidate.name);
    slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
  }

  // Second pass: assign unique slugs
  const slugUsage: Record<string, number> = {};

  for (const candidate of allCandidates) {
    const baseSlug = generateSlug(candidate.name);
    let finalSlug: string;

    if (slugCounts[baseSlug] === 1) {
      // Unique slug, use as-is
      finalSlug = baseSlug;
    } else {
      // Duplicate slug, append district and constituency
      const districtSlug = generateSlug(candidate.district);
      finalSlug = `${baseSlug}-${districtSlug}-${candidate.constituency}`;

      // If still not unique, append ID
      if (slugToIdMap!.has(finalSlug)) {
        finalSlug = `${baseSlug}-${candidate.id}`;
      }
    }

    slugToIdMap!.set(finalSlug, candidate.id);
    idToSlugMap!.set(candidate.id, finalSlug);
  }
}

/**
 * Get candidate ID from slug
 */
export function getIdFromSlug(slug: string): string | undefined {
  buildSlugMappings();
  return slugToIdMap!.get(slug);
}

/**
 * Get slug from candidate ID
 */
export function getSlugFromId(id: string): string | undefined {
  buildSlugMappings();
  return idToSlugMap!.get(id);
}

/**
 * Get all slug-id pairs for sitemap generation
 */
export function getAllSlugs(): { slug: string; id: string }[] {
  buildSlugMappings();
  return Array.from(slugToIdMap!.entries()).map(([slug, id]) => ({ slug, id }));
}
