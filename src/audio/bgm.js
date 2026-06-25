const BGM_URL = './audio/bgm.mp3';

export function createBgm() {
  const audio = document.createElement('audio');
  audio.src = BGM_URL;
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  audio.setAttribute('playsinline', '');
  document.body.appendChild(audio);

  let fadeId = 0;
  let targetVol = 0.55;
  let muted = false;

  function fadeTo(to, ms) {
    cancelAnimationFrame(fadeId);
    const from = audio.volume;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms);
      audio.volume = from + (to - from) * k;
      if (k < 1) fadeId = requestAnimationFrame(step);
    };
    fadeId = requestAnimationFrame(step);
  }

  function play() {
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
    fadeTo(muted ? 0 : targetVol, 2600);
  }

  function stop() {
    fadeTo(0, 800);
    setTimeout(() => audio.pause(), 800);
  }

  function toggleMute() {
    muted = !muted;
    fadeTo(muted ? 0 : targetVol, 600);
    return muted;
  }

  return { play, stop, toggleMute, audio };
}
