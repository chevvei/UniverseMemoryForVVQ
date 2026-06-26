import * as THREE from 'three';
import { COLOR } from '../config.js';
import { radialSprite, makeAtmosphere } from './_helpers.js';

function star(color) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 32, 32),
    new THREE.MeshBasicMaterial({ color })
  );
  g.add(core);
  g.add(makeAtmosphere(3.4, color));
  g.add(radialSprite(color, 22, 0.6));
  return g;
}

export function createTwins() {
  const g = new THREE.Group();
  const cv = star(COLOR.ICE);
  const qq = star(COLOR.ROSE);
  g.add(cv, qq);
  const R = 7;
  function update(t) {
    const a = t * 0.8;
    cv.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
    qq.position.set(Math.cos(a + Math.PI) * R, 0, Math.sin(a + Math.PI) * R);
  }
  return { object: g, update, cv, qq };
}
