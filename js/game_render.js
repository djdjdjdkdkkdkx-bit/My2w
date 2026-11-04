'use strict';
/* ===== world renderer ===== */
Game.render = function (dt) {
  const ctx = this.ctx; ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#0b0d16'; ctx.fillRect(0, 0, V.w, V.h);
  if (G.mode === 'title' || !G.p) { Title.bg && Title.bg(ctx, dt); return; }
  const m = G.mapObj;
  const shx = (Math.random() * 2 - 1) * G.cam.shake, shy = (Math.random() * 2 - 1) * G.cam.shake;
  const cx = Math.round(G.cam.x + shx), cy = Math.round(G.cam.y + shy);
  const x0 = Math.max(0, Math.floor(cx / TILE) - 1), y0 = Math.max(0, Math.floor(cy / TILE) - 1);
  const x1 = Math.min(m.w - 1, Math.ceil((cx + V.w) / TILE) + 1), y1 = Math.min(m.h - 1, Math.ceil((cy + V.h) / TILE) + 1);
  const animF = Math.floor(G.time * 3) % 3, animF2 = Math.floor(G.time * 3) % 2;
  // tiles
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = m.t[ty * m.w + tx]; const arr = SPR.tiles[t]; if (!arr) continue;
    const fr = SPR.anim[t] ? arr[(Math.floor(G.time * 2.5) + tx + ty) % arr.length] : arr[U.hash(tx, ty, 5) * arr.length | 0];
    ctx.drawImage(fr, tx * TILE - cx, ty * TILE - cy);
  }
  // tags: chests & special props drawn as sprites
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = m.tags[tx + ',' + ty]; if (!t) continue;
    if (t.type === 'chest') { const op = G.opened[G.mapKey + ':' + tx + ',' + ty]; ctx.drawImage(op ? SPR.decos.chestO : SPR.decos.chest, tx * TILE - cx, ty * TILE + 2 - cy); }
    else if (t.type === 'heart') { const img = SPR.decos.emberheart[animF]; ctx.drawImage(img, tx * TILE + 8 - img.width / 2 - cx, ty * TILE + 16 - img.height - cy); }
    else if (t.type === 'shrine') { const img = SPR.decos.shrine; ctx.drawImage(img, tx * TILE + 8 - img.width / 2 - cx, ty * TILE + 16 - img.height - cy); }
    else if (t.type === 'kiln') { const img = SPR.decos.kiln; ctx.drawImage(img, tx * TILE + 8 - img.width / 2 - cx, ty * TILE + 16 - img.height - cy); }
    else if (t.type === 'well') { const img = SPR.decos.well; ctx.drawImage(img, tx * TILE + 8 - img.width / 2 - cx, ty * TILE + 16 - img.height - cy); }
  }
  // build y-sorted draw list: decos + npcs + mobs + player + drops
  const list = [];
  for (const d of m.decos) { if (d.x < x0 - 1 || d.x > x1 + 1 || d.y < y0 - 2 || d.y > y1 + 1) continue;
    const imgSet = SPR.decos[d.k]; if (!imgSet) continue;
    const img = imgSet.length ? (imgSet[d.v % imgSet.length] || imgSet[0]) : (imgSet.width ? imgSet : null);
    if (!img) continue;
    list.push({ y: d.y * TILE + 16, draw: (i) => ctx.drawImage(i.img, d.x * TILE + 8 - i.img.width / 2 - cx, d.y * TILE + 16 - i.img.height - cy), img }); }
  for (const key in m.tags) { const t = m.tags[key]; if (t.type !== 'npc') continue;
    if (t.x < x0 - 1 || t.x > x1 + 1 || t.y < y0 - 2 || t.y > y1 + 1) continue;
    const ch = SPR.chars[t.k]; if (!ch) continue; const img = ch.down[0];
    const bob = Math.sin(G.time * 2 + t.x) > .6 ? 1 : 0;
    list.push({ y: t.y * TILE + 15, draw: (i) => ctx.drawImage(i.img, t.x * TILE + 8 - 8 - cx, t.y * TILE + 16 - i.img.height - cy + i.bob), img, bob }); }
  for (const mo of G.mobs) { if (mo.dead) continue; if (mo.x < cx - 30 || mo.x > cx + V.w + 30 || mo.y < cy - 40 || mo.y > cy + V.h + 40) continue;
    list.push({ y: mo.y, draw: (i) => this.drawMob(i.mo, cx, cy) , mo }); }
  list.push({ y: G.p.y, draw: () => this.drawPlayer(cx, cy) });
  for (const d of G.drops) list.push({ y: d.y, draw: (i) => { const s = d.kind === 'coin' ? SPR.icons.coin : SPR.icons[ITEMS[d.item] ? ITEMS[d.item].icon : 'coin'];
    ctx.drawImage(s, d.x - 5 - cx, d.y - 6 - Math.abs(Math.sin(d.t * 4)) * 3 - cy); }, });
  list.sort((a, b) => a.y - b.y);
  for (const it of list) it.draw(it);
  // projectiles & telegraphs above
  for (const pr of G.projs) { const img = SPR.projs[pr.img]; if (img) ctx.drawImage(img, pr.x - img.width / 2 - cx, pr.y - img.height / 2 - cy); }
  for (const pt of G.parts) {
    if (pt.kind === 'tele') { const pr = 1 - pt.t / pt.dur; ctx.strokeStyle = 'rgba(255,93,93,' + (.4 + pr * .5) + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(pt.x - cx, pt.y - cy, pt.r, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(255,93,93,' + (.08 + pr * .12) + ')'; ctx.fill(); }
    else if (pt.kind === 'ring') { ctx.strokeStyle = pt.col || '#7ee0ff'; ctx.globalAlpha = pt.t / .6; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(pt.x - cx, pt.y - cy, pt.r, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
    else { ctx.fillStyle = pt.col; ctx.fillRect(pt.x - cx, pt.y - cy, pt.s || 2, pt.s || 2); }
  }
  // slash arc
  if (G.p.atkT > 0) {
    const fa = [1.5708, -1.5708, Math.PI, 0][G.p.atkDir];
    const prog = 1 - G.p.atkT / .18; const a = fa + (prog - .5) * 1.6;
    ctx.save(); ctx.translate(G.p.x - cx, G.p.y - 6 - cy); ctx.rotate(a);
    ctx.drawImage(SPR.sl.a, -3, -13); ctx.restore();
  }
  // floating texts
  ctx.font = '7px monospace'; ctx.textAlign = 'center';
  for (const ft of G.texts) { ctx.globalAlpha = Math.min(1, ft.t * 2); ctx.fillStyle = '#000'; ctx.fillText(ft.txt, ft.x - cx + 1, ft.y - cy + 1); ctx.fillStyle = ft.col; ctx.fillText(ft.txt, ft.x - cx, ft.y - cy); }
  ctx.globalAlpha = 1;
  // interact verb
  if (G.mode === 'play') { const f = findFocus(); if (f) { const label = VERB[f.type];
    const lx = f.x * TILE + 8 - cx, ly = f.y * TILE - 12 - cy;
    ctx.fillStyle = 'rgba(5,7,13,.8)'; const w = ctx.measureText(label).width + 8; ctx.fillRect(lx - w / 2, ly - 8, w, 11);
    ctx.fillStyle = '#ffd97a'; ctx.fillText(label, lx, ly); } }
  this.drawLight(ctx, cx, cy);
};
