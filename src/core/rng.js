/**
 * Gerador pseudoaleatório puro (mulberry32).
 * Recebe uma semente e devolve [valor em [0,1), próxima semente],
 * o que mantém o estado do jogo serializável e os testes determinísticos.
 */
export function nextRandom(seed) {
  const next = (seed + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, next];
}

/** Sorteia um item de uma lista. Retorna [item, próxima semente]. */
export function pick(list, seed) {
  const [value, next] = nextRandom(seed);
  return [list[Math.floor(value * list.length)], next];
}
