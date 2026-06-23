import * as THREE from 'three';
import { SHIP, COLOR } from '../config.js';

export function createTrail(shipObject) {
  const N = SHIP.trailParticles;
  const pos = new Float32Array(N * 3);
  const life = new Float32Array(N);
  for (let i = 0; i < N; i++) life[i] = 0;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColorA: { value: new THREE.Color(COLOR.ICE) }, uColorB: { value: new THREE.Color(COLOR.ROSE) } },
    vertexShader: `
      attribute float aLife; varying float vL;
      void main(){
        vL = aLife;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (1.0 + aLife * 5.0) * (180.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vL; uniform vec3 uColorA; uniform vec3 uColorB;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        if(d > 0.5) discard;
        vec3 col = mix(uColorB, uColorA, vL);
        gl_FragColor = vec4(col, vL * (1.0 - d * 2.0));
      }`
  });
  const points = new THREE.Points(geo, mat);
  let head = 0;
  const emitPos = new THREE.Vector3();
  const back = new THREE.Vector3();

  function update(dt, throttle) {
    for (let i = 0; i < N; i++) {
      if (life[i] > 0) life[i] = Math.max(0, life[i] - dt * 0.8);
    }
    if (throttle > 0.05) {
      const emit = Math.ceil(throttle * 3);
      for (let k = 0; k < emit; k++) {
        back.set(0, 0, 2.0).applyQuaternion(shipObject.quaternion).add(shipObject.position);
        emitPos.copy(back);
        pos[head * 3] = emitPos.x + (Math.random() - 0.5) * 0.6;
        pos[head * 3 + 1] = emitPos.y + (Math.random() - 0.5) * 0.6;
        pos[head * 3 + 2] = emitPos.z + (Math.random() - 0.5) * 0.6;
        life[head] = 1.0;
        head = (head + 1) % N;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aLife.needsUpdate = true;
  }

  return { object: points, update };
}
