export function createNav(container) {
  const nav = document.createElement('div');
  nav.className = 'nav';
  nav.innerHTML = `
    <button class="back-btn" data-back>← 返回宇宙</button>
    <button class="upload-btn" data-upload>＋ 上传</button>
    <button data-mute>♪</button>
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
    uploadBtn: nav.querySelector('[data-upload]'),
    muteBtn: nav.querySelector('[data-mute]'),
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
  el.innerHTML = `
    <div class="loading-title">UNIVERSE MEMORY · cv · qq</div>
    <div class="bar"><i></i></div>
    <div class="loading-sub" data-sub>正在点亮记忆星系…</div>
    <button class="enter-btn" data-enter hidden>进 入 宇 宙</button>
  `;
  container.appendChild(el);
  const enterBtn = el.querySelector('[data-enter]');
  const sub = el.querySelector('[data-sub]');
  let entered = false;

  function ready() {
    sub.textContent = '星系已点亮，开启这段旅程 ♪';
    enterBtn.hidden = false;
  }
  function onEnter(cb) {
    enterBtn.addEventListener('click', () => {
      if (entered) return;
      entered = true;
      cb();
      el.classList.add('hidden');
      setTimeout(() => el.remove(), 700);
    });
  }
  return { ready, onEnter };
}
