import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class StatusBar {
  constructor() {
    this.el = document.getElementById('status-bar');
    this._setupEvents();
  }

  _setupEvents() {
    eventBus.on(EVENTS.MODEL_DOWNLOAD_PROGRESS, ({ toolType, progress }) => {
      this.el.innerHTML = `
        <span>Downloading model...</span>
        <div class="progress" style="width:120px">
          <div class="progress__fill" style="width:${Math.round(progress)}%"></div>
        </div>
        <span>${Math.round(progress)}%</span>
      `;
    });

    eventBus.on(EVENTS.MODEL_READY, ({ toolType }) => {
      this.el.textContent = 'Model ready';
      setTimeout(() => this.clear(), 3000);
    });

    eventBus.on(EVENTS.INFERENCE_START, () => {
      this.el.textContent = 'Running inference...';
    });

    eventBus.on(EVENTS.INFERENCE_COMPLETE, () => {
      this.el.textContent = 'Inference complete';
      setTimeout(() => this.clear(), 3000);
    });
  }

  clear() {
    this.el.textContent = '';
  }
}
