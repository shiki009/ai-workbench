import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class BaseTool {
  constructor({ type, label, icon, workspace, aiManager, storage }) {
    this.type = type;
    this.label = label;
    this.icon = icon;
    this.workspace = workspace;
    this.aiManager = aiManager;
    this.storage = storage;
    this.active = false;
    this.modelLoaded = false;
    this._unsubs = [];
  }

  activate() {
    if (this.active) return;
    this.active = true;

    const body = this.workspace.addCard(this.type, {
      icon: this.icon,
      title: this.label,
    });

    this.body = body;
    this._setupBaseEvents();
    this.onActivate(body);
  }

  deactivate() {
    if (!this.active) return;
    this.active = false;
    this._cleanupEvents();
    this.onDeactivate();
    this.aiManager.terminateWorker(this.type);
    this.workspace.removeCard(this.type);
    this.body = null;
  }

  async loadModel() {
    if (this.modelLoaded) return;
    this._setStatus('Loading model...');
    await this.aiManager.loadModel(this.type);
  }

  _setupBaseEvents() {
    this._unsubs.push(
      eventBus.on(EVENTS.MODEL_DOWNLOAD_PROGRESS, (data) => {
        if (data.toolType !== this.type) return;
        this._setStatus(`
          <span>Downloading: ${Math.round(data.progress)}%</span>
          <div class="progress" style="width:100px">
            <div class="progress__fill" style="width:${Math.round(data.progress)}%"></div>
          </div>
        `);
      }),
      eventBus.on(EVENTS.MODEL_READY, (data) => {
        if (data.toolType !== this.type) return;
        this.modelLoaded = true;
        this._setStatus('Model ready');
        this.onModelReady();
      }),
      eventBus.on(EVENTS.INFERENCE_COMPLETE, (data) => {
        if (data.toolType !== this.type) return;
        this.onInferenceComplete(data.result);
      })
    );
  }

  _cleanupEvents() {
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
  }

  _setStatus(html) {
    this.workspace.setStatus(this.type, html);
  }

  // Override in subclasses
  onActivate(body) {}
  onDeactivate() {}
  onModelReady() {}
  onInferenceComplete(result) {}
}
