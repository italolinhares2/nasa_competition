import { revealedDimensions } from '../core/game.js';
import { similarity } from '../core/similarity.js';
import { SITE_BY_ID } from '../data/sites.js';
import { TARGETS } from '../data/targets.js';
import { t } from '../i18n/index.js';
import { h, mount } from './dom.js';

function targetCard(state, target, onSelect) {
  const siteId = state.assignments[target.id];
  const site = siteId ? SITE_BY_ID[siteId] : null;
  const estimate = site ? similarity(site.profile, target, revealedDimensions(state, siteId)) : null;
  const text = t(`targets.${target.id}`);

  return h(
    'article',
    { class: `mission mission--${target.world}` },
    h('h3', null, `${target.icon} ${text.name}`),
    h('p', { class: 'muted' }, `${t(`worlds.${target.world}`)} · ${text.short}`),
    h('p', { class: 'mission-story' }, text.story),
    site
      ? h(
          'button',
          { class: 'mission-pick', type: 'button', onClick: () => onSelect(siteId) },
          '📌 ',
          h('strong', null, t(`sites.${siteId}.name`)),
          estimate == null ? t('board.noData') : ` · ~${estimate}%`,
        )
      : h('p', { class: 'mission-pick is-empty' }, t('board.noPick')),
  );
}

/** Traduz uma entrada do diário (o estado guarda só chave + ids). */
function logText({ key, params }) {
  if (key === 'event') return `${params.icon} ${t(`events.${params.event}`)}`;
  return t(`log.${key}`, {
    ...params,
    place: params.place && t(`sites.${params.place}.name`),
    instrument: params.instrument && t(`instruments.${params.instrument}.name`),
  });
}

/** Quadro de missão (os três alvos) e diário de bordo. */
export function createBoard({ onSelect }) {
  const el = h('section', { class: 'board', 'aria-label': t('board.label') });

  function update(state) {
    const entries = [...state.log].reverse().slice(0, 8);
    mount(
      el,
      h('div', { class: 'missions' }, TARGETS.map((target) => targetCard(state, target, onSelect))),
      h(
        'div',
        { class: 'log' },
        h('h3', null, t('board.logTitle')),
        h(
          'ol',
          null,
          entries.map((entry) =>
            h('li', { class: `log-${entry.kind}` }, h('span', { class: 'log-day' }, t('board.day', { n: entry.day })), logText(entry)),
          ),
        ),
      ),
    );
  }

  return { el, update };
}
