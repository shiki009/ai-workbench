import * as THREE from 'three';
import { COLORS } from '../constants.js';

export class ButtonMesh {
  constructor({ width = 0.3, height = 0.08, label = 'Button', color = COLORS.CYAN, onClick = null } = {}) {
    this.width = width;
    this.height = height;
    this.onClick = onClick;
    this.hovered = false;

    this.group = new THREE.Group();
    this.group.userData.button = this;

    // Background
    const geo = new THREE.PlaneGeometry(width, height);
    this._material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
    });
    this._mesh = new THREE.Mesh(geo, this._material);
    this._mesh.name = 'button-bg';
    this._mesh.userData.isButton = true;
    this._mesh.userData.buttonRef = this;
    this.group.add(this._mesh);

    // Border
    const borderGeo = new THREE.EdgesGeometry(geo);
    const borderMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    const border = new THREE.LineSegments(borderGeo, borderMat);
    border.position.z = 0.001;
    this.group.add(border);

    this._baseColor = color;
    this._baseOpacity = 0.3;
  }

  setHover(val) {
    this.hovered = val;
    this._material.opacity = val ? 0.6 : this._baseOpacity;
  }

  trigger() {
    if (this.onClick) this.onClick();
    // Flash effect
    this._material.opacity = 0.9;
    setTimeout(() => {
      this._material.opacity = this.hovered ? 0.6 : this._baseOpacity;
    }, 100);
  }

  dispose() {
    this.group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  }
}
