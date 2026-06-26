import * as THREE from 'three';
import { COLOR } from '../config.js';
import { radialSprite } from './_helpers.js';

export function createPoints(pointsData) {
  const root = new THREE.Group();
  const meshes = [];
  for (const pt of pointsData) {
    const color = pt.owner === 'cv' ? COLOR.ICE : COLOR.ROSE;
    const g = new THREE.Group();
    const marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(2.2, 0),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, wireframe: true })
    );
    g.add(marker);
    g.add(radialSprite(color, 9, 0.5));
    g.position.set(pt.pos[0], pt.pos[1], pt.pos[2]);
    marker.userData.pointId = pt.id;
    marker.userData.linkPlanet = pt.linkPlanet;
    g.userData.linkPlanet = pt.linkPlanet;
    root.add(g);
    meshes.push({ id: pt.id, group: g, marker, data: pt });
  }
  function update(t) {
    for (const m of meshes) {
      m.marker.rotation.y = t * 0.6;
      m.marker.rotation.x = t * 0.3;
      m.group.scale.setScalar(1 + Math.sin(t * 2 + m.group.position.x) * 0.08);
    }
  }
  return { object: root, update, meshes };
}
