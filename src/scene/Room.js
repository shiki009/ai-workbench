import * as THREE from 'three';
import { ROOM, COLORS } from '../constants.js';

export class Room {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'room';
    this._buildFloor();
    this._buildWalls();
    this._buildCeiling();
    scene.add(this.group);
  }

  _buildFloor() {
    // Grid floor with emissive lines
    const geo = new THREE.PlaneGeometry(ROOM.WIDTH, ROOM.DEPTH, ROOM.WIDTH * 2, ROOM.DEPTH * 2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x080818,
      roughness: 0.85,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = 'floor';
    this.group.add(floor);

    // Grid lines
    const gridHelper = new THREE.GridHelper(
      Math.max(ROOM.WIDTH, ROOM.DEPTH),
      Math.max(ROOM.WIDTH, ROOM.DEPTH) * 2,
      COLORS.CYAN,
      COLORS.CYAN
    );
    gridHelper.material.opacity = 0.08;
    gridHelper.material.transparent = true;
    gridHelper.position.y = 0.001;
    this.group.add(gridHelper);

    // Emissive grid lines for bloom
    const emissiveGrid = new THREE.GridHelper(
      Math.max(ROOM.WIDTH, ROOM.DEPTH),
      Math.max(ROOM.WIDTH, ROOM.DEPTH),
      COLORS.CYAN,
      COLORS.CYAN
    );
    emissiveGrid.material.opacity = 0.04;
    emissiveGrid.material.transparent = true;
    emissiveGrid.position.y = 0.002;
    this.group.add(emissiveGrid);
  }

  _buildWalls() {
    const hw = ROOM.WIDTH / 2;
    const hd = ROOM.DEPTH / 2;
    const h = ROOM.HEIGHT;

    const wallMat = new THREE.MeshStandardMaterial({
      color: COLORS.WALL_BASE,
      roughness: 0.7,
      metalness: 0.3,
      side: THREE.BackSide,
    });

    // Hexagonal panel pattern on walls
    const walls = [
      { pos: [0, h / 2, -hd], rot: [0, 0, 0], size: [ROOM.WIDTH, h] },           // back
      { pos: [0, h / 2, hd], rot: [0, Math.PI, 0], size: [ROOM.WIDTH, h] },       // front
      { pos: [-hw, h / 2, 0], rot: [0, Math.PI / 2, 0], size: [ROOM.DEPTH, h] },  // left
      { pos: [hw, h / 2, 0], rot: [0, -Math.PI / 2, 0], size: [ROOM.DEPTH, h] },  // right
    ];

    for (const w of walls) {
      const geo = new THREE.PlaneGeometry(w.size[0], w.size[1], 1, 1);
      const mesh = new THREE.Mesh(geo, wallMat.clone());
      mesh.position.set(...w.pos);
      mesh.rotation.set(...w.rot);
      mesh.receiveShadow = true;
      mesh.name = 'wall';
      this.group.add(mesh);
    }

    // Wall accent lines (horizontal glowing strips)
    this._addWallAccents(hw, hd, h);
  }

  _addWallAccents(hw, hd, h) {
    const lineMat = new THREE.MeshBasicMaterial({
      color: COLORS.CYAN,
      transparent: true,
      opacity: 0.15,
    });

    const heights = [0.05, h * 0.3, h * 0.6, h - 0.05];
    const wallDefs = [
      { start: [-hw, 0, -hd], end: [hw, 0, -hd] },
      { start: [-hw, 0, hd], end: [hw, 0, hd] },
      { start: [-hw, 0, -hd], end: [-hw, 0, hd] },
      { start: [hw, 0, -hd], end: [hw, 0, hd] },
    ];

    for (const wd of wallDefs) {
      for (const y of heights) {
        const points = [
          new THREE.Vector3(wd.start[0], y, wd.start[2]),
          new THREE.Vector3(wd.end[0], y, wd.end[2]),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, lineMat);
        this.group.add(line);
      }
    }

    // Corner edge lights
    const corners = [
      [-hw + 0.01, -hd + 0.01],
      [hw - 0.01, -hd + 0.01],
      [-hw + 0.01, hd - 0.01],
      [hw - 0.01, hd - 0.01],
    ];

    const edgeMat = new THREE.MeshBasicMaterial({
      color: COLORS.PURPLE,
      transparent: true,
      opacity: 0.3,
    });

    for (const [cx, cz] of corners) {
      const geo = new THREE.BoxGeometry(0.02, h, 0.02);
      const mesh = new THREE.Mesh(geo, edgeMat);
      mesh.position.set(cx, h / 2, cz);
      this.group.add(mesh);
    }
  }

  _buildCeiling() {
    const geo = new THREE.PlaneGeometry(ROOM.WIDTH, ROOM.DEPTH);
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS.CEILING,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ceiling = new THREE.Mesh(geo, mat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = ROOM.HEIGHT;
    ceiling.name = 'ceiling';
    this.group.add(ceiling);

    // Recessed ceiling light panels
    this._addCeilingLights();
  }

  _addCeilingLights() {
    const lightGeo = new THREE.PlaneGeometry(1.5, 0.3);
    const lightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });

    const positions = [
      [0, ROOM.HEIGHT - 0.01, -2],
      [0, ROOM.HEIGHT - 0.01, 0],
      [0, ROOM.HEIGHT - 0.01, 2],
    ];

    for (const pos of positions) {
      const panel = new THREE.Mesh(lightGeo, lightMat.clone());
      panel.rotation.x = Math.PI / 2;
      panel.position.set(...pos);
      this.group.add(panel);
    }
  }
}
