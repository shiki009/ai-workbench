import * as THREE from 'three';

export class XRInputHandler {
  constructor(sceneManager, raycaster) {
    this.sceneManager = sceneManager;
    this.raycaster = raycaster;
    this.controllers = [];
    this.tempMatrix = new THREE.Matrix4();
  }

  setupControllers(xrSession) {
    const renderer = this.sceneManager.renderer;
    for (let i = 0; i < 2; i++) {
      const controller = renderer.xr.getController(i);
      controller.addEventListener('selectstart', () => this._onSelectStart(controller));
      controller.addEventListener('selectend', () => this._onSelectEnd(controller));
      this.sceneManager.scene.add(controller);
      this.controllers.push(controller);

      // Controller ray visual
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -3),
      ]);
      const mat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.5 });
      const line = new THREE.Line(geo, mat);
      controller.add(line);
    }
  }

  _onSelectStart(controller) {
    this.tempMatrix.identity().extractRotation(controller.matrixWorld);
    const ray = new THREE.Raycaster();
    ray.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    ray.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);

    const intersects = ray.intersectObjects(this.sceneManager.scene.children, true);
    if (intersects.length > 0 && this.raycaster.onPointerDown) {
      this.raycaster.onPointerDown(intersects[0], intersects[0].point);
    }
  }

  _onSelectEnd() {
    if (this.raycaster.onPointerUp) this.raycaster.onPointerUp();
  }
}
