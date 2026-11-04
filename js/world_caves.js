'use strict';
/* ===== dungeon maps ===== */
function blank(w, h, wallT, floorT, name, music, dark) {
  const m = { w, h, t: new Uint8Array(w * h), decos: [], tags: {}, zones: [], name, music, dark: dark || 0 };
  m.t.fill(wallT); MAPS[name] = m; return m;
}
function carve(m, x0, y0, x1, y1, t) { fillR(m, x0, y0, x1, y1, t === undefined ? T.CFLOOR : t); }
function corr(m, x0, y0, x1, y1, t) { let x = x0, y = y0; setT(m, x, y, t || T.CFLOOR);
  while (x !== x1) { x += Math.sign(x1 - x); setT(m, x, y, t || T.CFLOOR); setT(m, x, y + 1, t || T.CFLOOR); }
  while (y !== y1) { y += Math.sign(y1 - y); setT(m, x, y, t || T.CFLOOR); setT(m, x + 1, y, t || T.CFLOOR); } }
function buildCave1() {
  const m = blank(46, 34, T.CWALL, T.CFLOOR, 'cave1', 'cave', .82); m.nice = 'Barrow Cave';
  carve(m, 18, 24, 28, 31); corr(m, 26, 27, 36, 27); carve(m, 32, 20, 42, 27);
  corr(m, 36, 20, 36, 10); carve(m, 30, 6, 42, 12);
  carve(m, 12, 20, 18, 27); corr(m, 14, 20, 14, 14); carve(m, 8, 8, 18, 14);
  // secret alcove behind cracked wall
  carve(m, 4, 6, 8, 10); setT(m, 9, 8, T.CRACK);
  for (let i = 0; i < 8; i++) setT(m, U.irnd(20, 40), U.irnd(8, 26), T.GLOW);
  deco(m, 'stump', 20, 25, 0); deco(m, 'skull', 34, 22, 0); deco(m, 'moss', 30, 9, 0);
  const p = (x, y, map, tx, ty, o) => tag(m, x, y, Object.assign({ type: 'portal', map, tx, ty }, o));
  p(23, 31, 'world', 78, 32, { auto: true });
  p(42, 8, 'cave2', 5, 5, { auto: true, req: () => G.chapter >= 3, reqMsg: 'A shaft breathes up from far below. The dark says: not yet. (Finish the desert first.)' });
  const chest = (x, y, c) => tag(m, x, y, { type: 'chest', c });
  chest(40, 22, { items: [['childs_lantern', 1]], coins: 10 });   // quest lantern
  chest(6, 7, { items: [['shard', 1]], coins: 40 });              // secret alcove shard
  chest(34, 9, { coins: 30, items: [['pot_l', 1]] });
  tag(m, 12, 9, { type: 'trig', id: 'crack', cond: () => false }); // (crack is a tile, handled by attack)
  m.zones = [{ x0: 2, y0: 2, x1: 44, y1: 32, mobs: ['crawler', 'bat', 'golem'], cap: 7, w: ['crawler', 'bat', 'crawler', 'golem'] }];
}
function buildCave2() {
  const m = blank(44, 42, T.CWALL, T.CFLOOR, 'cave2', 'cave', .88); m.nice = 'The Deep Hollow';
  carve(m, 2, 2, 12, 8); corr(m, 10, 5, 18, 5); carve(m, 16, 2, 26, 10);
  corr(m, 24, 8, 24, 18); carve(m, 18, 16, 30, 22); corr(m, 28, 20, 34, 20);
  carve(m, 30, 14, 40, 24); corr(m, 12, 20, 12, 28); carve(m, 6, 26, 18, 34);
  corr(m, 16, 32, 24, 32); carve(m, 22, 26, 32, 38);
  // pools
  fillR(m, 20, 18, 24, 21, T.WATER); fillR(m, 8, 28, 12, 32, T.DEEP);
  for (let i = 0; i < 10; i++) setT(m, U.irnd(4, 40), U.irnd(4, 38), T.GLOW);
  deco(m, 'tablet', 10, 18, 0); tag(m, 10, 18, { type: 'sign', d: 'tablet' });
  deco(m, 'skull', 26, 30, 0); deco(m, 'stump', 8, 6, 0);
  // sinkhole + shard chest
  deco(m, 'sink', 34, 34, 4); const chest = (x, y, c) => tag(m, x, y, { type: 'chest', c });
  chest(34, 34, { items: [['shard', 1]], coins: 50 });
  chest(8, 30, { coins: 35, items: [['pot_l', 1], ['moss', 1]] });
  // arena
  carve(m, 14, 26, 26, 36);
  for (let a = 0; a < TAU; a += .15) { const x = Math.round(20 + Math.cos(a) * 6), y = Math.round(31 + Math.sin(a) * 6); setT(m, x, y, T.CFLOOR); }
  tag(m, 20, 31, { type: 'boss', boss: 'deepking' });
  const p = (x, y, map, tx, ty, o) => tag(m, x, y, Object.assign({ type: 'portal', map, tx, ty }, o));
  p(3, 3, 'cave1', 41, 9, { auto: true });
  p(24, 28, 'keep', 4, 32, { auto: true, req: () => got('deepshaft'), reqMsg: 'A shaft climbs toward cold stars, sealed by the King\'s will. (It opens for mercy.)' });
  m.zones = [{ x0: 2, y0: 2, x1: 42, y1: 40, mobs: ['crawler', 'golem', 'wraith'], cap: 8, w: ['crawler', 'crawler', 'golem', 'wraith'] }];
}
