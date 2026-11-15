import en from './en.js';
import pt from './pt.js';

/**
 * Internacionalização: dicionários por idioma, com inglês como padrão.
 * Os textos nunca ficam no estado do jogo — apenas chaves e ids —
 * para que trocar de idioma traduza tudo, inclusive o diário de bordo.
 */
export const DEFAULT_LANG = 'en';
export const LANGS = Object.freeze([
  { id: 'en', label: 'English', locale: 'en-US' },
  { id: 'pt', label: 'Português', locale: 'pt-BR' },
]);
export const DICTIONARIES = Object.freeze({ en, pt });

const LANG_KEY = 'volta-80-dias-espacial:lang';
const listeners = new Set();
let current = loadLang();

function loadLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved in DICTIONARIES ? saved : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

const lookup = (dict, path) => path.split('.').reduce((node, key) => node?.[key], dict);

const interpolate = (text, params) =>
  params ? text.replace(/\{(\w+)\}/g, (match, key) => params[key] ?? match) : text;

export const getLang = () => current;
export const getLocale = () => LANGS.find((l) => l.id === current).locale;

/**
 * Traduz uma chave ("panel.travelTo") interpolando {parâmetros}.
 * Cai para o inglês se faltar no idioma atual; devolve a chave se não existir.
 * Valores não textuais (listas, objetos) são devolvidos como estão.
 */
export function t(path, params) {
  const value = lookup(DICTIONARIES[current], path) ?? lookup(DICTIONARIES[DEFAULT_LANG], path);
  if (value == null) return path;
  return typeof value === 'string' ? interpolate(value, params) : value;
}

export function setLang(lang) {
  if (!(lang in DICTIONARIES) || lang === current) return;
  current = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* sem armazenamento: vale só para esta sessão */
  }
  listeners.forEach((fn) => fn(lang));
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
