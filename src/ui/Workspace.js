import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class Workspace {
  constructor() {
    this.container = document.getElementById('workspace-cards');
    this.emptyState = document.getElementById('workspace-empty');
    this.cards = new Map();
  }

  addCard(toolType, { icon, title, color }) {
    if (this.cards.has(toolType)) {
      this._focusCard(toolType);
      return this.cards.get(toolType).body;
    }

    this.emptyState.style.display = 'none';

    const card = document.createElement('div');
    card.className = 'tool-card';
    card.dataset.toolType = toolType;
    card.innerHTML = `
      <div class="tool-card__header">
        <div class="tool-card__title-group">
          <span class="tool-card__icon">${icon}</span>
          <span class="tool-card__title">${title}</span>
        </div>
        <button class="tool-card__close" title="Close">&times;</button>
      </div>
      <div class="tool-card__body"></div>
      <div class="tool-card__status"></div>
    `;

    const closeBtn = card.querySelector('.tool-card__close');
    closeBtn.addEventListener('click', () => {
      eventBus.emit(EVENTS.TOOL_DEACTIVATE, { toolType });
    });

    this.container.appendChild(card);
    const body = card.querySelector('.tool-card__body');
    const status = card.querySelector('.tool-card__status');
    this.cards.set(toolType, { card, body, status });
    this._focusCard(toolType);

    return body;
  }

  removeCard(toolType) {
    const entry = this.cards.get(toolType);
    if (!entry) return;
    entry.card.remove();
    this.cards.delete(toolType);

    if (this.cards.size === 0) {
      this.emptyState.style.display = '';
    }
  }

  setStatus(toolType, html) {
    const entry = this.cards.get(toolType);
    if (entry) {
      entry.status.innerHTML = html;
    }
  }

  getBody(toolType) {
    const entry = this.cards.get(toolType);
    return entry ? entry.body : null;
  }

  _focusCard(toolType) {
    for (const [type, entry] of this.cards) {
      entry.card.classList.toggle('tool-card--focused', type === toolType);
    }
  }
}
