import * as THREE from 'three';
import { COLORS, EVENTS } from '../constants.js';
import { eventBus } from '../events.js';

export class PipelineConnector {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.connections = [];
    this._group = new THREE.Group();
    this._group.name = 'pipeline-connections';
    sceneManager.scene.add(this._group);

    // Particle material for data flow animation
    this._particleMat = new THREE.PointsMaterial({
      color: COLORS.CYAN,
      size: 0.03,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this._setupEvents();
  }

  _setupEvents() {
    eventBus.on(EVENTS.PIPELINE_CONNECT, ({ fromPanel, toPanel, fromType, toType }) => {
      this._createConnection(fromPanel, toPanel, fromType, toType);
    });

    eventBus.on(EVENTS.PIPELINE_DISCONNECT, ({ fromType, toType }) => {
      this._removeConnection(fromType, toType);
    });

    eventBus.on(EVENTS.PIPELINE_DATA, () => {
      // Trigger particle animation on data flow
      this._animateDataFlow();
    });
  }

  _createConnection(fromPanel, toPanel, fromType, toType) {
    // Output port (right side of source panel)
    const fromPos = new THREE.Vector3(
      fromPanel.group.position.x + fromPanel.width / 2 + 0.05,
      fromPanel.group.position.y,
      fromPanel.group.position.z
    );

    // Input port (left side of target panel)
    const toPos = new THREE.Vector3(
      toPanel.group.position.x - toPanel.width / 2 - 0.05,
      toPanel.group.position.y,
      toPanel.group.position.z
    );

    // Port spheres
    const portGeo = new THREE.SphereGeometry(0.03, 16, 16);
    const portMat = new THREE.MeshBasicMaterial({ color: COLORS.CYAN });

    const outPort = new THREE.Mesh(portGeo, portMat);
    outPort.position.copy(fromPos);
    this._group.add(outPort);

    const inPort = new THREE.Mesh(portGeo, portMat.clone());
    inPort.position.copy(toPos);
    this._group.add(inPort);

    // Tube connection
    const midPoint = new THREE.Vector3().lerpVectors(fromPos, toPos, 0.5);
    midPoint.y += 0.3;

    const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.008, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: COLORS.CYAN,
      transparent: true,
      opacity: 0.4,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    this._group.add(tube);

    // Particles along the curve for data flow animation
    const particleCount = 20;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const point = curve.getPoint(t);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeo, this._particleMat);
    particles.visible = false;
    this._group.add(particles);

    this.connections.push({
      fromType,
      toType,
      fromPanel,
      toPanel,
      outPort,
      inPort,
      tube,
      curve,
      particles,
    });
  }

  _removeConnection(fromType, toType) {
    const idx = this.connections.findIndex(
      (c) => c.fromType === fromType && c.toType === toType
    );
    if (idx === -1) return;

    const conn = this.connections[idx];
    this._group.remove(conn.outPort, conn.inPort, conn.tube, conn.particles);
    conn.outPort.geometry.dispose();
    conn.inPort.geometry.dispose();
    conn.tube.geometry.dispose();
    conn.tube.material.dispose();
    conn.particles.geometry.dispose();
    this.connections.splice(idx, 1);
  }

  _animateDataFlow() {
    for (const conn of this.connections) {
      conn.particles.visible = true;
      // Simple visibility toggle for animation effect
      setTimeout(() => {
        conn.particles.visible = false;
      }, 1500);
    }
  }

  update(delta) {
    // Update connection positions if panels moved
    for (const conn of this.connections) {
      const fromPos = new THREE.Vector3(
        conn.fromPanel.group.position.x + conn.fromPanel.width / 2 + 0.05,
        conn.fromPanel.group.position.y,
        conn.fromPanel.group.position.z
      );
      const toPos = new THREE.Vector3(
        conn.toPanel.group.position.x - conn.toPanel.width / 2 - 0.05,
        conn.toPanel.group.position.y,
        conn.toPanel.group.position.z
      );

      conn.outPort.position.copy(fromPos);
      conn.inPort.position.copy(toPos);
    }
  }

  dispose() {
    while (this.connections.length > 0) {
      const c = this.connections[0];
      this._removeConnection(c.fromType, c.toType);
    }
    this._particleMat.dispose();
  }
}
