'use strict';
/* ===== interactions, menus glue, chapter flow ===== */
Game.openShop = who => Menus.shop(who);
Game.applyOrigin = () => { const p = G.p; p.maxhp = 24 + 6 * (p.lvl - 1) + (F('origin') === 'vigor' ? 16 : F('origin') ? 6 : 0); p.hp = p.maxhp; };
Game.checkMenus = () => {
  if (Input.edge('menu')) { Menus.open('pause'); return; }
  if (Input.edge('inv')) { Menus.open('inv'); return; }
  if (Input.edge('map')) { Menus.open('map'); return; }
  if (Input.edge('quests')) { Menus.open('quests'); return; }
  if (F('rocco_fight') && !F('rocco_fought')) { F('rocco_fought', 1);
    for (let i = 0; i < 2; i++) spawnMob('bandit', G.p.x + U.irnd(-40, 40), G.p.y + U.irnd(-40, 40));
    toast('Rocco whistles. Friends arrive.', 0); SFX.play('roar'); }
};
const VERB = { npc: 'Talk', chest: 'Open', camp: 'Rest', well: 'Draw', sign: 'Read', shrine: 'Pray', kiln: 'Peer', heart: 'Touch' };
function findFocus() {
  const p = G.p, m = G.mapObj, tx = Math.floor(p.x / TILE), ty = Math.floor(p.y / TILE);
  let best = null, bd = 22;
  for (let oy = -2; oy <= 2; oy++) for (let ox = -2; ox <= 2; ox++) {
    const t = m.tags[(tx + ox) + ',' + (ty + oy)]; if (!t) continue;
    const d = U.dist(p.x, p.y, t.x * TILE + 8, t.y * TILE + 8);
    if (d < bd && VERB[t.type]) { bd = d; best = t; }
  }
  return best;
}
Game.interact = () => {
  if (G.mode !== 'play') return;
  const t = findFocus(); if (!t) return;
  switch (t.type) {
    case 'npc': Dlg.run(t.d); break;
    case 'chest': openChest(t); break;
    case 'camp': campDialog(); break;
    case 'well': wellDialog(); break;
    case 'sign': Dlg.run(t.d); break;
    case 'shrine': Dlg.run('shrine'); break;
    case 'kiln': Dlg.run('kiln'); break;
    case 'heart': if (G.chapter >= 5 && !got('finale_at')) { F('finale_at', 1); Dlg.runArray(DLG.finale_enter().concat([{ go: 'finale' }])); } else toast('The Heart pulses patiently.'); break;
    case 'gate': break;
  }
};
function openChest(t) {
  const key = G.mapKey + ':' + t.x + ',' + t.y;
  if (G.opened[key]) { toast('Empty. The lid sighs.'); return; }
  G.opened[key] = 1; SFX.play('chest'); vibrate(30);
  const c = t.c || {};
  if (c.coins) { G.p.coins += c.coins; toast('+' + c.coins + ' coins', 1); }
  for (const [k, n] of (c.items || [])) {
    if (k.startsWith('w:')) { const id = k.slice(2); if (!G.p.ownW.includes(id)) { G.p.ownW.push(id); equipBest('w', id); toast(G.p.wpn === id ? 'Equipped: ' + WPN[id].n : 'Found: ' + WPN[id].n, 1); } else { G.p.coins += 30; toast('+30 coins (spare gear sold)', 1); } }
    else if (k.startsWith('a:')) { const id = k.slice(2); if (!G.p.ownA.includes(id)) { G.p.ownA.push(id); equipBest('a', id); toast(G.p.arm === id ? 'Equipped: ' + ARM[id].n : 'Found: ' + ARM[id].n, 1); } else { G.p.coins += 30; toast('+30 coins (spare gear sold)', 1); } }
    else giveItem(k, n || 1);
  }
  saveGame(true);
}
function campDialog() {
  Dlg.runArray([
    L('Campfire', 'The flames dance in no wind at all. Rest a while?'),
    { c: [
      { t: 'Rest until dawn (heal & save)', f: () => { G.clock = 400; G.p.hp = G.p.maxhp; saveGame(); toast('You sleep like a stone that knows it is loved.', 1); G.spawnPt = { map: G.mapKey, x: G.p.x, y: G.p.y }; }, go: '_close' },
      { t: 'Rest until dusk', f: () => { G.clock = 1150; G.p.hp = Math.min(G.p.maxhp, G.p.hp + 20); saveGame(true); G.spawnPt = { map: G.mapKey, x: G.p.x, y: G.p.y }; toast('The light goes long and gold.', 1); }, go: '_close' },
      { t: 'Just save', f: () => { saveGame(); G.spawnPt = { map: G.mapKey, x: G.p.x, y: G.p.y }; }, go: '_close' },
      { t: 'Leave the fire be', go: '_close' }] }]);
}
function wellDialog() {
  const toss = (fn) => { if (G.p.coins < 10) { toast('You need 10 coins to make a wish.'); return; } G.p.coins -= 10; fn(); };
  if (!G.quests['q_well']) { Dlg.run('well'); return; }
  if (!F('well1')) {
    Dlg.runArray([L('Well', 'You flip a coin. It falls a long, long way...'),
      { do: () => toss(() => { F('well1', 1); giveItem('shard', 1); SFX.play('shard'); burst(G.p.x, G.p.y, '#9fe8ff', 14); }) },
      L('Pip', 'IT ANSWERED! The well LIKES you!'), { do: () => { completeQuest('q_well'); questReward('q_well'); }, go: '_close' }]);
  } else if (!F('well2')) {
    Dlg.runArray([L('Well', 'The water swirls, considering.'),
      { do: () => toss(() => { F('well2', 1); if (!G.p.ownC.includes('ring')) { G.p.ownC.push('ring'); G.p.acc = G.p.acc || 'ring'; toast('Charm: Ring of Luck (+8% crit)', 1); SFX.play('chest'); } else { G.p.coins += 25; toast('+25 coins', 1); } }) },
      L('You', 'Something glints back up at you.'), { go: '_close' }]);
  } else Dlg.run('well');
}
Game.gather = () => {
  if (G.mode !== 'play' || !G.p) return;
  const p = G.p, map = G.mapObj;
  const tt = tileAt(map, Math.floor(p.x / TILE), Math.floor(p.y / TILE));
  const moving = Input.ax || Input.ay;
  if (!moving) return;
  if (tt === T.TALL && Math.random() < .012 && invCount('moonpetal') < 6 && (G.quests['q_tea'] && !G.quests['q_tea'].done || Math.random() < .3)) giveItem('moonpetal', 1);
  if ((tt === T.SAND || tt === T.QSAND) && Math.random() < .006 && invCount('pollen') < 5) giveItem('pollen', 1);
  if (tt === T.GLOW && Math.random() < .05 && invCount('moss') < 4) giveItem('moss', 1);
  if (tt === T.GLOW && Math.random() < .008) giveItem('emberstone', 1);
};
