'use strict';
/* ===== village & world structures ===== */
function house(m, x, y, w, h, doorX) {
  fillR(m, x, y, x + w - 1, y + Math.floor(h / 2), T.ROOF);
  for (let yy = y + Math.floor(h / 2); yy <= y + h - 1; yy++) for (let xx = x; xx <= x + w - 1; xx++) setT(m, xx, yy, T.WWALL);
  setT(m, x + doorX, y + h - 1, T.DOOR);
  deco(m, 'bed', x + 1, y + Math.floor(h / 2) + 1); deco(m, 'table', x + w - 2, y + Math.floor(h / 2) + 1);
}
function buildVillage(m) {
  // plaza
  fillR(m, 100, 42, 118, 54, T.PATH);
  house(m, 104, 32, 7, 5, 3);   // Mara's hut (door at 107,36)
  house(m, 112, 32, 7, 5, 3);   // Ott's shop (door 115,36)
  house(m, 119, 39, 6, 5, 2);   // Bruna's forge (door 121,43)
  house(m, 96, 46, 6, 5, 2);    // Rowan healer (door 98,50)
  house(m, 112, 47, 6, 5, 2);   // village home (door 114,51)
  house(m, 102, 47, 5, 5, 2);   // village home (door 104,51)
  deco(m, 'kiln', 101, 40, 6); deco(m, 'well', 109, 45, 4);
  deco(m, 'anvil', 120, 44, 2); deco(m, 'furnace', 123, 41, 2);
  deco(m, 'bed', 105, 34); // inn marker inside mara hut (visual)
  // farm
  fillR(m, 94, 56, 101, 62, T.GRASS); deco(m, 'fence', 93, 56, 0); deco(m, 'fence', 93, 59, 0); deco(m, 'bush', 100, 61, 0);
  for (let i = 0; i < 5; i++) deco(m, 'flowerB', 95 + i * 2, 58, 0);
  // gravestones (cemetery west)
  for (let i = 0; i < 5; i++) { deco(m, 'grave', 87 + i * 2, 62 + (i % 2) * 2, 0); setT(m, 87 + i * 2, 62 + (i % 2) * 2, T.GRASS); }
  //NPC + tag positions (see placeWorldTags)
}
function decorateWorld(m) {
  const R = Math.random;
  // trees in forest region
  for (let y = 52; y < 142; y++) for (let x = 28; x < 108; x++) {
    const t = getT(m, x, y); if (t === T.PATH || t === T.WATER || t === T.DEEP) continue;
    const n = U.fbm(x, y, 17, 2);
    if (n > .5 && U.hash(x, y, 3) < .62) deco(m, U.hash(x, y, 8) < .3 ? 'pine' : 'tree', x, y, 10);
  }
  // warden mound clearing
  for (let y = 78; y < 98; y++) for (let x = 54; x < 74; x++) if (U.dist(x, y, 64, 88) < 9) { /* leave clearing */ 
    m.decos = m.decos.filter(d => !(d.x === x && d.y === y)); }
  // scattered rocks/flowers/bushes in grasslands
  for (let y = 40; y < 200; y += 1) for (let x = 8; x < 212; x += 1) {
    const t = getT(m, x, y);
    if (t === T.GRASS || t === T.TALL) {
      const h = U.hash(x, y, 99);
      if (h < .012) deco(m, 'rock', x, y, 6); else if (h < .018) deco(m, 'bush', x, y, 4); else if (h < .021) deco(m, 'flowerB', x, y, 0);
    } else if (t === T.SAND) {
      const h = U.hash(x, y, 101);
      if (h < .015) deco(m, 'cactus', x, y, 8); else if (h < .02) deco(m, 'rock', x, y, 6); else if (h < .022) deco(m, 'skull', x, y, 2);
    } else if (t === T.MTN && U.hash(x, y, 103) < .03) deco(m, 'rock', x, y, 6);
  }
  // lake reeds & pier
  for (let y = 128; y < 178; y++) for (let x = 84; x < 134; x++) { const t = getT(m, x, y);
    if ((t === T.WATER || t === T.DEEP) && U.hash(x, y, 55) < .12) deco(m, 'reed', x, y, 2); }
  for (let i = 0; i < 6; i++) setT(m, 108, 126 + i, T.PIER);
  deco(m, 'boat', 103, 138, 2); deco(m, 'boat', 114, 141, 2);
  // oasis pond & palms & camp
  fillR(m, 157, 82, 163, 88, T.WATER); setT(m, 160, 84, T.DEEP);
  deco(m, 'pine', 155, 80, 10); deco(m, 'pine', 165, 80, 10); deco(m, 'umbrella', 164, 86, 6);
  // temple arena rings (dune sovereign)
  for (let a = 0; a < TAU; a += .12) { const x = Math.round(178 + Math.cos(a) * 8), y = Math.round(102 + Math.sin(a) * 8); if (getT(m, x, y) !== T.PATH) setT(m, x, y, T.QSAND); }
  for (let a = 0; a < TAU; a += .2) { const x = Math.round(178 + Math.cos(a) * 12), y = Math.round(102 + Math.sin(a) * 12); deco(m, 'rock', x, y, 6); }
  deco(m, 'arch', 178, 95, 6);
  // warden mound props
  deco(m, 'stump', 60, 84, 2); deco(m, 'stump', 68, 92, 2); deco(m, 'skull', 62, 92, 2);
  // keep gate arch & campfires & signs placed in placeWorldTags
}
