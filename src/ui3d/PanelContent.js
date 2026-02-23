import * as THREE from 'three';

export class PanelContent {
  constructor(width = 512, height = 384) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    return this;
  }

  fillBackground(color = 'rgba(10, 14, 30, 0.01)') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    return this;
  }

  drawText(text, x, y, { color = '#e0e0e0', font = '14px Segoe UI, system-ui, sans-serif', maxWidth = null } = {}) {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    if (maxWidth) {
      this._wrapText(text, x, y, maxWidth, 18);
    } else {
      this.ctx.fillText(text, x, y);
    }
    return this;
  }

  drawImage(img, x, y, w, h) {
    this.ctx.drawImage(img, x, y, w, h);
    return this;
  }

  drawRect(x, y, w, h, { fill = null, stroke = null, lineWidth = 1, radius = 0 } = {}) {
    this.ctx.beginPath();
    if (radius > 0) {
      this.ctx.roundRect(x, y, w, h, radius);
    } else {
      this.ctx.rect(x, y, w, h);
    }
    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }
    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
    return this;
  }

  drawProgressBar(x, y, w, h, progress, { bgColor = 'rgba(255,255,255,0.1)', fillColor = '#00d4ff' } = {}) {
    this.drawRect(x, y, w, h, { fill: bgColor, radius: h / 2 });
    if (progress > 0) {
      this.drawRect(x, y, w * Math.min(progress, 1), h, { fill: fillColor, radius: h / 2 });
    }
    return this;
  }

  _wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        this.ctx.fillText(line.trim(), x, y);
        line = word + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line.trim(), x, y);
  }

  update() {
    this.texture.needsUpdate = true;
    return this;
  }

  dispose() {
    this.texture.dispose();
  }
}
