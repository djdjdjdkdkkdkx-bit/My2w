'use strict';
/* ===== item icons & UI art ===== */
function buildIcons() {
  const I = SPR.icons;
  I.coin = mk(10, 10, g => { px(g, 2, 2, '#c9a04a', 6, 6); px(g, 3, 3, '#ffe08a', 4, 4); px(g, 4, 4, '#c98a2e', 2, 2); });
  I.pot_s = mk(10, 12, g => { px(g, 3, 0, '#8a6a42', 4, 3); px(g, 2, 3, '#c0392b', 6, 8); px(g, 3, 4, '#ff7a6b', 4, 4); px(g, 3, 1, '#cfcfd8', 4, 1); });
  I.pot_l = mk(12, 14, g => { px(g, 4, 0, '#8a6a42', 4, 4); px(g, 2, 4, '#c0392b', 8, 9); px(g, 3, 5, '#ff7a6b', 5, 5); px(g, 4, 1, '#cfcfd8', 4, 1); });
  I.elixir = mk(12, 14, g => { px(g, 4, 0, '#c9a04a', 4, 4); px(g, 2, 4, '#f2b04a', 8, 9); px(g, 3, 5, '#ffd97a', 5, 5); px(g, 4, 1, '#e8e4d4', 4, 1); });
  I.moonpetal = mk(12, 12, g => { px(g, 5, 6, '#2f6b36', 2, 5); px(g, 3, 2, '#c9a4ff', 6, 4); px(g, 5, 1, '#e8d8ff', 2, 2); px(g, 4, 3, '#fff', 2, 2); });
  I.pollen = mk(12, 12, g => { px(g, 3, 3, '#c95a1e', 6, 6); px(g, 2, 2, '#f2b04a', 3, 3); px(g, 7, 6, '#f2b04a', 3, 3); px(g, 5, 5, '#ffd97a', 2, 2); });
  I.moss = mk(12, 12, g => { px(g, 2, 4, '#4f8a6a', 8, 6); px(g, 3, 2, '#6fae8a', 5, 3); px(g, 8, 3, '#6fae8a', 3, 2); });
  I.emberstone = mk(12, 12, g => { px(g, 2, 4, '#6f7585', 8, 6); px(g, 5, 5, '#f2b04a', 3, 3); px(g, 3, 3, '#8a90a0', 4, 2); });
  I.shard = mk(12, 12, g => { px(g, 5, 1, '#9fe8ff', 2, 10); px(g, 2, 4, '#9fe8ff', 8, 2); px(g, 4, 3, '#e8fbff', 3, 5); px(g, 6, 5, '#fff', 1, 1); });
  I.lantern = mk(12, 12, g => { px(g, 4, 0, '#5e4629', 4, 2); px(g, 3, 2, '#8a6a42', 6, 8); px(g, 4, 4, '#ffd97a', 4, 4); });
  I.ring = mk(12, 12, g => { px(g, 3, 4, '#c9a04a', 6, 6); px(g, 4, 5, '#ffe08a', 4, 4); px(g, 5, 2, '#9fe8ff', 2, 2); });
  I.cloak = mk(12, 12, g => { px(g, 2, 2, '#b89a54', 8, 8); px(g, 3, 3, '#d9c37e', 6, 6); px(g, 5, 5, '#8f7438', 2, 2); });
  I.sigil = mk(12, 12, g => { px(g, 2, 2, '#8a90a0', 8, 8); px(g, 4, 4, '#f2b04a', 4, 4); px(g, 5, 5, '#ffd97a', 2, 2); });
  I.fang = mk(14, 10, g => { px(g, 1, 3, '#8a6a42', 12, 3); px(g, 9, 1, '#e8e4d4', 4, 6); px(g, 11, 3, '#ffd97a', 2, 2); });
  I.map = mk(12, 12, g => { px(g, 1, 2, '#e8d8b0', 10, 8); px(g, 3, 4, '#a34b2e', 3, 1); px(g, 6, 6, '#a34b2e', 3, 1); px(g, 2, 2, '#8a6a42', 2, 8); });
  // weapons
  const wpn = (c1, c2) => mk(16, 16, g => { px(g, 7, 2, c1, 2, 9); px(g, 8, 2, c2, 1, 9); px(g, 5, 10, '#5e4629', 6, 2); px(g, 7, 12, '#4a3226', 2, 3); px(g, 6, 11, '#ffd97a', 4, 1); });
  I.w_rusty = wpn('#8a8a98', '#6f7585'); I.w_iron = wpn('#cfcfd8', '#9a9aa8'); I.w_fang = wpn('#c9b08a', '#8a6a42');
  I.w_sandglass = wpn('#ffe08a', '#d9c37e'); I.w_hollow = wpn('#7ee0ff', '#3a6a7e'); I.w_dawn = wpn('#ffd97a', '#f2b04a');
  I.w_ember = wpn('#ff7a5e', '#f2b04a'); I.w_sabre = wpn('#a35dff', '#6a3aa8');
  // armor
  const arm = c => mk(16, 16, g => { px(g, 3, 3, c, 10, 8); px(g, 1, 3, c, 2, 4); px(g, 13, 3, c, 2, 4); px(g, 6, 6, shade(c, .3), 4, 4); px(g, 7, 11, shade(c, -.3), 2, 2); });
  I.a_cloth = arm('#8a7a5a'); I.a_leather = arm('#8a6a42'); I.a_chain = arm('#8a90a0'); I.a_sand = arm('#d9c37e');
  I.a_keep = arm('#54648c'); I.a_aegis = arm('#ffd97a');
  I.hope = mk(12, 12, g => { px(g, 4, 3, '#5e4629', 4, 2); px(g, 3, 5, '#8a6a42', 6, 6); px(g, 4, 6, '#ffd97a', 4, 4); });
  I.skull = mk(12, 12, g => { px(g, 3, 2, PAL.bone, 6, 6); px(g, 4, 4, '#10141f', 2, 2); px(g, 7, 4, '#10141f', 2, 2); px(g, 4, 8, PAL.bone, 4, 2); });
  I.heart = mk(12, 12, g => { px(g, 3, 3, '#c95a5e', 6, 3); px(g, 2, 4, '#c95a5e', 8, 4); px(g, 4, 8, '#a33b5e', 4, 2); px(g, 5, 4, '#ff9db0', 2, 2); });
  I.star = mk(12, 12, g => { px(g, 5, 0, '#ffe08a', 2, 12); px(g, 0, 5, '#ffe08a', 12, 2); px(g, 4, 4, '#fff', 4, 4); });
}
