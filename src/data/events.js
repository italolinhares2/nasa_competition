/**
 * Eventos de viagem. `days` negativo = ganha tempo; positivo = perde tempo.
 * Os textos ficam em src/i18n (chave `events.<id>`).
 */
export const EVENTS = Object.freeze([
  { id: 'tailwind', icon: '💨', days: -1, science: 0 },
  { id: 'storm', icon: '⛈️', days: 1, science: 0 },
  { id: 'dust', icon: '🌪️', days: 1, science: 5 },
  { id: 'colleague', icon: '🧑‍🔬', days: 0, science: 8 },
  { id: 'robot', icon: '🤖', days: 0, science: 6 },
  { id: 'shortcut', icon: '🚂', days: -1, science: 0 },
]);
