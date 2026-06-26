export const HUD_STYLE = { SOFT: 'hud-soft', TECH: 'hud-tech' };

export function createHud(container, site) {
  const hud = document.createElement('div');
  hud.className = 'hud hud-soft';
  hud.innerHTML = `
    <div class="hud-frame"></div>
    <div class="hud-target">— 自由航行 —</div>
    <div class="hud-owners"><span class="cv">cv</span> · <span class="qq">qq</span></div>
    <div class="hud-stats">
      <div>SPD <span data-spd>0.00</span></div>
      <div>SECTOR ${site.subtitle}</div>
    </div>
  `;
  container.appendChild(hud);
  const target = hud.querySelector('.hud-target');
  const spd = hud.querySelector('[data-spd]');

  function setStyle(style) {
    hud.className = 'hud ' + style;
  }
  function toggleStyle() {
    const next = hud.classList.contains('hud-soft') ? HUD_STYLE.TECH : HUD_STYLE.SOFT;
    setStyle(next);
    return next;
  }
  function setTarget(text) { target.textContent = text; }
  function setSpeed(v) { if (spd) spd.textContent = v.toFixed(2); }

  return { setStyle, toggleStyle, setTarget, setSpeed };
}
