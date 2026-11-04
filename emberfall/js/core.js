'use strict';
/* ===== EMBERFALL core utils ===== */
const TILE = 16, TAU = Math.PI * 2;
const V = { zoom: 3, w: 0, h: 0 };
const U = {
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  lerp(a, b, t) { return a + (b - a) * t; },
  dist(ax, ay, bx, by) { const x = bx - ax, y = by - ay; return Math.sqrt(x * x + y * y); },
  d2(ax, ay, bx, by) { const x = bx - ax, y = by - ay; return x * x + y * y; },
  ang(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); },
  angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; },
  // deterministic RNG
  rng(seed) { let s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
  ri(r, a, b) { return a + Math.floor(r() * (b - a + 1)); },
  pick(r, arr) { return arr[Math.floor(r() * arr.length)]; },
  chance(p) { return Math.random() < p; },
  irnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
  hash(x, y, s) { let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (s | 0) * 947430521; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; },
  smooth(t) { return t * t * (3 - 2 * t); },
  noise2(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), tx = this.smooth(x - xi), ty = this.smooth(y - yi);
    const a = this.hash(xi, yi, s), b = this.hash(xi + 1, yi, s), c = this.hash(xi, yi + 1, s), d = this.hash(xi + 1, yi + 1, s);
    return this.lerp(this.lerp(a, b, tx), this.lerp(c, d, tx), ty); },
  fbm(x, y, s, oct = 3, sc = 0.045) { let v = 0, amp = 0.55, f = 1, tot = 0; for (let i = 0; i < oct; i++) { v += this.noise2(x * f * sc, y * f * sc, s + i * 77) * amp; tot += amp; amp *= 0.55; f *= 2.1; } return v / tot; },
};
const $ = id => document.getElementById(id);
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function px(g, x, y, c, w = 1, h = 1) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function hex2(h) { return h; }
function shade(hex, amt) { // hex '#rrggbb', amt -1..1
  const n = parseInt(hex.slice(1), 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; } else { r *= (1 + amt); g *= (1 + amt); b *= (1 + amt); }
  return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
}
const PAL = {
  out: '#05070d', ink: '#10141f', panel: '#242c44', panel2: '#313c5e', line: '#465273', gold: '#ffd97a', gold2: '#f2b04a',
  skin: '#e8b796', skin2: '#d99f78', hairD: '#4a3226', hairL: '#8a5a33', clothB: '#3a5f8a', clothG: '#4f8a4f',
  clothR: '#a33b3b', clothP: '#6a4a8a', clothY: '#c9a04a', clothK: '#2b3040', bone: '#e8e4d4', blood: '#c0392b',
  leaf1: '#2e6b3a', leaf2: '#3f8f4a', leaf3: '#57a85f', grass1: '#3f8f4a', grass2: '#357a40', grass3: '#4aa355',
  dirt1: '#8a6a42', dirt2: '#6f5433', sand1: '#d9c37e', sand2: '#c4a95e', water1: '#2a5f8a', water2: '#1f4a6e',
  rock1: '#6f7585', rock2: '#4a4f5e', cave1: '#2b3040', cave2: '#3a4155', wood1: '#8a6a42', wood2: '#5e4629',
  roof1: '#a33b3b', roof2: '#7a2d2d', ember: '#f2b04a', ember2: '#c95a1e', spark: '#ffe9b0',
};
const G = { // mutable game state
  mode: 'boot', panel: null, mapKey: 'world', mapObj: null, time: 0, clock: 120, // clock = minutes in day cycle
  flags: {}, quests: {}, hope: 0, shards: 0, chapter: 0, playtime: 0,
  p: null, mobs: [], projs: [], parts: [], texts: [], drops: [], decos: [], focus: null,
  cam: { x: 0, y: 0, sx: 0, sy: 0, shake: 0 }, opened: {}, gates: {}, triggers: {},
  reveals: {}, hitstop: 0, boss: null, spawnPt: null, pendingSave: false, lastSaveName: 'Emberfall',
};
function F(k, v) { if (v !== undefined) { G.flags[k] = v; } return G.flags[k] || 0; }
function got(k) { return !!G.flags[k]; }
function addHope(n, why) { if (n > 0 && G.hope >= 6) return; G.hope = U.clamp(G.hope + n, 0, 6); if (why) toast('Hope rises · ' + why, 1); }
