'use strict';
/* ===== tiny synth audio ===== */
const SFX = {
  ctx: null, master: null, musTimer: null, cur: null, step: 0,
  init() { if (this.ctx) return; try { const AC = window.AudioContext || window.webkitAudioContext; this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(this.ctx.destination); } catch (e) { } },
  unlock() { this.init(); if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  vol() { return Settings.sfx ? 0.5 : 0; },
  blip(f, dur, type, vol, slide) {
    if (!this.ctx || !Settings.sfx) return; const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
    g.gain.setValueAtTime((vol || .2) * (Settings.sfx ? 1 : 0), t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + .02);
  },
  noise(dur, vol, freq) {
    if (!this.ctx || !Settings.sfx) return; const t = this.ctx.currentTime, n = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 800;
    const g = this.ctx.createGain(); g.gain.value = vol || .2;
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
  },
  play(n) {
    switch (n) {
      case 'step': this.noise(.05, .05, 500); break;
      case 'swing': this.blip(300, .08, 'sawtooth', .1, 500); break;
      case 'hit': this.blip(180, .1, 'square', .22, -90); this.noise(.06, .12, 2000); break;
      case 'hurt': this.blip(140, .2, 'sawtooth', .25, -80); break;
      case 'coin': this.blip(900, .07, 'square', .16); setTimeout(() => this.blip(1350, .1, 'square', .14), 60); break;
      case 'pick': this.blip(700, .09, 'triangle', .18, 300); break;
      case 'potion': this.blip(500, .12, 'triangle', .2, 250); setTimeout(() => this.blip(760, .14, 'triangle', .16), 80); break;
      case 'lvl': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, .16, 'square', .18), i * 90)); break;
      case 'chest': this.blip(220, .1, 'square', .16, 120); setTimeout(() => this.blip(440, .12, 'square', .14), 90); break;
      case 'quest': this.blip(660, .12, 'triangle', .2); setTimeout(() => this.blip(880, .16, 'triangle', .18), 110); break;
      case 'die': this.blip(300, .4, 'sawtooth', .2, -240); this.noise(.3, .15, 400); break;
      case 'roar': this.blip(90, .5, 'sawtooth', .3, 40); this.noise(.4, .2, 300); break;
      case 'ui': this.blip(660, .05, 'square', .1); break;
      case 'uiOk': this.blip(520, .08, 'square', .12, 160); break;
      case 'roll': this.noise(.09, .08, 900); break;
      case 'boom': this.noise(.25, .28, 500); this.blip(80, .3, 'sine', .3, -30); break;
      case 'zap': this.blip(1200, .12, 'square', .12, -700); break;
      case 'shard': [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => this.blip(f, .2, 'triangle', .16), i * 80)); break;
      case 'end': [392, 494, 587, 784].forEach((f, i) => setTimeout(() => this.blip(f, .3, 'triangle', .18), i * 140)); break;
    }
  },
  /* music: simple scheduled pattern */
  MUS: {
    title: { bpm: 92, notes: [220, 277, 330, 220, 196, 247, 294, 196], bass: [110, 110, 98, 98], wave: 'triangle', pad: 'sine' },
    village: { bpm: 100, notes: [330, 392, 440, 392, 330, 294, 330, 392], bass: [165, 131, 147, 131], wave: 'triangle', pad: 'sine' },
    forest: { bpm: 84, notes: [330, 349, 392, 349, 330, 294, 262, 294], bass: [82, 87, 98, 87], wave: 'square', pad: 'sine' },
    desert: { bpm: 78, notes: [294, 311, 349, 311, 294, 262, 247, 262], bass: [73, 78, 87, 78], wave: 'sawtooth', pad: 'triangle' },
    cave: { bpm: 66, notes: [220, 233, 262, 233, 196, 208, 233, 208], bass: [55, 58, 65, 58], wave: 'sine', pad: 'sine' },
    keep: { bpm: 88, notes: [262, 277, 330, 277, 294, 311, 349, 311], bass: [65, 69, 82, 69], wave: 'square', pad: 'sawtooth' },
    grove: { bpm: 72, notes: [440, 523, 587, 523, 494, 523, 587, 494], bass: [110, 131, 147, 131], wave: 'triangle', pad: 'sine' },
    boss: { bpm: 132, notes: [196, 233, 196, 262, 196, 233, 311, 262], bass: [49, 58, 49, 65], wave: 'sawtooth', pad: 'square' },
    end: { bpm: 70, notes: [262, 330, 392, 523, 392, 330, 294, 330], bass: [65, 82, 98, 82], wave: 'triangle', pad: 'sine' },
  },
  playMusic(key) {
    if (this.cur === key) return; this.cur = key; if (this.musTimer) { clearInterval(this.musTimer); this.musTimer = null; }
    if (!this.ctx || !Settings.music || !key || !this.MUS[key]) return;
    const m = this.MUS[key]; this.step = 0; const stepDur = 60 / m.bpm / 2;
    this.musTimer = setInterval(() => {
      if (!this.ctx || !Settings.music) return; const t = this.ctx.currentTime; const s = this.step;
      const n = m.notes[s % m.notes.length]; this.tone(n, stepDur * 1.8, m.wave, .045);
      if (s % 2 === 0) this.tone(m.bass[(s / 2) % m.bass.length], stepDur * 3.4, m.pad, .06);
      if (key === 'boss' && s % 4 === 0) this.noise(.05, .06, 300);
      this.step++;
    }, stepDur * 1000);
  },
  tone(f, dur, type, vol) { if (!this.ctx) return; const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(vol || .06, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + .05); },
  stopMusic() { this.cur = null; if (this.musTimer) { clearInterval(this.musTimer); this.musTimer = null; } },
};
