'use strict';
/* ===== save system ===== */
const SAVE_KEY = 'emberfall_save1', META_KEY = 'emberfall_meta1';
const Settings = { sfx: true, music: true, autosave: true };
function loadMeta() {
  try { const m = JSON.parse(localStorage.getItem(META_KEY) || '{}'); META.endings = m.endings || {}; META.seen = m.seen || {}; Object.assign(Settings, m.settings || {}); } catch (e) { }
}
function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify({ endings: META.endings, seen: META.seen, settings: Settings })); } catch (e) { } }
const META = { endings: {}, seen: {}, load: loadMeta, save: saveMeta };
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
function unb64(str) { const s = atob(str), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
function snapshot() {
  const p = G.p, r = {};
  r.v = 3; r.map = G.mapKey; r.x = Math.round(p.x); r.y = Math.round(p.y); r.face = p.face;
  r.lvl = p.lvl; r.xp = p.xp; r.hp = Math.round(p.hp); r.coins = p.coins; r.playtime = Math.round(G.playtime);
  r.clock = G.clock; r.origin = F('origin'); r.name = p.name;
  r.bag = JSON.stringify(p.bag); r.wpn = p.wpn; r.arm = p.arm; r.acc = p.acc;
  r.own = JSON.stringify({ w: p.ownW, a: p.ownA, c: p.ownC });
  r.flags = JSON.stringify(G.flags); r.quests = JSON.stringify(G.quests);
  r.hope = G.hope; r.shards = G.shards; r.chapter = G.chapter; r.opened = JSON.stringify(G.opened);
  r.gates = JSON.stringify(G.gates); r.trig = JSON.stringify(G.triggers); r.spawn = JSON.stringify(G.spawnPt);
  r.rev = {}; for (const k in G.reveals) r.rev[k] = b64(G.reveals[k]);
  return r;
}
function saveGame(silent) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot())); if (!silent) toast('Journey saved', 1); } catch (e) { toast('Save failed', 0); }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function wipeSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
function loadInto() {
  let r; try { r = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return false; }
  if (!r || r.v !== 3) return false;
  G.flags = JSON.parse(r.flags); G.quests = JSON.parse(r.quests); G.opened = JSON.parse(r.opened);
  G.gates = JSON.parse(r.gates); G.triggers = JSON.parse(r.trig); G.spawnPt = JSON.parse(r.spawn);
  G.hope = r.hope; G.shards = r.shards; G.chapter = r.chapter; G.playtime = r.playtime || 0; G.clock = r.clock;
  F('origin', r.origin);
  makePlayer(r.x, r.y, r.face, r.lvl, r.xp, r.hp, r.coins);
  const p = G.p; p.bag = JSON.parse(r.bag); p.wpn = r.wpn; p.arm = r.arm; p.acc = r.acc;
  const o = JSON.parse(r.own); p.ownW = o.w; p.ownA = o.a; p.ownC = o.c;
  G.reveals = {}; for (const k in r.rev) G.reveals[k] = unb64(r.rev[k]);
  p.name = r.name || 'Ashe';
  return true;
}
function revealKey(k) { if (!G.reveals[k]) { const m = MAPS[k]; G.reveals[k] = new Uint8Array(Math.ceil(m.w / 4) * Math.ceil(m.h / 4)); } return G.reveals[k]; }
function markReveal(k, tx, ty) { const u = revealKey(k), m = MAPS[k]; const cw = Math.ceil(m.w / 4); const cx = tx >> 2, cy = ty >> 2; if (cx < 0 || cy < 0 || cx >= cw || cy >= u.length / cw) return; u[cy * cw + cx] = 1; }
function revealRadius(k, tx, ty, r) { const m = MAPS[k], cw = Math.ceil(m.w / 4); const u = revealKey(k); const rr = Math.ceil(r / 4) + 1;
  for (let cy = (ty >> 2) - rr; cy <= (ty >> 2) + rr; cy++) for (let cx = (tx >> 2) - rr; cx <= (tx >> 2) + rr; cx++) {
    if (cx < 0 || cy < 0 || cx >= cw || cy >= u.length / cw) continue; u[cy * cw + cx] = 1; }
}
