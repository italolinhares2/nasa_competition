/** Constantes globais do jogo. Centralizadas para facilitar balanceamento. */
export const MAX_DAYS = 80;
export const KM_PER_DAY = 2000;
export const HOME_ID = 'londres';
export const SAVE_KEY = 'volta-80-dias-espacial:save';
export const SAVE_VERSION = 2;

/** Pontuação */
export const POINTS = Object.freeze({
  perDimensionRevealed: 2,
  quizCorrect: 10,
  perDayLeft: 2,
  lessKnownBonus: 5,
  lessKnownMinSimilarity: 60,
  latePenaltyPerDay: 10,
  timeoutPenaltyRatio: 0.3,
});

/** Probabilidade de um evento aleatório ao chegar em um destino. */
export const EVENT_CHANCE = 0.35;

/** Títulos finais por pontuação mínima (ordem crescente); textos em `ranks.<id>`. */
export const RANKS = Object.freeze([
  { min: 0, id: 'apprentice', icon: '🎈' },
  { min: 200, id: 'explorer', icon: '🧭' },
  { min: 300, id: 'navigator', icon: '🚀' },
  { min: 400, id: 'commander', icon: '🏆' },
]);
