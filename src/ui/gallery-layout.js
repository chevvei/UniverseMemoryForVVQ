export function arcPositions(count, radius, span) {
  const out = [];
  if (count <= 0) return out;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = (t - 0.5) * span;
    out.push({
      x: Math.sin(angle) * radius,
      y: 0,
      z: -Math.cos(angle) * radius
    });
  }
  return out;
}

export function ringPositions(count, radius) {
  const out = [];
  if (count <= 0) return out;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    out.push({
      x: Math.sin(angle) * radius,
      y: 0,
      z: Math.cos(angle) * radius,
      angle
    });
  }
  return out;
}
