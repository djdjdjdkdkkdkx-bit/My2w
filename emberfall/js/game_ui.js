'use strict';
/* ===== HUD, toasts, title, touch ===== */
function toast(txt, gold) {
  const t = el('div', 'toast' + (gold ? ' gold' : ''), txt);
  $('toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3200);
  while ($('toasts').children.length > 4) $('toasts').firstChild.remove();
}
const UI = {
  build() {
    const hud = $('hud');
    hud.innerHTML = '<div id="hudL" class="panel">' +
      '<div id="namePlate"><span id="pname">Ashe</span><small id="plvl">Lv 1</small></div>' +
      '<div class="bar hp"><i id="hpfill"></i><span id="hptext"></span></div>' +
      '<div class="bar xp"><i id="xpfill"></i></div>' +
      '<div id="coinRow"><canvas id="icCoin"></canvas><b id="coinN">0</b><canvas id="icPot"></canvas><b id="potN">0</b><canvas id="icPotL"></canvas><b id="potLN">0</b><canvas id="icHope"></canvas><b id="hopeN">0</b></div></div>' +
      '<div id="hudR"><div id="chapterTag" class="panel">…</div><div id="questTracker" class="panel"></div>' +
      '<div id="miniWrap"><canvas id="mini"></canvas></div><div id="hudShards"><canvas id="icShard"></canvas><b id="shardN">0/7</b></div></div>';
    const draw = (id, key) => { const c = $(id); c.width = 12; c.height = 12; c.getContext('2d').drawImage(SPR.icons[key], 0, 0); };
    draw('icCoin', 'coin'); draw('icPot', 'pot_s'); draw('icPotL', 'pot_l'); draw('icHope', 'hope'); draw('icShard', 'shard');
    this.mini = $('mini');
    this.setupTouch();
  },
  onMapChange() {
    const m = G.mapObj; this.mini.width = Math.max(26, Math.ceil(m.w / 2)); this.mini.height = Math.max(20, Math.ceil(m.h / 2));
    this.mini.style.width = '132px'; this.mini.style.height = Math.round(132 * m.h / m.w) + 'px';
  },
  update(dt) {
    const p = G.p; if (!p) return;
    $('pname').textContent = p.name; $('plvl').textContent = 'Lv ' + p.lvl;
    $('hpfill').style.width = U.clamp(p.hp / p.maxhp * 100, 0, 100) + '%';
    $('hptext').textContent = Math.max(0, Math.round(p.hp)) + '/' + p.maxhp;
    $('xpfill').style.width = U.clamp(p.xp / xpNeed(p.lvl) * 100, 0, 100) + '%';
    $('coinN').textContent = p.coins; $('potN').textContent = p.bag.pot_s || 0; $('potLN').textContent = p.bag.pot_l || 0;
    $('hopeN').textContent = G.hope + '/6'; $('shardN').textContent = G.shards + '/7';
    const c = CHAPTERS[G.chapter] || CHAPTERS[0];
    $('chapterTag').innerHTML = '<b style="color:#ffd97a">' + c.n + '</b> · ' + Game.regionAt(p.x, p.y);
    // quest tracker
    let q = null;
    for (const k of ['dawn', 'ch1', 'ch2', 'ch3', 'ch4', 'fin']) { const qq = G.quests[k]; if (qq && !qq.done) { q = { id: k, qq }; break; } }
    let side = null; for (const k in G.quests) { if (k.startsWith('q_') && !G.quests[k].done) { side = { id: k, qq: G.quests[k] }; break; } }
    let html = '';
    if (q) html += '<b>' + QDB[q.id].n + '</b>' + QDB[q.id].steps[Math.min(q.qq.s, QDB[q.id].steps.length - 1)];
    if (side) html += (html ? '<br>' : '') + '<b style="color:#c9a4ff">' + QDB[side.id].n + '</b>' + QDB[side.id].steps[Math.min(side.qq.s, QDB[side.id].steps.length - 1)];
    $('questTracker').innerHTML = html || 'Explore. The world remembers the brave.';
    // boss bar safety
    if (G.boss && !G.boss.dead) { $('bossWrap').classList.remove('hidden'); $('bossFill').style.width = U.clamp(G.boss.hp / G.boss.maxhp * 100, 0, 100) + '%'; }
    this._mmT = (this._mmT || 0) + dt; if (this._mmT > .3) { this._mmT = 0; this.drawMini(); }
    // potion badge
    const pb = $('potBadge'); if (pb) pb.textContent = (p.bag.pot_s || 0) + (p.bag.pot_l || 0) || '';
  },
  drawMini() {
    const m = G.mapObj, c = this.mini, g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height); g.fillStyle = '#0a0c14'; g.fillRect(0, 0, c.width, c.height);
    const u = G.reveals[G.mapKey], cw = Math.ceil(m.w / 4), rev = u ? u.length : 0;
    for (let cy = 0; cy < Math.ceil(m.h / 4); cy++) for (let cx = 0; cx < cw; cx++) {
      if (!u || !u[cy * cw + cx]) continue;
      let col = '#2f4a2f';
      const t = tileAt(m, cx * 4 + 2, cy * 4 + 2);
      if (t === T.WATER || t === T.DEEP) col = '#2a5f8a'; else if (t === T.SAND || t === T.QSAND) col = '#c4a95e';
      else if (t === T.MTN || t === T.CLIFF || t === T.CWALL) col = '#4a4f5e';
      else if (t === T.LAVA) col = '#c95a1e';
      else if (t === T.PATH || t === T.ROAD || t === T.PIER) col = '#8a6a42';
      else if (t === T.KFLOOR || t === T.CFLOOR) col = '#3a4155';
      g.fillStyle = col; g.fillRect(cx, cy, 1, 1);
    }
    // player dot
    const p = G.p; g.fillStyle = '#ffd97a'; g.fillRect(Math.floor(p.x / TILE / 2) - 1, Math.floor(p.y / TILE / 2) - 1, 2, 2);
    g.strokeStyle = 'rgba(255,217,122,.6)'; g.strokeRect(Math.floor(p.x / TILE / 2) - 2.5, Math.floor(p.y / TILE / 2) - 2.5, 5, 5);
  },
  setupTouch() {
    const touchCapable = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const t = $('touch'); t.classList.remove('hidden');
    t.innerHTML = '<div id="stickZone"><div id="stickN"><i></i></div></div>' +
      '<div id="btnsTop"><button class="tbtn menb" id="btnMenu">☰<small>menu</small></button></div>' +
      '<div id="btnsR">' +
      '<div style="position:relative"><button class="tbtn potb" id="btnPot">HP<span id="potBadge"></span></button></div>' +
      '<button class="tbtn useb" id="btnUse">✋<small>use</small></button>' +
      '<button class="tbtn" id="btnRoll">»<small>roll</small></button>' +
      '<button class="tbtn big" id="btnAtk">⚔<small>attack</small></button></div>';
    setupStick($('stickZone'), $('stickN'));
    bindBtn($('btnAtk'), 'atk'); bindBtn($('btnRoll'), 'roll'); bindBtn($('btnUse'), 'use'); bindBtn($('btnPot'), 'pot');
    bindBtn($('btnMenu'), 'menu');
    if (!touchCapable) { t.style.opacity = .0; t.style.pointerEvents = 'none'; t.style.display = 'none'; }
  },
};
/* ===== title screen ===== */
const Title = {
  show() {
    G.mode = 'title'; $('hud').classList.add('hidden'); $('touch').classList.add('hidden');
    $('dlg').classList.add('hidden'); $('menuScr').classList.add('hidden'); $('bossWrap').classList.add('hidden');
    const t = $('titleScr'); t.classList.remove('hidden');
    t.innerHTML = '<div id="tLogo">EMBERFALL</div><div id="tSub">a pixel tale of one small morning</div><div id="tMenu"></div><div id="tFoot">v1.0 · WASD/arrows move · SPACE attack · SHIFT roll · E use · H potion · I bag · M map · Q quests · ESC menu</div>';
    const menu = $('tMenu');
    const add = (label, fn, cls) => { const b = el('button', 'pbtn ' + (cls || ''), label); b.onclick = () => { SFX.play('uiOk'); fn(); }; menu.appendChild(b); return b; };
    add('New Journey', () => { t.classList.add('hidden'); $('hud').classList.remove('hidden'); $('touch').classList.remove('hidden'); Game.newGame(); });
    const cb = add('Continue', () => { t.classList.add('hidden'); $('hud').classList.remove('hidden'); $('touch').classList.remove('hidden'); Game.continueGame(); });
    if (!hasSave()) cb.setAttribute('disabled', 'true');
    add('Epilogues (' + endingsFound() + '/8)', () => this.epilogues());
    add('How to Play', () => this.howto());
  },
  hide() { $('titleScr').classList.add('hidden'); $('hud').classList.remove('hidden'); $('touch').classList.remove('hidden'); },
  epilogues() {
    const t = $('titleScr'); const wrap = el('div', 'panel'); wrap.style.cssText = 'width:min(560px,92vw);max-height:80vh;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px';
    wrap.innerHTML = '<div class="sec" style="margin:0">EPILOGUES — ' + endingsFound() + '/8 FOUND</div>';
    for (const k of END_ORDER) { const e = ENDINGS[k], found = META.endings[k];
      wrap.appendChild(el('div', 'row', '<span class="' + (found ? '' : 'mut') + '">' + (found ? e.t : '???') + '</span><span class="grow mut">' + (found ? e.kind.toUpperCase() : 'undiscovered') + '</span>')); }
    const b = el('button', 'pbtn', 'Back'); b.onclick = () => { wrap.remove(); this.show(); }; wrap.appendChild(b);
    t.innerHTML = ''; t.appendChild(wrap);
  },
  howto() {
    const t = $('titleScr'); const wrap = el('div', 'panel'); wrap.style.cssText = 'width:min(560px,92vw);max-height:80vh;overflow:auto;padding:16px;font-size:8px;line-height:2';
    wrap.innerHTML = '<div class="sec" style="margin:0">HOW TO PLAY</div>' +
      '<p>Explore freely: village, forest, dunes, caves, the Keep.</p><p>Chapters guide the tale; side quests raise <b style="color:#ffd97a">HOPE</b>.</p>' +
      '<p>Choices at boss fights and in town change the ending. There are <b>8 epilogues</b> — 5 bitter, 2 warm, 1 hidden. The hidden one wants <b>7 Ember Shards</b>, mercy for all four bosses, and a certain question asked at the Heart.</p>' +
      '<p style="margin-top:8px"><b>Keys:</b> WASD move · SPACE/J attack · SHIFT/K roll · E/ENTER use & talk · H potion · I inventory · M map · Q quests · ESC menu.</p>' +
      '<p><b>Touch:</b> left stick moves; ⚔ attacks, » rolls, ✋ talks/opens, HP drinks, ☰ menu.</p><p style="margin-top:8px">Campfires save your journey. Resting till dawn heals.</p>';
    const b = el('button', 'pbtn', 'Back'); b.onclick = () => { wrap.remove(); this.show(); }; wrap.appendChild(b);
    t.innerHTML = ''; t.appendChild(wrap);
  },
};
