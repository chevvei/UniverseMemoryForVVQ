import { describe, it, expect } from 'vitest';
import { validateMemories } from '../src/data/loader.js';
import data from '../src/data/memories.json';

describe('validateMemories', () => {
  it('示例数据通过校验', () => {
    expect(() => validateMemories(data)).not.toThrow();
  });
  it('缺 site 抛错', () => {
    expect(() => validateMemories({ planets: [], points: [] })).toThrow();
  });
  it('行星缺 id 抛错', () => {
    const bad = { site: { title: 't', subtitle: 's' },
      planets: [{ name: 'x', orbit: { dist: 1, speed: 1 }, appearance: { color: '#fff', glow: '#fff', size: 1, ring: false }, cards: [] }],
      points: [] };
    expect(() => validateMemories(bad)).toThrow();
  });
  it('卡片类型非法抛错', () => {
    const bad = { site: { title: 't', subtitle: 's' },
      planets: [{ id: 'a', name: 'x', owner: 'cv', orbit: { dist: 1, speed: 1 }, appearance: { color: '#fff', glow: '#fff', size: 1, ring: false }, cards: [{ type: 'audio' }] }],
      points: [] };
    expect(() => validateMemories(bad)).toThrow();
  });
});
