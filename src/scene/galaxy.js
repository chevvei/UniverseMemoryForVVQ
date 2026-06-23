import * as THREE from 'three';
import { WORLD } from '../config.js';

const ARM_COLORS = [0x9ec6ff, 0xffc4dd, 0xfff4d6, 0xc9a8ff];

export function createGalaxy() {
  const count = WORLD.galaxyParticles;
  const arms = 4;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const siz = new Float32Array(count);
  const seed = new Float32Array(count);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const arm = i % arms;
    const radius = Math.pow(Math.random(), 0.6) * 1100 + 60;
    const armAngle = (arm / arms) * Math.PI * 2;
    const spin = radius * 0.004;
    const scatter = (Math.random() - 0.5) * 0.5 * (1 - radius / 1300);
    const angle = armAngle + spin + scatter;
    const yJitter = (Math.random() - 0.5) * 40 * (1 - radius / 1400);
    pos[i * 3] = Math.cos(angle) * radius;
    pos[i * 3 + 1] = yJitter;
    pos[i * 3 + 2] = Math.sin(angle) * radius;
    c.set(ARM_COLORS[Math.floor(Math.random() * ARM_COLORS.length)]);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    siz[i] = Math.random() * 2.4 + 0.6;
    seed[i] = Math.random() * 10;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute float aSize; attribute float aSeed; varying vec3 vColor; varying float vTw;
      uniform float uTime;
      void main(){
        vColor = color;
        vTw = 0.6 + 0.4 * sin(uTime * 1.5 + aSeed * 6.2831);
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = aSize * (260.0 / -mv.z) * vTw;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vTw;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        if(d > 0.5) discard;
        float a = (1.0 - d * 2.0);
        gl_FragColor = vec4(vColor, a * vTw);
      }`,
    vertexColors: true
  });
  const points = new THREE.Points(geo, mat);
  points.rotation.x = 0.38;
  function update(t) {
    mat.uniforms.uTime.value = t;
    points.rotation.y = t * 0.01;
  }
  return { object: points, update };
}
