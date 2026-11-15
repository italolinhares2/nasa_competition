import { SAVE_KEY, SAVE_VERSION } from '../config.js';

/** Persistência tolerante a falhas (modo privado, cota cheia, JSON corrompido). */
export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* sem armazenamento: o jogo segue normalmente */
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    return state?.version === SAVE_VERSION && !state.finished ? state : null;
  } catch {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignorado */
  }
}
