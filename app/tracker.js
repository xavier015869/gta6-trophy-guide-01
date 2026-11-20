// tracker.js — the tracker's saved state: which trophies are earned, the
// progress counters for trophies PlayStation tracks to a number, and the
// spoiler-shield preference. Everything lives in localStorage under one key;
// export/import moves the same shape in and out as a JSON file.

export const STORAGE_KEY = 'leonida-legend-tracker-v1';

const defaultState = () => ({ earned: [], counts: {}, spoiler: true });

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      spoiler: parsed.spoiler !== false,
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota); the tracker still
    // works for the session, it just will not persist.
  }
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function setEarned(state, id, on) {
  const has = state.earned.includes(id);
  if (on && !has) state.earned.push(id);
  if (!on && has) state.earned = state.earned.filter((n) => n !== id);
}

export function getCount(state, trophy) {
  if (!trophy.count) return 0;
  const n = Number(state.counts[trophy.id]);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, trophy.count);
}

export function setCount(state, trophy, value) {
  if (!trophy.count) return;
  const n = Math.max(0, Math.min(trophy.count, Math.floor(Number(value) || 0)));
  if (n === 0) delete state.counts[trophy.id];
  else state.counts[trophy.id] = n;
  // A counter that reaches its target is an earned trophy.
  if (n >= trophy.count) setEarned(state, trophy.id, true);
}

export function exportProgress(state) {
  const payload = {
    app: 'leonida-legend',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    counts: state.counts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-legend-progress.json';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function parseImport(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a progress file');
  // Accept both this app's export shape and a bare {earned, counts} object.
  const earned = Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [];
  const counts = {};
  if (parsed.counts && typeof parsed.counts === 'object') {
    for (const [k, v] of Object.entries(parsed.counts)) {
      const id = Number(k);
      const n = Number(v);
      if (Number.isInteger(id) && Number.isFinite(n) && n > 0) counts[id] = Math.floor(n);
    }
  }
  return { earned, counts };
}

export function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
  return defaultState();
}
