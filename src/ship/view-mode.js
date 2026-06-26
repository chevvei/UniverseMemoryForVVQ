import * as THREE from 'three';

export const VIEW = { CHASE: 'chase', COCKPIT: 'cockpit' };

export function createViewMode(shipObject, camera) {
  let mode = VIEW.CHASE;
  const tmpPos = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();
  const offChase = new THREE.Vector3(0, 3.2, 11);
  const offCockpit = new THREE.Vector3(0, 0.7, -0.4);

  function toggle() {
    mode = mode === VIEW.CHASE ? VIEW.COCKPIT : VIEW.CHASE;
    return mode;
  }
  function get() { return mode; }

  function update(dt) {
    const off = mode === VIEW.CHASE ? offChase : offCockpit;
    tmpPos.copy(off).applyQuaternion(shipObject.quaternion).add(shipObject.position);
    camera.position.lerp(tmpPos, Math.min(1, dt * 6));

    const lookAhead = mode === VIEW.CHASE ? 8 : 30;
    tmpLook.set(0, mode === VIEW.CHASE ? 1.5 : 0.5, -lookAhead)
      .applyQuaternion(shipObject.quaternion).add(shipObject.position);
    camera.lookAt(tmpLook);
  }

  return { update, toggle, get };
}
