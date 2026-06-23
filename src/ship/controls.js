import * as THREE from 'three';
import { SHIP, WORLD } from '../config.js';
import { softClampToSphere } from './bounds.js';

export function createShipControls(shipObject, domElement) {
  const keys = {};
  let pointerDown = false;
  let px = 0, py = 0;
  let yawInput = 0, pitchInput = 0;
  let touchThrottle = 0;
  let joyX = 0, joyY = 0;
  let enabled = true;

  const velocity = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const quat = shipObject.quaternion;

  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  domElement.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, .nav, .joystick, .throttle-btn')) return;
    pointerDown = true; px = e.clientX; py = e.clientY;
  });
  window.addEventListener('pointerup', () => { pointerDown = false; });
  window.addEventListener('pointermove', (e) => {
    if (!pointerDown) return;
    yawInput = -(e.clientX - px) * 0.002;
    pitchInput = -(e.clientY - py) * 0.002;
    px = e.clientX; py = e.clientY;
  });

  function bindJoystick(joyEl, knobEl) {
    let active = false, cx = 0, cy = 0;
    joyEl.addEventListener('pointerdown', (e) => {
      active = true; const r = joyEl.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      joyEl.setPointerCapture(e.pointerId);
    });
    joyEl.addEventListener('pointermove', (e) => {
      if (!active) return;
      let dx = (e.clientX - cx) / 50, dy = (e.clientY - cy) / 50;
      const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
      joyX = dx; joyY = dy;
      knobEl.style.transform = `translate(${dx * 32}px, ${dy * 32}px)`;
    });
    const end = () => { active = false; joyX = 0; joyY = 0; knobEl.style.transform = 'translate(0,0)'; };
    joyEl.addEventListener('pointerup', end);
    joyEl.addEventListener('pointercancel', end);
  }

  function bindThrottle(btnEl) {
    const on = () => { touchThrottle = 1; };
    const off = () => { touchThrottle = 0; };
    btnEl.addEventListener('pointerdown', on);
    btnEl.addEventListener('pointerup', off);
    btnEl.addEventListener('pointercancel', off);
  }

  function setEnabled(v) { enabled = v; if (!v) { velocity.multiplyScalar(0.5); } }

  function update(dt) {
    if (!enabled) return 0;
    const k = Math.min(2, dt * 60);
    let yaw = yawInput, pitch = pitchInput;
    if (keys['KeyA']) yaw += SHIP.turnRate * k;
    if (keys['KeyD']) yaw -= SHIP.turnRate * k;
    if (keys['ArrowUp']) pitch += SHIP.turnRate * k;
    if (keys['ArrowDown']) pitch -= SHIP.turnRate * k;
    yaw += -joyX * SHIP.turnRate * 1.5;
    pitch += -joyY * SHIP.turnRate * 1.5;

    const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
    quat.multiply(qy).multiply(qx);
    yawInput *= 0.6; pitchInput *= 0.6;

    let throttle = touchThrottle;
    if (keys['KeyW']) throttle = 1;
    if (keys['KeyS']) throttle = -0.5;
    if (Math.abs(joyY) > 0.1 && touchThrottle === 0) throttle = Math.max(throttle, 0.4);

    forward.set(0, 0, -1).applyQuaternion(quat);
    velocity.addScaledVector(forward, throttle * SHIP.accel);
    if (velocity.length() > SHIP.maxSpeed) velocity.setLength(SHIP.maxSpeed);
    velocity.multiplyScalar(0.985);

    shipObject.position.add(velocity);
    const clamped = softClampToSphere(shipObject.position, WORLD.boundRadius, 0.25);
    shipObject.position.set(clamped.x, clamped.y, clamped.z);

    return Math.max(0, Math.min(1, Math.abs(throttle)));
  }

  return { update, bindJoystick, bindThrottle, setEnabled, velocity };
}
