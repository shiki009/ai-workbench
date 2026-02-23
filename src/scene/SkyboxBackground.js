import * as THREE from 'three';

const vertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // Gradient: deep navy at bottom -> dark purple at top
    float y = normalize(vWorldPosition).y;
    vec3 bottomColor = vec3(0.04, 0.04, 0.1);
    vec3 topColor = vec3(0.06, 0.02, 0.12);
    vec3 color = mix(bottomColor, topColor, smoothstep(-0.2, 1.0, y));

    // Animated stars (only visible above horizon)
    if (y > 0.0) {
      vec2 starUV = vWorldPosition.xz / (vWorldPosition.y + 0.001) * 3.0;
      float star = hash(floor(starUV * 60.0));
      star = step(0.997, star);
      float twinkle = sin(uTime * 2.0 + hash(floor(starUV * 60.0)) * 6.28) * 0.5 + 0.5;
      color += star * twinkle * vec3(0.6, 0.7, 1.0) * y;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

export class SkyboxBackground {
  constructor(scene) {
    this.uniforms = {
      uTime: { value: 0 },
    };

    const geo = new THREE.SphereGeometry(50, 32, 32);
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.name = 'skybox';
    scene.add(this.mesh);
  }

  update(delta) {
    this.uniforms.uTime.value += delta;
  }
}
