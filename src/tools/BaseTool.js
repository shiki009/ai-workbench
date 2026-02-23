import { Panel3D } from '../ui3d/Panel3D.js';
import { TextRenderer } from '../ui3d/TextRenderer.js';
import { PanelContent } from '../ui3d/PanelContent.js';
import { PANEL } from '../constants.js';

export class BaseTool {
  constructor({ type, label, panelManager, aiManager, storage }) {
    this.type = type;
    this.label = label;
    this.panelManager = panelManager;
    this.aiManager = aiManager;
    this.storage = storage;
    this.panel = null;
    this.active = false;
    this.modelLoaded = false;
  }

  activate() {
    if (this.active) return;
    this.active = true;
    this.panel = this.panelManager.spawnPanel({
      width: this.panelWidth || PANEL.DEFAULT_WIDTH,
      height: this.panelHeight || PANEL.DEFAULT_HEIGHT,
      title: this.label,
    });
    this.panel._toolRef = this;
    this.onActivate();
  }

  deactivate() {
    if (!this.active) return;
    this.active = false;
    this.aiManager.terminateWorker(this.type);
    if (this.panel) {
      this.panelManager.removePanel(this.panel);
      this.panel = null;
    }
    this.onDeactivate();
  }

  async loadModel() {
    if (this.modelLoaded) return;
    await this.aiManager.loadModel(this.type);
  }

  // Override in subclasses
  onActivate() {}
  onDeactivate() {}
  onModelReady() { this.modelLoaded = true; }
  onInferenceComplete(result) {}
}
