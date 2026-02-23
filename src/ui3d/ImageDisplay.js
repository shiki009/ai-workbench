import * as THREE from 'three';

export class ImageDisplay {
  constructor(width = 1.0, height = 1.0) {
    this.width = width;
    this.height = height;

    const geo = new THREE.PlaneGeometry(width, height);
    this._material = new THREE.MeshBasicMaterial({
      color: 0x111128,
      transparent: true,
      opacity: 1.0,
    });
    this.mesh = new THREE.Mesh(geo, this._material);
    this.mesh.name = 'image-display';
  }

  setImage(imageSource) {
    if (this._material.map) this._material.map.dispose();

    if (imageSource instanceof HTMLImageElement || imageSource instanceof HTMLCanvasElement || imageSource instanceof ImageBitmap) {
      const tex = new THREE.Texture(imageSource);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      this._material.map = tex;
      this._material.color.setHex(0xffffff);
      this._material.needsUpdate = true;
    } else if (imageSource instanceof THREE.Texture) {
      this._material.map = imageSource;
      this._material.color.setHex(0xffffff);
      this._material.needsUpdate = true;
    }
  }

  setImageFromURL(url) {
    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        if (this._material.map) this._material.map.dispose();
        this._material.map = tex;
        this._material.color.setHex(0xffffff);
        this._material.needsUpdate = true;
        resolve(tex);
      });
    });
  }

  clear() {
    if (this._material.map) {
      this._material.map.dispose();
      this._material.map = null;
    }
    this._material.color.setHex(0x111128);
    this._material.needsUpdate = true;
  }

  dispose() {
    if (this._material.map) this._material.map.dispose();
    this._material.dispose();
    this.mesh.geometry.dispose();
  }
}
