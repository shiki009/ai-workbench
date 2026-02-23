import * as THREE from 'three';

export class RaycastInteraction {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hoveredObject = null;
    this.isPointerDown = false;
    this._lastIntersectPoint = new THREE.Vector3();

    // Callbacks set by PanelManager
    this.onPointerDown = null;
    this.onPointerMove = null;
    this.onPointerUp = null;
    this.onHover = null;
    this.onToolIconClick = null;

    this._setupListeners();
  }

  _setupListeners() {
    const el = this.sceneManager.domElement;

    el.addEventListener('pointermove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.isPointerDown && this.onPointerMove) {
        this.raycaster.setFromCamera(this.pointer, this.sceneManager.camera);
        // Project onto a plane at the drag depth
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyQuaternion(this.sceneManager.camera.quaternion), 0);
        const target = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, target);
        if (target) {
          this.onPointerMove(target);
        }
      }
    });

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.isPointerDown = true;

      this.raycaster.setFromCamera(this.pointer, this.sceneManager.camera);
      const intersects = this.raycaster.intersectObjects(
        this.sceneManager.scene.children,
        true
      );

      for (const intersect of intersects) {
        // Tool icon click
        if (intersect.object.userData.isToolIcon) {
          if (this.onToolIconClick) {
            this.onToolIconClick(intersect.object.userData.toolType);
          }
          return;
        }
        // Panel interaction
        if (this.onPointerDown) {
          const handled = this.onPointerDown(intersect, intersect.point);
          if (handled) {
            this._lastIntersectPoint.copy(intersect.point);
            return;
          }
        }
      }
    });

    el.addEventListener('pointerup', () => {
      this.isPointerDown = false;
      if (this.onPointerUp) this.onPointerUp();
    });
  }

  update() {
    if (this.isPointerDown) return; // Don't update hover while dragging

    this.raycaster.setFromCamera(this.pointer, this.sceneManager.camera);
    const intersects = this.raycaster.intersectObjects(
      this.sceneManager.scene.children,
      true
    );

    let newHovered = null;
    for (const intersect of intersects) {
      const obj = intersect.object;
      if (obj.userData.isButton || obj.userData.isToolIcon || obj.userData.isPanel || obj.userData.isSlider) {
        newHovered = obj;
        break;
      }
    }

    if (newHovered !== this.hoveredObject) {
      // Unhover old
      if (this.hoveredObject) {
        if (this.hoveredObject.userData.buttonRef) {
          this.hoveredObject.userData.buttonRef.setHover(false);
        }
        if (this.hoveredObject.userData.iconRef) {
          this.hoveredObject.userData.iconRef.material.opacity = 0.4;
        }
        document.body.style.cursor = 'default';
      }
      // Hover new
      if (newHovered) {
        if (newHovered.userData.buttonRef) {
          newHovered.userData.buttonRef.setHover(true);
        }
        if (newHovered.userData.iconRef) {
          newHovered.userData.iconRef.material.opacity = 0.7;
        }
        document.body.style.cursor = 'pointer';
      }
      this.hoveredObject = newHovered;
    }
  }
}
