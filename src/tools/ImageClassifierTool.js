import { BaseTool } from './BaseTool.js';

export class ImageClassifierTool extends BaseTool {
  constructor(opts) {
    super(opts);
    this._imageData = null;
    this._fileInput = null;
  }

  onActivate(body) {
    body.innerHTML = `
      <div class="flex-col gap-12">
        <div class="image-preview" id="ic-preview">
          <span class="image-preview__placeholder">Upload an image to classify</span>
        </div>
        <div class="flex gap-8">
          <button class="btn btn--primary btn--sm" id="ic-load">Load Model</button>
          <button class="btn btn--secondary btn--sm" id="ic-upload">Upload Image</button>
        </div>
        <div id="ic-results"></div>
      </div>
    `;

    this._fileInput = document.createElement('input');
    this._fileInput.type = 'file';
    this._fileInput.accept = 'image/*';
    this._fileInput.style.display = 'none';
    body.appendChild(this._fileInput);

    body.querySelector('#ic-load').addEventListener('click', () => this.loadModel());
    body.querySelector('#ic-upload').addEventListener('click', () => this._fileInput.click());
    this._fileInput.addEventListener('change', (e) => this._onFileSelected(e));
  }

  onDeactivate() {
    this._imageData = null;
    this._fileInput = null;
  }

  _onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const preview = this.body.querySelector('#ic-preview');
    preview.innerHTML = `<img src="${url}" alt="Uploaded image" />`;

    const reader = new FileReader();
    reader.onload = () => {
      this._imageData = reader.result;
      if (this.modelLoaded) {
        this._classify();
      } else {
        this._setStatus('Load the model first, then upload an image');
      }
    };
    reader.readAsDataURL(file);
  }

  _classify() {
    if (!this._imageData) return;
    this._setStatus('Classifying...');
    const worker = this.aiManager.getWorker(this.type);
    worker.postMessage({
      type: 'run-inference',
      data: { imageData: this._imageData },
    });
  }

  onModelReady() {
    if (this._imageData) this._classify();
  }

  onInferenceComplete(results) {
    this._setStatus('Classification complete');
    const container = this.body.querySelector('#ic-results');

    if (!Array.isArray(results)) {
      container.innerHTML = '<p style="color:var(--text-secondary)">No results</p>';
      return;
    }

    container.innerHTML = `
      <div class="results-list">
        ${results.map((r, i) => {
          const pct = (r.score * 100).toFixed(1);
          return `
            <div class="result-row">
              <span class="result-row__rank">${i + 1}.</span>
              <span class="result-row__label" title="${r.label}">${r.label}</span>
              <div class="result-row__bar">
                <div class="progress">
                  <div class="progress__fill" style="width:${pct}%"></div>
                </div>
              </div>
              <span class="result-row__score">${pct}%</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.storage.addHistory({ toolType: this.type, results });
  }
}
