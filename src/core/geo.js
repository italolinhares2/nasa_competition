import { KM_PER_DAY } from '../config.js';

const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

/** Distância ortodrômica (círculo máximo) entre dois pontos, em km. */
export function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Dias de viagem (mínimo 1) para uma distância em km. */
export function travelDays(km) {
  return Math.max(1, Math.ceil(km / KM_PER_DAY));
}

/** Meio de transporte temático conforme a distância (texto em `transport.<id>`). */
export function transportFor(km) {
  if (km < 2000) return { id: 'train', icon: '🚂' };
  if (km < 6000) return { id: 'balloon', icon: '🎈' };
  return { id: 'rocket', icon: '🚀' };
}

/** Projeção equirretangular em um viewBox de 360 x 180. */
export function project({ lat, lon }) {
  return { x: lon + 180, y: 90 - lat };
}
