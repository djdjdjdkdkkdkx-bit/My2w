'use strict';
/* ===== world generation: the overworld ===== */
const MAPS = {};
function setT(m, x, y, t) { if (x >= 0 && y >= 0 && x < m.w && y < m.h) m.t[y * m.w + x] = t; }
function getT(m, x, y) { return (x < 0 || y < 0 || x >= m.w || y >= m.h) ? T.MTN : m.t[y * m.w + x]; }
function fillR(m, x0, y0, x1, y1, t) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setT(m, x, y, t); }
function road(m, pts, t, w) {
  t = t === undefined ? T.PATH : t; w = w || 1;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const dx = Math.sign(bx - ax), dy = Math.sign(by - ay); let x = ax, y = ay;
    while (x !== bx || y !== by) { for (let ox = -w; ox <= w; ox++) for (let oy = -w; oy <= w; oy++) setT(m, x + ox, y + oy, t); if (x !== bx) x += dx; else if (y !== by) y += dy; else break; }
    for (let ox = -w; ox <= w; ox++) for (let oy = -w; oy <= w; oy++) setT(m, bx + ox, by + oy, t);
  }
}
function scatter(m, x0, y0, x1, y1, t, p, seed, clearR) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (U.hash(x, y, seed) < p) { if (clearR && nearTile(m, x, y, clearR, 2)) continue; setT(m, x, y, t); }
  }
}
function nearTile(m, x, y, t, r) { for (let oy = -r; oy <= r; oy++) for (let ox = -r; ox <= r; ox++) if (getT(m, x + ox, y + oy) === t) return true; return false; }
function deco(m, key, x, y, dy) { m.decos.push({ k: key, x, y, dy: dy || 0, v: Math.floor(U.hash(x, y, 51) * 2) }); }
function tag(m, x, y, o) { m.tags[x + ',' + y] = Object.assign({ x, y }, o); }
function buildWorld() {
  const W = 220, H = 220, m = { w: W, h: H, t: new Uint8Array(W * H), decos: [], tags: {}, zones: [], name: 'The Wilds', music: 'village', dark: 0 };
  MAPS.world = m;
  // base grass + variation
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const n = U.fbm(x, y, 11, 3);
    setT(m, x, y, n > .62 ? T.TALL : n < .34 ? T.FLOWER : T.GRASS);
  }
  // border cliffs
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < 4 || y < 4 || x >= W - 4 || y >= H - 4) setT(m, x, y, T.CLIFF);
  // north mountains with jitter
  for (let y = 4; y < 30; y++) for (let x = 4; x < W - 4; x++) {
    const e = U.fbm(x, y, 23, 3);
    if (y < 12 + e * 16) setT(m, x, y, T.MTN); else if (y < 16 + e * 16 && U.hash(x, y, 5) < .5) setT(m, x, y, T.CLIFF);
  }
  // desert east
  for (let y = 40; y < H - 30; y++) for (let x = 138; x < W - 4; x++) {
    const e = U.fbm(x + 99, y, 31, 3);
    if (x > 140 + e * 24) setT(m, x, y, T.SAND);
    if (x > 150 && x < 206 && y > 86 && y < 118 && U.hash(x, y, 77) < .05) setT(m, x, y, T.QSAND);
  }
  // lake
  const LX = 108, LY = 152, LR = 21;
  for (let y = LY - LR - 3; y <= LY + LR + 3; y++) for (let x = LX - LR - 3; x <= LX + LR + 3; x++) {
    const d = U.dist(x, y, LX, LY), wob = U.fbm(x, y, 41, 2) * 4;
    if (d < LR - 6 + wob) setT(m, x, y, T.DEEP); else if (d < LR + wob) setT(m, x, y, T.WATER);
    else if (d < LR + 3 + wob) { if (getT(m, x, y) !== T.DEEP) setT(m, x, y, U.hash(x, y, 9) < .25 ? T.SAND : T.GRASS); }
  }
  // scatter forests west (after roads later? do scatter now; roads carve later clear them)
  for (let y = 56; y < 140; y++) for (let x = 30; x < 106; x++) {
    if (U.fbm(x, y, 17, 2) > .52 && U.hash(x, y, 3) < .75) setT(m, x, y, T.GRASS); // keep floor grassy, trees as decos
  }
  buildVillage(m);
  buildRoads(m);
  decorateWorld(m);
  placeWorldTags(m);
  buildCave1(); buildCave2(); buildKeep(); buildGrot(); buildGrove();
  buildWorldZones(m);
  return m;
}
function buildRoads(m) {
  road(m, [[108, 52], [44, 52]], T.PATH);              // west road to forest
  road(m, [[112, 56], [140, 56]], T.PATH);             // east to crossroads
  road(m, [[140, 56], [140, 30], [186, 30], [186, 44]], T.PATH); // crossroads -> keep gate
  road(m, [[140, 56], [160, 84]], T.PATH);             // to oasis
  road(m, [[160, 84], [178, 84], [178, 98]], T.PATH);  // oasis -> temple
  road(m, [[108, 52], [108, 30], [80, 30], [78, 31]], T.PATH); // north -> barrow
  road(m, [[108, 54], [108, 132]], T.PATH);            // south to lake pier
}
