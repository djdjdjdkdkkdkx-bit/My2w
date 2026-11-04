'use strict';
/* ===== Ember Keep, Seagrot, Hidden Grove ===== */
function buildKeep() {
  const m = blank(40, 36, T.BWALL, T.KFLOOR, 'keep', 'keep', .6); m.nice = 'The Ember Keep';
  carve(m, 2, 26, 10, 33); corr(m, 8, 29, 16, 29); carve(m, 14, 24, 24, 33);
  corr(m, 20, 24, 20, 16); carve(m, 12, 8, 28, 18);
  corr(m, 14, 12, 14, 6); carve(m, 10, 2, 30, 8);  // throne hall
  corr(m, 26, 14, 34, 14); carve(m, 30, 8, 38, 20); // armory wing
  // lava strips
  for (let x = 13; x < 28; x++) setT(m, x, 20, T.LAVA);
  for (let y = 24; y < 32; y++) setT(m, 25, y, T.LAVA);
  for (let i = 0; i < 8; i++) setT(m, U.irnd(4, 36), U.irnd(4, 32), T.GLOW);
  deco(m, 'arch', 20, 15, 6); deco(m, 'skull', 12, 26, 0); deco(m, 'tablet', 30, 16, 0);
  tag(m, 30, 16, { type: 'sign', d: 'tablet' });
  const p = (x, y, map, tx, ty, o) => tag(m, x, y, Object.assign({ type: 'portal', map, tx, ty }, o));
  p(3, 33, 'world', 186, 46, { auto: true });
  const chest = (x, y, c) => tag(m, x, y, { type: 'chest', c });
  chest(36, 10, { items: [['shard', 1], ['a:keep', 1]] }); // armory: shard + keep plate
  chest(16, 6, { coins: 80, items: [['pot_l', 2]] });
  // throne & heart
  deco(m, 'bed', 19, 4, 0); // throne bench visual
  tag(m, 20, 5, { type: 'boss', boss: 'marshal' });
  tag(m, 20, 2, { type: 'heart' });
  m.zones = [{ x0: 2, y0: 2, x1: 38, y1: 34, mobs: ['guard', 'wraith', 'golem'], cap: 8, w: ['guard', 'guard', 'wraith', 'golem'] }];
}
function buildGrot() {
  const m = blank(26, 22, T.CWALL, T.CFLOOR, 'grot', 'cave', .6); m.nice = 'The Seagrot';
  carve(m, 8, 14, 18, 20); corr(m, 12, 14, 12, 8); carve(m, 6, 4, 20, 10);
  fillR(m, 4, 2, 22, 3, T.WATER); fillR(m, 2, 6, 5, 12, T.WATER); fillR(m, 21, 6, 24, 12, T.DEEP);
  deco(m, 'boat', 14, 16, 2); deco(m, 'reed', 16, 19, 2);
  for (let i = 0; i < 6; i++) setT(m, U.irnd(8, 20), U.irnd(4, 18), T.GLOW);
  const chest = (x, y, c) => tag(m, x, y, { type: 'chest', c });
  chest(18, 6, { items: [['shard', 1]], coins: 55 });
  chest(8, 8, { coins: 25, items: [['pot_l', 1]] });
  const p = (x, y, map, tx, ty, o) => tag(m, x, y, Object.assign({ type: 'portal', map, tx, ty }, o));
  p(12, 19, 'world', 108, 128, { auto: true });
  m.zones = [{ x0: 2, y0: 2, x1: 24, y1: 20, mobs: ['bat', 'wraith'], cap: 4, w: ['bat', 'bat', 'wraith'] }];
}
function buildGrove() {
  const m = blank(30, 26, T.BWALL, T.GRASS, 'grove', 'grove', .12); m.nice = 'The Hidden Grove';
  carve(m, 4, 4, 26, 22, T.GRASS);
  for (let y = 4; y < 23; y++) for (let x = 4; x < 27; x++) { const n = U.fbm(x, y, 71, 2); if (n > .6) setT(m, x, y, T.FLOWER); }
  for (let i = 0; i < 10; i++) deco(m, 'pine', U.irnd(5, 25), U.irnd(5, 22), 10);
  for (let i = 0; i < 6; i++) deco(m, 'flowerB', U.irnd(5, 25), U.irnd(6, 21), 0);
  deco(m, 'shrine', 15, 9, 8); tag(m, 15, 10, { type: 'shrine' });
  tag(m, 18, 12, { type: 'npc', k: 'hermit', d: 'hermit' });
  const chest = (x, y, c) => tag(m, x, y, { type: 'chest', c });
  chest(10, 6, { items: [['shard', 1], ['elixir', 1]], coins: 40 });
  const p = (x, y, map, tx, ty, o) => tag(m, x, y, Object.assign({ type: 'portal', map, tx, ty }, o));
  p(15, 22, 'world', 49, 75, { auto: true });
  m.zones = [];
}
function mapNice(k) { const m = MAPS[k]; return m && m.nice ? m.nice : (k === 'world' ? 'The Wilds' : k); }
function solidAt(map, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= map.w || ty >= map.h) return true;
  const t = map.t[ty * map.w + tx]; return SOLID.has(t);
}
function tileAt(map, tx, ty) { if (tx < 0 || ty < 0 || tx >= map.w || ty >= map.h) return T.CLIFF; return map.t[ty * map.w + tx]; }
