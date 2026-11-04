'use strict';
/* ===== pause / inventory / quests / map / shop ===== */
const Menus = {
  open(which) {
    G.mode = 'menu'; G.panel = which; const s = $('menuScr'); s.classList.remove('hidden');
    s.innerHTML = '<div id="menuBox" class="panel"></div>';
    this.render();
  },
  close() { $('menuScr').classList.add('hidden'); $('menuScr').innerHTML = ''; G.mode = 'play'; G.panel = null; },
  render() {
    const box = $('menuBox'); box.innerHTML = '';
    const tabs = el('div', '', ''); tabs.id = 'menuTabs';
    const mk = (id, label) => { const b = el('button', 'pbtn' + (G.panel === id ? ' sel' : ''), label); b.onclick = () => { SFX.play('ui'); G.panel = id; this.render(); }; tabs.appendChild(b); };
    mk('pause', '☰'); mk('inv', 'Bag'); mk('quests', 'Quests'); mk('map', 'Map'); mk('set', 'Settings');
    box.appendChild(tabs);
    const body = el('div', '', ''); body.id = 'menuBody'; box.appendChild(body);
    const foot = el('div', '', ''); foot.id = 'menuFoot';
    const back = el('button', 'pbtn', 'Back (ESC)'); back.onclick = () => { SFX.play('ui'); this.close(); };
    foot.appendChild(back); box.appendChild(foot);
    this['r_' + G.panel] && this['r_' + G.panel](body, foot);
  },
  r_pause(body) {
    body.appendChild(el('div', 'sec', 'PAUSED — ' + (CHAPTERS[G.chapter] || CHAPTERS[0]).n + ' · ' + mapNice(G.mapKey)));
    const col = el('div', 'col'); body.appendChild(col);
    const add = (label, fn, cls) => { const b = el('button', 'pbtn ' + (cls || ''), label); b.onclick = () => { SFX.play('uiOk'); fn(); }; col.appendChild(b); };
    add('Resume', () => this.close());
    add('Inventory', () => { G.panel = 'inv'; this.render(); });
    add('Quests & Hope', () => { G.panel = 'quests'; this.render(); });
    add('World Map', () => { G.panel = 'map'; this.render(); });
    add('Save Journey', () => { saveGame(); this.render(); });
    add('Settings', () => { G.panel = 'set'; this.render(); });
    add('Quit to Title', () => { saveGame(true); this.close(); Title.show(); }, 'danger');
    const side = el('div', 'col side'); body.appendChild(side);
    side.innerHTML = '<b>Ashe</b> Lv ' + G.p.lvl + '<br>HP ' + Math.round(G.p.hp) + '/' + G.p.maxhp + '<br>ATK ' + playerAtk() + ' · DEF ' + playerDef() +
      '<br>Coins ' + G.p.coins + '<br>Hope ' + G.hope + '/6<br>Shards ' + G.shards + '/7<br><br><span class="mut">Playtime ' + Math.floor(G.playtime / 60) + 'm</span>';
  },
  r_inv(body) {
    const p = G.p, col = el('div', 'col'); body.appendChild(col);
    const section = (title) => { const s = el('div', 'sec', title); col.appendChild(s); const l = el('div', 'list'); col.appendChild(l); return l; };
    const row = (list, icon, name, sub, act, actLabel, eq) => {
      const r = el('div', 'row'); r.innerHTML = ''; const c = cnv(16, 16); c.getContext('2d').drawImage(SPR.icons[icon] || SPR.decos.chest, 0, 0, 16, 16, 0, 0, 16, 16);
      r.appendChild(c); const g = el('div', 'grow', name + (sub ? ' <span class="mut">· ' + sub + '</span>' : '') + (eq ? ' <span class="eq">[equipped]</span>' : ''));
      r.appendChild(g); if (act) { const b = el('button', 'pbtn', actLabel || 'Equip'); b.onclick = (e) => { e.stopPropagation(); act(); this.render(); }; r.appendChild(b); }
      list.appendChild(r); return r;
    };
    const wl = section('WEAPONS'); for (const k of p.ownW) row(wl, WPN[k].icon, WPN[k].n, 'ATK +' + WPN[k].atk, () => { p.wpn = k; SFX.play('uiOk'); }, null, p.wpn === k);
    const al = section('ARMOR'); for (const k of p.ownA) row(al, ARM[k].icon, ARM[k].n, 'DEF +' + ARM[k].def, () => { p.arm = k; SFX.play('uiOk'); }, null, p.arm === k);
    const cl = section('CHARMS'); if (!p.ownC.length) cl.appendChild(el('div', 'row mut', 'None yet — the world provides.'));
    for (const k of p.ownC) row(cl, ACC[k].icon, ACC[k].n, ACC[k].d, () => { p.acc = p.acc === k ? null : k; SFX.play('uiOk'); }, p.acc === k ? 'Unequip' : 'Equip', p.acc === k);
    const il = section('ITEMS'); let any = false;
    for (const k in p.bag) { const n = p.bag[k]; if (!n) continue; any = true; const it = ITEMS[k];
      row(il, it.icon, it.n + ' ×' + n, it.d || '', it.use ? () => { if (it.use === 'heal30') { takeItem(k); healPlayer(30); SFX.play('potion'); } else if (it.use === 'heal70') { takeItem(k); healPlayer(70); SFX.play('potion'); } else if (it.use === 'elixir') { takeItem(k); healPlayer(999); F('elixirT', 20); SFX.play('lvl'); } else if (it.use === 'map') { toast('The map unfolds in your mind.', 1); F('map_seen', 1); takeItem(k); } this.render(); } : null, it.use ? 'Use' : null); }
    if (!any) il.appendChild(el('div', 'row mut', 'Empty pockets, full heart.'));
  },
  r_quests(body) {
    const col = el('div', 'col'); body.appendChild(col);
    col.appendChild(el('div', 'sec', 'QUESTS'));
    let any = false;
    for (const k in G.quests) { const q = G.quests[k], d = QDB[k]; if (!d) continue; any = true;
      col.appendChild(el('div', 'row' + (q.done ? '' : ''), '<div class="grow"><b style="color:' + (q.done ? '#8fe08f' : '#ffd97a') + '">' + d.n + '</b><br><span class="mut">' + (q.done ? 'Complete.' : d.steps[Math.min(q.s, d.steps.length - 1)]) + '</span></div>')); }
    if (!any) col.appendChild(el('div', 'row mut', 'No quests yet. Talk to the village.'));
    col.appendChild(el('div', 'sec', 'HOPE — the village\'s heart'));
    const hr = el('div', 'row'); hr.innerHTML = '';
    for (let i = 0; i < 6; i++) { const c = cnv(14, 14); const g = c.getContext('2d'); g.drawImage(SPR.icons.hope, 0, 0); if (i >= G.hope) g.globalAlpha = .22; hr.appendChild(c); }
    col.appendChild(hr);
    col.appendChild(el('div', 'hintline', 'Hope grows from kindness: side quests, mercy toward beaten foes, truths told. It shapes which dawn you earn.'));
  },
  r_map(body) {
    const col = el('div', 'col'); body.appendChild(col);
    col.appendChild(el('div', 'sec', mapNice(G.mapKey) + ' — fog lifts as you walk'));
    const cv = el('canvas', ''); cv.id = 'mapCv'; const m = G.mapObj; cv.width = m.w; cv.height = m.h;
    col.appendChild(cv); const g = cv.getContext('2d'); g.fillStyle = '#0a0c14'; g.fillRect(0, 0, m.w, m.h);
    const u = G.reveals[G.mapKey], cw = Math.ceil(m.w / 4);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (!u || !u[(y >> 2) * cw + (x >> 2)]) continue;
      const t = m.t[y * m.w + x]; let col = '#2f4a2f';
      if (t === T.WATER || t === T.DEEP) col = '#2a5f8a'; else if (t === T.SAND || t === T.QSAND) col = '#c4a95e';
      else if (t === T.MTN || t === T.CLIFF) col = '#4a4f5e'; else if (t === T.CWALL) col = '#2b3040';
      else if (t === T.LAVA) col = '#c95a1e'; else if (t === T.PATH || t === T.PIER) col = '#8a6a42'; else if (t === T.ROAD) col = '#7a7a8a';
      else if (t === T.CFLOOR) col = '#3a4155'; else if (t === T.KFLOOR) col = '#465273'; else if (t === T.WWALL || t === T.ROOF) col = '#a34b3b';
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
    // markers
    for (const key in m.tags) { const t = m.tags[key]; if (t.type === 'chest' && !G.opened[G.mapKey + ':' + key]) { g.fillStyle = '#ffd97a'; g.fillRect(t.x, t.y, 1, 1); } }
    const p = G.p; g.fillStyle = '#fff'; g.fillRect(Math.floor(p.x / TILE) - 1, Math.floor(p.y / TILE) - 1, 2, 2);
    const side = el('div', 'col side'); body.appendChild(side);
    side.innerHTML = '<b>Regions</b><br>Bramblebrook — home<br>Whisperwood — west<br>Ashen Dunes — east<br>Emberrise — north<br>Lake Miren — south<br>Ember Keep — far north-east<br><br><b>Chests</b> glow gold.<br><span class="mut">Some doors only open for the kind, the lit, or the determined.</span>';
  },
  r_set(body) {
    const col = el('div', 'col'); body.appendChild(col);
    col.appendChild(el('div', 'sec', 'SETTINGS'));
    const tog = (label, key, fn) => { const b = el('button', 'pbtn tog', label + ': ' + (Settings[key] ? 'ON' : 'OFF')); b.onclick = () => { Settings[key] = !Settings[key]; META.save(); if (fn) fn(); b.textContent = label + ': ' + (Settings[key] ? 'ON' : 'OFF'); SFX.play('uiOk'); }; col.appendChild(b); };
    tog('Music', 'music', () => { if (!Settings.music) SFX.stopMusic(); else SFX.playMusic(Game.musicFor(G.mapKey)); });
    tog('Sound FX', 'sfx');
    tog('Autosave', 'autosave');
    tog('Vibration', 'vib');
    col.appendChild(el('div', 'hintline', 'Progress saves at campfires, chapter turns, and map crossings (autosave). Manual save any time from the pause menu.'));
  },
  r_shop_notneeded() { },
  shop(who) {
    G.mode = 'menu'; G.panel = 'shop'; const s = $('menuScr'); s.classList.remove('hidden');
    s.innerHTML = '<div id="menuBox" class="panel"></div>';
    const stock = shopStock(who); const box = $('menuBox');
    box.innerHTML = '<div class="sec" style="margin:0">' + stock.n + '</div><div class="mut" style="font-size:7px;color:#8a97b8;margin:6px 0">' + stock.greet + ' · You carry ' + G.p.coins + ' coins.</div>';
    const body = el('div', 'col'); box.appendChild(body);
    for (const [key, price] of stock.list) {
      const g = gearKey(key); const nm = itemName(g.id); const icn = g.t === 'w' ? WPN[g.id].icon : g.t === 'a' ? ARM[g.id].icon : ITEMS[g.id].icon;
      const owned = g.t === 'w' ? G.p.ownW.includes(g.id) : g.t === 'a' ? G.p.ownA.includes(g.id) : (g.id === 'map' && F('map_seen'));
      const r = el('div', 'row'); const c = cnv(16, 16); c.getContext('2d').drawImage(SPR.icons[icn] || SPR.icons.coin, 0, 0, 16, 16, 0, 0, 16, 16);
      r.appendChild(c);
      const sub = g.t === 'w' ? 'ATK +' + WPN[g.id].atk : g.t === 'a' ? 'DEF +' + ARM[g.id].def : (ITEMS[g.id].d || '');
      r.appendChild(el('div', 'grow', nm + ' <span class="mut">· ' + sub + '</span>'));
      r.appendChild(el('span', 'mut', price + 'c'));
      const b = el('button', 'pbtn', owned ? 'Owned' : 'Buy');
      if (owned) b.setAttribute('disabled', 'true');
      b.onclick = () => { buyItem(key, price); this.shop(who); };
      r.appendChild(b); body.appendChild(r);
    }
    const foot = el('div'); foot.style.cssText = 'display:flex;justify-content:flex-end;gap:8px';
    const back = el('button', 'pbtn', 'Leave'); back.onclick = () => { SFX.play('ui'); this.close(); }; foot.appendChild(back);
    box.appendChild(foot);
  },
};
