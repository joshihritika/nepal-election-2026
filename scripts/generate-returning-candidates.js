#!/usr/bin/env node
/**
 * Cross-references candidate-history.ts with candidates-scraped.ts
 * to generate categorized returning candidate lists.
 *
 * Usage: node scripts/generate-returning-candidates.js
 */

const fs = require("fs");
const path = require("path");

// --- Parse candidate-history.ts to extract HISTORY map ---
const historyFile = fs.readFileSync(
  path.join(__dirname, "../src/data/candidate-history.ts"),
  "utf-8"
);

// Extract all entries: id -> [{year, district, constituency, party, result}]
const HISTORY = {};
const entryRegex = /"(\d+)":\s*\[([\s\S]*?)\]/g;
let m;
while ((m = entryRegex.exec(historyFile)) !== null) {
  const id = m[1];
  const block = m[2];
  const items = [];
  const itemRegex =
    /\{\s*year:\s*"([^"]+)",\s*district:\s*"([^"]+)",\s*constituency:\s*"([^"]+)",\s*party:\s*"([^"]+)",\s*result:\s*"([^"]+)"\s*\}/g;
  let im;
  while ((im = itemRegex.exec(block)) !== null) {
    items.push({
      year: im[1],
      district: im[2],
      constituency: im[3],
      party: im[4],
      result: im[5],
    });
  }
  if (items.length > 0) {
    HISTORY[id] = items;
  }
}

// --- Parse candidates-scraped.ts to extract current candidates ---
const scrapedFile = fs.readFileSync(
  path.join(__dirname, "../src/data/candidates-scraped.ts"),
  "utf-8"
);

// Build a map of id -> {name, party, district, constituency}
const CURRENT = {};
// Match each candidate object
const candRegex =
  /\{\s*id:\s*"(\d+)",\s*name:\s*"([^"]+)",\s*party:\s*"([^"]+)",[\s\S]*?district:\s*"([^"]+)",\s*constituency:\s*(\d+)/g;
let cm;
while ((cm = candRegex.exec(scrapedFile)) !== null) {
  CURRENT[cm[1]] = {
    id: cm[1],
    name: cm[2],
    party: cm[3],
    district: cm[4],
    constituency: Number(cm[5]),
  };
}

// --- Parse districts.ts for Nepali names ---
const districtsFile = fs.readFileSync(
  path.join(__dirname, "../src/data/districts.ts"),
  "utf-8"
);
const DISTRICT_NAMES = {};
const distRegex = /id:\s*"([^"]+)".*?nameNepali:\s*"([^"]+)"/g;
let dm;
while ((dm = distRegex.exec(districtsFile)) !== null) {
  DISTRICT_NAMES[dm[1]] = dm[2];
}

// --- Categorize ---
const returningWinners = [];
const partySwitchers = [];
const twoTimeContestants = [];

for (const id of Object.keys(HISTORY)) {
  const cand = CURRENT[id];
  if (!cand) continue; // not running in 2082

  const history = HISTORY[id];
  const districtNepali = DISTRICT_NAMES[cand.district] || cand.district;

  const entry = {
    id: cand.id,
    name: cand.name,
    district: districtNepali,
    constituency: cand.constituency,
    party: cand.party,
    history: history,
  };

  // Check if won before
  const hasWon = history.some((h) => h.result === "विजयी");
  if (hasWon) returningWinners.push(entry);

  // Check if party changed (compare any past party to current)
  const pastParties = new Set(history.map((h) => h.party));
  const switched = ![...pastParties].every((p) => p === cand.party);
  if (switched) partySwitchers.push(entry);

  // Check if ran in both 2074 and 2079
  const years = new Set(history.map((h) => h.year));
  if (years.has("२०७४") && years.has("२०७९")) {
    twoTimeContestants.push(entry);
  }
}

// --- Generate output ---
function toTS(arr) {
  return arr
    .map(
      (e) =>
        `  { id: "${e.id}", name: "${e.name}", district: "${e.district}", constituency: ${e.constituency}, party: "${e.party}", history: ${JSON.stringify(e.history).replace(/"/g, '"')} }`
    )
    .join(",\n");
}

// Use a simpler serialization that preserves Nepali
function serialize(arr) {
  const lines = [];
  for (const e of arr) {
    const hist = e.history
      .map(
        (h) =>
          `{ year: "${h.year}", district: "${h.district}", constituency: "${h.constituency}", party: "${h.party}", result: "${h.result}" }`
      )
      .join(", ");
    lines.push(
      `  { id: "${e.id}", name: "${e.name}", district: "${e.district}", constituency: ${e.constituency}, party: "${e.party}", history: [${hist}] },`
    );
  }
  return lines.join("\n");
}

const output = `// Auto-generated returning candidate data
// Generated: ${new Date().toISOString()}
// Returning Winners: ${returningWinners.length}, Party Switchers: ${partySwitchers.length}, Two-time Contestants: ${twoTimeContestants.length}

export interface ReturningCandidate {
  id: string;
  name: string;
  district: string;
  constituency: number;
  party: string;
  history: { year: string; district: string; constituency: string; party: string; result: string }[];
}

export const RETURNING_WINNERS: ReturningCandidate[] = [
${serialize(returningWinners)}
];

export const PARTY_SWITCHERS: ReturningCandidate[] = [
${serialize(partySwitchers)}
];

export const TWO_TIME_CONTESTANTS: ReturningCandidate[] = [
${serialize(twoTimeContestants)}
];
`;

const outPath = path.join(__dirname, "../src/data/returning-candidates.ts");
fs.writeFileSync(outPath, output, "utf-8");
console.log(`Written to ${outPath}`);
console.log(
  `Returning Winners: ${returningWinners.length}, Party Switchers: ${partySwitchers.length}, Two-time: ${twoTimeContestants.length}`
);
