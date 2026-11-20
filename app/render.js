// Rendering for the Leonida Legend trophy guide: the roadmap, the filter chips and the trophy
// cards. Cards always show the official name, description and grade; with the spoiler setting
// on, a hidden trophy that is not yet earned is masked until it is earned.

import { PSN_POINTS } from './tracker.js';

export const KIND_LABELS = {
  all: 'All trophies',
  story: 'Story',
  missable: 'Missable',
  side: 'Strangers & side missions',
  activities: 'Activities',
  collectibles: 'Collectibles',
  crime: 'Crime & robberies',
  feats: 'Feats & moments',
  completion: 'Money & completion',
  online: 'Online',
};

export function renderRoadmap(container, roadmap) {
  container.replaceChildren();
  for (const step of roadmap) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = step.title;
    const p = document.createElement('p');
    p.textContent = step.text;
    li.append(h, p);
    container.append(li);
  }
}

export function renderKindFilters(container, activeKind, onPick) {
  container.replaceChildren();
  for (const [kind, label] of Object.entries(KIND_LABELS)) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'kind-chip';
    chip.textContent = label;
    chip.setAttribute('aria-pressed', String(kind === activeKind));
    chip.addEventListener('click', () => onPick(kind));
    container.append(chip);
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function trophyCard(trophy, state, onToggle) {
  const earned = state.earned.includes(trophy.name);
  const masked = state.spoilersHidden && trophy.hidden && !earned;

  const card = el('article', `trophy-card grade-${trophy.grade}${earned ? ' is-earned' : ''}`);

  const head = el('div', 'card-head');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => onToggle(trophy.name));

  const title = el('div', 'card-title');
  title.append(el('h3', '', masked ? 'Hidden Trophy' : trophy.name));
  title.append(el('p', 'official', masked ? 'Hidden on PlayStation until earned.' : trophy.description));
  head.append(box, title, el('span', `pill grade-${trophy.grade}`, trophy.grade));
  card.append(head);

  const tags = el('div', 'tags');
  tags.append(el('span', 'tag', KIND_LABELS[trophy.kind] ?? trophy.kind));
  tags.append(el('span', 'tag points', `${PSN_POINTS[trophy.grade]} pts`));
  if (trophy.count !== undefined) tags.append(el('span', 'tag', `Target: ${trophy.count.toLocaleString('en-US')}`));
  if (trophy.hidden) tags.append(el('span', 'tag', 'Hidden trophy'));
  if (trophy.missable) tags.append(el('span', 'tag missable', 'Missable — see guide'));
  card.append(tags);

  if (masked) {
    card.append(el('p', 'masked-note', 'Spoiler protection is on: this trophy\u2019s guide stays hidden until you earn it, or until you turn the setting off.'));
  } else {
    card.append(el('p', 'guide', trophy.guide));
    const sources = el('p', 'sources');
    const label = el('strong', '', 'Sources: ');
    sources.append(label, document.createTextNode(trophy.sources));
    card.append(sources);
  }
  return card;
}

export function renderProgress(summary, summaryEl, fillEl, gradesEl) {
  summaryEl.textContent = `${summary.earned} of ${summary.total} trophies earned · ${summary.percent}% · ${summary.points} of ${summary.totalPoints} PSN points`;
  fillEl.style.width = `${summary.percent}%`;
  const order = ['platinum', 'gold', 'silver', 'bronze'];
  gradesEl.textContent = order
    .filter((g) => summary.byGrade[g])
    .map((g) => `${g}: ${summary.byGrade[g].earned}/${summary.byGrade[g].total}`)
    .join(' · ');
}
