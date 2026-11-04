'use strict';
/* ===== bosses: patterns, scenes, progression ===== */
function spawnBoss(key, x, y) {
  const m = spawnMob(key, x, y, true); if (!m) return;
  G.boss = m; $('bossWrap').classList.remove('hidden'); $('bossName').textContent = BOSSES[key].n; $('bossFill').style.width = '100%';
  SFX.play('roar'); G.cam.shake = 8; return m;
}
function updateBoss(m, dt, d) {
  const p = G.p, def = m.def, sp = def.spd * (m.phase === 2 ? 1.35 : 1);
  m.cd = Math.max(0, m.cd - dt);
  const a = U.ang(m.x, m.y, p.x, p.y);
  switch (m.key) {
    case 'warden': {
      if (d > 60) moveEntity(m, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, G.mapObj);
      if (m.cd <= 0) { m.cd = m.phase === 2 ? 1.4 : 2; m.flash = .3;
        telegraph(p.x, p.y, 26, .6, Math.round(def.dmg * 1.3));
        telegraph(p.x + U.irnd(-20, 20), p.y + U.irnd(-20, 20), 20, .75, def.dmg);
        if (m.hp < m.maxhp * .6 && !m.sum1) { m.sum1 = 1; spawnMinions('slime', m, 2); }
        if (m.hp < m.maxhp * .3 && !m.sum2) { m.sum2 = 1; spawnMinions('slime', m, 2); } }
      break; }
    case 'sovereign': {
      if (m.state === 'dash') { moveEntity(m, m.vx * dt, m.vy * dt, G.mapObj); if (m.st > .4) { m.state = 'idle'; m.st = 0; m.cd = 1.1; } }
      else if (m.state === 'wind') { if (m.st > .45) { m.st = 0; m.state = 'dash'; m.vx = Math.cos(a) * sp * 4; m.vy = Math.sin(a) * sp * 4; SFX.play('roar'); } }
      else { if (d > 40) moveEntity(m, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, G.mapObj);
        if (m.cd <= 0) { m.cd = m.phase === 2 ? 1.6 : 2.2;
          if (Math.random() < .5) { m.state = 'wind'; m.st = 0; m.flash = .35; }
          else { for (let i = -1; i <= 1; i++) fireProj(m, 'sand', a + i * .35, 130, def.dmg); SFX.play('zap'); } }
        if (m.hp < m.maxhp * .5 && !m.sum1) { m.sum1 = 1; spawnMinions('scorp', m, 2); } }
      break; }
    case 'deepking': {
      if (d > 46) moveEntity(m, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, G.mapObj);
      if (m.cd <= 0) { m.cd = m.phase === 2 ? 1.7 : 2.4; m.flash = .3;
        const r = Math.random();
        if (r < .4) { for (let i = 0; i < 5; i++) fireProj(m, 'orb', a - .8 + i * .4, 100, def.dmg); SFX.play('zap'); }
        else if (r < .75) { telegraph(m.x, m.y, 40, .7, Math.round(def.dmg * 1.4)); fireProj(m, 'wave', 0, 0, 0); G.parts.push({ x: m.x, y: m.y, kind: 'ring', r: 10, vr: 90, t: .6, dmg: def.dmg, col: '#7ee0ff' }); }
        else { telegraph(p.x, p.y, 24, .55, def.dmg); }
        if (m.hp < m.maxhp * .55 && !m.sum1) { m.sum1 = 1; spawnMinions('crawler', m, 2); }
        if (m.hp < m.maxhp * .25 && !m.sum2) { m.sum2 = 1; spawnMinions('crawler', m, 2); } }
      break; }
    case 'marshal': {
      if (m.state === 'dash') { moveEntity(m, m.vx * dt, m.vy * dt, G.mapObj); if (m.st > .38) { m.state = 'idle'; m.st = 0; m.cd = m.phase === 2 ? .8 : 1.2; } }
      else if (m.state === 'wind') { if (m.st > .4) { m.st = 0; m.state = 'dash'; m.vx = Math.cos(a) * sp * 4.4; m.vy = Math.sin(a) * sp * 4.4; SFX.play('swing'); } }
      else { if (d > 44) moveEntity(m, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, G.mapObj);
        if (m.cd <= 0) { m.cd = m.phase === 2 ? 1.3 : 1.9;
          if (Math.random() < .55) { m.state = 'wind'; m.st = 0; m.flash = .3; }
          else { const n = m.phase === 2 ? 8 : 6; for (let i = 0; i < n; i++) fireProj(m, 'bolt', i * TAU / n + m.t, 95, def.dmg); SFX.play('zap'); } }
        if (m.hp < m.maxhp * .5 && !m.sum1) { m.sum1 = 1; spawnMinions('guard', m, 2); } }
      break; }
  }
}
function spawnMinions(key, m, n) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU; const s = spawnMob(key, m.x + Math.cos(a) * 24, m.y + Math.sin(a) * 24); if (s) { s.hp = Math.round(s.def.hp * .6); burst(s.x, s.y, '#9fb0d8', 6); } } SFX.play('roar'); }
function bossPhase2(m) { m.phase = 2; SFX.play('roar'); G.cam.shake = 9; toast('The ' + (m.def.n || 'boss') + ' grows furious!', 0); burst(m.x, m.y, '#ff5d5d', 20); }
function onBossDead(m) {
  G.hitstop = .5; G.cam.shake = 12;
  Game.fadeIn('rgba(5,7,13,.55)', 500, () => Game.fadeOut(300));
  const key = m.key; const sc = BOSS_SCENES[key];
  setTimeout(() => { G.mode = 'dialog'; Dlg.runArray(sc.end()); }, 900);
}
function bossAfterSteps(key) {
  const sc = BOSS_SCENES[key];
  const spared = got('spared_' + key);
  return sc[spared ? 'spare' : 'slay']().concat([{ do: () => Game.afterBoss(key) }]);
}
