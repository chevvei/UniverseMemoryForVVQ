import * as THREE from 'three';

function field(count, spread, size, color) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = spread * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  return new THREE.Points(geo, mat);
}

export function createStarfield() {
  const g = new THREE.Group();
  const s1 = field(2200, 1500, 1.6, 0xffffff);
  const s2 = field(500, 1300, 2.6, 0x7fd4ff);
  g.add(s1, s2);
  function update(t) {
    g.rotation.y = t * 0.003;
  }
  return { object: g, update };
}
