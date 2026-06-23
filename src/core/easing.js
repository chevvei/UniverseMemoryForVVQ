export function clamp01(t) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function easeInOutCubic(t) {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
