import { BaseTool } from './BaseTool.js';
import { PanelContent } from '../ui3d/PanelContent.js';
import { ProgressBar3D } from '../ui3d/ProgressBar3D.js';
import { ButtonMesh } from '../ui3d/ButtonMesh.js';
import { SliderMesh } from '../ui3d/SliderMesh.js';
import { TextRenderer } from '../ui3d/TextRenderer.js';
import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class TextGeneratorTool extends BaseTool {
  constructor(opts) {
    super(opts);
    this.panelWidth = 2.4;
    this.panelHeight = 2.2;
    this._outputText = '';
    this._contentCanvas = null;
    this._maxTokens = 256;
    this._temperature = 0.7;
    this._unsubs = [];
    this._htmlOverlay = null;
  }

  onActivate() {
    // Progress bar
    this._progressBar = new ProgressBar3D(0.12);
    this._progressBar.group.position.set(0, 0.3, 0.01);
    this._progressBar.group.visible = false;
    this.panel.contentGroup.add(this._progressBar.group);

    // Content canvas for output
    this._contentCanvas = new PanelContent(512, 400);
    this._drawInitialContent();
    this.panel.setContentTexture(this._contentCanvas.texture);

    // Status text
    this._statusText = TextRenderer.create({
      text: 'Click "Load Model" to start',
      fontSize: 0.04,
      color: '#9b9bbb',
      anchorX: 'center',
      anchorY: 'middle',
    });
    this._statusText.position.set(0, 0.55, 0.01);
    this.panel.contentGroup.add(this._statusText);

    // Load button
    const loadBtn = new ButtonMesh({
      width: 0.5,
      height: 0.08,
      label: 'Load Model',
      color: 0x9b59ff,
      onClick: () => this.loadModel(),
    });
    loadBtn.group.position.set(-0.5, -0.85, 0.01);
    this.panel.contentGroup.add(loadBtn.group);

    // Generate button
    const genBtn = new ButtonMesh({
      width: 0.5,
      height: 0.08,
      label: 'Generate',
      color: 0x00d4ff,
      onClick: () => this._generate(),
    });
    genBtn.group.position.set(0.5, -0.85, 0.01);
    this.panel.contentGroup.add(genBtn.group);

    // Temperature slider
    const tempSlider = new SliderMesh({
      width: 0.5,
      min: 0.1,
      max: 2.0,
      value: this._temperature,
      label: 'Temperature',
      onChange: (v) => { this._temperature = v; },
    });
    tempSlider.group.position.set(0.5, -0.95, 0.01);
    this.panel.contentGroup.add(tempSlider.group);

    const tempLabel = TextRenderer.create({
      text: 'Temperature',
      fontSize: 0.03,
      color: '#9b9bbb',
      anchorX: 'center',
      anchorY: 'middle',
    });
    tempLabel.position.set(0.5, -0.9, 0.01);
    this.panel.contentGroup.add(tempLabel);

    // HTML text input overlay
    this._createHTMLOverlay();

    // Events
    this._unsubs.push(
      eventBus.on(EVENTS.MODEL_DOWNLOAD_PROGRESS, (data) => {
        if (data.toolType !== this.type) return;
        this._progressBar.group.visible = true;
        this._progressBar.setProgress(data.progress / 100);
        this._statusText.text = `Downloading: ${Math.round(data.progress)}%`;
        this._statusText.sync();
      }),
      eventBus.on(EVENTS.MODEL_READY, (data) => {
        if (data.toolType !== this.type) return;
        this._progressBar.group.visible = false;
        this._statusText.text = 'Model ready! Enter a prompt.';
        this._statusText.sync();
      }),
      eventBus.on(EVENTS.INFERENCE_PROGRESS, (data) => {
        if (data.toolType !== this.type) return;
        this._outputText = data.fullText;
        this._drawOutput();
      }),
      eventBus.on(EVENTS.INFERENCE_COMPLETE, (data) => {
        if (data.toolType !== this.type) return;
        this._outputText = data.result;
        this._drawOutput();
        this._statusText.text = 'Generation complete!';
        this._statusText.sync();
      })
    );
  }

  onDeactivate() {
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
    if (this._htmlOverlay && this._htmlOverlay.parentNode) {
      this._htmlOverlay.parentNode.removeChild(this._htmlOverlay);
    }
  }

  _createHTMLOverlay() {
    this._htmlOverlay = document.createElement('div');
    this._htmlOverlay.className = 'html-input-overlay';
    this._htmlOverlay.style.cssText = 'bottom: 80px; left: 50%; transform: translateX(-50%); width: 400px;';

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Enter your prompt here...';
    textarea.rows = 3;
    textarea.style.width = '100%';
    this._textarea = textarea;

    this._htmlOverlay.appendChild(textarea);
    document.getElementById('overlay').appendChild(this._htmlOverlay);
  }

  async _generate() {
    const prompt = this._textarea?.value?.trim();
    if (!prompt) {
      this._statusText.text = 'Please enter a prompt first.';
      this._statusText.sync();
      return;
    }
    if (!this.modelLoaded) {
      this._statusText.text = 'Load the model first!';
      this._statusText.sync();
      return;
    }

    this._statusText.text = 'Generating...';
    this._statusText.sync();
    this._outputText = '';

    const worker = this.aiManager.getWorker(this.type);
    worker.postMessage({
      type: 'run-inference',
      data: {
        prompt,
        maxTokens: this._maxTokens,
        temperature: this._temperature,
      },
    });
  }

  _drawOutput() {
    this._contentCanvas
      .clear()
      .fillBackground()
      .drawText('Output:', 10, 20, {
        color: '#9b59ff',
        font: 'bold 14px Segoe UI, system-ui, sans-serif',
      })
      .drawText(this._outputText || '...', 10, 45, {
        color: '#e0e0e0',
        font: '13px Segoe UI, system-ui, sans-serif',
        maxWidth: 490,
      })
      .update();
  }

  _drawInitialContent() {
    this._contentCanvas
      .clear()
      .fillBackground()
      .drawText('Text Generation', 10, 25, {
        color: '#9b59ff',
        font: 'bold 16px Segoe UI, system-ui, sans-serif',
      })
      .drawText('Generate text using SmolLM2-360M running locally in your browser.', 10, 55, {
        color: '#9b9bbb',
        font: '13px Segoe UI, system-ui, sans-serif',
        maxWidth: 490,
      })
      .update();
  }

  onInferenceComplete(data) {
    this.storage.addHistory({
      toolType: this.type,
      prompt: this._textarea?.value,
      result: data.result,
    });
  }
}
