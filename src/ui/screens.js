import coverUrl from '../assets/capa.jpg';
import { DIMENSION_BY_ID } from '../data/dimensions.js';
import { t } from '../i18n/index.js';
import { h } from './dom.js';
import { langSwitch } from './langSwitch.js';
import { radarChart } from './radar.js';
import { teamCredit } from './teamLogo.js';

// ---------- Tela inicial ----------

export function titleScreen({ hasSave, onStart, onContinue }) {
  return h(
    'main',
    { class: 'screen title' },
    h('div', { class: 'screen-lang' }, langSwitch()),
    h('div', { class: 'title-hero' }, h('img', { src: coverUrl, alt: t('title.heroAlt'), width: 750, height: 427 })),
    h(
      'div',
      { class: 'title-card' },
      h('p', { class: 'eyebrow' }, t('title.eyebrow')),
      h('h1', null, t('title.h1a'), h('span', null, t('title.h1b'))),
      h('p', { class: 'subtitle' }, t('title.subtitle')),
      h('p', null, t('title.pitch')),
      h(
        'div',
        { class: 'title-actions' },
        h('button', { class: 'btn btn--primary btn--big', type: 'button', onClick: onStart }, t('title.start')),
        hasSave ? h('button', { class: 'btn btn--big', type: 'button', onClick: onContinue }, t('title.continue')) : null,
      ),
      h('p', { class: 'muted small' }, t('title.footer')),
    ),
    teamCredit(),
  );
}

// ---------- Introdução ----------

/** Avatares dos personagens, na mesma ordem de `intro.slides`. */
const SLIDE_AVATARS = ['🎩', '🧭', '🧑‍🚀', '🤖', '🎩'];

export function introScreen({ onDone }) {
  const slides = t('intro.slides');
  let index = 0;
  const el = h('main', { class: 'screen intro' });

  function render() {
    const slide = slides[index];
    const last = index === slides.length - 1;
    const advance = () => {
      if (last) return onDone();
      index += 1;
      render();
    };
    el.replaceChildren(
      h(
        'div',
        { class: 'dialog' },
        h('div', { class: 'dialog-avatar', 'aria-hidden': 'true' }, SLIDE_AVATARS[index]),
        h('div', { class: 'dialog-body' }, h('h2', null, slide.name), h('p', null, slide.text)),
        h('div', { class: 'dialog-dots', 'aria-hidden': 'true' }, slides.map((_, i) => h('span', { class: i === index ? 'is-active' : '' }))),
        h(
          'div',
          { class: 'dialog-actions' },
          h('button', { class: 'btn btn--ghost', type: 'button', onClick: onDone }, t('intro.skip')),
          h('button', { class: 'btn btn--primary', type: 'button', onClick: advance }, t(last ? 'intro.board' : 'intro.next')),
        ),
      ),
    );
    el.querySelector('.btn--primary').focus();
  }

  render();
  return el;
}

// ---------- Relatório final ----------

const dimNames = (ids) =>
  ids.map((id) => `${DIMENSION_BY_ID[id].icon} ${t(`dimensions.${id}.label`)}`).join(', ');

function targetResult(entry) {
  const { target, site, best } = entry;
  const targetName = t(`targets.${target.id}.name`);
  const heading = h('h3', null, `${target.icon} ${targetName}`);
  const bestNote = h(
    'p',
    { class: 'muted' },
    site?.id === best.site.id
      ? t('report.foundBest')
      : t('report.bestPossible', { name: t(`sites.${best.site.id}.name`), similarity: best.similarity }),
  );

  if (!site) return h('article', { class: 'result' }, heading, h('p', null, t('report.noPick')), bestNote);

  const text = t(`sites.${site.id}`);
  return h(
    'article',
    { class: 'result' },
    heading,
    h('p', { class: 'result-site' }, '📌 ', h('strong', null, text.name), ` · ${text.country}`),
    radarChart(target.profile, site.profile, t('report.radarLabel', { site: text.name, target: targetName })),
    h(
      'p',
      { class: 'bar-legend' },
      h('span', { class: 'legend-site' }, t('report.legendSite')),
      h('span', { class: 'legend-goal legend-goal--area' }, t('report.legendTarget')),
    ),
    h(
      'dl',
      { class: 'result-stats' },
      h('dt', null, t('report.realSimilarity')), h('dd', null, `${entry.similarity}%`),
      h('dt', null, t('report.dataMeasured')), h('dd', null, `${Math.round(entry.coverage * 100)}%`),
      h('dt', null, t('report.pointsLabel')), h('dd', null, `${entry.points}${entry.bonus ? t('report.discoveryBonus', { n: entry.bonus }) : ''}`),
    ),
    h('p', null, h('strong', null, t('report.matches')), dimNames(entry.strong)),
    h('p', null, h('strong', null, t('report.differs')), dimNames(entry.weak)),
    h('p', null, h('strong', null, t('report.limit')), text.limits),
    bestNote,
  );
}

export function reportScreen({ report, onRestart }) {
  const row = (label, value) => h('tr', null, h('th', { scope: 'row' }, label), h('td', null, value));
  const limit = (key) => h('li', null, h('strong', null, t(`report.${key}Label`)), t(`report.${key}`));

  return h(
    'main',
    { class: 'screen report' },
    h('div', { class: 'screen-lang' }, langSwitch()),
    h(
      'header',
      { class: 'report-head' },
      h('p', { class: 'eyebrow' }, t(report.timeout ? 'report.headTimeout' : 'report.headOk')),
      h('h1', null, `${report.rank.icon} ${t(`ranks.${report.rank.id}`)}`),
      h('p', { class: 'report-total' }, h('strong', null, report.total), t('report.points')),
      h('p', { class: 'muted' }, t('report.summary', { sites: report.sitesVisited, days: report.daysUsed })),
    ),
    h('div', { class: 'results' }, report.targets.map(targetResult)),
    h(
      'section',
      { class: 'report-extra' },
      h(
        'table',
        { class: 'score-table' },
        h('caption', null, t('report.scoreCaption')),
        h(
          'tbody',
          null,
          row(t('report.rowAnalogs'), report.analogPoints),
          row(t('report.rowScience'), report.science),
          row(t('report.rowDays'), `+${report.timeBonus}`),
          report.timeoutPenalty ? row(t('report.rowTimeout'), `−${report.timeoutPenalty}`) : null,
          report.latePenalty ? row(t('report.rowLate'), `−${report.latePenalty}`) : null,
          row(t('report.rowTotal'), report.total),
        ),
      ),
      h(
        'div',
        { class: 'earth-limits' },
        h('h2', null, t('report.earthTitle')),
        h('ul', null, limit('gravity'), limit('atmosphere'), limit('radiation')),
        h('p', null, t('report.earthNote')),
      ),
    ),
    h('div', { class: 'title-actions' }, h('button', { class: 'btn btn--primary btn--big', type: 'button', onClick: onRestart }, t('report.again'))),
    h('p', { class: 'muted small center' }, t('report.disclaimer')),
    teamCredit(),
  );
}
