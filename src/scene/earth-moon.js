import * as THREE from 'three';
import { makeAtmosphere } from './_helpers.js';

const TEX = 'textures/';
const loader = new THREE.TextureLoader();
function tryLoad(name) {
  // 资源缺失时返回的纹理通道留空（不写兜底贴图），onError 静默
  return loader.load(TEX + name, undefined, undefined, () => {});
}

export function createEarthMoon({ position = new THREE.Vector3(-180, 40, 260), earthRadius = 14 } = {}) {
  const root = new THREE.Group();
  root.position.copy(position);

  // 地球
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius, 48, 48),
    new THREE.MeshStandardMaterial({
      map: tryLoad('earth_albedo.jpg'),
      normalMap: tryLoad('earth_normal.jpg'),
      roughnessMap: tryLoad('earth_specular.jpg'),
      roughness: 0.9, metalness: 0.05
    })
  );
  root.add(earth);

  // 云层
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius * 1.02, 96, 96),
    new THREE.MeshStandardMaterial({
      map: tryLoad('earth_clouds.png'),
      transparent: true, depthWrite: false, opacity: 0.85
    })
  );
  root.add(clouds);

  // 大气辉光
  root.add(makeAtmosphere(earthRadius * 1.12, '#7fb6ff'));

  // 月球（潮汐锁定）
  const moonOrbit = new THREE.Group();
  root.add(moonOrbit);
  const moonRadius = earthRadius * 0.27;
  const moonDist = earthRadius * 4.0;
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(moonRadius, 128, 128),
    new THREE.MeshStandardMaterial({
      map: tryLoad('moon_albedo.jpg'),
      bumpMap: tryLoad('moon_displace.jpg'),
      bumpScale: moonRadius * 0.5,
      displacementMap: tryLoad('moon_displace.jpg'),
      displacementScale: moonRadius * 0.04,
      roughness: 1.0, metalness: 0.0
    })
  );
  moon.position.set(moonDist, 0, 0);
  moonOrbit.add(moon);

  function update(t) {
    earth.rotation.y = t * 0.08;
    clouds.rotation.y = t * 0.1;
    moonOrbit.rotation.y = t * 0.04;
    // 潮汐锁定：月球自转抵消公转，始终同一面朝地球
    moon.rotation.y = -t * 0.04;
  }

  return { object: root, update };
}
