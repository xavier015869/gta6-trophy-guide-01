// Leonida Legend — hand-in program for make.fun's gta6-trophy-guide-01 bounty.
//
// The guide itself is this repository's app/ folder: plain static files
// (ES modules, one stylesheet, and app/data/trophies.json holding all 55
// trophies with their guides), served by any static server with app/ at its
// root and working fully offline. This program hands the entry in: it copies
// app/ and screenshots/ to /output and writes /output/dossier.json with the
// vendored make.fun library, byte for byte what the scorer rebuilds.
//
// Before copying, it validates the trophy data the gate cares about: exactly
// 55 trophies, and every one carrying a non-blank guide — a data file that
// fails that is a broken entry and should fail here, loudly, not at the gate.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// --- Validate the trophy data (the gate's trophies row, checked early) ---
const dataPath = join(here, 'app', 'data', 'trophies.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const trophies = Array.isArray(data) ? data : data.trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error(`trophies.json must hold exactly 55 trophies, found ${Array.isArray(trophies) ? trophies.length : 'none'}`);
}
const guideless = trophies.filter((t) => typeof t?.name !== 'string' || typeof t?.guide !== 'string' || t.guide.trim() === '');
if (guideless.length > 0) {
  throw new Error(`trophies.json has ${guideless.length} trophies with no name or a blank guide`);
}
const missables = trophies.filter((t) => t.missable).length;
const hidden = trophies.filter((t) => t.hidden).length;
console.log(`trophy data OK: 55 trophies (${hidden} hidden, ${missables} missable), every one with a guide`);

// The published list's shape: 1 platinum, 2 gold, 6 silver, 46 bronze and a
// six-stage roadmap. A data edit that breaks the shape is a broken entry.
const gradeCounts = {};
for (const t of trophies) gradeCounts[t.grade] = (gradeCounts[t.grade] ?? 0) + 1;
const expectedGrades = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
for (const [grade, want] of Object.entries(expectedGrades)) {
  if (gradeCounts[grade] !== want) {
    throw new Error(`trophies.json should hold ${want} ${grade} trophies, found ${gradeCounts[grade] ?? 0}`);
  }
}
const roadmap = Array.isArray(data) ? [] : data.roadmap;
if (!Array.isArray(roadmap) || roadmap.length !== 6) {
  throw new Error(`trophies.json must carry the 6-stage roadmap, found ${Array.isArray(roadmap) ? roadmap.length : 'none'}`);
}
console.log('list shape OK: 1 platinum, 2 gold, 6 silver, 46 bronze; roadmap has 6 stages');

// --- Validate the screenshots the gate will measure (3-4 images, ≤256 KiB) ---
const shotsDir = join(here, 'screenshots');
const shots = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((n) => !n.startsWith('.') && /\.(png|jpe?g)$/i.test(n)).sort()
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
}
for (const name of shots) {
  const size = statSync(join(shotsDir, name)).size;
  if (size > 262144) throw new Error(`screenshots/${name} is ${size} bytes, over the 256 KiB cap`);
}
console.log(`screenshots OK: ${shots.join(', ')}`);

// --- Hand in: copy app/ and screenshots/, then write the dossier ---
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
console.log(`handed in to ${out}: app/, screenshots/ and dossier.json`);
