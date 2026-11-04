'use strict';
/* build the dialog DOM once (index.html ships an empty #dlg) */
(function buildDlgBox() {
  const d = $('dlg'); if (!d || $('dlgBox')) return;
  d.innerHTML = '<div id="dlgBox" class="panel"><span id="dlgName"></span><div id="dlgText"></div><div id="dlgChoices"></div><div id="dlgHint">▼</div></div>';
})();

/* ===== dialogue runner ===== */
const Dlg = {
  q: [], i: 0, typing: false, shown: '', full: '', cur: null, after: null,
  run(key, opts) { const f = DLG[key]; if (!f) { console.warn('no dlg', key); return; } this.runArray(f(), opts); },
  runArray(steps, opts) {
    this.q = steps.slice(); this.after = (opts && opts.after) || null; this.i = 0; G.mode = 'dialog';
    $('dlg').classList.remove('hidden'); this.next();
  },
  next() {
    if (this.i >= this.q.length) return this.close();
    const s = this.q[this.i++];
    if (s.do) {
      const q0 = this.q;
      try { s.do(); } catch (e) { console.error(e); }
      if (this.q !== q0) return; // do() handed control to another dialog/menu
      if (s.go) { const k = s.go; if (k === '_close') return this.close(); return this.run(k, { after: this.after }); }
      return this.next();
    }
    if (s.go) { const k = s.go; if (k === '_close') return this.close(); return this.run(k, { after: this.after }); }
    if (s.br) { const k = s.br(); if (!k) return this.next(); if (k === '_close') return this.close(); return this.run(k, { after: this.after }); }
    if (s.c) { this.cur = null; this.showChoices(s.c); return; }
    // line
    this._ch = null; this.cur = s; this.full = s.t; this.shown = ''; this.typing = true;
    $('dlgName').textContent = s.w || ''; $('dlgName').style.display = s.w ? 'block' : 'none';
    $('dlgChoices').classList.add('hidden'); $('dlgChoices').innerHTML = '';
    $('dlgHint').style.visibility = 'hidden';
  },
  close() {
    $('dlg').classList.add('hidden');
    if (G.mode === 'dialog') { G.mode = 'play'; SFX.playMusic(Game.musicFor(G.mapKey)); }
    const a = this.after; this.after = null; if (a) a();
  },
  showChoices(choices) {
    const box = $('dlgChoices'); if (!box) return this.next();
    box.innerHTML = ''; box.classList.remove('hidden');
    $('dlgHint').style.visibility = 'hidden';
    const list = choices.filter(c => !c.cond || c.cond());
    if (!list.length) return this.next();
    this._ch = list; this._chI = 0;
    list.forEach((c, idx) => {
      const b = el('button', 'pbtn' + (idx === 0 ? ' sel' : ''), c.t);
      b.onpointerdown = e => { e.preventDefault(); this.pick(idx); };
      b.onmouseenter = () => { this._chI = idx; this.hl(); };
      box.appendChild(b);
    });
  },
  hl() { const bs = $('dlgChoices').children; for (let i = 0; i < bs.length; i++) bs[i].classList.toggle('sel', i === this._chI); },
  pick(idx) {
    if (!this._ch) return; const c = this._ch[idx]; if (!c) return; SFX.play('uiOk'); vibrate(15);
    $('dlgChoices').classList.add('hidden'); this._ch = null;
    const q0 = this.q;
    if (c.f) { try { c.f(); } catch (e) { console.error(e); } }
    if (this.q !== q0 || G.mode !== 'dialog') { $('dlg').classList.add('hidden'); return; } // choice handed control elsewhere
    if (c.end) { this.q = []; this.after = null; $('dlg').classList.add('hidden'); return; }
    if (c.steps) { const more = c.steps(); this.q = this.q.slice(this.i).concat(more); this.i = 0; return this.next(); }
    if (c.go) { if (c.go === '_close') return this.close(); return this.run(c.go, { after: this.after }); }
    this.next();
  },
  update(dt) {
    if (G.mode !== 'dialog') return;
    if (this.typing) {
      const spd = Input.hold('atk') || Input.hold('use') ? 3 : 1;
      this._tt = (this._tt || 0) + dt * 60 * spd;
      const n = Math.min(this.full.length, Math.floor(this._tt / 2));
      if (n !== this.shown.length) { this.shown = this.full.slice(0, n); if (Math.random() < .3) SFX.blip(700 + Math.random() * 300, .02, 'square', .03); }
      $('dlgText').textContent = this.shown;
      if (n >= this.full.length) { this.typing = false; $('dlgHint').style.visibility = 'visible'; this._tt = 0; }
      if (Input.edge('use') || Input.edge('atk')) { this.shown = this.full; $('dlgText').textContent = this.full; this.typing = false; $('dlgHint').style.visibility = 'visible'; this._tt = 0; }
    } else if (this._ch && !$('dlgChoices').classList.contains('hidden')) {
      if (Input.edge('down')) { this._chI = (this._chI + 1) % this._ch.length; this.hl(); SFX.play('ui'); }
      if (Input.edge('up')) { this._chI = (this._chI + this._ch.length - 1) % this._ch.length; this.hl(); SFX.play('ui'); }
      if (Input.edge('use')) this.pick(this._chI);
    } else if (Input.edge('use') || Input.edge('atk')) {
      this.next(); SFX.play('ui');
    }
  },
};
