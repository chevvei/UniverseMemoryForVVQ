import * as THREE from 'three';
import { radialSprite } from './_helpers.js';

const COLORS = [0x3a2b6e, 0x5a2b55, 0x21406e, 0x402b6b, 0x5a3b2b];

export function createNebula() {
  const g = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const color = COLORS[i % COLORS.length];
    const sp = radialSprite(color, 200 + Math.random() * 260, 0.16 + Math.random() * 0.12);
    const r = 500 + Math.random() * 700;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    sp.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) * 0.5,
      r * Math.sin(phi) * Math.sin(theta)
    );
    g.add(sp);
  }
  function update(t) {
    g.rotation.y = t * 0.006;
  }
  return { object: g, update };
}
