import { t } from '../i18n/index.js';
import { h, svg } from './dom.js';

/**
 * Logo da equipe GetHub ("G Constellation"): cinco estrelas ligadas
 * formando a letra G. Desenhado em SVG para ficar nítido em qualquer tamanho.
 */
const STARS = [
  [574, 369],
  [380, 320],
  [253, 508],
  [404, 693],
  [591, 571],
];
const G_END = [483, 571];
const STAR_SIZE = 40;

/** Estrela de quatro pontas centrada em (x, y). */
function starPath([x, y], size = STAR_SIZE) {
  const c = size * 0.2;
  return [
    `M${x},${y - size}`,
    `Q${x + c},${y - c} ${x + size},${y}`,
    `Q${x + c},${y + c} ${x},${y + size}`,
    `Q${x - c},${y + c} ${x - size},${y}`,
    `Q${x - c},${y - c} ${x},${y - size}Z`,
  ].join(' ');
}

function mark() {
  return svg(
    'svg',
    { class: 'team-mark', viewBox: '150 233 550 550', 'aria-hidden': 'true' },
    svg('circle', { class: 'team-orbit', cx: 425, cy: 508, r: 263 }),
    svg('polyline', { class: 'team-line', points: [...STARS, G_END].map((p) => p.join(',')).join(' ') }),
    STARS.map((star) => svg('path', { class: 'team-star', d: starPath(star) })),
    svg('circle', { class: 'team-dot', cx: G_END[0], cy: G_END[1], r: 17 }),
    svg('circle', { class: 'team-dot', cx: 656, cy: 398, r: 11 }),
  );
}

/** Crédito da equipe: rótulo traduzido + logo (símbolo e nome). */
export function teamCredit() {
  return h(
    'div',
    { class: 'team-credit' },
    h('span', { class: 'team-label' }, t('credits.madeBy')),
    h(
      'span',
      { class: 'team-logo', role: 'img', 'aria-label': t('credits.logoAlt') },
      mark(),
      h('span', { class: 'team-name', 'aria-hidden': 'true' }, 'Get', h('span', null, 'Hub')),
    ),
  );
}
