'use strict';
/* ===== mobs: spawn, ai, damage ===== */
function spawnMob(key, x, y, boss) {
  const def = boss ? BOSSES[key] : MOBS[key]; if (!def) return null;
  const m = { key, def, boss: !!boss, x, y, vx: 0, vy: 0, hp: def.hp, maxhp: def.hp, face: 0, t: Math.random() * 2,
    cd: 0, state: 'idle', st: 0, flash: 0, kx: 0, ky: 0, hitCd: 0, dead: false, phase: 1, home: { x, y }, wT: Math.random() * 2 };
  G.mobs.push(m); return m;
}
function removeMob(m) { const i = G.mobs.indexOf(m); if (i >= 0) G.mobs.splice(i, 1); }
function updateMobs(dt) {
  const p = G.p;
  for (const m of G.mobs) {
    if (m.dead) continue;
    const d = U.dist(p.x, p.y, m.x, m.y);
    if (!m.boss && d > 500) { m.gone = true; continue; }
    m.t += dt; m.flash = Math.max(0, m.flash - dt); m.cd = Math.max(0, m.cd - dt); m.hitCd = Math.max(0, m.hitCd - dt); m.st += dt;
    if (m.boss) updateBoss(m, dt, d);
    else mobAI(m, dt, d);
    // knockback
    if (m.kx || m.ky) { moveEntity(m, m.kx * dt, m.ky * dt, G.mapObj); m.kx *= Math.pow(.0001, dt); if (Math.abs(m.kx) < 3) m.kx = 0; if (Math.abs(m.ky) < 3) m.ky = 0; }
    // contact damage
    if (d < m.def.r + 7 && m.hitCd <= 0) {
      const a = U.ang(m.x, m.y, p.x, p.y);
      hurtPlayer(m.def.dmg, Math.cos(a) * 130, Math.sin(a) * 130);
      m.hitCd = .8; m.cd = Math.max(m.cd, .3);
    }
  }
  for (let i = G.mobs.length - 1; i >= 0; i--) if (G.mobs[i].gone || G.mobs[i].dead) G.mobs.splice(i, 1);
}
function mobAI(m, dt, d) {
  const p = G.p, def = m.def, sp = def.spd;
  const toP = () => { const a = U.ang(m.x, m.y, p.x, p.y); return [Math.cos(a) * sp, Math.sin(a) * sp]; };
  switch (def.ai) {
    case 'chase': { if (d < 150) { const [vx, vy] = toP(); moveEntity(m, vx * dt, vy * dt, G.mapObj); m.fx = vx < 0 ? -1 : 1; } else wander(m, dt, sp * .5); break; }
    case 'hopper': {
      m.wT -= dt; if (m.state === 'hop') { moveEntity(m, m.vx * dt, m.vy * dt, G.mapObj); m.vx *= Math.pow(.01, dt); m.vy *= Math.pow(.01, dt);
        if (m.st > .5) { m.state = 'idle'; m.st = 0; } }
      else if (m.wT <= 0) { m.wT = U.irnd(.7, 1.3); m.st = 0; m.state = 'hop';
        const a = d < 160 ? U.ang(m.x, m.y, p.x, p.y) : Math.random() * TAU;
        m.vx = Math.cos(a) * 90; m.vy = Math.sin(a) * 90; }
      break; }
    case 'flutter': {
      if (d < 170) { const a = U.ang(m.x, m.y, p.x, p.y) + Math.sin(m.t * 4) * .5; moveEntity(m, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, G.mapObj); }
      else wander(m, dt, sp * .6); break; }
    case 'lunge': {
      if (m.state === 'dash') { moveEntity(m, m.vx * dt, m.vy * dt, G.mapObj); if (m.st > .32) { m.state = 'idle'; m.st = 0; m.cd = 1.2; } }
      else if (m.state === 'wind') { if (m.st > .38) { m.st = 0; m.state = 'dash'; const a = U.ang(m.x, m.y, p.x, p.y); m.vx = Math.cos(a) * sp * 3.4; m.vy = Math.sin(a) * sp * 3.4; } }
      else { if (d < 120 && m.cd <= 0) { m.state = 'wind'; m.st = 0; m.flash = .3; } else if (d > 40) { const [vx, vy] = toP(); moveEntity(m, vx * dt, vy * dt, G.mapObj); } }
      break; }
    case 'archer': case 'shooter': {
      const ideal = def.ai === 'archer' ? 90 : 110;
      if (d < 190) {
        if (d < ideal - 25) { const a = U.ang(p.x, p.y, m.x, m.y); moveEntity(m, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, G.mapObj); }
        else if (d > ideal + 25) { const [vx, vy] = toP(); moveEntity(m, vx * dt, vy * dt, G.mapObj); }
        if (m.cd <= 0) { m.cd = def.ai === 'archer' ? 1.7 : 2.1; m.flash = .25; fireProj(m, def.proj, U.ang(m.x, m.y, p.x, p.y), 120, def.dmg); SFX.play('zap'); }
      } else wander(m, dt, sp * .5); break; }
    case 'slam': {
      if (d < 170) {
        if (d > 34) { const [vx, vy] = toP(); moveEntity(m, vx * dt, vy * dt, G.mapObj); }
        else if (m.cd <= 0) { m.cd = 2.2; m.flash = .4; telegraph(m.x, m.y, 30, .55, Math.round(def.dmg * 1.2)); }
      } break; }
  }
}
function wander(m, dt, sp) {
  m.wT -= dt; if (m.wT <= 0) { m.wT = U.irnd(1, 3); const a = Math.random() * TAU; m.wx = Math.cos(a) * sp; m.wy = Math.sin(a) * sp;
    if (U.dist(m.x, m.y, m.home.x, m.home.y) > 90) { const a2 = U.ang(m.x, m.y, m.home.x, m.home.y); m.wx = Math.cos(a2) * sp; m.wy = Math.sin(a2) * sp; } }
  if (m.wx || m.wy) moveEntity(m, m.wx * dt, m.wy * dt, G.mapObj);
}
function fireProj(m, kind, ang, spd, dmg) {
  const imgs = { arrow: 'arrow', bolt: 'bolt', sand: 'sand', orb: 'orb', rock: 'rock', spit: 'spit', wave: 'wave' };
  G.projs.push({ x: m.x, y: m.y - 6, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 4, dmg, kind, img: imgs[kind] || 'bolt', life: 2.4, from: 'mob' });
}
function hurtMob(m) {
  const p = G.p; const crit = Math.random() < playerCrit();
  let dmg = playerAtk() * (0.9 + Math.random() * 0.25); if (crit) dmg *= 1.6;
  dmg = Math.round(dmg); m.hp -= dmg; m.flash = .14;
  const a = U.ang(p.x, p.y, m.x, m.y); m.kx = Math.cos(a) * 150; m.ky = Math.sin(a) * 150;
  floatText(m.x, m.y - m.def.r - 6, dmg + (crit ? '!' : ''), crit ? '#ffd97a' : '#fff');
  burst(m.x, m.y, crit ? '#ffd97a' : '#ff8a7a', crit ? 8 : 5); SFX.play('hit'); G.hitstop = Math.max(G.hitstop, crit ? .06 : .03);
  if (m.boss) { $('bossFill').style.width = Math.max(0, (m.hp / m.maxhp * 100)) + '%';
    if (m.hp < m.maxhp * .5 && m.phase === 1) bossPhase2(m); }
  if (m.hp <= 0) killMob(m);
}
function killMob(m) {
  m.dead = true; burst(m.x, m.y, m.boss ? '#ffd97a' : '#c95a5e', m.boss ? 30 : 10); SFX.play(m.boss ? 'boom' : 'hit');
  addXp(m.def.xp);
  const n = m.def.coin ? U.irnd(m.def.coin[0], m.def.coin[1]) : (m.boss ? 120 : 0);
  for (let i = 0; i < Math.min(6, Math.ceil(n / 4) + 1); i++) G.drops.push({ x: m.x + U.irnd(-6, 6), y: m.y + U.irnd(-6, 6), vx: U.irnd(-40, 40), vy: U.irnd(-60, -20), kind: 'coin', n: Math.ceil(n / Math.min(6, Math.ceil(n / 4) + 1)), t: 0 });
  if (m.def.drops) for (const [k, p] of m.def.drops) if (Math.random() < p) G.drops.push({ x: m.x, y: m.y - 4, vx: U.irnd(-30, 30), vy: -50, kind: 'item', item: k, t: 0 });
  if (m.boss) { $('bossWrap').classList.add('hidden'); G.boss = null; onBossDead(m); }
}
