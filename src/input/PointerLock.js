export class PointerLock {
  constructor(element) {
    this.element = element;
    this.locked = false;

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.element;
    });
  }

  request() {
    this.element.requestPointerLock();
  }

  exit() {
    if (this.locked) document.exitPointerLock();
  }
}
