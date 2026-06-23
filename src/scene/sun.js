import * as THREE from 'three';
import { WORLD, COLOR } from '../config.js';
import { radialSprite } from './_helpers.js';

export function createSun() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(WORLD.sunRadius, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffe6a8 })
  );
  g.add(core);

  const glow = radialSprite(COLOR.SUN, WORLD.sunRadius * 9, 0.7);
  g.add(glow);
  const glow2 = radialSprite(0xfff0c4, WORLD.sunRadius * 4.5, 0.9);
  g.add(glow2);

  const rays = new THREE.Group();
  const rayCount = 14;
  for (let i = 0; i < rayCount; i++) {
    const sp = radialSprite(0xfff3cc, WORLD.sunRadius * 3.4, 0.18);
    sp.scale.y *= 7;
    sp.material.rotation = (i / rayCount) * Math.PI * 2;
    rays.add(sp);
  }
  g.add(rays);

  const light = new THREE.PointLight(0xfff0d0, 2.4, 0, 0.0);
  g.add(light);
  g.add(new THREE.AmbientLight(0x404a66, 0.6));

  function update(t) {
    rays.rotation.z = t * 0.05;
    const pulse = 1 + Math.sin(t * 1.4) * 0.04;
    glow.scale.set(WORLD.sunRadius * 9 * pulse, WORLD.sunRadius * 9 * pulse, 1);
  }
  return { object: g, update };
}
