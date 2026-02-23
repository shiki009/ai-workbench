import { DEVICE_TIER } from '../constants.js';

export class CapabilityDetector {
  constructor() {
    this.capabilities = {
      webGPU: false,
      opfs: false,
      sharedArrayBuffer: false,
      webWorkers: true,
      webGL2: false,
      deviceTier: DEVICE_TIER.LOW,
      storageQuota: 0,
      maxTextureSize: 0,
    };
  }

  async detect() {
    await Promise.all([
      this._checkWebGPU(),
      this._checkOPFS(),
      this._checkWebGL2(),
      this._checkStorage(),
    ]);

    this.capabilities.sharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    this._computeDeviceTier();

    return this.capabilities;
  }

  async _checkWebGPU() {
    if (!navigator.gpu) return;
    try {
      const adapter = await navigator.gpu.requestAdapter();
      this.capabilities.webGPU = !!adapter;
    } catch {
      this.capabilities.webGPU = false;
    }
  }

  async _checkOPFS() {
    try {
      await navigator.storage.getDirectory();
      this.capabilities.opfs = true;
    } catch {
      this.capabilities.opfs = false;
    }
  }

  async _checkWebGL2() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (gl) {
        this.capabilities.webGL2 = true;
        this.capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      }
    } catch {
      this.capabilities.webGL2 = false;
    }
  }

  async _checkStorage() {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        this.capabilities.storageQuota = est.quota || 0;
      } catch {
        // Ignore
      }
    }
  }

  _computeDeviceTier() {
    const c = this.capabilities;
    if (c.webGPU && c.storageQuota > 2e9 && c.maxTextureSize >= 8192) {
      c.deviceTier = DEVICE_TIER.HIGH;
    } else if (c.webGL2 && c.storageQuota > 500e6) {
      c.deviceTier = DEVICE_TIER.MEDIUM;
    } else {
      c.deviceTier = DEVICE_TIER.LOW;
    }
  }

  getSummary() {
    const c = this.capabilities;
    const lines = [
      `WebGPU: ${c.webGPU ? 'Available' : 'Not available'}`,
      `WebGL2: ${c.webGL2 ? 'Available' : 'Not available'}`,
      `OPFS: ${c.opfs ? 'Available' : 'Not available'}`,
      `SharedArrayBuffer: ${c.sharedArrayBuffer ? 'Available' : 'Not available'}`,
      `Storage: ${(c.storageQuota / 1e9).toFixed(1)} GB`,
      `Max Texture: ${c.maxTextureSize}px`,
      `Device Tier: ${c.deviceTier}`,
    ];
    return lines.join('\n');
  }
}
