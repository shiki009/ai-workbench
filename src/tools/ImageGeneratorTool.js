import { BaseTool } from './BaseTool.js';
import { PanelContent } from '../ui3d/PanelContent.js';
import { ImageDisplay } from '../ui3d/ImageDisplay.js';
import { ProgressBar3D } from '../ui3d/ProgressBar3D.js';
import { ButtonMesh } from '../ui3d/ButtonMesh.js';
import { SliderMesh } from '../ui3d/SliderMesh.js';
import { TextRenderer } from '../ui3d/TextRenderer.js';
import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class ImageGeneratorTool extends BaseTool {
  constructor(opts) {
    super(opts);
    this.panelWidth = 2.4;
    this.panelHeight = 2.4;
    this._steps = 20;
    this._guidanceScale = 7.5;
    this._unsubs = [];
    this._htmlOverlay = null;
  }

  onActivate() {
    // Progress bar
    this._progressBar = new ProgressBar3D(0.15);
    this._progressBar.group.position.set(0, 0.1, 0.01);
    this._progressBar.group.visible = false;
    this.panel.contentGroup.add(this._progressBar.group);

    // Image display
    this._imageDisplay = new ImageDisplay(1.4, 1.0);
    this._imageDisplay.mesh.position.set(0, -0.1, 0.01);
    this.panel.contentGroup.add(this._imageDisplay.mesh);

    // Status text
    this._statusText = TextRenderer.create({
      text: 'Requires WebGPU. Click "Load Model" to start.',
      fontSize: 0.04,
      color: '#9b9bbb',
      anchorX: 'center',
      anchorY: 'middle',
    });
    this._statusText.position.set(0, 0.6, 0.01);
    this.panel.contentGroup.add(this._statusText);

    // Load button
    const loadBtn = new ButtonMesh({
      width: 0.5,
      height: 0.08,
      label: 'Load Model',
      color: 0xff6b9d,
      onClick: () => this.loadModel(),
    });
    loadBtn.group.position.set(-0.5, -0.95, 0.01);
    this.panel.contentGroup.add(loadBtn.group);

    // Generate button
    const genBtn = new ButtonMesh({
      width: 0.5,
      height: 0.08,
      label: 'Generate',
      color: 0x00d4ff,
      onClick: () => this._generate(),
    });
    genBtn.group.position.set(0.5, -0.95, 0.01);
    this.panel.contentGroup.add(genBtn.group);

    // Steps slider
    const stepsSlider = new SliderMesh({
      width: 0.45,
      min: 5,
      max: 50,
      value: this._steps,
      label: 'Steps',
      onChange: (v) => { this._steps = Math.round(v); },
    });
    stepsSlider.group.position.set(-0.55, -1.1, 0.01);
    this.panel.contentGroup.add(stepsSlider.group);

    // Guidance slider
    const guidanceSlider = new SliderMesh({
      width: 0.45,
      min: 1,
      max: 20,
      value: this._guidanceScale,
      label: 'Guidance',
      onChange: (v) => { this._guidanceScale = v; },
    });
    guidanceSlider.group.position.set(0.55, -1.1, 0.01);
    this.panel.contentGroup.add(guidanceSlider.group);

    // HTML overlay for prompt
    this._createHTMLOverlay();

    // Events
    this._unsubs.push(
      eventBus.on(EVENTS.MODEL_DOWNLOAD_PROGRESS, (data) => {
        if (data.toolType !== this.type) return;
        this._progressBar.group.visible = true;
        this._progressBar.setProgress(data.progress / 100);
        this._statusText.text = `Downloading model: ${Math.round(data.progress)}%`;
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
        this._progressBar.group.visible = true;
        this._progressBar.setProgress(data.progress);
        this._statusText.text = `Generating: Step ${data.step}/${data.totalSteps}`;
        this._statusText.sync();
      }),
      eventBus.on(EVENTS.INFERENCE_COMPLETE, (data) => {
        if (data.toolType !== this.type) return;
        this._progressBar.group.visible = false;
        this._statusText.text = 'Generation complete!';
        this._statusText.sync();
        this._displayResult(data.result);
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

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Describe the image you want to generate...';
    input.style.width = '100%';
    this._promptInput = input;

    this._htmlOverlay.appendChild(input);
    document.getElementById('overlay').appendChild(this._htmlOverlay);
  }

  async _generate() {
    const prompt = this._promptInput?.value?.trim();
    if (!prompt) {
      this._statusText.text = 'Please enter a prompt.';
      this._statusText.sync();
      return;
    }
    if (!this.modelLoaded) {
      this._statusText.text = 'Load the model first!';
      this._statusText.sync();
      return;
    }

    this._statusText.text = 'Starting generation...';
    this._statusText.sync();

    const worker = this.aiManager.getWorker(this.type);
    worker.postMessage({
      type: 'run-inference',
      data: {
        prompt,
        steps: this._steps,
        guidanceScale: this._guidanceScale,
      },
    });
  }

  async _displayResult(imageData) {
    try {
      if (imageData instanceof ImageData) {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        canvas.getContext('2d').putImageData(imageData, 0, 0);
        this._imageDisplay.setImage(canvas);

        // Save to storage
        canvas.toBlob(async (blob) => {
          const id = `img-gen-${Date.now()}`;
          await this.storage.saveImage(id, blob);
        });
      } else if (imageData instanceof Blob) {
        const bitmap = await createImageBitmap(imageData);
        this._imageDisplay.setImage(bitmap);
      }
    } catch (e) {
      this._statusText.text = 'Error displaying result.';
      this._statusText.sync();
    }
  }
}
