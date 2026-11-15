import { DIMENSIONS } from '../data/dimensions.js';

/**
 * Similaridade (0–100) entre o perfil de um local da Terra e o de um alvo
 * (base lunar ou marciana): 100 − distância euclidiana ponderada.
 * Os pesos do alvo dizem quais dimensões importam mais para aquela missão.
 * Se `only` for informado, considera apenas essas dimensões (estimativa parcial).
 */
export function similarity(profile, target, only = null) {
  let weighted = 0;
  let totalWeight = 0;
  for (const { id } of DIMENSIONS) {
    if (only && !only.has(id)) continue;
    const w = target.weights[id] ?? 1;
    weighted += w * (profile[id] - target.profile[id]) ** 2;
    totalWeight += w;
  }
  if (totalWeight === 0) return null;
  return Math.round(100 - Math.sqrt(weighted / totalWeight));
}

/** Quanto do que importa para o alvo já foi medido naquele local (0–1). */
export function coverage(scannedDims, target) {
  let known = 0;
  let total = 0;
  for (const { id } of DIMENSIONS) {
    const w = target.weights[id] ?? 1;
    total += w;
    if (scannedDims.has(id)) known += w;
  }
  return total === 0 ? 0 : known / total;
}

/** Ranking de todos os locais para um alvo, do mais ao menos parecido. */
export function rankSites(sites, target) {
  return sites
    .map((site) => ({ site, similarity: similarity(site.profile, target) }))
    .sort((a, b) => b.similarity - a.similarity);
}

/** Dimensões em que o local mais combina / mais diverge do alvo. */
export function strongestAndWeakest(profile, target, count = 2) {
  const diffs = DIMENSIONS.map(({ id }) => ({
    id,
    gap: Math.abs(profile[id] - target.profile[id]),
  })).sort((a, b) => a.gap - b.gap);
  return {
    strong: diffs.slice(0, count).map((d) => d.id),
    weak: diffs.slice(-count).reverse().map((d) => d.id),
  };
}
