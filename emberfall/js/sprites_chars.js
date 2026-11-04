'use strict';
/* ===== humanoid characters ===== */
function charFrames(p, kid, ghost) {
  const H = kid ? 14 : 18, W = 16;
  const body = (g, f, dir) => {
    if (ghost) g.globalAlpha = .8;
    const hy = kid ? 1 : 2, hw = kid ? 8 : 8, hx = 4;
    // legs
    if (dir === 'side') {
      px(g, 6, H - 4, p.pants, 2, 4 - (f ? 1 : 0)); px(g, 9, H - 4, p.pants, 2, f ? 3 : 4);
      px(g, 5, H - 1, '#3a2a1a', 4, 1); px(g, 9, H - 1, '#3a2a1a', 3, 1);
    } else {
      const l1 = f ? 3 : 4, l2 = f ? 4 : 3;
      px(g, 5, H - 4, p.pants, 2, l1); px(g, 9, H - 4, p.pants, 2, l2);
      px(g, 4, H - 1, '#3a2a1a', 3, 1); px(g, 9, H - 1, '#3a2a1a', 3, 1);
    }
    // torso
    px(g, 4, H - 9, p.top, 8, 5);
    if (dir === 'down') { px(g, 4, H - 9, p.top, 2, 5); px(g, 10, H - 9, p.top, 2, 5); px(g, 6, H - 9, p.acc || p.top, 4, 5); }
    if (dir === 'up') px(g, 5, H - 9, p.acc || p.top, 6, 5);
    if (dir === 'side') px(g, 5, H - 9, p.top, 6, 5);
    // arms
    if (dir === 'down') { px(g, 2, H - 8, p.skin, 2, 3); px(g, 12, H - 8, p.skin, 2, 3); }
    if (dir === 'up') { px(g, 3, H - 8, p.top, 2, 3); px(g, 11, H - 8, p.top, 2, 3); }
    if (dir === 'side') { px(g, 10, H - 8, p.skin, 2, 3); px(g, 3, H - 8, p.top, 2, 3); }
    // head
    px(g, hx, hy, p.skin, hw, 7); px(g, hx, hy, p.hair, hw, 2); px(g, hx, hy + 2, p.hair, 1, 3); px(g, hx + hw - 1, hy + 2, p.hair, 1, 3);
    if (dir === 'down') { px(g, hx + 1, hy + 3, '#1a1a24', 1, 2); px(g, hx + hw - 2, hy + 3, '#1a1a24', 1, 2); }
    if (dir === 'side') { px(g, hx + 4, hy + 3, '#1a1a24', 2, 2); px(g, hx + 3, hy + 2, p.hair, 4, 1); }
    if (dir === 'up') px(g, hx, hy + 2, p.hair, hw, 4);
    if (p.hat) { px(g, hx - 1, hy - 1, p.hat, hw + 2, 2); px(g, hx + 1, hy - 3, p.hat, hw - 2, 2); }
    if (p.hood) { px(g, hx - 1, hy - 1, p.hood, hw + 2, 3); px(g, hx, hy, p.hood, hw, 4); }
    if (p.helm) { px(g, hx - 1, hy - 1, p.helm, hw + 2, 3); px(g, hx, hy + 2, p.helm, 1, 3); px(g, hx + hw - 1, hy + 2, p.helm, 1, 3); }
    if (p.beard) px(g, hx + 1, hy + 5, p.beard, hw - 2, 3);
    if (p.scarf) px(g, 4, H - 10, p.scarf, 8, 2);
  };
  const dirs = { down: [], up: [], right: [], left: [] };
  for (const d of ['down', 'up', 'right']) dirs[d] = [0, 1].map(f => mk(W, H, g => body(g, f, d)));
  dirs.left = dirs.right.map(mirror);
  return dirs;
}
function buildChars() {
  const C = SPR.chars;
  C.player = charFrames({ skin: PAL.skin, hair: '#c96a2e', top: PAL.clothB, pants: PAL.clothK, acc: '#8a3a2e', scarf: '#c95a2e' });
  C.mara = charFrames({ skin: PAL.skin2, hair: '#cfcfd8', top: '#4f7a6a', pants: PAL.clothK, acc: '#3a5f52' });
  C.rowan = charFrames({ skin: PAL.skin, hair: '#a04a2e', top: '#e8e4d4', pants: '#6a5a8a', acc: '#c9a04a' });
  C.ott = charFrames({ skin: PAL.skin2, hair: '#4a3226', top: '#c9a04a', pants: '#5e4629', acc: '#a34b2e', beard: '#4a3226' });
  C.bruna = charFrames({ skin: '#c98a5e', hair: '#3a2a1a', top: '#a34b2e', pants: PAL.clothK, acc: '#5e4629', scarf: '#6a2a1e' });
  C.nima = charFrames({ skin: PAL.skin, hair: '#2a5f8a', top: '#3a8a8a', pants: '#245a6e', acc: '#7ee0ff' });
  C.pip = charFrames({ skin: PAL.skin, hair: '#e8d88a', top: '#6fae6a', pants: '#8a6a42' }, true);
  C.rocco = charFrames({ skin: PAL.skin2, hair: '#2a2a2a', top: '#5e4629', pants: '#3a3f4c', acc: '#a33b3b', scarf: '#a33b3b' });
  C.hesan = charFrames({ skin: '#d9a06a', hair: '#e8e4d4', top: '#d9c37e', pants: '#b89a54', acc: '#a08a3a' });
  C.zia = charFrames({ skin: '#c98a5e', hair: '#3a2a1a', top: '#a04a8a', pants: '#5e3a6e', hat: '#c9a04a' });
  C.mav = charFrames({ skin: PAL.skin2, hair: '#4a3226', top: '#54648c', pants: PAL.clothK, helm: '#8a90a0' });
  C.spirit = charFrames({ skin: '#cfe8ff', hair: '#9fd8ff', top: '#7ab8e8', pants: '#5a9fd8' }, false, true);
  C.hermit = charFrames({ skin: '#c9b08a', hair: '#cfcfd8', top: '#4a6a4a', pants: '#3a5a3a', hood: '#2f4a35' });
  C.villager = charFrames({ skin: PAL.skin2, hair: '#6a4a2a', top: '#8a7a5a', pants: '#5e4629' });
  C.wardenTender = charFrames({ skin: '#b8d8a0', hair: '#4f8a4f', top: '#2f6b36', pants: '#24563a' });
}
