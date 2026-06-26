import { fitSize, checkVideoSize, classifyFile, LIMITS } from './compress-core.js';

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ img, url }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')); };
    img.src = url;
  });
}

export async function compressImage(file) {
  const { img, url } = await loadImage(file);
  const size = fitSize(img.naturalWidth, img.naturalHeight, LIMITS.imageMaxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size.width, size.height);
  URL.revokeObjectURL(url);
  const dataUrl = canvas.toDataURL('image/jpeg', LIMITS.imageQuality);
  return { type: 'image', src: dataUrl, width: size.width, height: size.height };
}

export function prepareVideo(file) {
  const check = checkVideoSize(file.size);
  if (!check.ok) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(`视频 ${mb}MB 超过 25MB 上限，请压缩后再上传`);
  }
  const src = URL.createObjectURL(file);
  return { type: 'video', src };
}

export async function processFile(file) {
  const kind = classifyFile(file.type);
  if (kind === 'image') return compressImage(file);
  if (kind === 'video') return prepareVideo(file);
  throw new Error('仅支持图片或视频');
}
