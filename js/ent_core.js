'use strict';
/* ===== player entity ===== */
const SOLID_DECO = new Set(['tree', 'pine', 'cactus', 'rock', 'well', 'kiln', 'arch', 'shrine', 'umbrella', 'boat', 'camp', 'stump', 'anvil', 'furnace', 'grave', 'bed', 'tablet', 'sink', 'sign']);
function buildSolidDecos() { for (const k in MAPS) { const m = MAPS[k]; m.solidD = new Set(); for (const d of m.decos) if (SOLID_DECO.has(d.k)) m.solidD.add(d.x + ',' + d.y); } }
function collides(map, x, y, r) {
  r = r || 5;
  const x0 = Math.floor((x - r) / TILE), x1 = Math.floor((x + r) / TILE), y0 = Math.floor((y - 3) / TILE), y1 = Math.floor((y + 3) / TILE);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (solidAt(map, tx, ty)) return true;
    if (map.solidD && map.solidD.has(tx + ',' + ty)) return true;
  }
  return false;
}
function moveEntity(e, dx, dy, map) {
  const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 3) || 1;
  for (let i = 0; i < steps; i++) {
    if (dx) { const nx = e.x + dx / steps; if (!collides(map, nx, e.y)) e.x = nx; else if (e.bump) e.bump(); }
    if (dy) { const ny = e.y + dy / steps; if (!collides(map, e.x, ny)) e.y = ny; else if (e.bump) e.bump(); }
  }
}
function updatePlayer(dt) {
  const p = G.p, map = G.mapObj;
  p.inv = Math.max(0, p.inv - dt); p.atkCd = Math.max(0, p.atkCd - dt); p.rollCd = Math.max(0, p.rollCd - dt);
  p.atkT = Math.max(0, p.atkT - dt); if (F('elixirT') > 0) F('elixirT', F('elixirT') - dt);
  let ax = Input.ax, ay = Input.ay;
  if (G.mode === 'play') { const a = Input.axis(); ax = a.x; ay = a.y; } else { ax = 0; ay = 0; Input.clearAxis(); }
  // dead-zone shaping for smooth touch
  const mag = Math.min(1, Math.hypot(ax, ay));
  const dmag = mag < .25 ? 0 : (mag - .25) / .75;
  if (dmag === 0 && !Input.touchMode) { Input.clearAxis(); ax = ay = 0; }
  // roll
  if (p.rollT > 0) {
    p.rollT -= dt; moveEntity(p, p.vx * dt, p.vy * dt, map);
    if (Math.random() < dt * 30) dust(p.x, p.y + 4);
    if (p.rollT <= 0) { p.rollCd = (p.acc === 'lantern' ? .42 : .55); }
  } else {
    if (Input.edge('roll') && p.rollCd <= 0 && G.mode === 'play') { startRoll(); }
    const spd = playerSpd() * dmag;
    if (ax || ay) {
      const l = Math.hypot(ax, ay); let ux = ax / l, uy = ay / l;
      if (Math.abs(ux) > Math.abs(uy)) p.face = ux < 0 ? 2 : 3; else p.face = uy < 0 ? 1 : 0;
      p.vx = ux * spd; p.vy = uy * spd;
      moveEntity(p, p.vx * dt, p.vy * dt, map);
      p.walkT += dt; if (p.walkT > .18) { p.walkT = 0; SFX.play('step'); if (Math.random() < .5) dust(p.x, p.y + 5); }
    } else { p.vx = p.vy = 0; p.walkT = 0; }
  }
  // knockback decay
  if (p.kx || p.ky) { moveEntity(p, p.kx * dt, p.ky * dt, map); p.kx *= Math.pow(.0001, dt); p.ky *= Math.pow(.0001, dt); if (Math.abs(p.kx) < 4) p.kx = 0; if (Math.abs(p.ky) < 4) p.ky = 0; }
  // attack
  if (Input.edge('atk') && p.atkCd <= 0 && G.mode === 'play') playerAttack();
  // quick potion
  if (Input.edge('pot')) usePotion(G.p.bag.pot_l > 0 && (G.p.hp / G.p.maxhp < .45));
  // interact
  if (Input.edge('use')) Game.interact();
  // quicksand slow
  const tt = tileAt(map, Math.floor(p.x / TILE), Math.floor(p.y / TILE));
  if (SLOWQ.has(tt) && (ax || ay)) { moveEntity(p, -p.vx * dt * .5, -p.vy * dt * .5, map); if (Math.random() < dt * 2) floatText(p.x, p.y - 10, 'quickSand!', '#d9c37e'); }
  // reveal + region + gathering
  markPosReveal(); Game.gather();
}
function startRoll() {
  const p = G.p; p.rollT = .26; SFX.play('roll'); vibrate(20);
  const dir = p.face; const sp = 190;
  p.vx = [0, 0, -1, 1][dir] * sp; p.vy = [1, -1, 0, 0][dir] * sp;
  burst(p.x, p.y + 4, '#9fb0d8', 4);
}
function playerAttack() {
  const p = G.p; p.atkCd = .34; p.atkT = .18; p.atkDir = p.face; SFX.play('swing'); vibrate(15);
  const reach = 20 + (WPN[p.wpn].atk > 12 ? 4 : 0), arc = 1.15;
  const fa = [1.5708, -1.5708, Math.PI, 0][p.face];
  for (const m of G.mobs) {
    if (m.dead) continue; const d = U.dist(p.x, p.y, m.x, m.y); if (d > reach + m.def.r) continue;
    const a = U.ang(p.x, p.y, m.x, m.y); if (Math.abs(U.angDiff(fa, a)) > arc) continue;
    hurtMob(m);
  }
  // break cracked walls
  const map = G.mapObj; const tx = Math.floor((p.x + [0, 0, -14, 14][p.face]) / TILE), ty = Math.floor((p.y + [14, -14, 0, 0][p.face]) / TILE);
  if (tileAt(map, tx, ty) === T.CRACK) { map.t[ty * map.w + tx] = T.CFLOOR; map.solidD && map.solidD.delete(tx + ',' + ty);
    SFX.play('boom'); burst(tx * TILE + 8, ty * TILE + 8, '#54648c', 12); toast('The cracked wall gives way!', 1); markReveal(G.mapKey, tx, ty); }
}
function playerDie() {
  if (G.mode === 'dead') return; SFX.play('die'); G.mode = 'dead';
  const loss = Math.round(G.p.coins * .1); G.p.coins -= loss;
  const bossKey = G.boss ? G.boss.key : null;
  Game.fadeIn('#0b0d16', 700, () => {
    const sp = G.spawnPt || { map: 'world', x: 108 * TILE + 8, y: 47 * TILE + 8 };
    G.p.hp = G.p.maxhp; Game.goto(sp.map, sp.x, sp.y, 0, true);
    toast('You wake by the fire... (-' + loss + ' coins)', 0); saveGame(true); Game.fadeOut(400);
    G.mode = 'play';
  });
}
function markPosReveal() {
  const p = G.p; revealRadius(G.mapKey, Math.floor(p.x / TILE), Math.floor(p.y / TILE), 7);
}
function addXp(n) {
  const p = G.p; p.xp += n; floatText(p.x, p.y - 20, '+' + n + ' xp', '#7ee0ff');
  while (p.xp >= xpNeed(p.lvl)) { p.xp -= xpNeed(p.lvl); p.lvl++; p.maxhp = 24 + 6 * (p.lvl - 1) + (F('origin') === 'vigor' ? 16 : F('origin') ? 6 : 0); p.hp = p.maxhp;
    SFX.play('lvl'); toast('LEVEL UP! Lv ' + p.lvl + ' — fully healed', 1); burst(p.x, p.y, '#ffd97a', 18); vibrate(80); }
}
