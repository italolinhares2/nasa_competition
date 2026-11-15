/**
 * Dimensões de analogia (inspiradas nas "Potential Considerations" do desafio).
 * Cada dimensão é um índice didático de 0 a 100.
 * Os textos ficam em src/i18n (chave `dimensions.<id>`).
 */
export const DIMENSIONS = Object.freeze([
  { id: 'geo', icon: '🪨' },
  { id: 'relevo', icon: '⛰️' },
  { id: 'clima', icon: '🌡️' },
  { id: 'agua', icon: '🧊' },
  { id: 'poeira', icon: '🌪️' },
  { id: 'subsolo', icon: '🕳️' },
  { id: 'vida', icon: '🧫' },
]);

export const DIMENSION_BY_ID = Object.freeze(
  Object.fromEntries(DIMENSIONS.map((d) => [d.id, d])),
);
