import { HOME_ID } from '../config.js';
import { project } from '../core/geo.js';
import { HOME, SITES, locationById } from '../data/sites.js';
import { LANDMASSES } from '../data/world.js';
import { t } from '../i18n/index.js';
import { svg } from './dom.js';

const VIEWBOX = '0 4 360 172';

const toPoints = (coords) =>
  coords
    .map(([lon, lat]) => {
      const { x, y } = project({ lat, lon });
      return `${x},${y}`;
    })
    .join(' ');

function graticule() {
  const lines = [];
  for (let lon = 30; lon < 360; lon += 30) lines.push(svg('line', { x1: lon, y1: 0, x2: lon, y2: 180 }));
  for (let lat = 30; lat < 180; lat += 30) lines.push(svg('line', { x1: 0, y1: lat, x2: 360, y2: lat }));
  return svg('g', { class: 'map-graticule' }, lines);
}

function createMarker(place, onSelect) {
  const { x, y } = project(place);
  const isHome = place.id === HOME_ID;
  const name = t(`sites.${place.id}.name`);
  const country = t(`sites.${place.id}.country`);
  const select = () => onSelect(place.id);
  return svg(
    'g',
    {
      class: `marker${isHome ? ' marker--home' : ''}`,
      transform: `translate(${x} ${y})`,
      tabindex: 0,
      role: 'button',
      'aria-label': `${name}, ${country}`,
      onClick: select,
      onKeydown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      },
    },
    svg('title', null, `${name} — ${country}`),
    svg('circle', { class: 'marker-hit', r: 6 }),
    svg('circle', { class: 'marker-pulse', r: 2.4 }),
    isHome
      ? svg('text', { class: 'marker-home-icon', 'text-anchor': 'middle', y: 2 }, '🏛️')
      : svg('circle', { class: 'marker-dot', r: 2.2 }),
    svg('text', { class: 'marker-label', y: -4.2, 'text-anchor': 'middle' }, name),
  );
}

/**
 * Mapa-múndi em SVG. É criado uma única vez por partida/idioma; `update` só
 * ajusta classes, a rota e a posição do balão (permitindo animações por CSS).
 */
export function createMap({ onSelect }) {
  const route = svg('polyline', { class: 'map-route' });
  const balloon = svg('g', { class: 'balloon' }, svg('text', { 'text-anchor': 'middle', y: -3 }, '🎈'));

  const markers = new Map(
    [HOME, ...SITES].map((place) => [place.id, createMarker(place, onSelect)]),
  );

  const el = svg(
    'svg',
    { class: 'map', viewBox: VIEWBOX, role: 'group', 'aria-label': t('map.label') },
    svg(
      'defs',
      null,
      svg(
        'radialGradient',
        { id: 'ocean', cx: '50%', cy: '40%', r: '75%' },
        svg('stop', { offset: '0%', 'stop-color': '#2a5d8f' }),
        svg('stop', { offset: '100%', 'stop-color': '#12284f' }),
      ),
    ),
    svg('rect', { x: 0, y: 0, width: 360, height: 180, fill: 'url(#ocean)' }),
    graticule(),
    svg('g', { class: 'map-land' }, LANDMASSES.map((coords) => svg('polygon', { points: toPoints(coords) }))),
    route,
    svg('g', null, [...markers.values()]),
    balloon,
  );

  function update(state, selectedId) {
    route.setAttribute('points', toPoints(state.route.map((id) => {
      const place = locationById(id);
      return [place.lon, place.lat];
    })));

    for (const [id, marker] of markers) {
      const assigned = Object.values(state.assignments).includes(id);
      marker.classList.toggle('is-visited', id in state.visited);
      marker.classList.toggle('is-current', id === state.location);
      marker.classList.toggle('is-selected', id === selectedId);
      marker.classList.toggle('is-assigned', assigned);
    }

    const { x, y } = project(locationById(state.location));
    balloon.style.transform = `translate(${x}px, ${y}px)`;
  }

  return { el, update };
}
