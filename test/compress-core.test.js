import { describe, it, expect } from 'vitest';
import { fitSize, checkVideoSize, classifyFile, LIMITS } from '../src/upload/compress-core.js';

describe('fitSize', () => {
  it('小于上限保持原尺寸', () => {
    expect(fitSize(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
  it('超出上限按长边等比缩放', () => {
    const r = fitSize(3200, 1600, 1600);
    expect(r.width).toBe(1600);
    expect(r.height).toBe(800);
  });
  it('非法尺寸返回 0', () => {
    expect(fitSize(0, 0, 1600)).toEqual({ width: 0, height: 0 });
  });
});

describe('checkVideoSize', () => {
  it('未超限 ok', () => {
    expect(checkVideoSize(1024).ok).toBe(true);
  });
  it('超限不 ok', () => {
    expect(checkVideoSize(LIMITS.videoMaxBytes + 1).ok).toBe(false);
  });
});

describe('classifyFile', () => {
  it('识别图片/视频/未知', () => {
    expect(classifyFile('image/png')).toBe('image');
    expect(classifyFile('video/mp4')).toBe('video');
    expect(classifyFile('text/plain')).toBe('unknown');
  });
});
