export function softClampToSphere(pos, radius, strength) {
  const d = Math.hypot(pos.x, pos.y, pos.z);
  if (d <= radius || d === 0) return { x: pos.x, y: pos.y, z: pos.z };
  const over = d - radius;
  const pull = over * strength;
  const k = (d - pull) / d;
  return { x: pos.x * k, y: pos.y * k, z: pos.z * k };
}
