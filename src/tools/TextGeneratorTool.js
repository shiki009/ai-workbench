import { BaseTool } from './BaseTool.js';
import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class TextGeneratorTool extends BaseTool {
  constructor(opts) {
    super(opts);
    this._outputText = '';
    this._maxTokens = 256;
    this._temperature = 0.7;
    this._streaming = false;
  }

  onActivate(body) {
    body.innerHTML = `
      <div class="flex-col gap-12">
        <div>
          <label class="label">Prompt</label>
          <textarea class="textarea" id="tg-prompt" placeholder="Enter your prompt here..." rows="3"></textarea>
        </div>
        <div class="flex gap-8">
          <div class="slider-group" style="flex:1">
            <label class="label">Temperature: <span id="tg-temp-val">0.7</span></label>
            <input type="range" id="tg-temp" min="0.1" max="2.0" step="0.1" value="0.7" />
          </div>
          <div class="slider-group" style="flex:1">
            <label class="label">Max tokens: <span id="tg-tokens-val">256</span></label>
            <input type="range" id="tg-tokens" min="32" max="512" step="32" value="256" />
          </div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn--primary btn--sm" id="tg-load">Load Model</button>
          <button class="btn btn--secondary btn--sm" id="tg-generate" disabled>Generate</button>
        </div>
        <div>
          <label class="label">Output</label>
          <div class="text-output" id="tg-output">Generated text will appear here...</div>
        </div>
      </div>
    `;

    const tempSlider = body.querySelector('#tg-temp');
    const tempVal = body.querySelector('#tg-temp-val');
    tempSlider.addEventListener('input', () => {
      this._temperature = parseFloat(tempSlider.value);
      tempVal.textContent = this._temperature.toFixed(1);
    });

    const tokensSlider = body.querySelector('#tg-tokens');
    const tokensVal = body.querySelector('#tg-tokens-val');
    tokensSlider.addEventListener('input', () => {
      this._maxTokens = parseInt(tokensSlider.value, 10);
      tokensVal.textContent = this._maxTokens;
    });

    body.querySelector('#tg-load').addEventListener('click', () => this.loadModel());
    body.querySelector('#tg-generate').addEventListener('click', () => this._generate());

    this._unsubs.push(
      eventBus.on(EVENTS.INFERENCE_PROGRESS, (data) => {
        if (data.toolType !== this.type) return;
        this._outputText = data.fullText;
        this._renderOutput(true);
      })
    );
  }

  onDeactivate() {
    this._outputText = '';
    this._streaming = false;
  }

  onModelReady() {
    const genBtn = this.body.querySelector('#tg-generate');
    if (genBtn) genBtn.disabled = false;
  }

  _generate() {
    const prompt = this.body.querySelector('#tg-prompt')?.value?.trim();
    if (!prompt) {
      this._setStatus('Enter a prompt first');
      return;
    }
    if (!this.modelLoaded) {
      this._setStatus('Load the model first');
      return;
    }

    this._outputText = '';
    this._streaming = true;
    this._renderOutput(true);
    this._setStatus('Generating...');

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

  onInferenceComplete(result) {
    this._outputText = typeof result === 'string' ? result : (result?.text || JSON.stringify(result));
    this._streaming = false;
    this._renderOutput(false);
    this._setStatus('Generation complete');

    this.storage.addHistory({
      toolType: this.type,
      prompt: this.body.querySelector('#tg-prompt')?.value,
      result: this._outputText,
    });
  }

  _renderOutput(streaming) {
    const el = this.body.querySelector('#tg-output');
    if (!el) return;
    el.className = streaming ? 'text-output text-output--streaming' : 'text-output';
    const cursor = streaming ? '<span class="text-output__cursor"></span>' : '';
    el.innerHTML = this._escapeHtml(this._outputText || '...') + cursor;
    el.scrollTop = el.scrollHeight;
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
