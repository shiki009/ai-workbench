import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class Sidebar {
  constructor(toolDefs) {
    this.el = document.getElementById('sidebar');
    this.nav = document.getElementById('tool-nav');
    this._activeType = null;

    this._render(toolDefs);
    this._setupKeyboard();
  }

  _render(toolDefs) {
    this.nav.innerHTML = '';
    for (const def of toolDefs) {
      const item = document.createElement('button');
      item.className = 'tool-item';
      item.dataset.toolType = def.type;
      item.innerHTML = `
        <div class="tool-item__icon" style="background:${def.cssColor || 'rgba(0,212,255,0.15)'}">
          ${def.icon}
        </div>
        <div class="tool-item__info">
          <span class="tool-item__name">${def.label}</span>
          <span class="tool-item__desc">${def.description || ''}</span>
        </div>
      `;
      item.addEventListener('click', () => {
        eventBus.emit(EVENTS.TOOL_ACTIVATE, { toolType: def.type });
      });
      this.nav.appendChild(item);
    }
  }

  setActive(toolType) {
    this._activeType = toolType;
    for (const item of this.nav.children) {
      item.classList.toggle('tool-item--active', item.dataset.toolType === toolType);
    }
  }

  toggle() {
    this.el.classList.toggle('sidebar--collapsed');
  }

  _setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'KeyE') {
        e.preventDefault();
        this.toggle();
      }
    });
  }
}
