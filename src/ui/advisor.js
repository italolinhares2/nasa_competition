import { HOME_ID } from '../config.js';
import { daysLeft, daysToHome } from '../core/game.js';
import { INSTRUMENTS } from '../data/instruments.js';
import { TARGETS } from '../data/targets.js';
import { t } from '../i18n/index.js';

/** Dica contextual do robô Passe-9, de acordo com a situação da missão. */
export function adviceFor(state) {
  const slack = daysLeft(state) - daysToHome(state);
  const visitedCount = Object.keys(state.visited).length;
  const missing = TARGETS.filter((target) => !state.assignments[target.id]);
  const shortName = (target) => t(`targets.${target.id}.short`);

  if (slack < 0) return t('advisor.late');
  if (slack <= 4 && state.location !== HOME_ID) return t('advisor.tight');
  if (visitedCount === 0) return t('advisor.first');
  if (state.location === HOME_ID) {
    return missing.length
      ? t('advisor.homeMissing', { list: missing.map(shortName).join(', ') })
      : t('advisor.homeReady');
  }
  if (state.visited[state.location].scanned.length < INSTRUMENTS.length) return t('advisor.scanMore');
  if (missing.length) return t('advisor.complete', { target: shortName(missing[0]) });
  return t('advisor.free');
}
