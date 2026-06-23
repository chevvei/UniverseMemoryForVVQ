import { describe, it, expect } from 'vitest';
import { arcPositions } from '../src/ui/gallery-layout.js';

describe('arcPositions', () => {
  it('数量匹配', () => {
    const ps = arcPositions(4, 20, Math.PI / 2);
    expect(ps.length).toBe(4);
  });
  it('每个点都有 x/y/z 数值', () => {
    const ps = arcPositions(3, 20, Math.PI / 2);
    for (const p of ps) {
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(typeof p.z).toBe('number');
    }
  });
  it('单卡居中（角度跨度内对称）', () => {
    const ps = arcPositions(1, 20, Math.PI / 2);
    expect(ps[0].x).toBeCloseTo(0, 5);
  });
});
