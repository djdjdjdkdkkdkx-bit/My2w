'use strict';
/* ===== game core: state, loop, map travel ===== */
const Game = {
  cv: null, ctx: null, last: 0, acc: 0, mapSwitchCd: 0,
  init() {
    this.cv = $('cv'); this.ctx = this.cv.getContext('2d');
    buildSprites(); buildWorld(); buildSolidDecos();
    Input.init(); loadMeta();
    this.resize(); window.addEventListener('resize', () => this.resize());
    UI.build();
    G.mode = 'title'; Title.show(); SFX.playMusic('title');
    this.light = cnv(320, 240); this.lightCtx = this.light.getContext('2d');
    requestAnimationFrame(t => this.frame(t));
  },
  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    V.zoom = w >= 1100 ? 3 : w >= 640 ? 3 : 2; if (w < 480) V.zoom = 2;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    V.w = Math.ceil(w / V.zoom); V.h = Math.ceil(h / V.zoom);
    this.cv.width = Math.ceil(w / V.zoom * dpr); this.cv.height = Math.ceil(h / V.zoom * dpr);
    this.cv.style.width = w + 'px'; this.cv.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.ctx.imageSmoothingEnabled = false;
    V.dpr = dpr;
  },
  frame(t) {
    requestAnimationFrame(tt => this.frame(tt));
    let dt = (t - this.last) / 1000; this.last = t; if (dt > .1) dt = .1;
    if (G.hitstop > 0) { G.hitstop -= dt; dt *= .12; }
    G.time += dt; G.playtime += dt;
    this.update(dt); this.render(dt);
    Input.endFrame();
  },
  update(dt) {
    G.clock = (G.clock + dt / 6) % 1440; // 1 real sec = 10 game-min
    updateTelegraphs(dt);
    for (const pt of G.parts) { pt.t -= dt; if (pt.kind === 'p') { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += (pt.g || 0) * dt; } if (pt.kind === 'ring') { pt.r += pt.vr * dt; } }
    G.parts = G.parts.filter(p => p.t > 0);
    for (const ft of G.texts) { ft.t -= dt; ft.y -= 26 * dt; }
    G.texts = G.texts.filter(t => t.t > 0);
    if (G.mode !== 'play') {
      if (G.mode === 'dialog') Dlg.update(dt);
      else if (G.mode === 'menu' && Input.edge('menu')) Menus.close();
      else if (G.mode === 'title') Title.update(dt);
      return;
    }
    Game.checkMenus();
    updatePlayer(dt); updateMobs(dt); updateProjs(dt); updateDrops(dt);
    G.mapSwitchCd = Math.max(0, G.mapSwitchCd - dt);
    this.checkTags(); this.spawnTick(dt);
    // camera
    const p = G.p, m = G.mapObj;
    const tx = U.clamp(p.x - V.w / 2, 0, Math.max(0, m.w * TILE - V.w)), ty = U.clamp(p.y - V.h / 2, 0, Math.max(0, m.h * TILE - V.h));
    G.cam.x = U.lerp(G.cam.x, tx, .14); G.cam.y = U.lerp(G.cam.y, ty, .14);
    G.cam.shake *= Math.pow(.001, dt);
    this.weather();
    if (Settings.autosave && G.pendingSave) { G.pendingSave = false; saveGame(true); }
    UI.update(dt);
  },
  spawnTick(dt) {
    this._st = (this._st || 0) + dt; if (this._st < .4) return; this._st = 0;
    const m = G.mapObj, p = G.p;
    if (!m.zones || !m.zones.length) return;
    for (const z of m.zones) {
      const inZone = p.x > z.x0 * TILE && p.x < z.x1 * TILE && p.y > z.y0 * TILE && p.y < z.y1 * TILE;
      if (!inZone) continue;
      const count = G.mobs.filter(mm => !mm.boss && !mm.dead).length;
      if (count >= z.cap) break;
      if (m.safe && U.d2(p.x, p.y, m.safe.x * TILE, m.safe.y * TILE) < m.safe.r * m.safe.r) break;
      for (let tries = 0; tries < 8; tries++) {
        const ang = Math.random() * TAU, dist = U.irnd(150, 300);
        const x = p.x + Math.cos(ang) * dist, y = p.y + Math.sin(ang) * dist;
        const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
        if (tx < z.x0 || ty < z.y0 || tx > z.x1 || ty > z.y1) continue;
        if (collides(m, x, y, 8)) continue;
        if (m.safe && U.d2(x, y, m.safe.x * TILE, m.safe.y * TILE) < m.safe.r * m.safe.r) continue;
        spawnMob(U.pick(Math.random, z.w), x, y); break;
      }
    }
  },
  newGame() {
    G.flags = {}; G.quests = {}; G.opened = {}; G.gates = {}; G.triggers = {}; G.hope = 0; G.shards = 0; G.chapter = 0; G.playtime = 0; G.clock = 480;
    G.reveals = {}; G.spawnPt = { map: 'world', x: 108 * TILE + 8, y: 46 * TILE + 8 };
    makePlayer(108 * TILE + 8, 46 * TILE + 8, 0);
    this.goto('world', 108 * TILE + 8, 46 * TILE + 8, 0, true);
    G.mode = 'play'; addQuest('dawn');
    Dlg.runArray(DLG._prologue());
    saveGame(true);
  },
  continueGame() { if (!loadInto()) { toast('No save found'); return; } this.goto(G.mapKey, G.p.x, G.p.y, G.p.face, true); G.mode = 'play'; this.chCard(G.chapter, false); },
  goto(mapKey, x, y, face, instant) {
    const m = MAPS[mapKey]; if (!m) return;
    if (G.boss) delete G.triggers[G.boss.key + '_intro'];
    G.mapKey = mapKey; G.mapObj = m; G.mobs = []; G.projs = []; G.boss = null; $('bossWrap').classList.add('hidden');
    G.p.x = x; G.p.y = y; if (face !== undefined) G.p.face = face;
    G.cam.x = U.clamp(x - V.w / 2, 0, Math.max(0, m.w * TILE - V.w)); G.cam.y = U.clamp(y - V.h / 2, 0, Math.max(0, m.h * TILE - V.h));
    revealRadius(mapKey, Math.floor(x / TILE), Math.floor(y / TILE), 7);
    G.pendingSave = G.chapter > 0 && Settings.autosave;
    SFX.playMusic(this.musicFor(mapKey));
    UI.onMapChange();
  },
  musicFor(k) {
    if (k === 'cave1' || k === 'cave2') return 'cave'; if (k === 'keep') return 'keep'; if (k === 'grove') return 'grove';
    if (k !== 'world') return 'cave';
    const r = this.regionAt(G.p.x, G.p.y);
    if (r === 'Ashen Dunes') return 'desert'; if (r === 'Whisperwood') return 'forest'; if (r === 'Ember Keep') return 'keep'; return 'village';
  },
  regionAt(px, py) {
    const x = px / TILE, y = py / TILE;
    if (x >= 94 && x <= 128 && y >= 28 && y <= 60) return 'Bramblebrook';
    if (x >= 28 && x <= 108 && y >= 50 && y <= 142) return 'Whisperwood';
    if (x >= 160 && y <= 54) return 'Ember Keep';
    if (x >= 136 && y >= 56) return 'Ashen Dunes';
    if (y <= 52) return 'Emberrise Mountains';
    if (U.dist(x, y, 108, 152) < 26) return 'Lake Miren';
    return 'Emberfall Wilds';
  },
  checkTags() {
    if (G.mapSwitchCd > 0) return;
    const p = G.p, m = G.mapObj, tx = Math.floor(p.x / TILE), ty = Math.floor(p.y / TILE);
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const t = m.tags[(tx + ox) + ',' + (ty + oy)]; if (!t) continue;
      const d = U.dist(p.x, p.y, t.x * TILE + 8, t.y * TILE + 8);
      if (d > 14) continue;
      if (t.type === 'portal' && t.auto) { if (this.tryPortal(t)) return; }
      else if (t.type === 'gate' && !G.gates[t.gate]) {
        const ok = !t.need || t.need();
        if (ok) { G.gates[t.gate] = 1; F(t.gate + '_open', 1); SFX.play('chest'); toast('The gate opens!', 1); }
        else if (G.mapSwitchCd <= 0) { G.mapSwitchCd = 2; toast(t.msg || 'It will not open.'); }
      }
      else if (t.type === 'trig' && t.cond && t.cond()) { t.run(); }
      else if (t.type === 'boss') this.tryBoss(t);
      else if (t.type === 'heart' && G.chapter >= 5 && !got('finale_at')) { F('finale_at', 1); Dlg.runArray(DLG.finale_enter().concat([{ go: 'finale' }])); }
    }
  },
  tryPortal(t) {
    if (t.req && !t.req()) { if (G.mapSwitchCd <= 0) { G.mapSwitchCd = 2.5; toast(t.reqMsg || 'It will not open.'); } return false; }
    G.mapSwitchCd = 1; SFX.play('roll');
    this.fadeIn('#05070d', 260, () => { this.goto(t.map, t.tx * TILE + 8, t.ty * TILE + 8, G.p.face); this.fadeOut(260); toast(mapNice(t.map), 0); });
    return true;
  },
  tryBoss(t) {
    const key = t.boss, done = got(key + '_done');
    if (done || G.boss || G.mode !== 'play') return;
    const chNeed = { warden: 1, sovereign: 2, deepking: 3, marshal: 4 }[key];
    if (G.chapter < chNeed) { if (G.mapSwitchCd <= 0) { G.mapSwitchCd = 3; toast('Something huge sleeps here. It is not time.'); } return; }
    if (G.triggers[key + '_intro']) return;
    G.triggers[key + '_intro'] = 1;
    Dlg.runArray(BOSS_SCENES[key].intro(), { after: () => { const m = spawnBoss(key, t.x * TILE + 8, t.y * TILE + 8); if (m) G.spawnPt = { map: G.mapKey, x: (t.x - 2) * TILE + 8, y: (t.y + 3) * TILE + 8 }; } });
  },
  afterBoss(key) {
    F(key + '_done', 1); sparedAllCheck(); saveGame(true);
    const flow = { warden: () => { this.chSet(2); addQuest('ch2'); }, sovereign: () => { this.chSet(3); addQuest('ch3'); },
      deepking: () => { Dlg.run('ch3_after'); }, marshal: () => { this.chSet(5); addQuest('fin'); toast('The Heart chamber awaits beyond the throne.', 1); } };
    (flow[key] || (() => { }))();
  },
  chSet(n) { if (n > G.chapter) { G.chapter = n; this.chCard(n, true); } },
  chScene(k) { Dlg.run(k); },
  chCard(n, big) { const c = CHAPTERS[n] || CHAPTERS[0]; if (!big) return;
    const cd = $('card'); cd.classList.remove('hidden');
    cd.innerHTML = '<div class="cnum">' + c.n + '</div><div class="rule"></div><div class="ctitle">' + c.t + '</div>';
    SFX.play('quest');
    clearTimeout(this._cardT); this._cardT = setTimeout(() => cd.classList.add('hidden'), 2600);
  },
  fadeIn(color, ms, cb) { const f = this.fadeDiv || (this.fadeDiv = el('div')); f.style.cssText = 'position:fixed;inset:0;z-index:80;pointer-events:none;transition:opacity ' + ms + 'ms;background:' + color; document.body.appendChild(f);
    requestAnimationFrame(() => { f.style.opacity = 1; }); setTimeout(() => { if (cb) cb(); }, ms + 30); },
  fadeOut(ms) { if (this.fadeDiv) { const f = this.fadeDiv; f.style.opacity = 0; setTimeout(() => f.remove(), ms + 50); } },
  showEnding(key) {
    G.mode = 'ending'; const e = ENDINGS[key]; SFX.stopMusic(); SFX.playMusic('end');
    const scr = $('endScr') || document.body.appendChild(el('div', '', '')); scr.id = 'endScr';
    scr.innerHTML = '<div id="endInner" class="panel"><div id="endKind">ENDING · ' + e.kind.toUpperCase() + ' · ' + endingsFound() + '/8 FOUND</div>' +
      '<div id="endTitle" class="' + e.kind + '">' + e.t + '</div><div class="rule" style="width:120px;height:3px;background:#ffd97a"></div>' +
      '<div id="endBody">' + e.txt + '</div><div id="endFoot">Hope carried: ' + G.hope + ' · Shards: ' + G.shards + '/7 · Lv ' + G.p.lvl + '</div>' +
      '<div style="display:flex;gap:8px"><button class="pbtn" id="endTitleBtn">Title Screen</button><button class="pbtn" id="endLoadBtn">Load Last Save</button></div></div>';
    const root = $('uiRoot'); root.appendChild(scr);
    $('endTitleBtn').onclick = () => { scr.remove(); G.mode = 'title'; Title.show(); SFX.playMusic('title'); };
    $('endLoadBtn').onclick = () => { scr.remove(); if (hasSave()) { this.continueGame(); } else { G.mode = 'title'; Title.show(); } };
  },
};
