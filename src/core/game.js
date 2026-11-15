import { EVENT_CHANCE, HOME_ID, MAX_DAYS, POINTS, RANKS, SAVE_VERSION } from '../config.js';
import { EVENTS } from '../data/events.js';
import { INSTRUMENT_BY_ID } from '../data/instruments.js';
import { SITES, SITE_BY_ID, locationById } from '../data/sites.js';
import { TARGETS, TARGET_BY_ID } from '../data/targets.js';
import { haversineKm, transportFor, travelDays } from './geo.js';
import { nextRandom, pick } from './rng.js';
import { coverage, rankSites, similarity, strongestAndWeakest } from './similarity.js';

/**
 * Regras do jogo como funções puras: (estado, ação) -> novo estado.
 * Nada aqui toca no DOM nem contém textos: o diário guarda chaves e ids,
 * e os erros carregam um código — a interface traduz ambos (src/i18n).
 */

/** Erro de regra; `code` é a chave de tradução em `errors.<code>`. */
export class GameRuleError extends Error {
  constructor(code) {
    super(code);
    this.name = 'GameRuleError';
    this.code = code;
  }
}

export function createInitialState(seed = Date.now()) {
  return {
    version: SAVE_VERSION,
    seed: seed | 0,
    day: 0,
    location: HOME_ID,
    route: [HOME_ID],
    visited: {},
    science: 0,
    assignments: Object.fromEntries(TARGETS.map((t) => [t.id, null])),
    log: [{ day: 0, kind: 'info', key: 'start', params: {} }],
    finished: null, // null | { reason: 'report' | 'timeout' }
  };
}

const LOG_LIMIT = 40;

/** Acrescenta ao diário uma entrada traduzível: chave `log.<key>` + parâmetros. */
const withLog = (state, kind, key, params = {}) => ({
  ...state,
  log: [...state.log, { day: state.day, kind, key, params }].slice(-LOG_LIMIT),
});

const assertPlaying = (state) => {
  if (state.finished) throw new GameRuleError('finished');
};

/** Se o prazo estourou longe de Londres, o relatório sai por rádio. */
function applyTimeLimit(state) {
  if (state.finished || state.day < MAX_DAYS || state.location === HOME_ID) return state;
  return withLog({ ...state, finished: { reason: 'timeout' } }, 'warn', 'timeout');
}

// ---------- Consultas ----------

export function travelInfo(state, toId) {
  const km = haversineKm(locationById(state.location), locationById(toId));
  return { km: Math.round(km), days: travelDays(km), transport: transportFor(km) };
}

export const daysLeft = (state) => Math.max(0, MAX_DAYS - state.day);

export const daysToHome = (state) =>
  state.location === HOME_ID ? 0 : travelInfo(state, HOME_ID).days;

/** Dimensões já medidas em um local. */
export function revealedDimensions(state, siteId) {
  const scanned = state.visited[siteId]?.scanned ?? [];
  return new Set(scanned.flatMap((id) => INSTRUMENT_BY_ID[id].reveals));
}

export const isVisited = (state, siteId) => siteId in state.visited;

// ---------- Ações ----------

export function travel(state, toId) {
  assertPlaying(state);
  if (!locationById(toId)) throw new GameRuleError('unknownDestination');
  if (toId === state.location) throw new GameRuleError('alreadyHere');

  const { days, transport } = travelInfo(state, toId);
  let next = { ...state, day: state.day + days, location: toId, route: [...state.route, toId] };
  next = withLog(next, 'travel', 'travel', { icon: transport.icon, days, place: toId });

  if (toId !== HOME_ID && !next.visited[toId]) {
    next = { ...next, visited: { ...next.visited, [toId]: { scanned: [], quiz: null } } };
  }

  next = rollTravelEvent(next);
  return applyTimeLimit(next);
}

function rollTravelEvent(state) {
  const [chance, seedAfterChance] = nextRandom(state.seed);
  let next = { ...state, seed: seedAfterChance };
  if (chance >= EVENT_CHANCE) return next;

  const [event, seedAfterPick] = pick(EVENTS, next.seed);
  next = {
    ...next,
    seed: seedAfterPick,
    day: Math.max(0, next.day + event.days),
    science: next.science + event.science,
  };
  return withLog(next, event.days > 0 ? 'bad' : 'good', 'event', { event: event.id, icon: event.icon });
}

export function scan(state, instrumentId) {
  assertPlaying(state);
  const instrument = INSTRUMENT_BY_ID[instrumentId];
  const site = state.location;
  if (!instrument) throw new GameRuleError('unknownInstrument');
  if (site === HOME_ID) throw new GameRuleError('nothingAtHome');
  if (state.visited[site].scanned.includes(instrumentId)) throw new GameRuleError('alreadyScanned');

  const record = state.visited[site];
  const points = instrument.reveals.length * POINTS.perDimensionRevealed;
  let next = {
    ...state,
    day: state.day + instrument.cost,
    science: state.science + points,
    visited: { ...state.visited, [site]: { ...record, scanned: [...record.scanned, instrumentId] } },
  };
  next = withLog(next, 'scan', 'scan', { icon: instrument.icon, instrument: instrumentId, place: site, points });
  return applyTimeLimit(next);
}

export function answerQuiz(state, choice) {
  assertPlaying(state);
  const site = SITE_BY_ID[state.location];
  if (!site) throw new GameRuleError('noQuizAtHome');
  const record = state.visited[site.id];
  if (record.quiz) throw new GameRuleError('quizDone');

  const correct = choice === site.quizAnswer;
  const next = {
    ...state,
    science: state.science + (correct ? POINTS.quizCorrect : 0),
    visited: { ...state.visited, [site.id]: { ...record, quiz: correct ? 'right' : 'wrong' } },
  };
  return correct
    ? withLog(next, 'good', 'quizRight', { points: POINTS.quizCorrect })
    : withLog(next, 'info', 'quizWrong');
}

export function assign(state, targetId, siteId) {
  assertPlaying(state);
  if (!TARGET_BY_ID[targetId]) throw new GameRuleError('unknownTarget');
  if (siteId !== null && !isVisited(state, siteId)) throw new GameRuleError('notVisited');
  return { ...state, assignments: { ...state.assignments, [targetId]: siteId } };
}

/** Entrega o relatório (somente em Londres). */
export function fileReport(state) {
  assertPlaying(state);
  if (state.location !== HOME_ID) throw new GameRuleError('notHome');
  return withLog({ ...state, finished: { reason: 'report' } }, 'info', 'report');
}

// ---------- Relatório final ----------

export function buildReport(state) {
  const timeout = state.finished?.reason === 'timeout';

  const targets = TARGETS.map((target) => {
    const siteId = state.assignments[target.id];
    const site = siteId ? SITE_BY_ID[siteId] : null;
    const best = rankSites(SITES, target)[0];
    if (!site) return { target, site: null, best, similarity: 0, coverage: 0, points: 0 };

    const sim = similarity(site.profile, target);
    const cov = coverage(revealedDimensions(state, siteId), target);
    const confidence = 0.5 + 0.5 * cov;
    const bonus = site.lessKnown && sim >= POINTS.lessKnownMinSimilarity ? POINTS.lessKnownBonus : 0;
    return {
      target,
      site,
      best,
      similarity: sim,
      coverage: cov,
      bonus,
      points: Math.round(sim * confidence) + bonus,
      ...strongestAndWeakest(site.profile, target),
    };
  });

  const analogPoints = targets.reduce((sum, t) => sum + t.points, 0);
  const timeBonus = daysLeft(state) * POINTS.perDayLeft;
  const subtotal = analogPoints + state.science + timeBonus;
  const timeoutPenalty = timeout ? Math.round(subtotal * POINTS.timeoutPenaltyRatio) : 0;
  const latePenalty = Math.max(0, state.day - MAX_DAYS) * POINTS.latePenaltyPerDay;
  const total = Math.max(0, subtotal - timeoutPenalty - latePenalty);
  const rank = [...RANKS].reverse().find((r) => total >= r.min);

  return {
    timeout,
    targets,
    analogPoints,
    science: state.science,
    timeBonus,
    timeoutPenalty,
    latePenalty,
    total,
    rank,
    daysUsed: state.day,
    sitesVisited: Object.keys(state.visited).length,
  };
}
