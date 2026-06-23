import * as THREE from 'three';

const _v = new THREE.Vector3();

export function createTagLayer(container) {
  const layer = document.createElement('div');
  layer.style.position = 'fixed';
  layer.style.inset = '0';
  layer.style.pointerEvents = 'none';
  layer.style.zIndex = '5';
  container.appendChild(layer);

  const tags = [];

  function add(text, className) {
    const el = document.createElement('div');
    el.className = 'tag ' + className;
    el.textContent = text;
    layer.appendChild(el);
    return el;
  }

  function bind(object3d, text, className, yOff = 0) {
    const el = add(text, className);
    tags.push({ object: object3d, el, yOff });
    return el;
  }

  function update(camera) {
    for (const tag of tags) {
      tag.object.getWorldPosition(_v);
      _v.y += tag.yOff;
      const inFront = _v.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())) > 0;
      _v.project(camera);
      if (!inFront || _v.z > 1) { tag.el.style.opacity = '0'; continue; }
      const x = (_v.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-_v.y * 0.5 + 0.5) * window.innerHeight;
      tag.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      tag.el.style.opacity = '0.9';
    }
  }

  return { bind, update };
}
