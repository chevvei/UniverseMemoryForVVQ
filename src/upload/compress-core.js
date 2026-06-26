export const LIMITS = {
  imageMaxEdge: 1600,
  imageQuality: 0.8,
  videoMaxBytes: 25 * 1024 * 1024
};

export function fitSize(width, height, maxEdge) {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width: Math.round(width), height: Math.round(height) };
  const k = maxEdge / longest;
  return { width: Math.round(width * k), height: Math.round(height * k) };
}

export function checkVideoSize(bytes, maxBytes = LIMITS.videoMaxBytes) {
  return { ok: bytes <= maxBytes, bytes, maxBytes };
}

export function classifyFile(type) {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'unknown';
}
