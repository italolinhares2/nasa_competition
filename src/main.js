import './styles/main.css';
import { answerQuiz, assign, buildReport, createInitialState, fileReport, scan, travel } from './core/game.js';
import { clearSave, loadGame, saveGame } from './core/storage.js';
import { createStore } from './core/store.js';
import { TARGETS } from './data/targets.js';
import { getLang, onLangChange, t } from './i18n/index.js';
import { createBoard } from './ui/board.js';
import { h, mount } from './ui/dom.js';
import { createHud } from './ui/hud.js';
import { createMap } from './ui/map.js';
import { createPanel } from './ui/panel.js';
import { introScreen, reportScreen, titleScreen } from './ui/screens.js';
import { createToast } from './ui/toast.js';

/**
 * Ponto de entrada: liga o estado (store) às telas.
 * O estado do jogo vive no store; `ui` guarda apenas o estado de interface.
 */
const root = document.querySelector('#app');
const toast = createToast();
document.body.append(toast.el);

const store = createStore(createInitialState(), {
  onError: (code) => toast.show(t(`errors.${code}`)),
});
const ui = { selectedId: null, targetTab: TARGETS[0].id };
let gameView = null;
/** Redesenha a tela atual (usado ao trocar de idioma). */
let renderCurrentScreen = () => {};

function show(render) {
  renderCurrentScreen = render;
  render();
}

function showTitle() {
  show(() => {
    gameView = null;
    mount(
      root,
      titleScreen({
        hasSave: Boolean(loadGame()),
        onStart: showIntro,
        onContinue: () => startGame(loadGame() ?? createInitialState()),
      }),
    );
  });
}

function showIntro() {
  show(() => {
    gameView = null;
    mount(root, introScreen({ onDone: () => startGame(createInitialState()) }));
  });
}

function startGame(state) {
  ui.selectedId = null;
  gameView = null;
  store.set(state);
  show(() => {
    gameView = createGameView();
    mount(root, gameView.el);
    gameView.update(store.get());
  });
}

function showReport(state) {
  clearSave();
  show(() => {
    gameView = null;
    mount(root, reportScreen({ report: buildReport(state), onRestart: showTitle }));
  });
  window.scrollTo({ top: 0 });
}

function createGameView() {
  const refresh = () => gameView?.update(store.get());
  const select = (id) => {
    ui.selectedId = id;
    refresh();
  };

  const handlers = {
    onSelect: select,
    onTargetTab: (id) => {
      ui.targetTab = id;
      refresh();
    },
    onTravel: (id) => {
      ui.selectedId = id;
      store.dispatch(travel, id);
    },
    onScan: (id) => store.dispatch(scan, id),
    onQuiz: (index) => store.dispatch(answerQuiz, index),
    onAssign: (targetId, siteId) => store.dispatch(assign, targetId, siteId),
    onReport: () => store.dispatch(fileReport),
  };

  const hud = createHud({
    onMenu: () => {
      if (window.confirm(t('hud.menuConfirm'))) showTitle();
    },
  });
  const map = createMap({ onSelect: select });
  const panel = createPanel(handlers);
  const board = createBoard({ onSelect: select });

  const el = h(
    'div',
    { class: 'game' },
    hud.el,
    h('main', { class: 'game-main' }, h('div', { class: 'map-frame' }, map.el), panel.el),
    board.el,
  );

  return {
    el,
    update(state) {
      hud.update(state);
      map.update(state, ui.selectedId);
      panel.update(state, ui);
      board.update(state);
    },
  };
}

function syncDocumentLanguage() {
  document.documentElement.lang = getLang() === 'pt' ? 'pt-BR' : 'en';
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
}

store.subscribe((state) => {
  if (!gameView) return;
  if (state.finished) {
    showReport(state);
    return;
  }
  saveGame(state);
  gameView.update(state);
});

onLangChange(() => {
  syncDocumentLanguage();
  renderCurrentScreen();
});

syncDocumentLanguage();
showTitle();
