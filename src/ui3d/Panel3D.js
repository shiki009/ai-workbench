import * as THREE from 'three';
import { PANEL, COLORS } from '../constants.js';

const glassmorphismShader = {
  uniforms: {
    uColor: { value: new THREE.Color(0x0a0e1e) },
    uOpacity: { value: 0.65 },
    uBorderColor: { value: new THREE.Color(COLORS.CYAN) },
    uFocused: { value: 0.0 },
    uTime: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform vec3 uBorderColor;
    uniform float uFocused;
    uniform float uTime;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      // Frosted glass noise
      float frost = noise(vUv * 20.0 + uTime * 0.1) * 0.08;

      // Base color with frost
      vec3 color = uColor + frost;

      // Border glow
      float borderDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
      float borderGlow = smoothstep(0.02, 0.0, borderDist) * (0.4 + uFocused * 0.6);
      color = mix(color, uBorderColor, borderGlow);

      // Focus highlight
      float focusGlow = uFocused * 0.05;
      color += uBorderColor * focusGlow;

      gl_FragColor = vec4(color, uOpacity + borderGlow * 0.3);
    }
  `,
};

export class Panel3D {
  constructor({ width = PANEL.DEFAULT_WIDTH, height = PANEL.DEFAULT_HEIGHT, title = 'Panel', color = 0x0a0e1e } = {}) {
    this.width = width;
    this.height = height;
    this.title = title;
    this.minimized = false;
    this.focused = false;
    this._originalHeight = height;

    this.group = new THREE.Group();
    this.group.userData.panel = this;

    // Background panel
    const bgGeo = new THREE.PlaneGeometry(width, height);
    this._bgMaterial = new THREE.ShaderMaterial({
      ...glassmorphismShader,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 0.65 },
        uBorderColor: { value: new THREE.Color(COLORS.CYAN) },
        uFocused: { value: 0.0 },
        uTime: { value: 0.0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this._bgMesh = new THREE.Mesh(bgGeo, this._bgMaterial);
    this._bgMesh.name = 'panel-bg';
    this._bgMesh.userData.isPanel = true;
    this._bgMesh.userData.panelRef = this;
    this.group.add(this._bgMesh);

    // Border frame (thin emissive lines)
    this._buildBorder(width, height);

    // Title bar
    this._buildTitleBar(width, height);

    // Content area (will hold CanvasTexture or sub-objects)
    this.contentGroup = new THREE.Group();
    this.contentGroup.position.z = 0.001;
    this.group.add(this.contentGroup);
  }

  _buildBorder(w, h) {
    const thickness = PANEL.BORDER_WIDTH;
    const mat = new THREE.MeshBasicMaterial({
      color: COLORS.CYAN,
      transparent: true,
      opacity: 0.5,
    });

    // Top
    const topGeo = new THREE.PlaneGeometry(w, thickness);
    const top = new THREE.Mesh(topGeo, mat);
    top.position.set(0, h / 2 - thickness / 2, 0.001);

    // Bottom
    const bottom = new THREE.Mesh(topGeo, mat);
    bottom.position.set(0, -h / 2 + thickness / 2, 0.001);

    // Left
    const sideGeo = new THREE.PlaneGeometry(thickness, h);
    const left = new THREE.Mesh(sideGeo, mat);
    left.position.set(-w / 2 + thickness / 2, 0, 0.001);

    // Right
    const right = new THREE.Mesh(sideGeo, mat);
    right.position.set(w / 2 - thickness / 2, 0, 0.001);

    this._borderGroup = new THREE.Group();
    this._borderGroup.add(top, bottom, left, right);
    this._borderGroup.name = 'panel-border';
    this.group.add(this._borderGroup);
    this._borderMaterial = mat;
  }

  _buildTitleBar(w, h) {
    const tbHeight = PANEL.TITLE_BAR_HEIGHT;
    const geo = new THREE.PlaneGeometry(w - PANEL.BORDER_WIDTH * 2, tbHeight);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x0d1225,
      transparent: true,
      opacity: 0.8,
    });
    this._titleBar = new THREE.Mesh(geo, mat);
    this._titleBar.position.set(0, h / 2 - tbHeight / 2 - PANEL.BORDER_WIDTH, 0.002);
    this._titleBar.name = 'panel-titlebar';
    this._titleBar.userData.isDraggable = true;
    this._titleBar.userData.panelRef = this;
    this.group.add(this._titleBar);
  }

  setFocused(val) {
    this.focused = val;
    this._bgMaterial.uniforms.uFocused.value = val ? 1.0 : 0.0;
    this._borderMaterial.opacity = val ? 0.8 : 0.5;
    this._borderMaterial.color.setHex(val ? COLORS.CYAN : COLORS.CYAN);
  }

  minimize() {
    if (this.minimized) return;
    this.minimized = true;
    this.group.scale.set(0.3, 0.05, 0.3);
  }

  restore() {
    if (!this.minimized) return;
    this.minimized = false;
    this.group.scale.set(1, 1, 1);
  }

  setContentTexture(texture) {
    // Remove existing content mesh if any
    const existing = this.contentGroup.getObjectByName('content-quad');
    if (existing) {
      existing.geometry.dispose();
      existing.material.dispose();
      this.contentGroup.remove(existing);
    }

    const contentH = this.height - PANEL.TITLE_BAR_HEIGHT - PANEL.BORDER_WIDTH * 3;
    const contentW = this.width - PANEL.BORDER_WIDTH * 4;
    const geo = new THREE.PlaneGeometry(contentW, contentH);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'content-quad';
    mesh.position.set(0, -PANEL.TITLE_BAR_HEIGHT / 2, 0.003);
    this.contentGroup.add(mesh);
  }

  update(delta) {
    this._bgMaterial.uniforms.uTime.value += delta;
  }

  dispose() {
    this.group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
  }
}
