import { describe, expect, it } from 'vitest';
import { HOME_ID, MAX_DAYS, RANKS } from '../src/config.js';
import { EVENTS } from '../src/data/events.js';
import { INSTRUMENTS } from '../src/data/instruments.js';
import { DEFAULT_LANG, DICTIONARIES, getLang, onLangChange, setLang, t } from '../src/i18n/index.js';
import { haversineKm, travelDays } from '../src/core/geo.js';
import {
  GameRuleError,
  answerQuiz,
  assign,
  buildReport,
  createInitialState,
  fileReport,
  revealedDimensions,
  scan,
  travel,
} from '../src/core/game.js';
import { nextRandom } from '../src/core/rng.js';
import { coverage, rankSites, similarity } from '../src/core/similarity.js';
import { DIMENSIONS } from '../src/data/dimensions.js';
import { SITES } from '../src/data/sites.js';
import { TARGETS } from '../src/data/targets.js';

describe('dados', () => {
  it('todo local e alvo tem todas as dimensões entre 0 e 100', () => {
    for (const item of [...SITES, ...TARGETS]) {
      for (const { id } of DIMENSIONS) {
        expect(item.profile[id], `${item.id}.${id}`).toBeGreaterThanOrEqual(0);
        expect(item.profile[id], `${item.id}.${id}`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('ids dos locais são únicos', () => {
    expect(new Set(SITES.map((s) => s.id)).size).toBe(SITES.length);
  });
});

describe('i18n', () => {
  /** Lista todas as chaves de um dicionário ("a.b.c"), incluindo índices de listas. */
  const keysOf = (node, prefix = '') =>
    typeof node === 'string'
      ? [prefix]
      : Object.entries(node).flatMap(([key, value]) => keysOf(value, prefix ? `${prefix}.${key}` : key));

  it('o inglês é o idioma padrão', () => {
    expect(DEFAULT_LANG).toBe('en');
    expect(getLang()).toBe('en');
    expect(t('title.start')).toBe('Start adventure');
  });

  it('inglês e português têm exatamente as mesmas chaves', () => {
    expect(keysOf(DICTIONARIES.pt).sort()).toEqual(keysOf(DICTIONARIES.en).sort());
  });

  it('nenhum texto está vazio', () => {
    for (const dict of Object.values(DICTIONARIES)) {
      const lookup = (path) => path.split('.').reduce((node, key) => node[key], dict);
      for (const key of keysOf(dict)) expect(lookup(key).trim(), key).not.toBe('');
    }
  });

  it('todo dado do jogo tem texto e o quiz aponta para uma opção válida', () => {
    for (const dict of Object.values(DICTIONARIES)) {
      for (const site of SITES) {
        expect(dict.sites[site.id], site.id).toBeDefined();
        expect(site.quizAnswer).toBeLessThan(dict.sites[site.id].quiz.options.length);
      }
      for (const { id } of TARGETS) expect(dict.targets[id], id).toBeDefined();
      for (const { id } of DIMENSIONS) expect(dict.dimensions[id], id).toBeDefined();
      for (const { id } of INSTRUMENTS) expect(dict.instruments[id], id).toBeDefined();
      for (const { id } of EVENTS) expect(dict.events[id], id).toBeDefined();
      for (const { id } of RANKS) expect(dict.ranks[id], id).toBeDefined();
    }
  });

  it('troca de idioma traduz e avisa os assinantes; interpola parâmetros', () => {
    const seen = [];
    const off = onLangChange((lang) => seen.push(lang));
    setLang('pt');
    expect(t('title.start')).toBe('Começar aventura');
    expect(t('panel.travelTo', { name: 'Londres' })).toBe('Viajar para Londres');
    setLang('xx'); // idioma inexistente é ignorado
    expect(getLang()).toBe('pt');
    setLang('en');
    off();
    expect(seen).toEqual(['pt', 'en']);
    expect(t('chave.inexistente')).toBe('chave.inexistente');
  });

  it('o diário e os erros usam chaves que existem nos dicionários', () => {
    let s = travel(createInitialState(1), 'atacama');
    s = answerQuiz(scan(s, 'satellite'), 0);
    for (const entry of s.log) {
      if (entry.key !== 'event') expect(DICTIONARIES.en.log[entry.key], entry.key).toBeDefined();
    }
    try {
      travel(s, 'atacama');
    } catch (error) {
      expect(DICTIONARIES.en.errors[error.code]).toBeDefined();
    }
  });
});

describe('geo', () => {
  it('calcula distâncias conhecidas', () => {
    const km = haversineKm({ lat: 51.5, lon: -0.12 }, { lat: 40.7, lon: -74 });
    expect(km).toBeGreaterThan(5500);
    expect(km).toBeLessThan(5700);
  });

  it('viagem custa no mínimo 1 dia', () => {
    expect(travelDays(1)).toBe(1);
    expect(travelDays(4001)).toBe(3);
  });
});

describe('rng', () => {
  it('é determinístico para a mesma semente', () => {
    expect(nextRandom(42)).toEqual(nextRandom(42));
    const [v] = nextRandom(42);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });
});

describe('similarity', () => {
  it('perfil idêntico ao alvo dá 100', () => {
    const target = TARGETS[0];
    expect(similarity(target.profile, target)).toBe(100);
  });

  it('tubos de lava combinam mais com a Lua subterrânea que o Lençóis', () => {
    const tube = TARGETS.find((t) => t.id === 'lua_tubo');
    const ranking = rankSites(SITES, tube).map((r) => r.site.id);
    expect(ranking.indexOf('lanzarote')).toBeLessThan(ranking.indexOf('lencois'));
  });

  it('cobertura vai de 0 a 1', () => {
    const target = TARGETS[0];
    expect(coverage(new Set(), target)).toBe(0);
    expect(coverage(new Set(DIMENSIONS.map((d) => d.id)), target)).toBeCloseTo(1);
  });
});

describe('regras do jogo', () => {
  const start = () => createInitialState(1);

  it('começa em Londres no dia 0', () => {
    const s = start();
    expect(s.location).toBe(HOME_ID);
    expect(s.day).toBe(0);
  });

  it('viajar avança dias, muda o local e registra a visita', () => {
    const s = travel(start(), 'atacama');
    expect(s.location).toBe('atacama');
    expect(s.day).toBeGreaterThan(0);
    expect(s.visited.atacama).toEqual({ scanned: [], quiz: null });
  });

  it('não permite viajar para onde já está', () => {
    expect(() => travel(start(), HOME_ID)).toThrow(GameRuleError);
  });

  it('é puro: não modifica o estado anterior', () => {
    const before = start();
    const snapshot = JSON.stringify(before);
    travel(before, 'atacama');
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('escanear revela dimensões e rende ciência uma única vez', () => {
    let s = travel(start(), 'atacama');
    const day = s.day;
    s = scan(s, 'satellite');
    expect(s.day).toBe(day + 1);
    expect([...revealedDimensions(s, 'atacama')].sort()).toEqual(['clima', 'poeira']);
    expect(() => scan(s, 'satellite')).toThrow(GameRuleError);
  });

  it('quiz só pode ser respondido uma vez e premia acerto', () => {
    let s = travel(start(), 'atacama');
    const sci = s.science;
    s = answerQuiz(s, 1);
    expect(s.visited.atacama.quiz).toBe('right');
    expect(s.science).toBeGreaterThan(sci);
    expect(() => answerQuiz(s, 1)).toThrow(GameRuleError);
  });

  it('só permite indicar locais visitados', () => {
    expect(() => assign(start(), 'lua_polo', 'atacama')).toThrow(GameRuleError);
    const s = assign(travel(start(), 'atacama'), 'lua_polo', 'atacama');
    expect(s.assignments.lua_polo).toBe('atacama');
  });

  it('só entrega o relatório em Londres', () => {
    expect(() => fileReport(travel(start(), 'atacama'))).toThrow(GameRuleError);
    const s = fileReport(start());
    expect(s.finished.reason).toBe('report');
  });

  it('estourar o prazo longe de casa encerra a missão por rádio', () => {
    let s = { ...travel(start(), 'atacama'), day: MAX_DAYS - 1 };
    s = scan(s, 'satellite');
    expect(s.finished.reason).toBe('timeout');
  });
});

describe('relatório', () => {
  it('sem indicações a pontuação de análogos é zero', () => {
    const r = buildReport(fileReport(createInitialState(1)));
    expect(r.analogPoints).toBe(0);
    expect(r.targets.every((t) => t.site === null)).toBe(true);
  });

  it('medir mais dimensões aumenta a confiança e os pontos', () => {
    const base = travel(createInitialState(1), 'lanzarote');
    const scanned = ['satellite', 'radar', 'spectrometer', 'lab'].reduce(scan, base);
    const pts = (s) =>
      buildReport({ ...assign(s, 'lua_tubo', 'lanzarote'), finished: { reason: 'report' } }).targets.find(
        (t) => t.target.id === 'lua_tubo',
      ).points;
    expect(pts(scanned)).toBeGreaterThan(pts(base));
  });

  it('o timeout aplica penalidade', () => {
    const s = { ...travel(createInitialState(1), 'atacama'), finished: { reason: 'timeout' } };
    expect(buildReport(s).timeout).toBe(true);
  });
});
