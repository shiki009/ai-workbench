import * as THREE from 'three';
import { Panel3D } from './Panel3D.js';
import { PanelControls } from './PanelControls.js';
import { TextRenderer } from './TextRenderer.js';
import { ButtonMesh } from './ButtonMesh.js';
import { PANEL, EVENTS } from '../constants.js';
import { eventBus } from '../events.js';
import { tween, easeOutElastic } from '../utils/animate.js';

export class PanelManager {
  constructor(sceneManager, raycaster) {
    this.sceneManager = sceneManager;
    this.raycaster = raycaster;
    this.panels = [];
    this.focusedPanel = null;
    this.controls = new PanelControls(this);
    this._panelGroup = new THREE.Group();
    this._panelGroup.name = 'panels';
    sceneManager.scene.add(this._panelGroup);

    this._setupInput();
    this._setupEvents();
  }

  _setupInput() {
    this.raycaster.onPointerDown = (intersect, point) => {
      return this.controls.onPointerDown(intersect, point);
    };
    this.raycaster.onPointerMove = (point) => {
      return this.controls.onPointerMove(point);
    };
    this.raycaster.onPointerUp = () => {
      return this.controls.onPointerUp();
    };
  }

  _setupEvents() {
    eventBus.on(EVENTS.PANEL_CLOSE, (panel) => this.removePanel(panel));
    eventBus.on(EVENTS.PANEL_MINIMIZE, (panel) => panel.minimize());
    eventBus.on(EVENTS.PANEL_RESTORE, (panel) => panel.restore());
  }

  spawnPanel({ width, height, title, color, position } = {}) {
    const panel = new Panel3D({ width, height, title, color });

    // Position in front of camera if no position given
    if (position) {
      panel.group.position.copy(position);
    } else {
      const cam = this.sceneManager.camera;
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
      const pos = cam.position.clone().add(dir.multiplyScalar(PANEL.SPAWN_DISTANCE));
      pos.y = PANEL.SPAWN_HEIGHT;
      panel.group.position.copy(pos);
    }

    // Face camera
    panel.group.lookAt(this.sceneManager.camera.position);

    // Title text
    const titleText = TextRenderer.createTitle(title || 'Panel', width || PANEL.DEFAULT_WIDTH);
    titleText.position.set(0, (height || PANEL.DEFAULT_HEIGHT) / 2 - PANEL.TITLE_BAR_HEIGHT / 2 - PANEL.BORDER_WIDTH, 0.005);
    panel.group.add(titleText);

    // Close button
    const closeBtn = new ButtonMesh({
      width: 0.08,
      height: 0.06,
      label: 'X',
      color: 0xff4444,
      onClick: () => this.removePanel(panel),
    });
    closeBtn.group.position.set(
      (width || PANEL.DEFAULT_WIDTH) / 2 - 0.06,
      (height || PANEL.DEFAULT_HEIGHT) / 2 - PANEL.TITLE_BAR_HEIGHT / 2 - PANEL.BORDER_WIDTH,
      0.005
    );
    panel.group.add(closeBtn.group);

    // Minimize button
    const minBtn = new ButtonMesh({
      width: 0.08,
      height: 0.06,
      label: '_',
      color: 0x00d4ff,
      onClick: () => {
        if (panel.minimized) {
          panel.restore();
        } else {
          panel.minimize();
        }
      },
    });
    minBtn.group.position.set(
      (width || PANEL.DEFAULT_WIDTH) / 2 - 0.16,
      (height || PANEL.DEFAULT_HEIGHT) / 2 - PANEL.TITLE_BAR_HEIGHT / 2 - PANEL.BORDER_WIDTH,
      0.005
    );
    panel.group.add(minBtn.group);

    // Spawn animation
    panel.group.scale.set(0.01, 0.01, 0.01);
    tween(panel.group.scale, { x: 1, y: 1, z: 1 }, 600, easeOutElastic);

    this._panelGroup.add(panel.group);
    this.panels.push(panel);
    this.focusPanel(panel);

    eventBus.emit(EVENTS.PANEL_SPAWN, panel);
    return panel;
  }

  removePanel(panel) {
    const idx = this.panels.indexOf(panel);
    if (idx === -1) return;

    tween(panel.group.scale, { x: 0.01, y: 0.01, z: 0.01 }, 300).then(() => {
      this._panelGroup.remove(panel.group);
      panel.dispose();
      this.panels.splice(idx, 1);
      if (this.focusedPanel === panel) {
        this.focusedPanel = this.panels[this.panels.length - 1] || null;
        if (this.focusedPanel) this.focusedPanel.setFocused(true);
      }
    });
  }

  focusPanel(panel) {
    if (this.focusedPanel === panel) return;
    if (this.focusedPanel) this.focusedPanel.setFocused(false);
    panel.setFocused(true);
    this.focusedPanel = panel;

    // Move to front (z-ordering via render order)
    const idx = this.panels.indexOf(panel);
    if (idx !== -1) {
      this.panels.splice(idx, 1);
      this.panels.push(panel);
    }
    // Update render orders
    this.panels.forEach((p, i) => {
      p.group.renderOrder = i;
    });
  }

  update(delta) {
    for (const panel of this.panels) {
      panel.update(delta);
    }
  }

  getSerializedState() {
    return this.panels.map((p) => ({
      title: p.title,
      width: p.width,
      height: p.height,
      position: p.group.position.toArray(),
      rotation: p.group.rotation.toArray(),
      minimized: p.minimized,
    }));
  }
}
