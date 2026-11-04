'use strict';
/* ===== tile painters ===== */
const T = { GRASS: 0, TALL: 1, FLOWER: 2, PATH: 3, ROAD: 4, WATER: 5, DEEP: 6, SAND: 7, QSAND: 8, MTN: 9, CLIFF: 10,
  CWALL: 11, CFLOOR: 12, LAVA: 13, WFLOOR: 14, WWALL: 15, ROOF: 16, DOOR: 17, BWALL: 18, KFLOOR: 19, GLOW: 20,
  FENCE: 21, CRACK: 22, BRIDGE: 23, PIER: 24, RUG: 25 };
const SOLID = new Set([T.WATER, T.DEEP, T.MTN, T.CLIFF, T.CWALL, T.LAVA, T.WWALL, T.ROOF, T.BWALL, T.FENCE, T.CRACK]);
const SLOWQ = new Set([T.QSAND]);
function speck(g, seed, cols, n) { for (let i = 0; i < n; i++) { const x = Math.floor(U.hash(i, seed, 7) * 16), y = Math.floor(U.hash(seed, i, 13) * 16); px(g, x, y, cols[i % cols.length]); } }
function buildTiles() {
  const S = SPR.tiles;
  // grass (variants)
  S[T.GRASS] = [0, 1, 2].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.grass1, 16, 16); speck(g, v, [PAL.grass2, PAL.grass3, '#2f6b36'], 10); }));
  S[T.TALL] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.grass2, 16, 16); speck(g, v + 3, [PAL.grass3, '#2f6b36'], 8);
    g.fillStyle = PAL.leaf3; for (let i = 0; i < 5; i++) { const x = 2 + i * 3 + (v ? 1 : 0); g.fillRect(x, 4 + (i % 2) * 3, 1, 8); g.fillRect(x + 1, 6, 1, 6); } }));
  S[T.FLOWER] = [0, 1, 2].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.grass1, 16, 16); speck(g, v + 9, [PAL.grass2], 8);
    const cs = ['#ff9db0', '#ffe08a', '#c9a4ff']; g.fillStyle = cs[v % 3]; g.fillRect(3 + v * 3, 5, 2, 2); g.fillRect(9, 9, 2, 2); g.fillStyle = '#fff'; g.fillRect(4 + v * 3, 5, 1, 1); }));
  S[T.PATH] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.dirt1, 16, 16); speck(g, v + 4, [PAL.dirt2, '#a07c50'], 12); }));
  S[T.ROAD] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, '#9a9aa8', 16, 16); speck(g, v + 5, ['#8a8a98', '#aaaab8', '#77778a'], 14);
    g.strokeStyle = '#6f6f80'; g.strokeRect(0, 0, 16, 16); }));
  S[T.WATER] = [0, 1, 2].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.water1, 16, 16); speck(g, v + 6, [PAL.water2], 10);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(2, 3 + v * 2, 5, 1); g.fillRect(9, 9 - v * 2, 4, 1); }));
  S[T.DEEP] = [0, 1, 2].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.water2, 16, 16); speck(g, v + 7, ['#16324a'], 10);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(3, 6 + v, 4, 1); }));
  S[T.SAND] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.sand1, 16, 16); speck(g, v + 8, [PAL.sand2, '#e8d8a0'], 12); }));
  S[T.QSAND] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, '#b89a54', 16, 16); speck(g, v + 10, ['#8f7438', '#d0b468'], 12);
    g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(3, 6, 4, 2); g.fillRect(10, 10, 3, 2); }));
  S[T.MTN] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.rock1, 16, 16); speck(g, v + 11, [PAL.rock2, '#8a90a0'], 12);
    g.fillStyle = '#3f4452'; g.fillRect(0, 14, 16, 2); }));
  S[T.CLIFF] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.rock2, 16, 16); speck(g, v + 12, ['#3a3f4c', PAL.rock1], 10);
    g.fillStyle = '#2a2e38'; g.fillRect(0, 0, 16, 2); g.fillRect(0, 14, 16, 2); }));
  S[T.CWALL] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.cave1, 16, 16); speck(g, v + 13, [PAL.cave2, '#232838'], 10);
    g.fillStyle = '#1d2230'; g.fillRect(0, 13, 16, 3); }));
  S[T.CFLOOR] = [0, 1, 2].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.cave2, 16, 16); speck(g, v + 14, [PAL.cave1, '#465273'], 10); }));
  S[T.LAVA] = [0, 1, 2].map(v => mk(16, 16, g => { px(g, 0, 0, '#c95a1e', 16, 16); speck(g, v + 15, ['#f2b04a', '#e88a2e', '#8a3a14'], 12);
    g.fillStyle = '#ffd97a'; g.fillRect(2 + v * 2, 4, 4, 1); g.fillRect(9, 10 - v, 3, 1); }));
  S[T.WFLOOR] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.wood1, 16, 16); speck(g, v + 16, [PAL.wood2, '#a07c50'], 8);
    g.fillStyle = PAL.wood2; g.fillRect(0, 5, 16, 1); g.fillRect(0, 11, 16, 1); }));
  S[T.WWALL] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, '#7a5a3a', 16, 16); speck(g, v + 17, [PAL.wood2, '#8f6a45'], 10);
    g.fillStyle = PAL.wood2; g.fillRect(0, 0, 16, 2); g.fillRect(0, 14, 16, 2); }));
  S[T.ROOF] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, PAL.roof1, 16, 16); speck(g, v + 18, [PAL.roof2, '#c04f4f'], 10);
    g.fillStyle = PAL.roof2; g.fillRect(0, 7, 16, 2); }));
  S[T.DOOR] = [mk(16, 16, g => { px(g, 0, 0, '#4a3226', 16, 16); px(g, 2, 1, PAL.wood1, 12, 15); px(g, 3, 2, '#6f5433', 10, 13);
    px(g, 11, 8, '#ffd97a'); })];
  S[T.BWALL] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, '#3a4155', 16, 16); g.fillStyle = '#2b3040';
    for (let y = 0; y < 16; y += 4) { g.fillRect(0, y, 16, 1); g.fillRect(((y / 4) % 2) * 8, y, 1, 4); }
    speck(g, v + 19, ['#465273', '#232838'], 8); }));
  S[T.KFLOOR] = [0, 1].map(v => mk(16, 16, g => { px(g, 0, 0, '#465273', 16, 16); speck(g, v + 20, [PAL.cave2, '#54648c'], 10);
    g.strokeStyle = '#2b3040'; g.strokeRect(0, 0, 16, 16); }));
  S[T.GLOW] = [0, 1, 2].map(v => mk(16, 16, g => { px(g, 0, 0, '#465273', 16, 16); speck(g, v + 21, [PAL.cave2], 8);
    g.fillStyle = 'rgba(242,176,74,' + (0.25 + v * 0.15) + ')'; g.fillRect(3, 3, 10, 10);
    g.fillStyle = '#f2b04a'; g.fillRect(6, 6, 3, 3); }));
  S[T.FENCE] = [mk(16, 16, g => { g.clearRect(0, 0, 16, 16); px(g, 0, 6, PAL.wood2, 16, 2); px(g, 3, 3, PAL.wood1, 2, 11); px(g, 11, 3, PAL.wood1, 2, 11); })];
  S[T.CRACK] = [mk(16, 16, g => { px(g, 0, 0, PAL.cave1, 16, 16); speck(g, 30, [PAL.cave2, '#232838'], 10);
    g.strokeStyle = '#141a26'; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 2); g.lineTo(6, 7); g.lineTo(10, 10); g.lineTo(7, 14); g.stroke(); })];
  S[T.BRIDGE] = [mk(16, 16, g => { px(g, 0, 0, '#6f5433', 16, 16); for (let x = 0; x < 16; x += 4) px(g, x, 0, PAL.wood1, 2, 16); })];
  S[T.PIER] = [mk(16, 16, g => { px(g, 0, 0, '#5e4629', 16, 16); for (let x = 0; x < 16; x += 5) px(g, x, 0, '#6f5433', 3, 16); px(g, 0, 14, '#4a3226', 16, 2); })];
  S[T.RUG] = [mk(16, 16, g => { px(g, 0, 0, '#8a3a4a', 16, 16); px(g, 2, 2, '#a34b5e', 12, 12); px(g, 4, 4, '#c95a5e', 8, 8); })];
  SPR.anim = { [T.WATER]: 3, [T.DEEP]: 3, [T.LAVA]: 3, [T.GLOW]: 3, [T.TALL]: 2 };
}
