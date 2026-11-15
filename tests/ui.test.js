// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Teste de fumaça da interface: percorre o fluxo principal em um DOM simulado
 * (título → introdução → mapa → viagem → medição → troca de idioma → relatório).
 */
const $ = (selector) => document.querySelector(selector);
const clickText = (selector, text) => {
  const el = [...document.querySelectorAll(selector)].find((node) => node.textContent.includes(text));
  if (!el) throw new Error(`"${text}" não encontrado em ${selector}`);
  el.click();
};

describe('interface', () => {
  beforeAll(async () => {
    localStorage.clear();
    window.scrollTo = () => {};
    document.body.innerHTML = '<div id="app"></div>';
    await import('../src/main.js');
  });

  it('abre em inglês por padrão', () => {
    expect(document.documentElement.lang).toBe('en');
    expect($('h1').textContent).toBe('Around the World in 80 Days');
    expect($('.lang-btn.is-active').textContent).toBe('EN');
    expect($('.team-credit').textContent).toBe('Created by teamGetHub');
    expect(document.querySelectorAll('.team-star')).toHaveLength(5);
  });

  it('troca para português e de volta na tela inicial', () => {
    clickText('.lang-btn', 'PT');
    expect($('h1').textContent).toBe('A Volta ao Mundo em 80 Dias');
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.title).toContain('Missão Espacial');
    clickText('.lang-btn', 'EN');
    expect($('h1').textContent).toBe('Around the World in 80 Days');
  });

  it('inicia o jogo, viaja e mede um local', () => {
    clickText('.btn', 'Start adventure');
    clickText('.btn', 'Skip');
    expect($('.hud')).not.toBeNull();
    expect(document.querySelectorAll('.marker')).toHaveLength(17);

    clickText('.dest', 'Lanzarote lava tubes');
    clickText('.btn', 'Travel to Lanzarote lava tubes');
    expect($('.hud').textContent).toContain('Lanzarote lava tubes');

    clickText('.instrument', 'Spectrometer');
    expect($('.estimate').textContent).toContain('Estimated similarity');
    expect($('.log').textContent).toContain('Spectrometer at Lanzarote lava tubes');
  });

  it('trocar o idioma no meio do jogo traduz tudo, inclusive o diário', () => {
    clickText('.lang-btn', 'PT');
    expect($('.hud').textContent).toContain('Tubos de lava de Lanzarote');
    expect($('.log').textContent).toContain('Espectrômetro em Tubos de lava de Lanzarote');
    expect($('.panel h2').textContent).toBe('Tubos de lava de Lanzarote');
    expect($('.estimate').textContent).toContain('Semelhança estimada');
  });

  it('responde ao desafio, indica o local e entrega o relatório', () => {
    document.querySelectorAll('.quiz-option')[1].click();
    expect($('.quiz-feedback').textContent).toContain('Correto');

    clickText('.btn--assign', 'Cavernas lunares');
    expect($('.mission-pick strong').textContent).toBe('Tubos de lava de Lanzarote');

    clickText('.panel-back', 'Todos os destinos');
    clickText('.dest', 'Londres');
    clickText('.btn', 'Viajar para Londres');
    clickText('.btn', 'Entregar relatório final');

    expect($('.report-head')).not.toBeNull();
    expect($('.result-site').textContent).toContain('Tubos de lava de Lanzarote');
    expect(document.querySelectorAll('.radar')).toHaveLength(1);

    clickText('.lang-btn', 'EN');
    expect($('.report').textContent).toContain('What Earth cannot imitate');
  });
});
