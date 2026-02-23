import { CapabilityDetector } from './CapabilityDetector.js';
import { ONBOARDING_STEPS } from './steps.js';

export class OnboardingOverlay {
  constructor(storage, toolShelf) {
    this.storage = storage;
    this.toolShelf = toolShelf;
    this.detector = new CapabilityDetector();
    this.currentStep = 0;
    this._overlay = null;
    this._capabilities = null;
  }

  check() {
    const seen = this.storage.getPref('onboarding-complete', false);
    if (!seen) {
      this.show();
    }
  }

  show() {
    this._overlay = document.createElement('div');
    this._overlay.id = 'onboarding-overlay';
    this._overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(5, 5, 15, 0.92);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; font-family: 'Segoe UI', system-ui, sans-serif;
    `;

    this._card = document.createElement('div');
    this._card.style.cssText = `
      background: rgba(15, 18, 35, 0.95);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      width: 90%;
      color: #e0e0e0;
      box-shadow: 0 0 40px rgba(0, 212, 255, 0.1);
    `;

    this._overlay.appendChild(this._card);
    document.body.appendChild(this._overlay);

    this._renderStep();
  }

  async _renderStep() {
    const step = ONBOARDING_STEPS[this.currentStep];
    if (!step) {
      this._complete();
      return;
    }

    let extraContent = '';

    if (step.action === 'detect-capabilities') {
      this._capabilities = await this.detector.detect();
      const summary = this.detector.getSummary();
      extraContent = `
        <div style="
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(0, 212, 255, 0.15);
          border-radius: 6px;
          padding: 12px;
          margin-top: 16px;
          font-family: monospace;
          font-size: 12px;
          line-height: 1.8;
          white-space: pre;
          color: #8899aa;
        ">${summary}</div>
      `;

      if (!this._capabilities.webGPU) {
        extraContent += `
          <div style="
            margin-top: 12px;
            padding: 10px;
            background: rgba(255, 100, 100, 0.1);
            border: 1px solid rgba(255, 100, 100, 0.3);
            border-radius: 6px;
            font-size: 13px;
            color: #ff8888;
          ">
            WebGPU not detected. Image generation will be unavailable.
            Classification and text generation will use WASM fallback.
          </div>
        `;
      }
    }

    // Progress dots
    const dots = ONBOARDING_STEPS.map((_, i) =>
      `<span style="
        display: inline-block;
        width: 8px; height: 8px;
        border-radius: 50%;
        margin: 0 4px;
        background: ${i === this.currentStep ? '#00d4ff' : 'rgba(255,255,255,0.2)'};
        transition: background 0.3s;
      "></span>`
    ).join('');

    this._card.innerHTML = `
      <div style="text-align: center; margin-bottom: 8px;">${dots}</div>
      <h2 style="
        color: #00d4ff;
        font-size: 22px;
        font-weight: 600;
        margin: 0 0 12px;
      ">${step.title}</h2>
      <p style="
        color: #b0b0c0;
        font-size: 15px;
        line-height: 1.6;
        margin: 0 0 8px;
      ">${step.description}</p>
      ${extraContent}
      <div style="
        display: flex;
        justify-content: space-between;
        margin-top: 28px;
      ">
        <button id="onboard-skip" style="
          background: none;
          border: 1px solid rgba(255,255,255,0.15);
          color: #888;
          padding: 10px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Skip</button>
        <button id="onboard-next" style="
          background: rgba(0, 212, 255, 0.15);
          border: 1px solid rgba(0, 212, 255, 0.4);
          color: #00d4ff;
          padding: 10px 32px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        ">${this.currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}</button>
      </div>
    `;

    this._card.querySelector('#onboard-next').addEventListener('click', () => {
      this.currentStep++;
      this._renderStep();
    });

    this._card.querySelector('#onboard-skip').addEventListener('click', () => {
      this._complete();
    });
  }

  _complete() {
    this.storage.setPref('onboarding-complete', true);
    if (this._capabilities) {
      this.storage.setPref('device-capabilities', this._capabilities);
    }
    if (this._overlay && this._overlay.parentNode) {
      this._overlay.style.opacity = '0';
      this._overlay.style.transition = 'opacity 0.4s';
      setTimeout(() => {
        this._overlay.parentNode.removeChild(this._overlay);
      }, 400);
    }
  }
}
