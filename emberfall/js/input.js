'use strict';
/* ===== input: keyboard + touch ===== */
const Input = {
  down: {}, edges: {}, ax: 0, ay: 0, touchMode: false,
  KEYS: { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'atk', KeyJ: 'atk', KeyK: 'roll', ShiftLeft: 'roll', ShiftRight: 'roll', KeyE: 'use', Enter: 'use', KeyH: 'pot',
    KeyI: 'inv', KeyM: 'map', KeyQ: 'quests', Escape: 'menu', KeyP: 'menu', Tab: 'quests' },
  init() {
    window.addEventListener('keydown', e => {
      SFX.unlock(); const a = this.KEYS[e.code]; if (!a) return; e.preventDefault();
      if (!this.down[a]) this.edges[a] = true; this.down[a] = true; this.touchMode = false;
    });
    window.addEventListener('keyup', e => { const a = this.KEYS[e.code]; if (!a) return; e.preventDefault(); this.down[a] = false; });
    window.addEventListener('blur', () => { this.down = {}; });
  },
  set(name, on) { SFX.unlock(); if (on && !this.down[name]) this.edges[name] = true; this.down[name] = on; },
  hold(n) { return !!this.down[n]; },
  edge(n) { return !!this.edges[n]; },
  endFrame() { this.edges = {}; },
  axis() {
    let x = 0, y = 0;
    if (this.hold('left')) x -= 1; if (this.hold('right')) x += 1;
    if (this.hold('up')) y -= 1; if (this.hold('down')) y += 1;
    if (x || y) { const l = Math.hypot(x, y); this.ax = x / l; this.ay = y / l; this.touchMode = false; }
    else if (!this.touchMode) { this.ax = 0; this.ay = 0; }
    return { x: this.ax, y: this.ay };
  },
  clearAxis() { this.ax = 0; this.ay = 0; },
  // virtual stick
  stickVal(x, y) { this.ax = x; this.ay = y; this.touchMode = true; },
};
/* touch UI bindings are built in ui; they call Input.set / stickVal */
function setupStick(zone, knob) {
  let pid = null, ox = 0, oy = 0;
  const R = 40;
  const start = e => { if (pid !== null) return; pid = e.pointerId; ox = e.clientX; oy = e.clientY; knob.style.display = 'block';
    knob.style.left = ox + 'px'; knob.style.top = oy + 'px'; zone.setPointerCapture && zone.setPointerCapture(pid); e.preventDefault(); };
  const move = e => { if (e.pointerId !== pid) return; let dx = e.clientX - ox, dy = e.clientY - oy; const d = Math.hypot(dx, dy);
    if (d > R) { dx = dx / d * R; dy = dy / d * R; }
    knob.firstElementChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    const dead = 8; let nx = 0, ny = 0; if (d > dead) { nx = dx / R; ny = dy / R; }
    Input.stickVal(nx, ny); e.preventDefault(); };
  const end = e => { if (e.pointerId !== pid) return; pid = null; knob.style.display = 'none'; knob.firstElementChild.style.transform = ''; Input.stickVal(0, 0); };
  zone.addEventListener('pointerdown', start); zone.addEventListener('pointermove', move);
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  window.addEventListener('pointerdown', () => SFX.unlock(), { once: true });
}
function bindBtn(btn, name, onDown, onUp) {
  const d = e => { e.preventDefault(); btn.classList.add('press'); Input.set(name, true); if (onDown) onDown(); };
  const u = e => { e.preventDefault(); btn.classList.remove('press'); Input.set(name, false); if (onUp) onUp(); };
  btn.addEventListener('pointerdown', d); btn.addEventListener('pointerup', u);
  btn.addEventListener('pointerleave', u); btn.addEventListener('pointercancel', u);
}
