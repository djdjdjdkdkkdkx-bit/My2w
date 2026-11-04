'use strict';
/* ===== projectiles, drops, particles, telegraphs ===== */
function updateProjs(dt) {
  const p = G.p, map = G.mapObj;
  for (const pr of G.projs) {
    pr.life -= dt; pr.x += pr.vx * dt; pr.y += pr.vy * dt;
    if (pr.life <= 0) { pr.dead = true; continue; }
    if (collides(map, pr.x, pr.y, 3)) { pr.dead = true; burst(pr.x, pr.y, '#9fb0d8', 4); continue; }
    if (pr.from === 'mob') {
      const d = U.dist(pr.x, pr.y, p.x, p.y - 4);
      if (d < 8) { pr.dead = true; hurtPlayer(pr.dmg, pr.vx * .6, pr.vy * .6); }
    }
  }
  G.projs = G.projs.filter(pr => !pr.dead);
}
function updateDrops(dt) {
  const p = G.p;
  for (const d of G.drops) {
    d.t += dt; d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 160 * dt;
    if (d.vy > 0 && d.t > .18) { d.vy = -d.vy * .4; d.vx *= .7; if (Math.abs(d.vy) < 20) d.vy = 0; }
    const dd = U.dist(d.x, d.y, p.x, p.y);
    if (dd < 60 && d.t > .35) { const a = U.ang(d.x, d.y, p.x, p.y); d.x += Math.cos(a) * 240 * dt; d.y += Math.sin(a) * 240 * dt; }
    if (dd < 10) {
      d.dead = true;
      if (d.kind === 'coin') { G.p.coins += d.n; SFX.play('coin'); floatText(p.x, p.y - 14, '+' + d.n, '#ffe08a'); }
      else { giveItem(d.item, 1); if (d.item === 'shard') F('shard_fx', 1); }
    }
  }
  G.drops = G.drops.filter(d => !d.dead);
}
function telegraph(x, y, r, dur, dmg) { G.parts.push({ kind: 'tele', x, y, r, t: dur, dur, dmg }); }
function updateTelegraphs(dt) {
  const p = G.p;
  for (const t of G.parts) if (t.kind === 'tele') {
    if (t.t - dt <= 0 && t.t > 0) { // fire
      if (U.dist(p.x, p.y, t.x, t.y) < t.r + 6) hurtPlayer(t.dmg, (p.x - t.x) * 3, (p.y - t.y) * 3);
      burst(t.x, t.y, '#ff5d5d', 10); SFX.play('boom'); G.cam.shake = Math.max(G.cam.shake, 4);
    }
  }
}
function dust(x, y) { G.parts.push({ kind: 'p', x, y, vx: U.irnd(-14, 14), vy: U.irnd(-26, -8), g: 60, t: .4, col: 'rgba(200,190,160,.5)', s: 2 }); }
function burst(x, y, col, n) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = U.irnd(30, 110);
  G.parts.push({ kind: 'p', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, g: 140, t: U.irnd(3, 7) / 10, col, s: U.irnd(1, 3) }); } }
function floatText(x, y, txt, col) { G.texts.push({ x, y, txt, col: col || '#fff', t: .9 }); }
