/**
 * Instrumentos de campo: cada um consome dias e revela dimensões do local.
 * Os textos ficam em src/i18n (chave `instruments.<id>`).
 */
export const INSTRUMENTS = Object.freeze([
  { id: 'satellite', icon: '🛰️', reveals: ['clima', 'poeira'], cost: 1 },
  { id: 'radar', icon: '📡', reveals: ['relevo', 'subsolo'], cost: 1 },
  { id: 'spectrometer', icon: '🌈', reveals: ['geo', 'agua'], cost: 1 },
  { id: 'lab', icon: '🧪', reveals: ['vida'], cost: 1 },
]);

export const INSTRUMENT_BY_ID = Object.freeze(
  Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i])),
);
