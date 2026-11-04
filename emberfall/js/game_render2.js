'use strict';
/* ===== lighting, characters, mobs draw, weather ===== */
Game.drawPlayer = function (cx, cy) {
  const p = G.p, ctx = this.ctx;
  if (p.inv > 0 && Math.floor(G.time * 18) % 2) return; // blink
  const dirN = ['down', 'up', 'left', 'right'][p.face];
  const moving = Math.abs(p.vx) + Math.abs(p.vy) > 4;
  const fr = moving ? (Math.floor(G.time * 9) % 2) : 0;
  const ch = SPR.chars.player[dirN][fr] || SPR.chars.player[dirN][0];
  ctx.drawImage(ch, Math.round(p.x - 8 - cx), Math.round(p.y - ch.height + 3 - cy));
  if (p.rollT > 0) { ctx.globalAlpha = .35; ctx.drawImage(ch, Math.round(p.x - p.vx * .03 - 8 - cx), Math.round(p.y - ch.height + 3 - cy)); ctx.globalAlpha = 1; }
  // weapon hint while attacking
  if (p.atkT > 0) { /* slash drawn separately */ }
};
Game.drawMob = function (m, cx, cy) {
  const ctx = this.ctx;
  const frames = SPR.mobs[m.def.spr]; if (!frames) return;
  let img = frames[Math.floor(m.t * 6) % frames.length];
  const flip = m.fx === -1 || (m.state === 'dash' && m.vx < 0);
  if (flip) img = img._mir || (img._mir = mirror(img));
  const dy = m.def.ai === 'flutter' ? Math.sin(m.t * 6) * 3 : 0;
  const hop = m.state === 'hop' ? -6 : 0;
  ctx.drawImage(img, Math.round(m.x - img.width / 2 - cx), Math.round(m.y - img.height + 2 - cy + dy + hop));
  if (m.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .55; ctx.drawImage(img, Math.round(m.x - img.width / 2 - cx), Math.round(m.y - img.height + 2 - cy + dy + hop)); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (m.state === 'wind') { ctx.strokeStyle = '#ffd97a'; ctx.strokeRect(m.x - 10 - cx, m.y - img.height - 6 - cy, 20, 3); }
  // small hp bar for damaged normal mobs
  if (!m.boss && m.hp < m.maxhp) {
    ctx.fillStyle = '#05070d'; ctx.fillRect(m.x - 8 - cx, m.y - img.height - 8 - cy, 16, 3);
    ctx.fillStyle = '#ff5d5d'; ctx.fillRect(m.x - 7 - cx, m.y - img.height - 7 - cy, 14 * U.clamp(m.hp / m.maxhp, 0, 1), 1);
  }
};
Game.drawLight = function (ctx, cx, cy) {
  const m = G.mapObj; if (!this.light) return;
  let dark = m.dark || 0;
  const clock = G.clock; // minutes
  const nightA = (clock > 1230 || clock < 330) ? .5 : (clock > 1140 ? (clock - 1140) / 90 * .5 : (clock < 420 ? (420 - clock) / 90 * .5 : 0));
  const isDarkMap = dark > 0;
  if (!isDarkMap && nightA < .06) { // daylight tint only
    if (nightA > 0) { ctx.fillStyle = 'rgba(10,16,48,' + (nightA * .5) + ')'; ctx.fillRect(0, 0, V.w, V.h); }
    return;
  }
  const L = this.light, lg = this.lightCtx;
  if (L.width !== V.w || L.height !== V.h) { L.width = V.w; L.height = V.h; }
  lg.globalCompositeOperation = 'source-over';
  lg.clearRect(0, 0, V.w, V.h);
  lg.fillStyle = 'rgba(4,6,16,' + (isDarkMap ? dark : nightA) + ')';
  lg.fillRect(0, 0, V.w, V.h);
  lg.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, a) => { const g2 = lg.createRadialGradient(x, y, 2, x, y, r);
    g2.addColorStop(0, 'rgba(0,0,0,' + a + ')'); g2.addColorStop(1, 'rgba(0,0,0,0)');
    lg.fillStyle = g2; lg.beginPath(); lg.arc(x, y, r, 0, TAU); lg.fill(); };
  hole(G.p.x - cx, G.p.y - cy, 86 + Math.sin(G.time * 5) * 3, 1);
  const x0 = Math.max(0, Math.floor(cx / TILE) - 6), y0 = Math.max(0, Math.floor(cy / TILE) - 6);
  const x1 = Math.min(m.w - 1, Math.ceil((cx + V.w) / TILE) + 6), y1 = Math.min(m.h - 1, Math.ceil((cy + V.h) / TILE) + 6);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = m.t[ty * m.w + tx];
    if (t === T.GLOW) hole(tx * TILE + 8 - cx, ty * TILE + 8 - cy, 30, .8);
    else if (t === T.LAVA) hole(tx * TILE + 8 - cx, ty * TILE + 8 - cy, 26, .7);
    const tg = m.tags[tx + ',' + ty];
    if (tg && tg.type === 'camp') hole(tx * TILE + 8 - cx, ty * TILE + 8 - cy, 46 + Math.sin(G.time * 7 + tx) * 4, .95);
  }
  lg.globalCompositeOperation = 'source-over';
  ctx.drawImage(L, 0, 0);
  if (!isDarkMap && nightA > 0) { ctx.fillStyle = 'rgba(10,16,48,' + (nightA * .4) + ')'; ctx.fillRect(0, 0, V.w, V.h); }
};
Game.weather = function () {
  const inStorm = G.mapKey === 'world' && (() => { const x = G.p.x / TILE, y = G.p.y / TILE; return x > 168 && x < 200 && y > 86 && y < 120; })();
  const cloak = G.p.acc === 'cloak' || G.p.ownC.includes('cloak');
  $('storm').style.opacity = inStorm ? (cloak ? .25 : .85) : 0;
  if (inStorm && !cloak && Math.random() < .004) hurtPlayer(3, U.irnd(-40, 40), 0);
  if (inStorm && Math.random() < .3) G.parts.push({ kind: 'p', x: G.cam.x + Math.random() * V.w, y: G.cam.y + Math.random() * V.h, vx: -U.irnd(40, 120), vy: U.irnd(-10, 10), g: 0, t: .5, col: 'rgba(217,195,126,.4)', s: 1 });
};
/* title background embers */
Title.bg = function (ctx, dt) {
  const g = ctx.createLinearGradient(0, 0, 0, V.h);
  g.addColorStop(0, '#0b0d16'); g.addColorStop(.7, '#1a1020'); g.addColorStop(1, '#2a1420');
  ctx.fillStyle = g; ctx.fillRect(0, 0, V.w, V.h);
  this._em = this._em || [];
  if (this._em.length < 40 && Math.random() < .3) this._em.push({ x: Math.random() * V.w, y: V.h + 10, vy: -U.irnd(14, 40), vx: U.irnd(-8, 8), s: U.irnd(1, 2), t: 1 });
  for (const e of this._em) { e.y += e.vy * dt; e.x += e.vx * dt; ctx.fillStyle = 'rgba(242,176,74,' + (e.t * .8) + ')'; ctx.fillRect(e.x, e.y, e.s, e.s); }
  this._em = this._em.filter(e => e.y > -12);
  ctx.fillStyle = 'rgba(242,176,74,.05)'; ctx.fillRect(0, V.h * .8, V.w, V.h * .2);
};
Title.update = function () { };
