import { BaseTool } from './BaseTool.js';
import { PanelContent } from '../ui3d/PanelContent.js';
import { ImageDisplay } from '../ui3d/ImageDisplay.js';
import { ProgressBar3D } from '../ui3d/ProgressBar3D.js';
import { ButtonMesh } from '../ui3d/ButtonMesh.js';
import { TextRenderer } from '../ui3d/TextRenderer.js';
import { eventBus } from '../events.js';
import { EVENTS, TOOL_TYPES } from '../constants.js';

export class ImageClassifierTool extends BaseTool {
  constructor(opts) {
    super(opts);
    this.panelWidth = 2.2;
    this.panelHeight = 2.0;
    this._results = [];
    this._imageData = null;
    this._progressBar = null;
    this._contentCanvas = null;
    this._fileInput = null;
    this._unsubs = [];
  }

  onActivate() {
    // Progress bar
    this._progressBar = new ProgressBar3D(0.12);
    this._progressBar.group.position.set(0, 0.2, 0.01);
    this._progressBar.group.visible = false;
    this.panel.contentGroup.add(this._progressBar.group);

    // Image display area
    this._imageDisplay = new ImageDisplay(0.8, 0.6);
    this._imageDisplay.mesh.position.set(-0.4, -0.1, 0.01);
    this.panel.contentGroup.add(this._imageDisplay.mesh);

    // Content canvas for results
    this._contentCanvas = new PanelContent(400, 300);
    this._drawInitialContent();
    this.panel.setContentTexture(this._contentCanvas.texture);

    // Load button
    const loadBtn = new ButtonMesh({
      width: 0.5,
      height: 0.08,
      label: 'Load Model',
      color: 0x00d4ff,
      onClick: () => this.loadModel(),
    });
    loadBtn.group.position.set(0, -0.7, 0.01);
    this.panel.contentGroup.add(loadBtn.group);

    // Upload button
    const uploadBtn = new ButtonMesh({
      width: 0.5,
      height: 0.08,
      label: 'Upload Image',
      color: 0x9b59ff,
      onClick: () => this._triggerFileUpload(),
    });
    uploadBtn.group.position.set(0, -0.85, 0.01);
    this.panel.contentGroup.add(uploadBtn.group);

    // Status text
    this._statusText = TextRenderer.create({
      text: 'Click "Load Model" to start',
      fontSize: 0.04,
      color: '#9b9bbb',
      anchorX: 'center',
      anchorY: 'middle',
    });
    this._statusText.position.set(0, 0.5, 0.01);
    this.panel.contentGroup.add(this._statusText);

    // Listen for events
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
        this._statusText.text = 'Model ready! Upload an image.';
        this._statusText.sync();
      }),
      eventBus.on(EVENTS.INFERENCE_COMPLETE, (data) => {
        if (data.toolType !== this.type) return;
        this._showResults(data.result);
      })
    );

    // Create hidden file input
    this._createFileInput();
  }

  onDeactivate() {
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
    if (this._fileInput && this._fileInput.parentNode) {
      this._fileInput.parentNode.removeChild(this._fileInput);
    }
  }

  _createFileInput() {
    this._fileInput = document.createElement('input');
    this._fileInput.type = 'file';
    this._fileInput.accept = 'image/*';
    this._fileInput.style.display = 'none';
    document.body.appendChild(this._fileInput);
    this._fileInput.addEventListener('change', (e) => this._onFileSelected(e));
  }

  _triggerFileUpload() {
    if (this._fileInput) this._fileInput.click();
  }

  async _onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Display image
    const url = URL.createObjectURL(file);
    await this._imageDisplay.setImageFromURL(url);

    // Convert to data URL for worker
    const reader = new FileReader();
    reader.onload = async () => {
      this._imageData = reader.result;
      this._statusText.text = 'Image loaded. Running classification...';
      this._statusText.sync();

      if (this.modelLoaded) {
        this._classify();
      } else {
        this._statusText.text = 'Load the model first, then try again.';
        this._statusText.sync();
      }
    };
    reader.readAsDataURL(file);
    URL.revokeObjectURL(url);
  }

  async _classify() {
    if (!this._imageData) return;
    this._progressBar.group.visible = true;
    this._progressBar.setProgress(0.5);

    const worker = this.aiManager.getWorker(this.type);
    worker.postMessage({
      type: 'run-inference',
      data: { imageData: this._imageData },
    });
  }

  onModelReady() {
    super.onModelReady();
    if (this._imageData) {
      this._classify();
    }
  }

  _showResults(results) {
    this._results = results;
    this._progressBar.group.visible = false;
    this._statusText.text = 'Classification Results:';
    this._statusText.sync();

    // Draw results on canvas
    this._contentCanvas.clear().fillBackground();
    this._contentCanvas.drawText('Top 5 Predictions:', 10, 20, {
      color: '#00d4ff',
      font: 'bold 16px Segoe UI, system-ui, sans-serif',
    });

    if (Array.isArray(results)) {
      results.forEach((r, i) => {
        const score = (r.score * 100).toFixed(1);
        this._contentCanvas.drawText(
          `${i + 1}. ${r.label}`,
          10,
          50 + i * 45,
          { color: '#e0e0e0', font: '14px Segoe UI, system-ui, sans-serif' }
        );
        this._contentCanvas.drawProgressBar(10, 68 + i * 45, 380, 12, r.score, {
          fillColor: i === 0 ? '#00d4ff' : '#9b59ff',
        });
        this._contentCanvas.drawText(`${score}%`, 350, 50 + i * 45, {
          color: '#00d4ff',
          font: '14px Segoe UI, system-ui, sans-serif',
        });
      });
    }

    this._contentCanvas.update();

    // Save to history
    this.storage.addHistory({
      toolType: this.type,
      results,
      imageData: this._imageData?.substring(0, 100),
    });
  }

  _drawInitialContent() {
    this._contentCanvas
      .clear()
      .fillBackground()
      .drawText('Image Classification', 10, 25, {
        color: '#00d4ff',
        font: 'bold 16px Segoe UI, system-ui, sans-serif',
      })
      .drawText('Upload an image to classify it using MobileViT.', 10, 55, {
        color: '#9b9bbb',
        font: '13px Segoe UI, system-ui, sans-serif',
        maxWidth: 380,
      })
      .drawRect(10, 80, 380, 200, {
        stroke: 'rgba(0, 212, 255, 0.2)',
        lineWidth: 1,
        radius: 4,
      })
      .drawText('Drop or upload an image here', 100, 185, {
        color: 'rgba(255,255,255,0.3)',
        font: '14px Segoe UI, system-ui, sans-serif',
      })
      .update();
  }
}
