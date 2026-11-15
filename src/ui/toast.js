import { h } from './dom.js';

const DURATION_MS = 3500;

/** Aviso temporário e acessível (aria-live) para mensagens de regra. */
export function createToast() {
  const el = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
  let timer = null;

  function show(message) {
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('is-visible'), DURATION_MS);
  }

  return { el, show };
}
