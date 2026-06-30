import * as THREE from 'three';
import { makeAtmosphere, makeRingTexture, radialSprite } from './_helpers.js';
import { createOrbitPath } from './orbit-path.js';

export function createPlanets(planetsData) {
  const root = new THREE.Group();
  const orbitGroup = new THREE.Group();
  root.add(orbitGroup);
  const meshes = [];
  const updaters = [];

  for (const p of planetsData) {
    const a = p.appearance;
    const pivot = new THREE.Group();
    pivot.rotation.x = (Math.random() - 0.5) * 0.3;

    const path = createOrbitPath(p.orbit.dist, a.glow);
    pivot.add(path.object);
    updaters.push(path.update);

    const planet = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(a.size, 40, 40),
      new THREE.MeshStandardMaterial({ color: a.color, roughness: 0.85, metalness: 0.1, emissive: new THREE.Color(a.color).multiplyScalar(0.15) })
    );
    planet.add(body);
    planet.add(makeAtmosphere(a.size * 1.35, a.glow));
    planet.add(radialSprite(a.glow, a.size * 7, 0.4));

    if (a.ring) {
      const ringGeo = new THREE.RingGeometry(a.size * 1.6, a.size * 3, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        map: makeRingTexture(), side: THREE.DoubleSide,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.3;
      planet.add(ring);
      // 光环粒子
      const pCount = 120;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        const r = a.size * (1.7 + Math.random() * 1.2);
        const ang = Math.random() * Math.PI * 2;
        pPos[i * 3] = Math.cos(ang) * r;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
        pPos[i * 3 + 2] = Math.sin(ang) * r;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: a.glow, size: 0.6, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
      const ringParticles = new THREE.Points(pGeo, pMat);
      ringParticles.rotation.x = Math.PI / 2.3;
      planet.add(ringParticles);
    }

    body.userData.planetId = p.id;
    planet.userData.planetId = p.id;
    pivot.add(planet);
    orbitGroup.add(pivot);

    const startAngle = Math.random() * Math.PI * 2;
    const entry = { id: p.id, planet, body, data: p };
    meshes.push(entry);

    updaters.push((t) => {
      const ang = startAngle + t * p.orbit.speed;
      planet.position.set(Math.cos(ang) * p.orbit.dist, 0, Math.sin(ang) * p.orbit.dist);
      body.rotation.y = t * 0.4;
    });
  }

  function update(t) { for (const fn of updaters) fn(t); }
  return { object: root, update, meshes };
}
