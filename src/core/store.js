/**
 * Store minimalista: guarda o estado, aplica ações (funções puras) e avisa
 * os assinantes. Erros de regra viram avisos para a interface, sem quebrar.
 */
export function createStore(initialState, { onError } = {}) {
  let state = initialState;
  const listeners = new Set();

  return {
    get: () => state,
    set(next) {
      state = next;
      listeners.forEach((fn) => fn(state));
    },
    /** Aplica `action(state, ...args)`; devolve true se a ação foi aceita. */
    dispatch(action, ...args) {
      try {
        this.set(action(state, ...args));
        return true;
      } catch (error) {
        if (error?.name === 'GameRuleError') {
          onError?.(error.message);
          return false;
        }
        throw error;
      }
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
