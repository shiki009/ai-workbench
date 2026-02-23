import * as THREE from 'three';
import { COLORS } from '../constants.js';

export class ProgressBar3D {
  constructor(radius = 0.15) {
    this.radius = radius;
    this.progress = 0;
    this.group = new THREE.Group();

    // Background ring
    const bgGeo = new THREE.TorusGeometry(radius, 0.008, 8, 64);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x222244,
      transparent: true,
      opacity: 0.5,
    });
    this._bgRing = new THREE.Mesh(bgGeo, bgMat);
    this.group.add(this._bgRing);

    // Progress arc
    this._arcMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.CYAN,
      transparent: true,
      opacity: 0.9,
    });
    this._updateArc(0);

    // Percentage text placeholder (will be set by parent)
    this.textValue = null;
  }

  setProgress(value) {
    this.progress = THREE.MathUtils.clamp(value, 0, 1);
    this._updateArc(this.progress);
  }

  _updateArc(progress) {
    // Remove old arc
    if (this._arcMesh) {
      this._arcMesh.geometry.dispose();
      this.group.remove(this._arcMesh);
    }

    if (progress <= 0) return;

    const angle = progress * Math.PI * 2;
    const geo = new THREE.TorusGeometry(this.radius, 0.012, 8, Math.max(3, Math.floor(64 * progress)), angle);
    this._arcMesh = new THREE.Mesh(geo, this._arcMaterial);
    this._arcMesh.rotation.z = Math.PI / 2; // Start from top
    this.group.add(this._arcMesh);
  }

  dispose() {
    this.group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  }
}
