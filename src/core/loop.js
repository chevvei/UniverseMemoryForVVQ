export function createLoop(composer) {
  const updaters = [];
  let clock = 0;
  function add(fn) { updaters.push(fn); }
  function start() {
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      for (const fn of updaters) fn(clock, dt);
      composer.render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  return { add, start };
}
