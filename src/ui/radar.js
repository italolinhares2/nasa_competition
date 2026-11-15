import { DIMENSIONS } from '../data/dimensions.js';
import { svg } from './dom.js';

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 78;

const angle = (i) => (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
const point = (i, value) => {
  const r = (RADIUS * value) / 100;
  return [CENTER + r * Math.cos(angle(i)), CENTER + r * Math.sin(angle(i))];
};
const polygon = (profile) => DIMENSIONS.map((d, i) => point(i, profile[d.id]).join(',')).join(' ');

/** Gráfico radar comparando o perfil do alvo (laranja) com o do local (azul). */
export function radarChart(targetProfile, siteProfile, label) {
  const rings = [25, 50, 75, 100].map((v) =>
    svg('polygon', {
      class: 'radar-ring',
      points: DIMENSIONS.map((_, i) => point(i, v).join(',')).join(' '),
    }),
  );
  const spokes = DIMENSIONS.map((_, i) => {
    const [x, y] = point(i, 100);
    return svg('line', { class: 'radar-ring', x1: CENTER, y1: CENTER, x2: x, y2: y });
  });
  const labels = DIMENSIONS.map((d, i) => {
    const [x, y] = point(i, 128);
    return svg('text', { class: 'radar-label', x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, d.icon);
  });

  return svg(
    'svg',
    { class: 'radar', viewBox: `0 0 ${SIZE} ${SIZE}`, role: 'img', 'aria-label': label },
    ...rings,
    ...spokes,
    svg('polygon', { class: 'radar-target', points: polygon(targetProfile) }),
    svg('polygon', { class: 'radar-site', points: polygon(siteProfile) }),
    ...labels,
  );
}
