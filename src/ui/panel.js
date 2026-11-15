import { HOME_ID, MAX_DAYS } from '../config.js';
import { haversineKm, travelDays } from '../core/geo.js';
import { isVisited, revealedDimensions, travelInfo } from '../core/game.js';
import { similarity } from '../core/similarity.js';
import { DIMENSIONS } from '../data/dimensions.js';
import { INSTRUMENTS } from '../data/instruments.js';
import { HOME, SITES, locationById } from '../data/sites.js';
import { TARGETS, TARGET_BY_ID } from '../data/targets.js';
import { getLocale, t } from '../i18n/index.js';
import { adviceFor } from './advisor.js';
import { h, mount } from './dom.js';

const instrumentFor = (dimId) => INSTRUMENTS.find((i) => i.reveals.includes(dimId));
const siteText = (id) => t(`sites.${id}`);
const targetText = (id) => t(`targets.${id}`);

function advisor(state) {
  return h(
    'div',
    { class: 'advisor' },
    h('span', { class: 'advisor-avatar', 'aria-hidden': 'true' }, '🤖'),
    h('p', null, h('strong', null, `${t('advisor.name')}: `), adviceFor(state)),
  );
}

// ---------- Lista de destinos (nenhum local selecionado) ----------

function destinationList(state, onSelect) {
  const rows = [HOME, ...SITES]
    .filter((place) => place.id !== state.location)
    .map((place) => ({ place, info: travelInfo(state, place.id) }))
    .sort((a, b) => a.info.days - b.info.days)
    .map(({ place, info }) => {
      const text = siteText(place.id);
      const icon = place.id === HOME_ID ? '🏛️' : isVisited(state, place.id) ? '✅' : '📍';
      return h(
        'li',
        null,
        h(
          'button',
          { class: 'dest', type: 'button', onClick: () => onSelect(place.id) },
          h('span', { class: 'dest-name' }, `${icon} ${text.name}`),
          h('span', { class: 'dest-meta' }, `${text.country} · ${info.transport.icon} ${t('hud.daysShort', { n: info.days })}`),
        ),
      );
    });
  return h('section', null, h('h3', null, t('panel.destinations')), h('ul', { class: 'dest-list' }, rows));
}

// ---------- Comparação local x alvo ----------

function targetTabs(activeId, onTargetTab) {
  return h(
    'div',
    { class: 'tabs', role: 'tablist', 'aria-label': t('panel.compareLabel') },
    TARGETS.map((target) =>
      h(
        'button',
        {
          class: `tab${target.id === activeId ? ' is-active' : ''}`,
          type: 'button',
          role: 'tab',
          'aria-selected': String(target.id === activeId),
          onClick: () => onTargetTab(target.id),
        },
        `${target.icon} ${targetText(target.id).short}`,
      ),
    ),
  );
}

function comparison(site, revealed, target) {
  const rows = DIMENSIONS.map((dim) => {
    const known = revealed.has(dim.id);
    const value = site.profile[dim.id];
    const goal = target.profile[dim.id];
    const { label, hint } = t(`dimensions.${dim.id}`);
    return h(
      'div',
      { class: 'bar-row', title: hint },
      h('span', { class: 'bar-label' }, `${dim.icon} ${label}`),
      h(
        'div',
        {
          class: `bar-track${known ? '' : ' is-unknown'}`,
          role: 'img',
          'aria-label': t(known ? 'panel.barKnown' : 'panel.barUnknown', { dim: label, value, goal }),
        },
        known ? h('div', { class: 'bar-fill', style: `width:${value}%` }) : null,
        h('div', { class: 'bar-goal', style: `left:${goal}%` }),
      ),
      h('span', { class: 'bar-value' }, known ? value : `${instrumentFor(dim.id).icon}?`),
    );
  });

  const estimate = similarity(site.profile, target, revealed);
  return h(
    'div',
    { class: 'comparison' },
    rows,
    h(
      'p',
      { class: 'bar-legend' },
      h('span', { class: 'legend-site' }, t('panel.legendSite')),
      h('span', { class: 'legend-goal' }, t('panel.legendTarget', { name: targetText(target.id).name })),
    ),
    h(
      'p',
      { class: 'estimate' },
      estimate == null
        ? t('panel.estimateNone')
        : [
            t('panel.estimate'),
            h('strong', null, `${estimate}%`),
            t('panel.estimateDims', { n: revealed.size, total: DIMENSIONS.length }),
          ],
    ),
  );
}

// ---------- Seções do local atual ----------

function instrumentsSection(state, site, onScan) {
  const scanned = state.visited[site.id].scanned;
  return h(
    'section',
    null,
    h('h3', null, t('panel.instruments')),
    h(
      'div',
      { class: 'instruments' },
      INSTRUMENTS.map((inst) => {
        const used = scanned.includes(inst.id);
        const text = t(`instruments.${inst.id}`);
        return h(
          'button',
          { class: 'instrument', type: 'button', disabled: used, title: text.description, onClick: () => onScan(inst.id) },
          h('span', { class: 'instrument-icon', 'aria-hidden': 'true' }, inst.icon),
          h('span', { class: 'instrument-name' }, text.name),
          h('span', { class: 'instrument-source' }, text.source),
          h('span', { class: 'instrument-cost' }, used ? t('panel.used') : t('panel.cost', { n: inst.cost })),
        );
      }),
    ),
  );
}

function quizSection(state, site, onQuiz) {
  const result = state.visited[site.id].quiz;
  const quiz = siteText(site.id).quiz;
  return h(
    'section',
    { class: 'quiz' },
    h('h3', null, t('panel.quizTitle')),
    h('p', null, quiz.question),
    h(
      'div',
      { class: 'quiz-options' },
      quiz.options.map((option, index) =>
        h(
          'button',
          {
            class: `quiz-option${result && index === site.quizAnswer ? ' is-right' : ''}`,
            type: 'button',
            disabled: Boolean(result),
            onClick: () => onQuiz(index),
          },
          option,
        ),
      ),
    ),
    result
      ? h('p', { class: `quiz-feedback is-${result}` }, result === 'right' ? t('panel.quizCorrect') : '💡 ', quiz.explanation)
      : null,
  );
}

function assignSection(state, site, onAssign) {
  return h(
    'section',
    null,
    h('h3', null, t('panel.assignTitle')),
    h(
      'div',
      { class: 'assign' },
      TARGETS.map((target) => {
        const chosen = state.assignments[target.id] === site.id;
        return h(
          'button',
          {
            class: `btn btn--assign${chosen ? ' is-active' : ''}`,
            type: 'button',
            'aria-pressed': String(chosen),
            onClick: () => onAssign(target.id, chosen ? null : site.id),
          },
          `${target.icon} ${targetText(target.id).short}${chosen ? ' ✓' : ''}`,
        );
      }),
    ),
  );
}

function travelSection(state, place, onTravel) {
  const info = travelInfo(state, place.id);
  const arrival = state.day + info.days;
  const backHome = place.id === HOME_ID ? 0 : travelDays(haversineKm(place, HOME));
  const tooLate = arrival + backHome > MAX_DAYS;
  return h(
    'section',
    { class: 'travel' },
    h(
      'p',
      null,
      `${info.transport.icon} ${t(`transport.${info.transport.id}`)} · ${info.km.toLocaleString(getLocale())} km · `,
      h('strong', null, t('panel.travelDays', { n: info.days })),
    ),
    tooLate
      ? h('p', { class: 'warning' }, t(place.id === HOME_ID ? 'panel.tooLateHome' : 'panel.tooLateSite'))
      : null,
    h(
      'button',
      { class: 'btn btn--primary', type: 'button', onClick: () => onTravel(place.id) },
      t('panel.travelTo', { name: siteText(place.id).name }),
    ),
  );
}

// ---------- Painéis ----------

function homePanel(state, handlers) {
  const atHome = state.location === HOME_ID;
  return [
    h('h2', null, `🏛️ ${siteText(HOME_ID).name}`),
    h('p', { class: 'muted' }, t('panel.homeSubtitle')),
    h('p', null, t('panel.homeText')),
    atHome
      ? h(
          'section',
          null,
          h(
            'ul',
            { class: 'picks' },
            TARGETS.map((target) => {
              const id = state.assignments[target.id];
              return h(
                'li',
                null,
                `${target.icon} ${targetText(target.id).name}: `,
                h('strong', null, id ? siteText(id).name : t('panel.noPick')),
              );
            }),
          ),
          h('button', { class: 'btn btn--primary', type: 'button', onClick: handlers.onReport }, t('panel.fileReport')),
        )
      : travelSection(state, HOME, handlers.onTravel),
  ];
}

function sitePanel(state, site, ui, handlers) {
  const here = state.location === site.id;
  const visited = isVisited(state, site.id);
  const revealed = revealedDimensions(state, site.id);
  const target = TARGET_BY_ID[ui.targetTab];
  const text = siteText(site.id);

  return [
    h('h2', null, text.name),
    h('p', { class: 'muted' }, text.country, visited && site.lessKnown ? h('span', { class: 'badge' }, t('panel.lessKnown')) : null),
    h('p', { class: 'tagline' }, text.tagline),
    h('p', null, text.description),
    here ? null : travelSection(state, site, handlers.onTravel),
    here ? instrumentsSection(state, site, handlers.onScan) : null,
    visited
      ? h('section', null, h('h3', null, t('panel.compareHeading')), targetTabs(ui.targetTab, handlers.onTargetTab), comparison(site, revealed, target))
      : h('p', { class: 'muted' }, t('panel.locked')),
    here ? quizSection(state, site, handlers.onQuiz) : null,
    visited
      ? [
          assignSection(state, site, handlers.onAssign),
          h(
            'section',
            { class: 'limits' },
            h('h3', null, t('panel.limitsTitle')),
            h('p', null, text.limits),
            h('p', { class: 'muted' }, t('panel.funFact', { text: text.funFact })),
          ),
        ]
      : null,
  ];
}

/** Painel lateral: detalhes do local selecionado ou lista de destinos. */
export function createPanel(handlers) {
  const el = h('aside', { class: 'panel', 'aria-live': 'polite' });

  function update(state, ui) {
    const selected = ui.selectedId ? locationById(ui.selectedId) : null;
    const body = !selected
      ? destinationList(state, handlers.onSelect)
      : selected.id === HOME_ID
        ? homePanel(state, handlers)
        : sitePanel(state, selected, ui, handlers);

    mount(
      el,
      advisor(state),
      selected
        ? h('button', { class: 'btn btn--ghost panel-back', type: 'button', onClick: () => handlers.onSelect(null) }, t('panel.allDestinations'))
        : null,
      body,
    );
  }

  return { el, update };
}
