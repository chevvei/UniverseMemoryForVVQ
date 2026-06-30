import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { COLOR } from '../config.js';
import { radialSprite } from '../scene/_helpers.js';

const MODEL_URL = './models/ship.glb';

function buildExhaust() {
  const exhaust = new THREE.Group();
  for (let i = -1; i <= 1; i += 2) {
    const flame = radialSprite(COLOR.ROSE, 1.6, 0.9);
    flame.position.set(i * 0.45, 0, 1.9);
    exhaust.add(flame);
  }
  const flameCenter = radialSprite(COLOR.ICE, 2.0, 0.85);
  flameCenter.position.set(0, 0, 2.0);
  exhaust.add(flameCenter);
  return exhaust;
}

function attachUpdate(ship, exhaust) {
  // 能量护盾：淡蓝半透明球壳，加速时脉冲
  const shield = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 24, 24),
    new THREE.MeshBasicMaterial({ color: COLOR.ICE, transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  ship.add(shield);
  let shieldOp = 0;
  function update(t, throttle = 0) {
    const base = 0.5 + throttle * 1.4;
    const flick = 0.85 + Math.sin(t * 30) * 0.15;
    exhaust.children.forEach((f, i) => {
      const s = base * flick * (i === exhaust.children.length - 1 ? 1.3 : 1);
      f.scale.set(s * 1.6, s * 1.6, 1);
      f.material.opacity = 0.5 + throttle * 0.4;
    });
    // 护盾脉冲
    const targetOp = throttle > 0.3 ? 0.12 + throttle * 0.15 : 0;
    shieldOp += (targetOp - shieldOp) * 0.06;
    shield.material.opacity = shieldOp + Math.sin(t * 4) * 0.03 * shieldOp;
    shield.scale.setScalar(1 + Math.sin(t * 3) * 0.02);
  }
  return { object: ship, update };
}

function buildProcedural() {
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

  const wing = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.2), accentMat);
  wing.position.z = 0.8;
  ship.add(wing);

  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 1.0), accentMat);
  fin.position.set(0, 0.5, 1.2);
  ship.add(fin);

  const exhaust = buildExhaust();
  ship.add(exhaust);
  return attachUpdate(ship, exhaust);
}

function normalizeModel(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 5 / maxDim;
  root.position.sub(center.multiplyScalar(scale));
  root.scale.setScalar(scale);

  const wrapper = new THREE.Group();
  wrapper.add(root);

  const back = (box.max.z - center.z / scale) * scale;
  const exhaust = buildExhaust();
  exhaust.position.z = Math.max(1.5, back);
  wrapper.add(exhaust);
  return attachUpdate(wrapper, exhaust);
}

export function loadShip() {
  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        resolve(normalizeModel(gltf.scene));
      },
      undefined,
      () => {
        resolve(buildProcedural());
      }
    );
  });
}
