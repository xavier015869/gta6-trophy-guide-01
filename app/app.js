// app.js — Leonida Legend's controller: loads the trophy data, holds the
// filter and view state, wires every control, and routes the URL hash
// (#/ trophies, #/roadmap, #/missables, #/trophy/<id>) so every view —
// including a single trophy's guide — is a link and a screenshot target.

import {
  loadState, saveState, isEarned, setEarned, getCount, setCount,
  exportProgress, parseImport, resetState,
} from './tracker.js';
import {
  renderSummary, renderMissableStrip, renderGrid, renderRoadmap, detailHtml, KIND_LABEL,
} from './render.js';

const refs = {
  progressCount: document.getElementById('progress-count'),
  progressPercent: document.getElementById('progress-percent'),
  overallBar: document.getElementById('overall-bar'),
  gradeSummary: document.getElementById('grade-summary'),
  missableStrip: document.getElementById('missable-strip'),
  missableCount: document.getElementById('missable-count'),
  grid: document.getElementById('grid'),
  emptyState: document.getElementById('empty-state'),
  resultCount: document.getElementById('result-count'),
  roadmapList: document.getElementById('roadmap-list'),
  viewTrophies: document.getElementById('view-trophies'),
  viewRoadmap: document.getElementById('view-roadmap'),
  tabTrophies: document.getElementById('tab-trophies'),
  tabRoadmap: document.getElementById('tab-roadmap'),
  tabMissables: document.getElementById('tab-missables'),
  search: document.getElementById('search'),
  filterGrade: document.getElementById('filter-grade'),
  filterKind: document.getElementById('filter-kind'),
  filterStage: document.getElementById('filter-stage'),
  filterMissable: document.getElementById('filter-missable'),
  filterUnearned: document.getElementById('filter-unearned'),
  spoilerToggle: document.getElementById('spoiler-toggle'),
  detail: document.getElementById('detail'),
  detailContent: document.getElementById('detail-content'),
  detailScrim: document.getElementById('detail-scrim'),
  detailClose: document.getElementById('detail-close'),
  importFile: document.getElementById('import-file'),
};

let data = null;
let state = loadState();
let view = 'trophies'; // 'trophies' | 'roadmap'
let openId = null;
const filters = { q: '', grade: 'all', kind: 'all', stage: 'all', missable: false, unearned: false };

const byId = (id) => data.trophies.find((t) => t.id === id);

function matchesFilters(t) {
  if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
  if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
  if (filters.stage !== 'all' && t.stage !== Number(filters.stage)) return false;
  if (filters.missable && !t.missable) return false;
  if (filters.unearned && isEarned(state, t.id)) return false;
  if (filters.q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${KIND_LABEL[t.kind] ?? ''}`.toLowerCase();
    if (!hay.includes(filters.q)) return false;
  }
  return true;
}

function renderAll() {
  renderSummary(refs, data, state);
  renderMissableStrip(refs, data, state);
  const list = data.trophies.filter(matchesFilters);
  renderGrid(refs, list, state);
  refs.resultCount.textContent = view === 'trophies'
    ? `Showing ${list.length} of ${data.trophies.length} trophies`
    : '';
  renderRoadmap(refs, data, state);
  refs.viewTrophies.hidden = view !== 'trophies';
  refs.viewRoadmap.hidden = view !== 'roadmap';
  refs.tabTrophies.classList.toggle('active', view === 'trophies' && !filters.missable);
  refs.tabRoadmap.classList.toggle('active', view === 'roadmap');
  refs.tabMissables.classList.toggle('active', view === 'trophies' && filters.missable);
  if (openId !== null) {
    const t = byId(openId);
    if (t) refs.detailContent.innerHTML = detailHtml(t, state);
  }
}

function openDetail(id) {
  const t = byId(id);
  if (!t) return;
  openId = id;
  refs.detailContent.innerHTML = detailHtml(t, state);
  refs.detail.hidden = false;
  refs.detailScrim.hidden = false;
}

function closeDetail() {
  openId = null;
  refs.detail.hidden = true;
  refs.detailScrim.hidden = true;
}

function applyRoute() {
  const hash = location.hash || '#/';
  const trophyMatch = hash.match(/^#\/trophy\/(\d+)$/);
  if (trophyMatch) {
    openDetail(Number(trophyMatch[1]));
  } else if (hash === '#/roadmap') {
    view = 'roadmap';
    closeDetail();
  } else if (hash === '#/missables') {
    view = 'trophies';
    filters.missable = true;
    refs.filterMissable.checked = true;
    closeDetail();
  } else {
    view = 'trophies';
    closeDetail();
  }
  renderAll();
}

function toggleEarn(id) {
  const t = byId(id);
  if (!t) return;
  setEarned(state, id, !isEarned(state, id));
  saveState(state);
  renderAll();
}

function stepCount(id, step) {
  const t = byId(id);
  if (!t || !t.count) return;
  setCount(state, t, getCount(state, t) + step);
  saveState(state);
  renderAll();
}

function bindEvents() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const id = Number(target.dataset.id);
    if (target.dataset.action === 'toggle-earn') {
      e.stopPropagation();
      toggleEarn(id);
    } else if (target.dataset.action === 'count-step') {
      stepCount(id, Number(target.dataset.step));
    } else if (target.dataset.action === 'open-detail') {
      location.hash = `#/trophy/${id}`;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openId !== null) {
      location.hash = view === 'roadmap' ? '#/roadmap' : '#/';
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('card')) {
      e.preventDefault();
      location.hash = `#/trophy/${e.target.dataset.id}`;
    }
  });

  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-count-input]');
    if (!input) return;
    const t = byId(Number(input.dataset.countInput));
    if (!t) return;
    setCount(state, t, Number(input.value));
    saveState(state);
    renderAll();
  });

  refs.search.addEventListener('input', () => {
    filters.q = refs.search.value.trim().toLowerCase();
    renderAll();
  });
  refs.filterGrade.addEventListener('change', () => { filters.grade = refs.filterGrade.value; renderAll(); });
  refs.filterKind.addEventListener('change', () => { filters.kind = refs.filterKind.value; renderAll(); });
  refs.filterStage.addEventListener('change', () => { filters.stage = refs.filterStage.value; renderAll(); });
  refs.filterMissable.addEventListener('change', () => {
    filters.missable = refs.filterMissable.checked;
    renderAll();
  });
  refs.filterUnearned.addEventListener('change', () => {
    filters.unearned = refs.filterUnearned.checked;
    renderAll();
  });
  refs.spoilerToggle.addEventListener('change', () => {
    state.spoiler = refs.spoilerToggle.checked;
    saveState(state);
    renderAll();
  });

  refs.tabTrophies.addEventListener('click', () => { location.hash = '#/'; });
  refs.tabRoadmap.addEventListener('click', () => { location.hash = '#/roadmap'; });
  refs.tabMissables.addEventListener('click', () => { location.hash = '#/missables'; });
  refs.detailClose.addEventListener('click', () => {
    location.hash = view === 'roadmap' ? '#/roadmap' : '#/';
  });
  refs.detailScrim.addEventListener('click', () => {
    location.hash = view === 'roadmap' ? '#/roadmap' : '#/';
  });

  document.getElementById('btn-export').addEventListener('click', () => exportProgress(state));
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!window.confirm('Reset all tracked progress? Earned trophies, counters and settings will be cleared.')) return;
    state = resetState();
    state.spoiler = refs.spoilerToggle.checked;
    saveState(state);
    renderAll();
  });
  refs.importFile.addEventListener('change', async () => {
    const file = refs.importFile.files?.[0];
    if (!file) return;
    try {
      const imported = parseImport(await file.text());
      const validIds = new Set(data.trophies.map((t) => t.id));
      state.earned = imported.earned.filter((id) => validIds.has(id));
      state.counts = {};
      for (const [k, v] of Object.entries(imported.counts)) {
        const t = byId(Number(k));
        if (t && t.count) setCount(state, t, v);
      }
      // A counter at its target means the trophy is earned.
      for (const t of data.trophies) {
        if (t.count && getCount(state, t) >= t.count) setEarned(state, t.id, true);
      }
      saveState(state);
      renderAll();
    } catch {
      window.alert('That file could not be read as Leonida Legend progress. Import a file made by Export progress.');
    } finally {
      refs.importFile.value = '';
    }
  });

  window.addEventListener('hashchange', applyRoute);
}

async function boot() {
  try {
    const res = await fetch('data/trophies.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    refs.grid.innerHTML = `<p class="empty-state">The trophy data could not be loaded (${String(err)}). Serve this folder with any static file server and reload.</p>`;
    return;
  }
  for (const stage of data.roadmap) {
    const opt = document.createElement('option');
    opt.value = String(stage.stage);
    opt.textContent = `Stage ${stage.stage} — ${stage.title}`;
    refs.filterStage.append(opt);
  }
  refs.spoilerToggle.checked = state.spoiler;
  bindEvents();
  applyRoute();
}

boot();
