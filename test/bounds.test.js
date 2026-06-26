import { describe, it, expect } from 'vitest';
import { softClampToSphere } from '../src/ship/bounds.js';

describe('softClampToSphere', () => {
  it('球内不变', () => {
    const p = { x: 10, y: 0, z: 0 };
    const r = softClampToSphere(p, 100, 0.1);
    expect(r).toEqual({ x: 10, y: 0, z: 0 });
  });
  it('球外向内拉回', () => {
    const p = { x: 200, y: 0, z: 0 };
    const r = softClampToSphere(p, 100, 0.5);
    expect(r.x).toBeLessThan(200);
    expect(r.x).toBeGreaterThan(100);
  });
});
