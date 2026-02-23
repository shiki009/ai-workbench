import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ROOM } from '../constants.js';
import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.moveSpeed = 4.0;
    this.keys = { forward: false, backward: false, left: false, right: false };
    this.usePointerLock = !this._isMobile();
    this.locked = false;

    if (this.usePointerLock) {
      this._setupPointerLock();
    } else {
      this._setupOrbit();
    }
    this._setupKeyboard();
  }

  _isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  }

  _setupPointerLock() {
    this.pointerLock = new PointerLockControls(this.camera, document.body);

    this.pointerLock.addEventListener('lock', () => {
      this.locked = true;
      document.getElementById('hud').textContent = 'WASD — Move  |  ESC — Release cursor  |  E — Open shelf';
      document.getElementById('crosshair').style.display = 'block';
      eventBus.emit(EVENTS.CAMERA_LOCK);
    });

    this.pointerLock.addEventListener('unlock', () => {
      this.locked = false;
      document.getElementById('hud').textContent = 'Click to enter workspace — WASD to move, Mouse to look';
      document.getElementById('crosshair').style.display = 'none';
      this.keys.forward = this.keys.backward = this.keys.left = this.keys.right = false;
      eventBus.emit(EVENTS.CAMERA_UNLOCK);
    });

    this.domElement.addEventListener('click', () => {
      if (!this.locked) {
        this.pointerLock.lock();
      }
    });
  }

  _setupOrbit() {
    this.orbit = new OrbitControls(this.camera, this.domElement);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.target.set(0, 1.5, 0);
    this.orbit.minDistance = 1;
    this.orbit.maxDistance = 8;
    this.orbit.maxPolarAngle = Math.PI * 0.85;
    this.locked = true; // orbit is always "active"
  }

  _setupKeyboard() {
    const keyMap = {
      KeyW: 'forward', ArrowUp: 'forward',
      KeyS: 'backward', ArrowDown: 'backward',
      KeyA: 'left', ArrowLeft: 'left',
      KeyD: 'right', ArrowRight: 'right',
    };

    document.addEventListener('keydown', (e) => {
      if (keyMap[e.code]) this.keys[keyMap[e.code]] = true;
    });
    document.addEventListener('keyup', (e) => {
      if (keyMap[e.code]) this.keys[keyMap[e.code]] = false;
    });
  }

  update(delta) {
    if (this.orbit) {
      this.orbit.update();
      return;
    }

    if (!this.locked) return;

    // Deceleration
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
    this.direction.x = Number(this.keys.right) - Number(this.keys.left);
    this.direction.normalize();

    if (this.keys.forward || this.keys.backward) {
      this.velocity.z -= this.direction.z * this.moveSpeed * delta;
    }
    if (this.keys.left || this.keys.right) {
      this.velocity.x -= this.direction.x * this.moveSpeed * delta;
    }

    this.pointerLock.moveRight(-this.velocity.x * delta);
    this.pointerLock.moveForward(-this.velocity.z * delta);

    // Clamp to room bounds
    const margin = 0.3;
    const hw = ROOM.WIDTH / 2 - margin;
    const hd = ROOM.DEPTH / 2 - margin;
    this.camera.position.x = THREE.MathUtils.clamp(this.camera.position.x, -hw, hw);
    this.camera.position.z = THREE.MathUtils.clamp(this.camera.position.z, -hd, hd);
  }
}
