import * as THREE from 'three';
import { COLORS } from '../constants.js';

export class SliderMesh {
  constructor({ width = 0.6, min = 0, max = 1, value = 0.5, label = '', onChange = null } = {}) {
    this.width = width;
    this.min = min;
    this.max = max;
    this.value = value;
    this.label = label;
    this.onChange = onChange;
    this.dragging = false;

    this.group = new THREE.Group();
    this.group.userData.slider = this;

    // Track
    const trackGeo = new THREE.PlaneGeometry(width, 0.01);
    const trackMat = new THREE.MeshBasicMaterial({ color: 0x333355, transparent: true, opacity: 0.6 });
    this._track = new THREE.Mesh(trackGeo, trackMat);
    this._track.name = 'slider-track';
    this._track.userData.isSlider = true;
    this._track.userData.sliderRef = this;
    this.group.add(this._track);

    // Fill
    const fillGeo = new THREE.PlaneGeometry(width * this._normalizedValue(), 0.01);
    const fillMat = new THREE.MeshBasicMaterial({ color: COLORS.CYAN, transparent: true, opacity: 0.8 });
    this._fill = new THREE.Mesh(fillGeo, fillMat);
    this._fill.position.z = 0.001;
    this._fill.position.x = -width / 2 + (width * this._normalizedValue()) / 2;
    this.group.add(this._fill);

    // Handle
    const handleGeo = new THREE.CircleGeometry(0.02, 16);
    const handleMat = new THREE.MeshBasicMaterial({ color: COLORS.CYAN });
    this._handle = new THREE.Mesh(handleGeo, handleMat);
    this._handle.position.z = 0.002;
    this._updateHandlePosition();
    this.group.add(this._handle);
  }

  _normalizedValue() {
    return (this.value - this.min) / (this.max - this.min);
  }

  _updateHandlePosition() {
    const norm = this._normalizedValue();
    this._handle.position.x = -this.width / 2 + norm * this.width;
    // Update fill
    this._fill.scale.x = Math.max(norm, 0.001);
    this._fill.position.x = -this.width / 2 + (norm * this.width) / 2;
  }

  setValueFromPointer(localX) {
    const norm = THREE.MathUtils.clamp((localX + this.width / 2) / this.width, 0, 1);
    this.value = this.min + norm * (this.max - this.min);
    this._updateHandlePosition();
    if (this.onChange) this.onChange(this.value);
  }

  dispose() {
    this.group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  }
}
