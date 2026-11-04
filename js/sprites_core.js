'use strict';
/* ===== sprite factory ===== */
const SPR = { tiles: {}, decos: {}, chars: {}, mobs: {}, icons: {}, slashes: {}, built: false };
function mk(w, h, fn) { const c = cnv(w, h); const g = c.getContext('2d'); fn(g, w, h); return c; }
function mirror(c) { const n = cnv(c.width, c.height); const g = n.getContext('2d'); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return n; }
function buildSprites() {
  if (SPR.built) return; SPR.built = true;
  buildTiles(); buildDecos(); buildChars(); buildMobs(); buildIcons();
  SPR.sl = { // slash arcs (rotated at draw)
    a: mk(26, 26, g => { g.strokeStyle = 'rgba(255,240,200,.9)'; g.lineWidth = 3; g.beginPath(); g.arc(3, 13, 12, -1.1, 1.1); g.stroke();
      g.strokeStyle = 'rgba(255,220,140,.5)'; g.lineWidth = 6; g.beginPath(); g.arc(3, 13, 10, -1, 1); g.stroke(); }),
  };
}
