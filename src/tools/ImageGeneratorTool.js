import { BaseTool } from './BaseTool.js';
import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class ImageGeneratorTool extends BaseTool {
  constructor(opts) {
    super(opts);
    this._steps = 20;
    this._guidanceScale = 7.5;
  }

  onActivate(body) {
    body.innerHTML = `
      <div class="flex-col gap-12">
        <div>
          <label class="label">Prompt</label>
          <input class="input" id="ig-prompt" type="text" placeholder="Describe the image you want to generate..." />
        </div>
        <div class="flex gap-8">
          <div class="slider-group" style="flex:1">
            <label class="label">Steps: <span id="ig-steps-val">20</span></label>
            <input type="range" id="ig-steps" min="5" max="50" step="1" value="20" />
          </div>
          <div class="slider-group" style="flex:1">
            <label class="label">Guidance: <span id="ig-guide-val">7.5</span></label>
            <input type="range" id="ig-guide" min="1" max="20" step="0.5" value="7.5" />
          </div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn--primary btn--sm" id="ig-load">Load Model</button>
          <button class="btn btn--secondary btn--sm" id="ig-generate" disabled>Generate</button>
        </div>
        <div class="image-preview" id="ig-preview">
          <span class="image-preview__placeholder">Generated image will appear here<br/><small>Requires WebGPU</small></span>
        </div>
        <div class="progress" id="ig-progress" style="display:none">
          <div class="progress__fill" id="ig-progress-fill" style="width:0%"></div>
        </div>
      </div>
    `;

    const stepsSlider = body.querySelector('#ig-steps');
    const stepsVal = body.querySelector('#ig-steps-val');
    stepsSlider.addEventListener('input', () => {
      this._steps = parseInt(stepsSlider.value, 10);
      stepsVal.textContent = this._steps;
    });

    const guideSlider = body.querySelector('#ig-guide');
    const guideVal = body.querySelector('#ig-guide-val');
    guideSlider.addEventListener('input', () => {
      this._guidanceScale = parseFloat(guideSlider.value);
      guideVal.textContent = this._guidanceScale.toFixed(1);
    });

    body.querySelector('#ig-load').addEventListener('click', () => this.loadModel());
    body.querySelector('#ig-generate').addEventListener('click', () => this._generate());

    this._unsubs.push(
      eventBus.on(EVENTS.INFERENCE_PROGRESS, (data) => {
        if (data.toolType !== this.type) return;
        const progress = this.body.querySelector('#ig-progress');
        const fill = this.body.querySelector('#ig-progress-fill');
        if (progress && fill) {
          progress.style.display = '';
          fill.style.width = `${Math.round((data.progress || 0) * 100)}%`;
        }
        this._setStatus(`Step ${data.step || '?'}/${data.totalSteps || this._steps}`);
      })
    );
  }

  onDeactivate() {}

  onModelReady() {
    const genBtn = this.body.querySelector('#ig-generate');
    if (genBtn) genBtn.disabled = false;
  }

  _generate() {
    const prompt = this.body.querySelector('#ig-prompt')?.value?.trim();
    if (!prompt) {
      this._setStatus('Enter a prompt first');
      return;
    }
    if (!this.modelLoaded) {
      this._setStatus('Load the model first');
      return;
    }

    this._setStatus('Starting generation...');
    const progress = this.body.querySelector('#ig-progress');
    if (progress) progress.style.display = '';

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

  onInferenceComplete(result) {
    const progress = this.body.querySelector('#ig-progress');
    if (progress) progress.style.display = 'none';
    this._setStatus('Generation complete');
    this._displayResult(result);
  }

  async _displayResult(imageData) {
    const preview = this.body.querySelector('#ig-preview');
    if (!preview) return;

    try {
      if (imageData instanceof ImageData) {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        canvas.getContext('2d').putImageData(imageData, 0, 0);
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.alt = 'Generated image';
        preview.appendChild(img);

        canvas.toBlob(async (blob) => {
          if (blob) {
            await this.storage.saveImage(`img-gen-${Date.now()}`, blob);
          }
        });
      } else if (imageData instanceof Blob) {
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(imageData);
        img.alt = 'Generated image';
        preview.appendChild(img);
      }
    } catch {
      this._setStatus('Error displaying result');
    }
  }
}
