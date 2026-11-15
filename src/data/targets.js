/**
 * Alvos da missão: locais candidatos a base na Lua e a exploração em Marte.
 * `profile` = condições ideais a serem imitadas; `weights` = o que mais importa.
 * Valores didáticos aproximados (não são medições oficiais).
 * Os textos ficam em src/i18n (chave `targets.<id>`).
 */
export const TARGETS = Object.freeze([
  {
    id: 'lua_polo',
    world: 'moon',
    icon: '🌕',
    profile: { geo: 60, relevo: 80, clima: 95, agua: 75, poeira: 40, subsolo: 20, vida: 0 },
    weights: { geo: 1, relevo: 2, clima: 3, agua: 3, poeira: 1, subsolo: 0.5, vida: 0.2 },
  },
  {
    id: 'lua_tubo',
    world: 'moon',
    icon: '🌑',
    profile: { geo: 90, relevo: 55, clima: 60, agua: 5, poeira: 35, subsolo: 100, vida: 0 },
    weights: { geo: 3, relevo: 1, clima: 1, agua: 0.5, poeira: 1, subsolo: 4, vida: 0.2 },
  },
  {
    id: 'marte_jezero',
    world: 'mars',
    icon: '🔴',
    profile: { geo: 75, relevo: 60, clima: 70, agua: 45, poeira: 80, subsolo: 30, vida: 55 },
    weights: { geo: 3, relevo: 1, clima: 1, agua: 2, poeira: 2, subsolo: 0.5, vida: 3 },
  },
]);

export const TARGET_BY_ID = Object.freeze(Object.fromEntries(TARGETS.map((t) => [t.id, t])));
