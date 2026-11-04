'use strict';
/* ===== mobs & bosses ===== */
function buildMobs() {
  const M = SPR.mobs;
  M.slime = [0, 1].map(v => mk(16, 14, g => { const h = v ? 10 : 12; px(g, 2, 14 - h, '#6fae6a', 12, h); px(g, 4, 14 - h - 1, '#8fd08a', 8, 2);
    px(g, 3, 10, '#4f8a4f', 10, 3); px(g, 5, 6 + (v ? 1 : 0), '#1a1a24', 2, 2); px(g, 10, 6 + (v ? 1 : 0), '#1a1a24', 2, 2); px(g, 7, 10, '#1a1a24', 2, 1); }));
  M.bat = [0, 1].map(v => mk(18, 12, g => { const wy = v ? -1 : 1; px(g, 7, 4, '#5a4a6a', 4, 6); px(g, 8, 5, '#8a6aa8', 2, 2);
    px(g, 1, 3 + wy, '#5a4a6a', 6, 4); px(g, 11, 3 + wy, '#5a4a6a', 6, 4); px(g, 2, 1 + wy, '#3a2a4a', 3, 3); px(g, 13, 1 + wy, '#3a2a4a', 3, 3);
    px(g, 8, 6, '#ff5d5d', 1, 1); px(g, 9, 6, '#ff5d5d', 1, 1); }));
  M.wolf = [0, 1].map(v => mk(22, 14, g => { px(g, 2, 4, '#5a5f6e', 16, 8); px(g, 1, 5, '#4a4f5e', 3, 4); px(g, 16, 3, '#5a5f6e', 5, 7);
    px(g, 18, 1, '#5a5f6e', 2, 3); px(g, 19, 4, '#1a1a24', 1, 1); px(g, 17, 6, '#e8e4d4', 2, 2);
    const ly = v ? 1 : 0; px(g, 4, 11, '#3a3f4c', 2, 3 - ly); px(g, 9, 11, '#3a3f4c', 2, 3); px(g, 14, 11, '#3a3f4c', 2, 3 - ly); }));
  M.scorp = [0, 1].map(v => mk(18, 12, g => { px(g, 4, 4, '#8a5a2e', 9, 5); px(g, 12, 2, '#6f4a24', 4, 3); px(g, 15, 1, '#ffd97a', 2, 2);
    px(g, 2, 6, '#6f4a24', 3, 3); const ly = v ? 1 : 0; px(g, 3, 8, '#4a3226', 2, 3 - ly); px(g, 7, 8, '#4a3226', 2, 3); px(g, 11, 8, '#4a3226', 2, 3 - ly); }));
  M.bandit = [0, 1].map(v => mk(16, 18, g => { const H = 18; px(g, 6, H - 5, '#3a3f4c', 2, 4); px(g, 9, H - 5, '#3a3f4c', 2, v ? 3 : 4);
    px(g, 4, H - 10, '#5e4629', 8, 5); px(g, 6, H - 10, '#a33b3b', 4, 5); px(g, 4, 2, PAL.skin2, 8, 6); px(g, 4, 2, '#2a2a2a', 8, 2);
    px(g, 6, 5, '#1a1a24', 1, 2); px(g, 9, 5, '#1a1a24', 1, 2); px(g, 13, 8, '#5e4629', 2, 1); }));
  M.crawler = [0, 1].map(v => mk(16, 12, g => { px(g, 4, 3, '#3a4155', 8, 6); px(g, 5, 4, '#54648c', 5, 3); px(g, 6, 4, '#9fe8ff', 2, 1);
    g.strokeStyle = '#2b3040'; const ly = v ? 1 : 0; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(4 + i * 4, 8); g.lineTo(1 + i * 4, 11 + ly); g.stroke(); g.beginPath(); g.moveTo(8 + i * 2, 8); g.lineTo(11 + i * 2, 11 - ly); g.stroke(); } }));
  M.golem = [0, 1].map(v => mk(20, 20, g => { const y = v ? 1 : 0; px(g, 4, 6 + y, PAL.rock1, 12, 12); px(g, 6, 2 + y, PAL.rock2, 8, 5);
    px(g, 7, 3 + y, '#9fe8ff', 2, 2); px(g, 12, 3 + y, '#9fe8ff', 2, 2); px(g, 1, 8 + y, PAL.rock2, 4, 8); px(g, 15, 8 + y, PAL.rock2, 4, 8);
    px(g, 6, 14, '#3a3f4c', 3, 5); px(g, 12, 14, '#3a3f4c', 3, 5); px(g, 9, 10, '#54648c', 3, 2); }));
  M.wraith = [0, 1].map(v => mk(16, 18, g => { g.globalAlpha = .85; px(g, 4, 2, '#4a4f6e', 8, 10); px(g, 3, 6, '#3a3f5a', 10, 8);
    const w = v ? 1 : 0; px(g, 3, 14, '#3a3f5a', 4, 3 - w); px(g, 9, 14, '#3a3f5a', 4, 3 + w);
    px(g, 6, 4, '#ffd97a', 2, 2); px(g, 9, 4, '#ffd97a', 2, 2); px(g, 5, 1, '#2a2e44', 6, 2); }));
  M.guard = [0, 1].map(v => mk(16, 18, g => { const H = 18; px(g, 6, H - 5, '#2b3040', 2, 4); px(g, 9, H - 5, '#2b3040', 2, v ? 3 : 4);
    px(g, 4, H - 10, '#54648c', 8, 5); px(g, 3, H - 9, '#8a90a0', 2, 4); px(g, 11, H - 9, '#8a90a0', 2, 4);
    px(g, 4, 2, '#8a90a0', 8, 5); px(g, 5, 4, '#ffd97a', 1, 2); px(g, 10, 4, '#ffd97a', 1, 2); px(g, 3, 1, '#54648c', 10, 2); }));
  // ===== bosses =====
  M.warden = [0, 1].map(v => mk(30, 30, g => { const b = v ? 1 : 0; px(g, 12, 20, '#5e4629', 6, 9); px(g, 6, 6 + b, '#2f6b36', 18, 12);
    px(g, 9, 2 + b, '#3f8f4a', 12, 8); px(g, 4, 10 + b, '#3f8f4a', 6, 6); px(g, 20, 10 + b, '#3f8f4a', 6, 6);
    px(g, 11, 8 + b, '#ffd97a', 2, 2); px(g, 17, 8 + b, '#ffd97a', 2, 2); px(g, 2, 16, '#5e4629', 4, 10); px(g, 24, 16, '#5e4629', 4, 10);
    px(g, 13, 13 + b, '#1a1a24', 4, 2); }));
  M.sovereign = [0, 1].map(v => mk(30, 30, g => { const b = v ? 1 : 0; px(g, 8, 8 + b, '#d9c37e', 14, 18); px(g, 10, 4 + b, '#e8d88a', 10, 6);
    px(g, 8, 2 + b, '#ffd97a', 2, 3); px(g, 14, 1 + b, '#ffd97a', 2, 4); px(g, 20, 2 + b, '#ffd97a', 2, 3);
    px(g, 12, 6 + b, '#1a1a24', 2, 2); px(g, 16, 6 + b, '#1a1a24', 2, 2); px(g, 10, 16 + b, '#a08a3a', 10, 2);
    px(g, 6, 12 + b, '#c4a95e', 4, 8); px(g, 20, 12 + b, '#c4a95e', 4, 8); px(g, 12, 24, '#8f7438', 6, 5); }));
  M.deepking = [0, 1].map(v => mk(32, 28, g => { const b = v ? 1 : 0; px(g, 6, 6 + b, '#2b4a5e', 20, 18); px(g, 9, 2 + b, '#3a6a7e', 14, 8);
    px(g, 11, 4 + b, '#9fe8ff', 3, 3); px(g, 18, 4 + b, '#9fe8ff', 3, 3); px(g, 12, 0 + b, '#ffd97a', 2, 3); px(g, 17, 0 + b, '#ffd97a', 2, 3);
    px(g, 2, 10 + b, '#2b4a5e', 5, 10); px(g, 25, 10 + b, '#2b4a5e', 5, 10); px(g, 10, 20, '#1d3a4a', 4, 6); px(g, 18, 20, '#1d3a4a', 4, 6);
    px(g, 13, 12 + b, '#7ee0ff', 6, 2); }));
  M.marshal = [0, 1].map(v => mk(28, 30, g => { const b = v ? 1 : 0; px(g, 8, 8 + b, '#2a2e44', 12, 16); px(g, 10, 2 + b, '#3a3f5a', 8, 7);
    px(g, 12, 5 + b, '#ff5d5d', 2, 2); px(g, 15, 5 + b, '#ff5d5d', 2, 2); px(g, 9, 0 + b, '#1a1a2a', 10, 3);
    px(g, 4, 10 + b, '#2a2e44', 5, 9); px(g, 19, 10 + b, '#2a2e44', 5, 9); px(g, 6, 22, '#1a1a2a', 4, 6); px(g, 17, 22, '#1a1a2a', 4, 6);
    px(g, 12, 12 + b, '#f2b04a', 4, 5); px(g, 13, 13 + b, '#ffd97a', 2, 3); px(g, 22, 6 + b, '#8a90a0', 2, 14); }));
  // projectiles
  const P = SPR.projs = {};
  P.arrow = mk(12, 4, g => { px(g, 0, 1, '#8a6a42', 8, 2); px(g, 8, 0, '#cfcfd8', 3, 4); });
  P.bolt = mk(8, 8, g => { px(g, 2, 0, '#c9a4ff', 4, 8); px(g, 0, 2, '#9f6aff', 8, 4); px(g, 3, 3, '#fff', 2, 2); });
  P.sand = mk(8, 8, g => { px(g, 1, 1, '#d9c37e', 6, 6); px(g, 2, 2, '#e8d88a', 4, 4); });
  P.orb = mk(10, 10, g => { px(g, 2, 2, '#7ee0ff', 6, 6); px(g, 3, 3, '#fff', 3, 3); });
  P.rock = mk(10, 10, g => { px(g, 1, 2, '#6f7585', 8, 7); px(g, 3, 0, '#8a90a0', 5, 3); });
  P.wave = mk(16, 8, g => { px(g, 0, 3, 'rgba(126,224,255,.7)', 16, 2); px(g, 2, 1, 'rgba(126,224,255,.4)', 12, 2); });
  P.spit = mk(8, 8, g => { px(g, 1, 1, '#8fd08a', 6, 6); px(g, 2, 2, '#c9ffb0', 3, 3); });
}
