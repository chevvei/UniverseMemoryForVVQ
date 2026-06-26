import * as THREE from 'three';
import { ringPositions } from './gallery-layout.js';
import { easeInOutCubic } from '../core/easing.js';

const loader = new THREE.TextureLoader();

function textCard(card, owner) {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 340;
  const ctx = cv.getContext('2d');
  const accent = owner === 'cv' ? '#7fd4ff' : '#ff9ec4';
  ctx.fillStyle = 'rgba(8,14,30,0.92)';
  ctx.fillRect(0, 0, 512, 340);
  ctx.strokeStyle = accent; ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 496, 324);
  ctx.fillStyle = accent;
  ctx.font = '600 34px "PingFang SC", sans-serif';
  ctx.fillText(card.title || '', 36, 80);
  ctx.fillStyle = '#dbeeff';
  ctx.font = '24px "PingFang SC", sans-serif';
  wrap(ctx, card.body || '', 36, 140, 440, 34);
  if (card.date) {
    ctx.fillStyle = 'rgba(190,210,255,0.6)';
    ctx.font = '20px monospace';
    ctx.fillText(card.date, 36, 300);
  }
  return new THREE.CanvasTexture(cv);
}

function wrap(ctx, text, x, y, maxW, lh) {
  const chars = text.split('');
  let line = '', yy = y;
  for (const ch of chars) {
    if (ctx.measureText(line + ch).width > maxW) { ctx.fillText(line, x, yy); line = ch; yy += lh; }
    else line += ch;
  }
  ctx.fillText(line, x, yy);
}

export function createGallery(scene) {
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);
  const cards = [];
  let opening = false, animT = 0, isOpen = false;
  const videoEls = [];
  let spin = 0;
  let paused = false;
  const RING_RADIUS = 26;
  const SPIN_SPEED = 0.105;
  const FRONT_ANGLE = 0;

  function clear() {
    for (const c of cards) {
      group.remove(c.mesh);
      c.mesh.material.map?.dispose();
      c.mesh.material.dispose();
    }
    cards.length = 0;
    for (const v of videoEls) { v.pause(); v.src = ''; }
    videoEls.length = 0;
  }

  let owner = 'cv';

  function makeTexture(card) {
    if (card.type === 'image') return loader.load(card.src);
    if (card.type === 'video') {
      const v = document.createElement('video');
      v.src = card.src; v.loop = true; v.muted = true; v.playsInline = true; v.autoplay = true;
      v.play().catch(() => {});
      videoEls.push(v);
      return new THREE.VideoTexture(v);
    }
    return textCard(card, owner);
  }

  function layout() {
    const positions = ringPositions(cards.length, RING_RADIUS);
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const p = positions[i];
      c.mesh.position.set(p.x, 0, p.z);
      c.mesh.lookAt(0, 0, 0);
      c.mesh.userData.cardIndex = i;
      c.baseAngle = p.angle;
      c.base.copy(c.mesh.position);
    }
  }

  function addCard(card) {
    const tex = makeTexture(card);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(11, 7.3), mat);
    mesh.userData.baseScale = 1;
    group.add(mesh);
    cards.push({ mesh, base: new THREE.Vector3(), baseAngle: 0, focus: false });
    layout();
    return cards.length - 1;
  }

  function open(planetData, centerWorld) {
    clear();
    owner = planetData.owner;
    group.position.copy(centerWorld);
    for (const card of planetData.cards) addCard(card);
    group.scale.setScalar(0.2);
    group.rotation.y = 0;
    spin = 0; paused = false;
    group.visible = true;
    opening = true; animT = 0; isOpen = true;
  }

  function frontIndex() {
    if (!cards.length) return -1;
    let best = -1, bestD = Infinity;
    for (let i = 0; i < cards.length; i++) {
      let a = (cards[i].baseAngle + spin) % (Math.PI * 2);
      let d = Math.abs(((a - FRONT_ANGLE + Math.PI) % (Math.PI * 2)) - Math.PI);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function focusCard(index) {
    const c = cards[index];
    if (index < 0 || !c) return null;
    paused = true;
    spin = FRONT_ANGLE - c.baseAngle;
    for (const cc of cards) cc.focus = false;
    c.focus = true;
    return { index };
  }

  function resume() {
    paused = false;
    for (const c of cards) c.focus = false;
  }

  function close() {
    isOpen = false; group.visible = false; clear();
  }

  function getMeshes() { return cards.map((c) => c.mesh); }

  function update(t, dt) {
    if (!group.visible) return;
    if (opening) {
      animT += dt / 0.9;
      const e = easeInOutCubic(animT);
      group.scale.setScalar(0.2 + e * 0.8);
      if (animT >= 1) opening = false;
    }
    if (!paused && !opening) spin += SPIN_SPEED * dt;
    let r = group.rotation.y;
    let diff = spin - r;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    group.rotation.y = r + diff * Math.min(1, dt * 5);

    const front = paused ? cards.findIndex((c) => c.focus) : frontIndex();
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const highlight = i === front;
      const target = highlight ? (paused ? 1.7 : 1.25) : 1;
      const s = c.mesh.scale.x + (target - c.mesh.scale.x) * Math.min(1, dt * 6);
      c.mesh.scale.set(s, s, s);
      const targetOp = highlight ? 1 : 0.45;
      const m = c.mesh.material;
      m.opacity = m.opacity + (targetOp - m.opacity) * Math.min(1, dt * 6);
      c.mesh.position.y = c.base.y + Math.sin(t * 0.6 + c.baseAngle) * 0.5;
    }
  }

  return { open, close, focusCard, resume, getMeshes, addCard, update, isOpen: () => isOpen };
}
