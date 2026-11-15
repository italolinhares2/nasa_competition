import { HOME_ID, MAX_DAYS } from '../config.js';
import { daysLeft, daysToHome } from '../core/game.js';
import { t } from '../i18n/index.js';
import { h, mount } from './dom.js';
import { langSwitch } from './langSwitch.js';

/** Barra superior: dia atual, ciência, local e folga para voltar a Londres. */
export function createHud({ onMenu }) {
  const el = h('header', { class: 'hud' });

  function update(state) {
    const left = daysLeft(state);
    const home = daysToHome(state);
    const slack = left - home;
    const progress = Math.min(100, (state.day / MAX_DAYS) * 100);
    const slackClass = slack < 0 ? 'is-danger' : slack <= 6 ? 'is-warn' : '';

    mount(
      el,
      h('div', { class: 'hud-brand' }, h('span', { 'aria-hidden': 'true' }, '🎩'), h('strong', null, t('hud.brand'))),
      h(
        'div',
        { class: 'hud-clock', role: 'group', 'aria-label': t('hud.clockLabel', { day: state.day, max: MAX_DAYS }) },
        h(
          'div',
          { class: 'hud-clock-text' },
          h('span', null, `⏱️ ${t('hud.day')} `, h('strong', null, state.day), ` / ${MAX_DAYS}`),
          h('span', null, t('hud.left', { n: left })),
        ),
        h('div', { class: 'hud-track' }, h('div', { class: `hud-fill ${slackClass}`, style: `width:${progress}%` })),
      ),
      h('div', { class: 'hud-stat', title: t('hud.scienceTitle') }, '🔬 ', h('strong', null, state.science)),
      h('div', { class: 'hud-stat', title: t('hud.locationTitle') }, '📍 ', h('strong', null, t(`sites.${state.location}.name`))),
      state.location === HOME_ID
        ? null
        : h(
            'div',
            { class: `hud-stat hud-return ${slackClass}`, title: t('hud.returnTitle') },
            `🏛️ ${t('hud.returnLabel')} `,
            h('strong', null, t('hud.daysShort', { n: home })),
            slack < 0 ? ' ⚠️' : '',
          ),
      langSwitch(),
      h('button', { class: 'btn btn--ghost', type: 'button', onClick: onMenu }, t('hud.menu')),
    );
  }

  return { el, update };
}
