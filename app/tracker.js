// Tracker state for the Leonida Legend trophy guide: which trophies are earned, and the spoiler
// setting. State lives in localStorage only; export writes it to a JSON file the reader keeps,
// and import reads such a file back. Nothing here touches the network.

const STORAGE_KEY = 'leonida-legend-tracker-v1';

export const PSN_POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };

function emptyState() {
  return { earned: [], spoilersHidden: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => typeof n === 'string') : [],
      spoilersHidden: parsed.spoilersHidden === true,
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toggleEarned(state, name) {
  const i = state.earned.indexOf(name);
  if (i === -1) state.earned.push(name);
  else state.earned.splice(i, 1);
  saveState(state);
  return state;
}

// Progress summary: counts overall and per grade, the percentage, and PSN points earned of the
// list's total (platinum 300, gold 90, silver 30, bronze 15 a trophy).
export function summarise(trophies, state) {
  const earnedSet = new Set(state.earned);
  const byGrade = {};
  let points = 0;
  let totalPoints = 0;
  for (const t of trophies) {
    const value = PSN_POINTS[t.grade] ?? 0;
    totalPoints += value;
    byGrade[t.grade] ??= { earned: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (earnedSet.has(t.name)) {
      byGrade[t.grade].earned += 1;
      points += value;
    }
  }
  const earned = trophies.filter((t) => earnedSet.has(t.name)).length;
  return {
    earned,
    total: trophies.length,
    percent: trophies.length ? Math.round((earned / trophies.length) * 100) : 0,
    points,
    totalPoints,
    byGrade,
  };
}

// Export: a small JSON document naming the game and the earned trophies, downloaded as a file.
export function exportProgress(state) {
  const payload = {
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exportedFrom: 'Leonida Legend trophy guide',
    earned: [...state.earned],
    spoilersHidden: state.spoilersHidden,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

// Import accepts this app's export, a bare array of trophy names, or an object with an "earned"
// array; names that are not on the official list are dropped and counted for the status line.
export function parseImport(text, trophies) {
  const data = JSON.parse(text);
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) throw new Error('no earned list in file');
  const known = new Set(trophies.map((t) => t.name));
  const accepted = names.filter((n) => known.has(n));
  return { earned: [...new Set(accepted)], dropped: names.length - accepted.length };
}
