'use strict';
/* ===== mob & boss definitions ===== */
/* ai: chase | hopper | flutter | lunge | archer | shooter | slam | boss */
const MOBS = {
  slime: { n: 'Bog Slime', hp: 12, dmg: 4, xp: 5, coin: [2, 5], spd: 26, ai: 'hopper', r: 6, spr: 'slime', drops: [['pot_s', .1]] },
  bat: { n: 'Ash Bat', hp: 9, dmg: 3, xp: 6, coin: [1, 4], spd: 52, ai: 'flutter', r: 5, spr: 'bat' },
  wolf: { n: 'Grove Wolf', hp: 16, dmg: 6, xp: 9, coin: [2, 6], spd: 40, ai: 'lunge', r: 6, spr: 'wolf', drops: [['pot_s', .08]] },
  scorp: { n: 'Dune Scorpion', hp: 15, dmg: 6, xp: 9, coin: [2, 7], spd: 30, ai: 'chase', r: 6, spr: 'scorp' },
  bandit: { n: 'Toll Bandit', hp: 24, dmg: 8, xp: 15, coin: [8, 16], spd: 38, ai: 'archer', r: 6, spr: 'bandit', proj: 'arrow', drops: [['pot_s', .2]] },
  crawler: { n: 'Barrow Crawler', hp: 20, dmg: 7, xp: 13, coin: [3, 9], spd: 36, ai: 'chase', r: 6, spr: 'crawler', drops: [['emberstone', .25]] },
  golem: { n: 'Cave Golem', hp: 40, dmg: 12, xp: 24, coin: [10, 20], spd: 22, ai: 'slam', r: 8, spr: 'golem', drops: [['emberstone', .5], ['pot_l', .15]] },
  wraith: { n: 'Dust Wraith', hp: 26, dmg: 9, xp: 17, coin: [6, 14], spd: 34, ai: 'shooter', r: 6, spr: 'wraith', proj: 'bolt' },
  guard: { n: 'Keep Sentry', hp: 34, dmg: 11, xp: 22, coin: [9, 18], spd: 44, ai: 'lunge', r: 6, spr: 'guard', drops: [['pot_l', .2]] },
};
const BOSSES = {
  warden: { n: 'THE BRAMBLE WARDEN', hp: 110, dmg: 10, xp: 130, spd: 30, r: 12, spr: 'warden', arena: 26 },
  sovereign: { n: 'THE DUNE SOVEREIGN', hp: 170, dmg: 14, xp: 200, spd: 46, r: 12, spr: 'sovereign', arena: 30 },
  deepking: { n: 'THE HOLLOW KING', hp: 240, dmg: 16, xp: 260, spd: 34, r: 13, spr: 'deepking', arena: 30 },
  marshal: { n: 'WRAITH MARSHAL', hp: 320, dmg: 18, xp: 340, spd: 52, r: 12, spr: 'marshal', arena: 32 },
};
/* ==== spawning zones are set by worldgen ==== */
function xpNeed(lvl) { return 25 + 22 * (lvl - 1) + (lvl - 1) * (lvl - 1) * 7; }
function playerAtk() {
  const p = G.p; let a = 2 + p.lvl + (WPN[p.wpn] ? WPN[p.wpn].atk : 0) + G.shards * 2;
  if (F('origin') === 'valor') a += 2; if (F('elixirT') > 0) a = Math.round(a * 1.15); return a;
}
function playerDef() { const p = G.p; return (ARM[p.arm] ? ARM[p.arm].def : 0); }
function playerCrit() { let c = .07 + (G.p.acc === 'ring' ? .08 : 0); if (F('origin') === 'wits') c += .05; return c; }
function playerSpd() { return 74 * (F('origin') === 'wits' ? 1.12 : 1); }
function healPlayer(n) { const p = G.p; const before = p.hp; p.hp = Math.min(p.maxhp, p.hp + n); if (p.hp > before) { floatText(p.x, p.y - 14, '+' + Math.round(p.hp - before), '#8fe08f'); burst(p.x, p.y, '#8fe08f', 6); } }
function hurtPlayer(dmg, kx, ky) {
  const p = G.p; if (p.inv > 0 || G.mode !== 'play') return;
  const d = Math.max(1, Math.round(dmg - playerDef() * .55));
  p.hp -= d; p.inv = .8; p.kx = (kx || 0); p.ky = (ky || 0);
  G.cam.shake = Math.min(8, 3 + d * .2); SFX.play('hurt'); vibrate(40);
  floatText(p.x, p.y - 16, '-' + d, '#ff7a6b'); burst(p.x, p.y, '#ff5d5d', 8);
  const v = $('vin'); v.classList.add('hurt'); setTimeout(() => v.classList.remove('hurt'), 250);
  if (p.hp <= 0) playerDie();
}
function vibrate(ms) { if (Settings.vib !== false && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { } } }
function makePlayer(x, y, face, lvl, xp, hp, coins) {
  const maxhp = 24 + 6 * ((lvl || 1) - 1) + (F('origin') === 'vigor' ? 16 : F('origin') ? 6 : 0);
  G.p = { x, y, vx: 0, vy: 0, face: face || 0, anim: 0, walkT: 0, atkT: 0, atkCd: 0, rollT: 0, rollCd: 0, inv: 0, hp, maxhp,
    lvl: lvl || 1, xp: xp || 0, coins: coins || 0, wpn: 'rusty', arm: 'cloth', acc: null, ownW: ['rusty'], ownA: ['cloth'], ownC: [],
    bag: { pot_s: 2 }, kx: 0, ky: 0, name: 'Ashe' };
  if (hp == null) G.p.hp = maxhp;
}
