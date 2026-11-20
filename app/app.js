// Leonida Legend — GTA VI trophy guide & tracker. Entry point: loads the official trophy data
// (app/data/trophies.json, a file of this app), wires the tracker state to the controls, and
// renders the roadmap and the trophy cards. Fully offline: the only file fetched is the app's
// own data file.

import { loadState, saveState, toggleEarned, summarise, exportProgress, parseImport } from './tracker.js';
import { renderRoadmap, renderKindFilters, renderProgress, trophyCard } from './render.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const state = loadState();

const listEl = document.getElementById('trophy-list');
const emptyEl = document.getElementById('empty-note');
const summaryEl = document.getElementById('progress-summary');
const fillEl = document.getElementById('progress-fill');
const gradesEl = document.getElementById('progress-grades');
const statusEl = document.getElementById('status-line');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade-filter');
const spoilerEl = document.getElementById('spoiler-toggle');
const earnedEl = document.getElementById('earned-toggle');
const chipsEl = document.getElementById('kind-filters');

let activeKind = 'all';
spoilerEl.checked = state.spoilersHidden;

renderRoadmap(document.getElementById('roadmap-steps'), data.roadmap ?? []);

function matchesFilters(t) {
  if (activeKind === 'online') return false; // the official list is entirely offline, single-player
  if (activeKind === 'missable' && !t.missable) return false;
  if (activeKind !== 'all' && activeKind !== 'missable' && t.kind !== activeKind) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (earnedEl.checked && state.earned.includes(t.name)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !t.name.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
  return true;
}

function render() {
  renderKindFilters(chipsEl, activeKind, (kind) => {
    activeKind = kind;
    render();
  });
  const shown = trophies.filter(matchesFilters);
  listEl.replaceChildren(...shown.map((t) => trophyCard(t, state, (name) => {
    toggleEarned(state, name);
    render();
  })));
  if (activeKind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies: the official list of 55 is entirely offline and single-player, so this filter has nothing to show. (Sources: the official list as listed by Exophase and PSNProfiles; EGamers.io, \u2018GTA 6 Trophy List\u2019.)';
  } else if (shown.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophies match the current filters.';
  } else {
    emptyEl.hidden = true;
  }
  renderProgress(summarise(trophies, state), summaryEl, fillEl, gradesEl);
}

searchEl.addEventListener('input', render);
gradeEl.addEventListener('change', render);
earnedEl.addEventListener('change', render);
spoilerEl.addEventListener('change', () => {
  state.spoilersHidden = spoilerEl.checked;
  saveState(state);
  render();
});

document.getElementById('export-button').addEventListener('click', () => {
  exportProgress(state);
  statusEl.textContent = 'Progress exported as gta6-trophy-progress.json.';
});

document.getElementById('import-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const result = parseImport(await file.text(), trophies);
    state.earned = result.earned;
    saveState(state);
    render();
    statusEl.textContent = `Imported ${result.earned.length} earned trophies${result.dropped ? ` (${result.dropped} name(s) not on the official list were dropped)` : ''}.`;
  } catch {
    statusEl.textContent = 'That file could not be read as trophy progress.';
  }
  event.target.value = '';
});

document.getElementById('reset-button').addEventListener('click', () => {
  state.earned = [];
  saveState(state);
  render();
  statusEl.textContent = 'Tracker reset: every trophy is unearned again.';
});

render();
