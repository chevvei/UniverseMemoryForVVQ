import * as THREE from 'three';
import { COLOR } from '../config.js';
import { radialSprite } from '../scene/_helpers.js';

export function loadShip() {
  const ship = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdfe8f5, roughness: 0.4, metalness: 0.7 });
  const accentMat = new THREE.MeshStandardMaterial({ color: COLOR.ICE, roughness: 0.3, metalness: 0.6, emissive: new THREE.Color(COLOR.ICE).multiplyScalar(0.25) });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x163a5a, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.7, emissive: 0x0a2030 });

  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 2.0, 8, 16), bodyMat);
  hull.rotation.x = Math.PI / 2;
  ship.add(hull);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 16), accentMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -2.2;
  ship.add(nose);

  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), glassMat);
  cockpit.position.set(0, 0.5, -0.6);
  ship.add(cockpit);

  const wingGeo = new THREE.BoxGeometry(3.4, 0.12, 1.2);
  const wing = new THREE.Mesh(wingGeo, accentMat);
  wing.position.z = 0.8;
  ship.add(wing);

  const finGeo = new THREE.BoxGeometry(0.12, 1.0, 1.0);
  const fin = new THREE.Mesh(finGeo, accentMat);
  fin.position.set(0, 0.5, 1.2);
  ship.add(fin);

  const exhaust = new THREE.Group();
  for (let i = -1; i <= 1; i += 2) {
    const flame = radialSprite(COLOR.ROSE, 1.6, 0.9);
    flame.position.set(i * 0.45, 0, 1.9);
    exhaust.add(flame);
  }
  const flameCenter = radialSprite(COLOR.ICE, 2.0, 0.85);
  flameCenter.position.set(0, 0, 2.0);
  exhaust.add(flameCenter);
  ship.add(exhaust);

  ship.userData.exhaust = exhaust;

  function update(t, throttle = 0) {
    const base = 0.5 + throttle * 1.4;
    const flick = 0.85 + Math.sin(t * 30) * 0.15;
    exhaust.children.forEach((f, i) => {
      const s = base * flick * (i === exhaust.children.length - 1 ? 1.3 : 1);
      f.scale.set(s * 1.6, s * 1.6, 1);
      f.material.opacity = 0.5 + throttle * 0.4;
    });
  }

  return Promise.resolve({ object: ship, update });
}
