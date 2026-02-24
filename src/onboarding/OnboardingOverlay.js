import { CapabilityDetector } from './CapabilityDetector.js';
import { ONBOARDING_STEPS } from './steps.js';

export class OnboardingOverlay {
  constructor(storage) {
    this.storage = storage;
    this.detector = new CapabilityDetector();
    this.currentStep = 0;
    this._capabilities = null;

    this._overlay = document.getElementById('onboarding-overlay');
    this._title = document.getElementById('onboarding-title');
    this._body = document.getElementById('onboarding-body');
    this._nextBtn = document.getElementById('onboarding-next');
    this._skipBtn = document.getElementById('onboarding-skip');
    this._dots = document.getElementById('onboarding-dots');
  }

  check() {
    const seen = this.storage.getPref('onboarding-complete', false);
    if (!seen) {
      this.show();
    }
  }

  show() {
    this._overlay.style.display = '';
    this._nextBtn.addEventListener('click', () => {
      this.currentStep++;
      this._renderStep();
    });
    this._skipBtn.addEventListener('click', () => this._complete());
    this._renderStep();
  }

  async _renderStep() {
    const step = ONBOARDING_STEPS[this.currentStep];
    if (!step) {
      this._complete();
      return;
    }

    this._title.textContent = step.title;

    let bodyHtml = `<p>${step.description}</p>`;

    if (step.action === 'detect-capabilities') {
      this._capabilities = await this.detector.detect();
      const summary = this.detector.getSummary();
      bodyHtml += `<pre style="background:var(--bg);padding:12px;border-radius:var(--radius);font-size:12px;line-height:1.8;margin-top:12px;color:var(--text-secondary);overflow-x:auto">${summary}</pre>`;

      if (!this._capabilities.webGPU) {
        bodyHtml += `<p style="color:#ff8888;font-size:13px;margin-top:8px">WebGPU not detected. Image generation will be unavailable.</p>`;
      }
    }

    this._body.innerHTML = bodyHtml;

    // Dots
    this._dots.innerHTML = ONBOARDING_STEPS.map((_, i) =>
      `<span class="onboarding__dot${i === this.currentStep ? ' onboarding__dot--active' : ''}"></span>`
    ).join('');

    // Button label
    const isLast = this.currentStep === ONBOARDING_STEPS.length - 1;
    this._nextBtn.textContent = isLast ? 'Get Started' : 'Next';
  }

  _complete() {
    this.storage.setPref('onboarding-complete', true);
    if (this._capabilities) {
      this.storage.setPref('device-capabilities', this._capabilities);
    }
    this._overlay.style.opacity = '0';
    this._overlay.style.transition = 'opacity 400ms ease';
    setTimeout(() => {
      this._overlay.style.display = 'none';
      this._overlay.style.opacity = '';
      this._overlay.style.transition = '';
    }, 400);
  }
}
