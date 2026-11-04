'use strict';
/* ===== world tags: portals, npcs, chests, triggers ===== */
function placeWorldTags(m) {
  const p = (x, y, map, tx, ty, o) => tag(m, x, y, Object.assign({ type: 'portal', map, tx, ty }, o));
  const gate = (x, y, id, need, msg) => tag(m, x, y, { type: 'gate', gate: id, need, msg, x, y });
  const chest = (x, y, c) => tag(m, x, y, { type: 'chest', c });
  const camp = (x, y) => { tag(m, x, y, { type: 'camp' }); deco(m, 'camp', x, y, 4); };
  const npc = (x, y, k, d) => tag(m, x, y, { type: 'npc', k, d });
  const sign = (x, y, d) => { tag(m, x, y, { type: 'sign', d }); deco(m, 'sign', x, y, 4); };
  // village npcs
  npc(103, 44, 'mara', 'mara'); npc(99, 49, 'rowan', 'rowan'); npc(114, 38, 'ott', 'ott'); npc(121, 45, 'bruna', 'bruna');
  npc(110, 48, 'pip', 'pip'); npc(97, 44, 'villager', 'villager'); npc(116, 50, 'villager', 'villager'); npc(105, 53, 'villager', 'villager');
  npc(91, 64, 'spirit', 'spirit');
  tag(m, 101, 40, { type: 'kiln' }); tag(m, 109, 45, { type: 'well' });
  sign(107, 39, 'sign_village'); 
  // portals (doors) — inside village: treat doors as flavor (no interiors), so no portals except map links
  // campfires (save points)
  camp(106, 39); camp(141, 58); camp(155, 90); camp(104, 134); camp(84, 32); camp(172, 96); camp(183, 47);
  // signs
  sign(44, 52, 'sign_forest'); sign(140, 60, 'sign_desert'); sign(80, 32, 'sign_mtn');
  // barrow cave entrance (auto portal)
  p(78, 30, 'cave1', 22, 28, { auto: true });
  // keep gate + portal behind it
  gate(186, 45, 'keep', () => invCount('sigil') > 0, 'The gate drinks sigils. No sigil, no entry.');
  p(186, 44, 'keep', 4, 30, { auto: true, req: () => got('keep_open') });
  // seagrot door under pier (needs lantern charm)
  tag(m, 108, 127, { type: 'portal', map: 'grot', tx: 12, ty: 18, auto: true, req: () => G.p.ownC.includes('lantern') || G.p.acc === 'lantern', reqMsg: 'A drowned door. Dark as sealed ink. (A lit lantern charm might open it.)' });
  // hidden grove entrance (needs spared warden)
  tag(m, 48, 74, { type: 'portal', map: 'grove', tx: 14, ty: 20, auto: true, req: () => got('grove_open'), reqMsg: 'Thorns knit like a wall. Something west of the mound holds the key.' });
  // toll bandit at crossroads (npc handled by quest fight)
  npc(140, 62, 'rocco', 'rocco'); 
  // oasis + temple npcs
  npc(166, 88, 'hesan', 'hesan'); npc(152, 78, 'zia', 'zia'); npc(182, 45, 'mav', 'mav');
  // pier npcs
  npc(106, 128, 'nima', 'nima');
  // chests (overworld)
  chest(70, 70, { coins: 25, items: [['pot_l', 1]] });
  chest(36, 62, { coins: 15, items: [['pot_s', 2]] });
  chest(150, 120, { coins: 60, items: [['elixir', 1]] });
  chest(200, 96, { coins: 45 });
  chest(96, 142, { coins: 20, items: [['pot_l', 1]] });
  chest(128, 42, { coins: 30, items: [['pot_s', 1]] });
  chest(176, 128, { coins: 35, items: [['pollen', 1]] });
  // arena triggers
  tag(m, 64, 88, { type: 'boss', boss: 'warden' });
  tag(m, 178, 102, { type: 'boss', boss: 'sovereign' });
  // chapter triggers
  tag(m, 90, 52, { type: 'trig', id: 'ch1', cond: () => G.chapter === 1 && !got('ch1_seen'), run: () => { F('ch1_seen', 1); Game.chScene('ch1_start'); } });
  tag(m, 132, 56, { type: 'trig', id: 'ch2', cond: () => G.chapter === 2 && !got('ch2_seen'), run: () => { F('ch2_seen', 1); Game.chScene('ch2_start'); } });
  tag(m, 80, 34, { type: 'trig', id: 'ch3', cond: () => G.chapter === 3 && !got('ch3_seen'), run: () => { F('ch3_seen', 1); Game.chScene('ch3_start'); } });
}
function buildWorldZones(m) {
  m.zones = [
    { x0: 30, y0: 52, x1: 108, y1: 140, mobs: ['slime', 'wolf', 'bat'], cap: 8, w: ['slime', 'wolf', 'bat', 'wolf'] },
    { x0: 8, y0: 40, x1: 214, y1: 210, mobs: ['slime', 'bat'], cap: 5, w: ['slime', 'bat', 'slime'] },
    { x0: 138, y0: 58, x1: 214, y1: 142, mobs: ['scorp', 'wraith', 'wolf'], cap: 8, w: ['scorp', 'scorp', 'wraith', 'wolf'] },
    { x0: 8, y0: 12, x1: 214, y1: 52, mobs: ['crawler', 'bat'], cap: 6, w: ['crawler', 'bat', 'crawler'] },
    { x0: 60, y0: 140, x1: 160, y1: 214, mobs: ['slime', 'wolf', 'bat'], cap: 6, w: ['slime', 'wolf', 'bat'] },
  ];
  m.safe = { x: 108, y: 47, r: 110 }; // no spawns near village
}
