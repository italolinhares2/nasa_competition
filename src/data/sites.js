import { HOME_ID } from '../config.js';

/** Ponto de partida e chegada da volta ao mundo. */
export const HOME = Object.freeze({ id: HOME_ID, lat: 51.5, lon: -0.12 });

/**
 * Locais candidatos a análogos planetários.
 * Os índices em `profile` são estimativas didáticas inspiradas na literatura
 * de análogos planetários; não substituem dados científicos oficiais.
 * `lessKnown` marca locais pouco estudados (bônus de descoberta).
 * `quizAnswer` é o índice da opção correta do desafio.
 * Os textos (nome, descrição, quiz...) ficam em src/i18n (chave `sites.<id>`).
 */
export const SITES = Object.freeze([
  { id: 'atacama', lat: -24.5, lon: -69.25, lessKnown: false, quizAnswer: 1, profile: { geo: 55, relevo: 40, clima: 45, agua: 5, poeira: 70, subsolo: 20, vida: 35 } },
  { id: 'haughton', lat: 75.4, lon: -89.7, lessKnown: false, quizAnswer: 1, profile: { geo: 70, relevo: 75, clima: 85, agua: 55, poeira: 25, subsolo: 25, vida: 40 } },
  { id: 'deathvalley', lat: 36.5, lon: -117.0, lessKnown: false, quizAnswer: 0, profile: { geo: 60, relevo: 45, clima: 55, agua: 10, poeira: 60, subsolo: 15, vida: 30 } },
  { id: 'mcmurdo', lat: -77.5, lon: 162.5, lessKnown: false, quizAnswer: 1, profile: { geo: 60, relevo: 55, clima: 90, agua: 60, poeira: 55, subsolo: 25, vida: 40 } },
  { id: 'danakil', lat: 14.24, lon: 40.3, lessKnown: true, quizAnswer: 1, profile: { geo: 80, relevo: 40, clima: 55, agua: 40, poeira: 45, subsolo: 40, vida: 60 } },
  { id: 'lencois', lat: -2.5, lon: -43.1, lessKnown: true, quizAnswer: 0, profile: { geo: 30, relevo: 20, clima: 10, agua: 35, poeira: 65, subsolo: 5, vida: 55 } },
  { id: 'carajas', lat: -6.07, lon: -50.15, lessKnown: true, quizAnswer: 0, profile: { geo: 50, relevo: 45, clima: 15, agua: 40, poeira: 5, subsolo: 85, vida: 60 } },
  { id: 'lanzarote', lat: 29.16, lon: -13.43, lessKnown: false, quizAnswer: 1, profile: { geo: 90, relevo: 45, clima: 25, agua: 15, poeira: 40, subsolo: 95, vida: 30 } },
  { id: 'riotinto', lat: 37.7, lon: -6.55, lessKnown: false, quizAnswer: 0, profile: { geo: 65, relevo: 30, clima: 20, agua: 60, poeira: 15, subsolo: 55, vida: 90 } },
  { id: 'maunakea', lat: 19.8, lon: -155.46, lessKnown: false, quizAnswer: 1, profile: { geo: 95, relevo: 60, clima: 50, agua: 25, poeira: 40, subsolo: 70, vida: 20 } },
  { id: 'uyuni', lat: -20.1, lon: -67.5, lessKnown: true, quizAnswer: 0, profile: { geo: 50, relevo: 5, clima: 55, agua: 50, poeira: 60, subsolo: 15, vida: 45 } },
  { id: 'svalbard', lat: 78.2, lon: 15.6, lessKnown: false, quizAnswer: 0, profile: { geo: 55, relevo: 55, clima: 80, agua: 85, poeira: 30, subsolo: 45, vida: 45 } },
  { id: 'pilbara', lat: -21.0, lon: 119.5, lessKnown: true, quizAnswer: 0, profile: { geo: 70, relevo: 40, clima: 40, agua: 15, poeira: 50, subsolo: 20, vida: 80 } },
  { id: 'wadirum', lat: 29.6, lon: 35.4, lessKnown: true, quizAnswer: 1, profile: { geo: 40, relevo: 55, clima: 40, agua: 5, poeira: 70, subsolo: 15, vida: 20 } },
  { id: 'ries', lat: 48.88, lon: 10.57, lessKnown: false, quizAnswer: 0, profile: { geo: 55, relevo: 40, clima: 15, agua: 20, poeira: 10, subsolo: 20, vida: 25 } },
  { id: 'askja', lat: 65.05, lon: -16.75, lessKnown: false, quizAnswer: 0, profile: { geo: 90, relevo: 55, clima: 60, agua: 55, poeira: 70, subsolo: 65, vida: 25 } },
]);

export const SITE_BY_ID = Object.freeze(Object.fromEntries(SITES.map((s) => [s.id, s])));

/** Busca um local ou o ponto de partida pelo id. */
export function locationById(id) {
  return id === HOME_ID ? HOME : SITE_BY_ID[id];
}
