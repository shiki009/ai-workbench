import * as THREE from 'three';
import { TextRenderer } from './TextRenderer.js';
import { ROOM, COLORS, TOOL_TYPES } from '../constants.js';
import { tween, easeOutCubic } from '../utils/animate.js';

export class ToolShelf {
  constructor(sceneManager, toolRegistry, raycaster, cameraController) {
    this.sceneManager = sceneManager;
    this.toolRegistry = toolRegistry;
    this.raycaster = raycaster;
    this.cameraController = cameraController;
    this.visible = false;
    this.icons = [];

    this._build();
    this._setupKeyboard();
  }

  _build() {
    this.group = new THREE.Group();
    this.group.name = 'tool-shelf';
    this.group.position.set(0, 2.0, -ROOM.DEPTH / 2 + 0.15);
    this.group.visible = false;

    // Shelf backdrop
    const backdropGeo = new THREE.PlaneGeometry(4, 2);
    const backdropMat = new THREE.MeshBasicMaterial({
      color: 0x0a0e1e,
      transparent: true,
      opacity: 0.85,
    });
    const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
    this.group.add(backdrop);

    // Border glow
    const borderGeo = new THREE.EdgesGeometry(backdropGeo);
    const borderMat = new THREE.LineBasicMaterial({ color: COLORS.CYAN, transparent: true, opacity: 0.4 });
    const border = new THREE.LineSegments(borderGeo, borderMat);
    border.position.z = 0.001;
    this.group.add(border);

    // Title
    const title = TextRenderer.create({
      text: 'AI TOOL SHELF',
      fontSize: 0.08,
      color: '#00d4ff',
      anchorX: 'center',
      anchorY: 'middle',
    });
    title.position.set(0, 0.75, 0.01);
    this.group.add(title);

    // Tool icons
    const tools = this.toolRegistry.getAll();
    const spacing = 1.2;
    const startX = -((tools.length - 1) * spacing) / 2;

    tools.forEach((tool, i) => {
      const icon = this._createToolIcon(tool, startX + i * spacing);
      this.icons.push(icon);
      this.group.add(icon.group);
    });

    this.sceneManager.scene.add(this.group);
  }

  _createToolIcon(tool, x) {
    const group = new THREE.Group();
    group.position.set(x, 0, 0.02);

    // Icon shape
    const geo = new THREE.BoxGeometry(0.5, 0.5, 0.05);
    const mat = new THREE.MeshBasicMaterial({
      color: tool.color || COLORS.CYAN,
      transparent: true,
      opacity: 0.4,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'tool-icon';
    mesh.userData.isToolIcon = true;
    mesh.userData.toolType = tool.type;
    mesh.userData.iconRef = { mesh, material: mat };
    group.add(mesh);

    // Icon border
    const edgesGeo = new THREE.EdgesGeometry(geo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: tool.color || COLORS.CYAN,
      transparent: true,
      opacity: 0.7,
    });
    group.add(new THREE.LineSegments(edgesGeo, edgesMat));

    // Tool symbol
    const symbol = TextRenderer.create({
      text: tool.icon || '?',
      fontSize: 0.15,
      color: '#ffffff',
      anchorX: 'center',
      anchorY: 'middle',
    });
    symbol.position.z = 0.03;
    group.add(symbol);

    // Label
    const label = TextRenderer.create({
      text: tool.label,
      fontSize: 0.045,
      color: '#9b9bbb',
      anchorX: 'center',
      anchorY: 'top',
    });
    label.position.set(0, -0.35, 0.01);
    group.add(label);

    return { group, mesh, material: mat, tool };
  }

  _setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        this.toggle();
      }
    });
  }

  toggle() {
    this.visible = !this.visible;
    this.group.visible = this.visible;
    if (this.visible) {
      this.group.scale.set(0.5, 0.5, 0.5);
      tween(this.group.scale, { x: 1, y: 1, z: 1 }, 400, easeOutCubic);
    }
  }

  show() {
    this.visible = true;
    this.group.visible = true;
  }

  hide() {
    this.visible = false;
    this.group.visible = false;
  }

  handleClick(toolType) {
    this.toolRegistry.activate(toolType);
    this.hide();
  }

  update(delta) {
    if (!this.visible) return;
    // Hover effects handled by raycaster
  }
}
