import * as THREE from 'three';
import { COLOR } from '../config.js';

// 水晶碎裂爆开：进入画廊时的过渡特效
export function createCrystalBurst() {
  const N = 60;
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N * 3);
  const aLife = new Float32Array(N);
  const aSize = new Float32Array(N);
  const aColor = new Float32Array(N * 3);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aLife', new THREE.BufferAttribute(aLife, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
  geo.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aLife; attribute float aSize; attribute vec3 aColor;
      varying float vLife; varying vec3 vColor;
      void main(){
        vLife = aLife; vColor = aColor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * aLife * (200.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vLife; varying vec3 vColor;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        if(d > 0.5) discard;
        float a = vLife * smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, a);
      }`
  });
  const points = new THREE.Points(geo, mat);
  points.visible = false;

  function burst(center) {
    points.visible = true;
    const ice = new THREE.Color(COLOR.ICE);
    const rose = new THREE.Color(COLOR.ROSE);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = center.x;
      pos[i * 3 + 1] = center.y;
      pos[i * 3 + 2] = center.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 15 + Math.random() * 40;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vel[i * 3 + 2] = Math.cos(phi) * speed;
      aLife[i] = 1.0;
      aSize[i] = 2 + Math.random() * 4;
      const col = Math.random() > 0.5 ? ice : rose;
      aColor[i * 3] = col.r; aColor[i * 3 + 1] = col.g; aColor[i * 3 + 2] = col.b;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aLife.needsUpdate = true;
    geo.attributes.aSize.needsUpdate = true;
    geo.attributes.aColor.needsUpdate = true;
  }

  function update(t, dt) {
    if (!points.visible) return;
    let alive = false;
    for (let i = 0; i < N; i++) {
      if (aLife[i] <= 0) continue;
      alive = true;
      aLife[i] = Math.max(0, aLife[i] - dt * 1.2);
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      vel[i * 3] *= 0.96;
      vel[i * 3 + 1] *= 0.96;
      vel[i * 3 + 2] *= 0.96;
    }
    if (alive) {
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aLife.needsUpdate = true;
    } else {
      points.visible = false;
    }
  }

  return { object: points, update, burst };
}
