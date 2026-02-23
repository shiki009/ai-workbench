import { eventBus } from '../events.js';

export class KeyboardControls {
  constructor() {
    this.bindings = new Map();
    this._setup();
  }

  _setup() {
    document.addEventListener('keydown', (e) => {
      // Don't capture when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const handler = this.bindings.get(e.code);
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    });
  }

  bind(code, handler) {
    this.bindings.set(code, handler);
  }

  unbind(code) {
    this.bindings.delete(code);
  }
}
