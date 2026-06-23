import { describe, it, expect } from 'vitest';
import { easeInOutCubic, clamp01 } from '../src/core/easing.js';

describe('easing', () => {
  it('clamp01 限制到 [0,1]', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.3)).toBe(0.3);
    expect(clamp01(2)).toBe(1);
  });
  it('easeInOutCubic 端点', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
  });
  it('easeInOutCubic 中点为 0.5', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
  });
});
