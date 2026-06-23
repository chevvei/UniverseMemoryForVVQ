export function createNav(container) {
  const nav = document.createElement('div');
  nav.className = 'nav';
  nav.innerHTML = `
    <button class="back-btn" data-back>← 返回宇宙</button>
    <button data-view>视角</button>
    <button data-hud>HUD</button>
  `;
  container.appendChild(nav);

  const touch = document.createElement('div');
  touch.className = 'touch-ctrl';
  touch.innerHTML = `
    <div class="joystick" data-joy><div class="knob" data-knob></div></div>
    <div class="throttle-btn" data-throttle>推进</div>
  `;
  container.appendChild(touch);

  const hint = document.createElement('div');
  hint.className = 'card-hint';
  hint.textContent = '点击卡片放大 · 点击星球进入';
  container.appendChild(hint);

  return {
    nav,
    backBtn: nav.querySelector('[data-back]'),
    viewBtn: nav.querySelector('[data-view]'),
    hudBtn: nav.querySelector('[data-hud]'),
    joy: touch.querySelector('[data-joy]'),
    knob: touch.querySelector('[data-knob]'),
    throttle: touch.querySelector('[data-throttle]'),
    hint,
    setInPlanet(v) { nav.classList.toggle('in-planet', v); },
    setHint(text) { hint.textContent = text; }
  };
}

export function createLoading(container) {
  const el = document.createElement('div');
  el.className = 'loading';
  el.innerHTML = `<div>UNIVERSE MEMORY · cv · qq</div><div class="bar"><i></i></div><div>进入记忆星系…</div>`;
  container.appendChild(el);
  return { hide() { el.classList.add('hidden'); setTimeout(() => el.remove(), 700); } };
}
