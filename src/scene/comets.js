import * as THREE from 'three';
import { radialSprite } from './_helpers.js';

function makeComet(color, radius, speed, phase, tilt) {
  const g = new THREE.Group();
  const head = radialSprite(color, 10, 0.95);
  g.add(head);
  const trailCount = 30;
  const tpos = new Float32Array(trailCount * 3);
  const tgeo = new THREE.BufferGeometry();
  tgeo.setAttribute('position', new THREE.BufferAttribute(tpos, 3));
  const tmat = new THREE.PointsMaterial({
    color, size: 4, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const trail = new THREE.Points(tgeo, tmat);
  g.add(trail);
  g.rotation.x = tilt;
  return { g, head, trail, tpos, tgeo, radius, speed, phase, trailCount };
}

export function createComets() {
  const root = new THREE.Group();
  const comets = [
    makeComet(0x9ec6ff, 260, 0.22, 0, 0.4),
    makeComet(0xffc4dd, 320, 0.16, 2, -0.3)
  ];
  comets.forEach((c) => root.add(c.g));
  function update(t) {
    for (const c of comets) {
      const a = t * c.speed + c.phase;
      const x = Math.cos(a) * c.radius;
      const z = Math.sin(a) * c.radius;
      const y = Math.sin(a * 1.3) * 30;
      c.head.position.set(x, y, z);
      for (let i = c.trailCount - 1; i > 0; i--) {
        c.tpos[i * 3] = c.tpos[(i - 1) * 3];
        c.tpos[i * 3 + 1] = c.tpos[(i - 1) * 3 + 1];
        c.tpos[i * 3 + 2] = c.tpos[(i - 1) * 3 + 2];
      }
      c.tpos[0] = x; c.tpos[1] = y; c.tpos[2] = z;
      c.tgeo.attributes.position.needsUpdate = true;
    }
  }
  return { object: root, update };
}
