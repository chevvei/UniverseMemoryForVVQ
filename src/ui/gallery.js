import * as THREE from 'three';
import { arcPositions } from './gallery-layout.js';
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

  function open(planetData, centerWorld) {
    clear();
    group.position.copy(centerWorld);
    const items = planetData.cards;
    const positions = arcPositions(items.length, 26, Math.PI * 0.9);
    for (let i = 0; i < items.length; i++) {
      const card = items[i];
      let tex;
      if (card.type === 'text') {
        tex = textCard(card, planetData.owner);
      } else if (card.type === 'image') {
        tex = loader.load(card.src);
      } else if (card.type === 'video') {
        const v = document.createElement('video');
        v.src = card.src; v.loop = true; v.muted = true; v.playsInline = true; v.autoplay = true;
        v.play().catch(() => {});
        videoEls.push(v);
        tex = new THREE.VideoTexture(v);
      }
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(11, 7.3), mat);
      const p = positions[i];
      mesh.position.set(p.x, p.y + Math.sin(i) * 1.5, p.z);
      mesh.lookAt(0, mesh.position.y, 0);
      mesh.userData.cardIndex = i;
      mesh.userData.baseScale = 1;
      group.add(mesh);
      cards.push({ mesh, base: mesh.position.clone(), focus: false });
    }
    group.visible = true;
    opening = true; animT = 0; isOpen = true;
  }

  function focusCard(index) {
    for (const c of cards) c.focus = false;
    if (index >= 0 && cards[index]) cards[index].focus = true;
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
    for (const c of cards) {
      const target = c.focus ? 1.6 : 1;
      const s = c.mesh.scale.x + (target - c.mesh.scale.x) * Math.min(1, dt * 6);
      c.mesh.scale.set(s, s, s);
      c.mesh.position.y = c.base.y + Math.sin(t * 0.8 + c.base.x) * 0.4;
    }
  }

  return { open, close, focusCard, getMeshes, update, isOpen: () => isOpen };
}
