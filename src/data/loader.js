import raw from './memories.json';

const CARD_TYPES = ['image', 'video', 'text'];

export function validateMemories(data) {
  if (!data || typeof data !== 'object') throw new Error('memories: 根必须是对象');
  if (!data.site || !data.site.title || !data.site.subtitle) throw new Error('memories: 缺 site.title/subtitle');
  if (!Array.isArray(data.planets)) throw new Error('memories: planets 必须是数组');
  if (!Array.isArray(data.points)) throw new Error('memories: points 必须是数组');
  for (const p of data.planets) {
    if (!p.id || !p.name || !p.owner) throw new Error('memories: 行星缺 id/name/owner');
    if (!p.orbit || typeof p.orbit.dist !== 'number' || typeof p.orbit.speed !== 'number') throw new Error(`memories: 行星 ${p.id} orbit 非法`);
    const a = p.appearance;
    if (!a || typeof a.size !== 'number' || typeof a.ring !== 'boolean') throw new Error(`memories: 行星 ${p.id} appearance 非法`);
    if (!Array.isArray(p.cards)) throw new Error(`memories: 行星 ${p.id} cards 必须是数组`);
    for (const c of p.cards) {
      if (!CARD_TYPES.includes(c.type)) throw new Error(`memories: 行星 ${p.id} 卡片类型非法 ${c.type}`);
    }
  }
  for (const pt of data.points) {
    if (!pt.id || !pt.name || !Array.isArray(pt.pos) || pt.pos.length !== 3) throw new Error('memories: 点位非法');
  }
  return data;
}

export function loadMemories() {
  return validateMemories(raw);
}
