import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { updateTweens } from '../utils/animate.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.updateCallbacks = [];

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.04);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.05,
      100
    );
    this.camera.position.set(0, 1.6, 3);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(this.renderer.domElement);

    // Post-processing composer — set up later by PostProcessing module
    this.composer = null;

    window.addEventListener('resize', () => this._onResize());
  }

  setComposer(composer) {
    this.composer = composer;
  }

  onUpdate(fn) {
    this.updateCallbacks.push(fn);
    return () => {
      const idx = this.updateCallbacks.indexOf(fn);
      if (idx !== -1) this.updateCallbacks.splice(idx, 1);
    };
  }

  start() {
    this.renderer.setAnimationLoop((time) => this._loop(time));
  }

  _loop(time) {
    const delta = this.clock.getDelta();
    updateTweens();
    for (const cb of this.updateCallbacks) {
      cb(delta, time);
    }
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    if (this.composer) {
      this.composer.setSize(w, h);
    }
  }

  get domElement() {
    return this.renderer.domElement;
  }
}
