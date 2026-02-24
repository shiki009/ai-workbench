import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class Toast {
  constructor() {
    this.container = document.getElementById('toast-container');
    eventBus.on(EVENTS.TOAST, ({ message, type }) => this.show(message, type));
  }

  show(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = message;
    this.container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 300ms ease';
      setTimeout(() => el.remove(), 300);
    }, 4000);
  }
}
