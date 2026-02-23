import { eventBus } from '../events.js';

export class XRSessionManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.session = null;
    this.controllers = [];
    this.supported = false;
    this._checkSupport();
  }

  async _checkSupport() {
    if (navigator.xr) {
      this.supported = await navigator.xr.isSessionSupported('immersive-vr').catch(() => false);
    }
  }

  async enterVR() {
    if (!this.supported) return false;
    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'hand-tracking'],
      });
      this.session = session;
      this.sceneManager.renderer.xr.enabled = true;
      this.sceneManager.renderer.xr.setSession(session);
      session.addEventListener('end', () => {
        this.session = null;
        this.sceneManager.renderer.xr.enabled = false;
      });
      return true;
    } catch (e) {
      console.warn('WebXR session failed:', e);
      return false;
    }
  }
}
