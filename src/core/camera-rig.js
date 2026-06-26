import * as THREE from 'three';
import { easeInOutCubic } from './easing.js';

export function createCameraRig(camera) {
  let active = false;
  let t = 0;
  let dur = 1.6;
  const fromPos = new THREE.Vector3();
  const fromQuat = new THREE.Quaternion();
  const toPos = new THREE.Vector3();
  const toQuat = new THREE.Quaternion();
  let onArrive = null;
  const _m = new THREE.Matrix4();
  const _up = new THREE.Vector3(0, 1, 0);

  function flyTo(targetWorldPos, distance, callback, duration = 1.6) {
    fromPos.copy(camera.position);
    fromQuat.copy(camera.quaternion);
    const dir = new THREE.Vector3().subVectors(camera.position, targetWorldPos).normalize();
    if (dir.lengthSq() < 1e-6) dir.set(0, 0.3, 1).normalize();
    toPos.copy(targetWorldPos).addScaledVector(dir, distance).add(new THREE.Vector3(0, distance * 0.25, 0));
    _m.lookAt(toPos, targetWorldPos, _up);
    toQuat.setFromRotationMatrix(_m);
    onArrive = callback;
    dur = duration; t = 0; active = true;
  }

  function returnTo(targetPos, targetQuat, callback, duration = 1.4) {
    fromPos.copy(camera.position);
    fromQuat.copy(camera.quaternion);
    toPos.copy(targetPos);
    toQuat.copy(targetQuat);
    onArrive = callback;
    dur = duration; t = 0; active = true;
  }

  function update(dt) {
    if (!active) return false;
    t += dt / dur;
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(fromPos, toPos, e);
    camera.quaternion.slerpQuaternions(fromQuat, toQuat, e);
    if (t >= 1) {
      active = false;
      const cb = onArrive; onArrive = null;
      if (cb) cb();
    }
    return true;
  }

  function isActive() { return active; }

  return { flyTo, returnTo, update, isActive };
}
