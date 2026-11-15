import { LANGS, getLang, setLang, t } from '../i18n/index.js';
import { h } from './dom.js';

/** Seletor de idioma (EN | PT). A troca dispara `onLangChange` em main.js. */
export function langSwitch() {
  return h(
    'div',
    { class: 'lang', role: 'group', 'aria-label': t('lang.label') },
    LANGS.map((lang) => {
      const active = lang.id === getLang();
      return h(
        'button',
        {
          class: `lang-btn${active ? ' is-active' : ''}`,
          type: 'button',
          lang: lang.id,
          title: lang.label,
          'aria-label': lang.label,
          'aria-pressed': String(active),
          onClick: () => setLang(lang.id),
        },
        lang.id.toUpperCase(),
      );
    }),
  );
}
