#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// CP1252 to byte mapping for 0x80-0x9F range (double-encoding fix)
const cp1252map = {8364:0x80,8218:0x82,402:0x83,8222:0x84,8230:0x85,8224:0x86,8225:0x87,710:0x88,8240:0x89,352:0x8A,8249:0x8B,338:0x8C,381:0x8E,8216:0x91,8217:0x92,8220:0x93,8221:0x94,8226:0x95,8211:0x96,8212:0x97,732:0x98,8482:0x99,353:0x9A,8250:0x9B,339:0x9C,382:0x9E,376:0x9F};

function fixString(s) {
  if (!s) return "";
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 256) bytes.push(c);
    else if (cp1252map[c] !== undefined) bytes.push(cp1252map[c]);
    else bytes.push(0x3F);
  }
  return Buffer.from(bytes).toString("utf8");
}

// Read raw election data
const data2074 = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "raw-electiondata2074.json"), "utf8"));
const data2079 = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "raw-electiondata2079.json"), "utf8"));

// Extract 2026 candidate name->id mapping from TS file
const tsContent = fs.readFileSync(path.join(__dirname, "..", "src/data/candidates-scraped.ts"), "utf8");
const nameToIds = new Map(); // name -> Set<id>
const regex = /id:\s*"(\d+)",\s*\n\s*name:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(tsContent)) !== null) {
  const [, id, name] = match;
  if (!nameToIds.has(name)) nameToIds.set(name, new Set());
  nameToIds.get(name).add(id);
}
console.log(`Found ${nameToIds.size} unique 2026 candidate names`);

// Build history: candidateId -> ElectionHistoryEntry[]
const history = {};

function processElection(data, year) {
  let matches = 0;
  for (const row of data) {
    const name = fixString(row.CandidateName).trim();
    const ids = nameToIds.get(name);
    if (!ids) continue;
    matches++;
    const entry = {
      year,
      district: fixString(row.DistrictName).trim(),
      constituency: row.SCConstID,
      party: fixString(row.PoliticalPartyName).trim(),
      result: row.Remarks === "Elected" ? "विजयी" : "पराजित",
    };
    for (const id of ids) {
      if (!history[id]) history[id] = [];
      history[id].push(entry);
    }
  }
  console.log(`${year}: ${matches} name matches found`);
}

processElection(data2074, "२०७४");
processElection(data2079, "२०७९");

// Sort entries by year for each candidate
for (const id of Object.keys(history)) {
  history[id].sort((a, b) => a.year.localeCompare(b.year));
}

// Generate TypeScript output
const ids = Object.keys(history).sort();
let output = `// Auto-generated election history from 2074/2079 data
// Generated: ${new Date().toISOString()}
// Candidates with history: ${ids.length}

import type { ElectionHistoryEntry } from "./candidate-enrichments";

const HISTORY: Record<string, ElectionHistoryEntry[]> = {\n`;

for (const id of ids) {
  output += `  "${id}": [\n`;
  for (const e of history[id]) {
    output += `    { year: "${e.year}", district: "${e.district}", constituency: "${e.constituency}", party: "${e.party}", result: "${e.result}" },\n`;
  }
  output += `  ],\n`;
}

output += `};

export function getHistory(id: string): ElectionHistoryEntry[] {
  return HISTORY[id] || [];
}
`;

const outPath = path.join(__dirname, "..", "src/data/candidate-history.ts");
fs.writeFileSync(outPath, output, "utf8");
console.log(`Wrote ${outPath} with ${ids.length} candidates`);
