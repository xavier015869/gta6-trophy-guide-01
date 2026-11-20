// render.js — turns the trophy data plus tracker state into the page:
// the header progress summary, the missable warning strip, the trophy grid,
// the detail drawer and the six-stage roadmap. Pure rendering: every
// interaction is reported back through data-action attributes for app.js.

import { isEarned, getCount } from './tracker.js';

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
export const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
export const KIND_LABEL = {
  story: 'Story', side: 'Side strand', activities: 'Activities',
  collectibles: 'Collectibles', crime: 'Crime', feats: 'Feat', completion: 'Completion',
};
const GRADE_GLYPH = { platinum: '✦', gold: '★', silver: '★', bronze: '★' };

export function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function isMasked(trophy, state) {
  return state.spoiler && trophy.hidden && !isEarned(state, trophy.id);
}

export function displayName(trophy, state) {
  return isMasked(trophy, state) ? 'Hidden Trophy' : trophy.name;
}

function displayDescription(trophy, state) {
  return isMasked(trophy, state)
    ? 'Masked by the spoiler shield until you earn it. Turn the shield off above to read it now.'
    : trophy.description;
}

function badgesHtml(trophy, state) {
  const parts = [
    `<span class="badge grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>`,
    `<span class="badge">${esc(KIND_LABEL[trophy.kind] ?? trophy.kind)}</span>`,
    `<span class="badge">Stage ${trophy.stage}</span>`,
  ];
  if (trophy.hidden) parts.push('<span class="badge hidden-badge">Hidden</span>');
  if (trophy.missable) parts.push('<span class="badge missable">⚠ Missable</span>');
  if (isEarned(state, trophy.id)) parts.push('<span class="badge done">✓ Earned</span>');
  return parts.join('');
}

export function renderSummary(refs, data, state) {
  const total = data.trophies.length;
  const earned = data.trophies.filter((t) => isEarned(state, t.id)).length;
  refs.progressCount.textContent = `${earned} of ${total} earned`;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  refs.progressPercent.textContent = `${pct}%`;
  refs.overallBar.style.width = `${pct}%`;
  refs.gradeSummary.innerHTML = GRADE_ORDER.map((g) => {
    const all = data.trophies.filter((t) => t.grade === g);
    const got = all.filter((t) => isEarned(state, t.id)).length;
    return `<span class="grade-chip">${GRADE_LABEL[g]} <b>${got}/${all.length}</b></span>`;
  }).join('');
}

export function renderMissableStrip(refs, data, state) {
  const missables = data.trophies.filter((t) => t.missable);
  const left = missables.filter((t) => !isEarned(state, t.id));
  refs.missableCount.textContent = String(left.length);
  if (!left.length) {
    refs.missableStrip.innerHTML = `<div class="missable-card"><h2>⚠ Missables — all clear</h2>
      <p>Every missable trophy is earned. Nothing on this list can be lost any more.</p></div>`;
    return;
  }
  const links = missables.map((t) => {
    const done = isEarned(state, t.id);
    return `<button type="button" class="missable-link${done ? ' done' : ''}" data-action="open-detail" data-id="${t.id}">${esc(displayName(t, state))}</button>`;
  }).join('');
  refs.missableStrip.innerHTML = `<div class="missable-card">
    <h2>⚠ ${left.length} missable ${left.length === 1 ? 'trophy' : 'trophies'} — do not leave these behind</h2>
    <p>The five stranger-chain finales (Andy, Kenton, Billy, Randy, Tyrone) sit behind story-progress windows, and Positive Mental Attitude has a meditation spot in Chapter 1 that counts toward its total. Finish the chains as they open and meditate at every spot the story offers.</p>
    <div class="missable-links">${links}</div></div>`;
}

function cardHtml(trophy, state) {
  const earned = isEarned(state, trophy.id);
  const masked = isMasked(trophy, state);
  const count = trophy.count ? getCount(state, trophy) : 0;
  const countPct = trophy.count ? Math.round((count / trophy.count) * 100) : 0;
  return `<article class="card${earned ? ' earned' : ''}${trophy.missable ? ' is-missable' : ''}" data-action="open-detail" data-id="${trophy.id}" tabindex="0" role="button" aria-label="${esc(displayName(trophy, state))}">
    <div class="card-top">
      <div class="medallion ${trophy.grade}" aria-hidden="true">${GRADE_GLYPH[trophy.grade]}</div>
      <div class="card-titles">
        <h3>${esc(displayName(trophy, state))}</h3>
        <p class="official">${masked ? '<span class="masked-note">Hidden until earned</span>' : `“${esc(trophy.description)}”`}</p>
      </div>
    </div>
    <div class="badges">${badgesHtml(trophy, state)}</div>
    ${masked ? '' : `<p class="guide-peek">${esc(trophy.guide)}</p>`}
    <div class="card-foot">
      <button type="button" class="earn-toggle${earned ? ' on' : ''}" data-action="toggle-earn" data-id="${trophy.id}" aria-pressed="${earned}">
        <span class="box">✓</span> ${earned ? 'Earned' : 'Mark earned'}
      </button>
      ${trophy.count ? `<span class="count-mini">${count.toLocaleString('en-US')} / ${trophy.count.toLocaleString('en-US')}</span>` : ''}
    </div>
    ${trophy.count ? `<div class="mini-track"><div class="mini-bar" style="width:${countPct}%"></div></div>` : ''}
  </article>`;
}

export function renderGrid(refs, list, state) {
  refs.grid.innerHTML = list.map((t) => cardHtml(t, state)).join('');
  refs.emptyState.hidden = list.length > 0;
}

export function renderRoadmap(refs, data, state) {
  refs.roadmapList.innerHTML = data.roadmap.map((stage) => {
    const trophies = data.trophies.filter((t) => t.stage === stage.stage);
    const done = trophies.filter((t) => isEarned(state, t.id)).length;
    const pct = trophies.length ? Math.round((done / trophies.length) * 100) : 0;
    const chips = trophies.map((t) => {
      const cls = ['stage-chip'];
      if (isEarned(state, t.id)) cls.push('done');
      if (t.missable) cls.push('missable');
      return `<button type="button" class="${cls.join(' ')}" data-action="open-detail" data-id="${t.id}">${esc(displayName(t, state))}</button>`;
    }).join('');
    return `<div class="stage-block">
      <div class="stage-head">
        <span class="stage-num">STAGE ${stage.stage}</span>
        <h3>${esc(stage.title)}</h3>
        <span class="stage-progress">${done}/${trophies.length} earned</span>
      </div>
      <p>${esc(stage.text)}</p>
      <div class="stage-track"><div class="stage-bar" style="width:${pct}%"></div></div>
      <div class="stage-trophies">${chips}</div>
    </div>`;
  }).join('');
}

export function detailHtml(trophy, state) {
  const earned = isEarned(state, trophy.id);
  const masked = isMasked(trophy, state);
  const count = trophy.count ? getCount(state, trophy) : 0;
  const countPct = trophy.count ? Math.round((count / trophy.count) * 100) : 0;
  return `
    <div class="card-top">
      <div class="medallion ${trophy.grade}" aria-hidden="true">${GRADE_GLYPH[trophy.grade]}</div>
      <div class="card-titles">
        <div class="badges">${badgesHtml(trophy, state)}</div>
      </div>
    </div>
    <h2>${esc(displayName(trophy, state))}</h2>
    <p class="official">“${esc(displayDescription(trophy, state))}” — official PlayStation description</p>
    ${trophy.missable ? `<div class="missable-warning"><b>⚠ MISSABLE.</b> This trophy can be lost on a single playthrough. Read the guide before you push the story further — the safe move is almost always to finish the related content as soon as it opens.</div>` : ''}
    <h4>How to earn it</h4>
    <p class="guide-text">${esc(trophy.guide)}</p>
    ${trophy.count ? `
    <h4>Your progress</h4>
    <div class="counter-box">
      <div class="counter-row">
        <button type="button" class="counter-btn" data-action="count-step" data-id="${trophy.id}" data-step="-1" aria-label="Decrease">−</button>
        <input class="counter-input" type="number" min="0" max="${trophy.count}" step="1" value="${count}" data-count-input="${trophy.id}" aria-label="Current count">
        <button type="button" class="counter-btn" data-action="count-step" data-id="${trophy.id}" data-step="1" aria-label="Increase">+</button>
        <span class="counter-of">of ${trophy.count.toLocaleString('en-US')} ${esc(trophy.unit ?? '')}</span>
      </div>
      <div class="mini-track"><div class="mini-bar" style="width:${countPct}%"></div></div>
    </div>` : ''}
    <h4>Kind &amp; roadmap</h4>
    <p class="sources">${esc(KIND_LABEL[trophy.kind] ?? trophy.kind)} · Roadmap stage ${trophy.stage} · Effort tier: ${esc(trophy.tier)}${trophy.hidden ? ' · Hidden on PlayStation until earned' : ''}</p>
    <h4>Sources</h4>
    <p class="sources">${esc(trophy.sources)}</p>
    <button type="button" class="tool-btn detail-earn${earned ? ' on' : ''}" data-action="toggle-earn" data-id="${trophy.id}">${earned ? '✓ Earned — tap to undo' : 'Mark as earned'}</button>`;
}
