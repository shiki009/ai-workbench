import * as THREE from 'three';
import { PANEL } from '../constants.js';

export class PanelControls {
  constructor(panelManager) {
    this.panelManager = panelManager;
    this._dragging = null;
    this._dragOffset = new THREE.Vector3();
    this._resizing = null;
  }

  onPointerDown(intersect, pointer3D) {
    const obj = intersect.object;

    // Title bar drag
    if (obj.userData.isDraggable && obj.userData.panelRef) {
      const panel = obj.userData.panelRef;
      this._dragging = panel;
      this._dragOffset.copy(panel.group.position).sub(intersect.point);
      this.panelManager.focusPanel(panel);
      return true;
    }

    // Button click
    if (obj.userData.isButton && obj.userData.buttonRef) {
      obj.userData.buttonRef.trigger();
      return true;
    }

    // Slider
    if (obj.userData.isSlider && obj.userData.sliderRef) {
      const slider = obj.userData.sliderRef;
      const local = slider.group.worldToLocal(intersect.point.clone());
      slider.setValueFromPointer(local.x);
      this._resizing = slider;
      return true;
    }

    // Panel body click - focus
    if (obj.userData.isPanel && obj.userData.panelRef) {
      this.panelManager.focusPanel(obj.userData.panelRef);
      return true;
    }

    return false;
  }

  onPointerMove(point) {
    if (this._dragging) {
      const newPos = point.clone().add(this._dragOffset);
      this._dragging.group.position.copy(newPos);
      return true;
    }
    if (this._resizing && this._resizing.dragging !== undefined) {
      const local = this._resizing.group.worldToLocal(point.clone());
      this._resizing.setValueFromPointer(local.x);
      return true;
    }
    return false;
  }

  onPointerUp() {
    const wasDragging = !!this._dragging || !!this._resizing;
    this._dragging = null;
    this._resizing = null;
    return wasDragging;
  }
}
