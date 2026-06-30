import * as THREE from 'three';
import { COLOR } from '../config.js';

// 流星雨：随机流星拖尾划过夜空
export function createMeteors({ count = 8 } = {}) {
  const root = new THREE.Group();
  const meteors = [];
  const BOUND = 800;

  function spawn() {
    const isCv = Math.random() > 0.5;
    const color = new THREE.Color(isCv ? COLOR.ICE : COLOR.ROSE);
    const trailLen = 20 + Math.floor(Math.random() * 20);
    const pos = new Float32Array(trailLen * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const line = new THREE.Line(geo, mat);
    root.add(line);

    const start = new THREE.Vector3(
      (Math.random() - 0.5) * BOUND,
      100 + Math.random() * 300,
      (Math.random() - 0.5) * BOUND
    );
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      -1 - Math.random(),
      (Math.random() - 0.5) * 2
    ).normalize().multiplyScalar(3 + Math.random() * 4);

    return {
      line, pos, geo, mat,
      head: start.clone(),
      dir,
      life: 0,
      maxLife: 2 + Math.random() * 2,
      trailLen
    };
  }

  for (let i = 0; i < count; i++) meteors.push(spawn());

  function update(_t, dt) {
    for (const m of meteors) {
      m.life += dt;
      m.head.addScaledVector(m.dir, dt * 30);
      // 拖尾位移
      for (let i = m.trailLen - 1; i > 0; i--) {
        m.pos[i * 3] = m.pos[(i - 1) * 3];
        m.pos[i * 3 + 1] = m.pos[(i - 1) * 3 + 1];
        m.pos[i * 3 + 2] = m.pos[(i - 1) * 3 + 2];
      }
      m.pos[0] = m.head.x; m.pos[1] = m.head.y; m.pos[2] = m.head.z;
      m.geo.attributes.position.needsUpdate = true;
      const fade = m.life / m.maxLife;
      m.mat.opacity = Math.sin(fade * Math.PI);
      if (m.life > m.maxLife) {
        // 重置
        m.head.set((Math.random() - 0.5) * BOUND, 100 + Math.random() * 300, (Math.random() - 0.5) * BOUND);
        m.life = 0;
        m.maxLife = 2 + Math.random() * 2;
      }
    }
  }
  return { object: root, update };
}
