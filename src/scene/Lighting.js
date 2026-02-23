import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ROOM, COLORS } from '../constants.js';

export class Lighting {
  constructor(scene) {
    this.scene = scene;
    RectAreaLightUniformsLib.init();
    this._setup();
  }

  _setup() {
    // Ambient fill
    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.4);
    this.scene.add(ambient);

    // Warm overhead rect area light
    const rectLight = new THREE.RectAreaLight(COLORS.WARM_WHITE, 3, 4, 1);
    rectLight.position.set(0, ROOM.HEIGHT - 0.1, 0);
    rectLight.rotation.x = -Math.PI / 2;
    this.scene.add(rectLight);

    // Cyan accent point lights
    const cyanPositions = [
      [-ROOM.WIDTH / 2 + 0.5, 2, -ROOM.DEPTH / 2 + 0.5],
      [ROOM.WIDTH / 2 - 0.5, 2, -ROOM.DEPTH / 2 + 0.5],
      [-ROOM.WIDTH / 2 + 0.5, 2, ROOM.DEPTH / 2 - 0.5],
      [ROOM.WIDTH / 2 - 0.5, 2, ROOM.DEPTH / 2 - 0.5],
    ];

    for (const pos of cyanPositions) {
      const light = new THREE.PointLight(COLORS.CYAN, 0.6, 8, 2);
      light.position.set(...pos);
      this.scene.add(light);
    }

    // Purple accent light (center-back)
    const purpleLight = new THREE.PointLight(COLORS.PURPLE, 0.4, 10, 2);
    purpleLight.position.set(0, 3, -ROOM.DEPTH / 2 + 1);
    this.scene.add(purpleLight);

    // Directional light for shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight.position.set(2, ROOM.HEIGHT - 1, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    this.scene.add(dirLight);
  }
}
