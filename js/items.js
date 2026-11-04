'use strict';
/* ===== items, equipment, shops ===== */
const WPN = {
  rusty: { n: 'Rusty Blade', atk: 4, icon: 'w_rusty', d: 'Pitted, but it saved your mother once.' },
  fang: { n: 'Oaken Fang', atk: 9, icon: 'w_fang', d: 'A splinter of the Warden\'s bough.' },
  iron: { n: 'Iron Sword', atk: 8, icon: 'w_iron', d: 'Honest village steel.' },
  sandglass: { n: 'Sandglass Falchion', atk: 13, icon: 'w_sandglass', d: 'Curved like the dune wind.' },
  hollow: { n: 'Hollow Cleaver', atk: 17, icon: 'w_hollow', d: 'Weighs nothing. Cuts like grief.' },
  sabre: { n: 'Wraith Sabre', atk: 18, icon: 'w_sabre', d: 'The Marshal\'s own edge, cooled.' },
  dawn: { n: 'Dawnforged Blade', atk: 21, icon: 'w_dawn', d: 'Forged from emberstone at first light.' },
  ember: { n: 'Emberedge', atk: 27, icon: 'w_ember', d: 'It hums with the morning. Only the worthy lift it.' },
};
const ARM = {
  cloth: { n: 'Cloth Tunic', def: 0, icon: 'a_cloth', d: 'Sewn by someone who loved you.' },
  leather: { n: 'Leather Jerkin', def: 3, icon: 'a_leather', d: 'Cheap. Cheerful. Effective.' },
  chain: { n: 'Chain Shirt', def: 6, icon: 'a_chain', d: 'Rings of honest metal.' },
  sand: { n: 'Sandplate', def: 9, icon: 'a_sand', d: 'Dune-glass scales, sun-warmed.' },
  keep: { n: 'Keep Plate', def: 12, icon: 'a_keep', d: 'Torn from the Keep\'s silent sentries.' },
  aegis: { n: 'Aegis of Dawn', def: 16, icon: 'a_aegis', d: 'Gleams like a promise kept.' },
};
const ACC = {
  lantern: { n: 'Lantern Charm', icon: 'lantern', d: 'Nima\'s gift. You roll quicker, lighter.' },
  ring: { n: 'Ring of Luck', icon: 'ring', d: '+8% chance of a telling blow.' },
  cloak: { n: 'Sand Cloak', icon: 'cloak', d: 'Storms of the dunes cannot touch you.' },
};
const MAT = {
  moonpetal: { n: 'Moonpetal', icon: 'moonpetal', d: 'Blooms only in tall grass at dusk.' },
  pollen: { n: 'Red Pollen', icon: 'pollen', d: 'Desert bloom dust. Stings a little.' },
  moss: { n: 'Cave Moss', icon: 'moss', d: 'Soft as a whisper, damp as sorrow.' },
  emberstone: { n: 'Emberstone', icon: 'emberstone', d: 'Warm rock from the deep. Forging stuff.' },
  shard: { n: 'Ember Shard', icon: 'shard', d: 'A splinter of the morning. +2 ATK.' },
};
const KEYI = {
  childs_lantern: { n: 'Child\'s Lantern', icon: 'lantern', d: 'Nima\'s son lost this in the Barrow.' },
  sigil: { n: 'Ember Sigil', icon: 'sigil', d: 'Opens the gate of the Ember Keep.' },
};
const ITEMS = Object.assign({}, MAT, KEYI, ACC, {
  pot_s: { n: 'Small Potion', icon: 'pot_s', d: 'Heals 30 HP.', use: 'heal30' },
  pot_l: { n: 'Red Potion', icon: 'pot_l', d: 'Heals 70 HP.', use: 'heal70' },
  elixir: { n: 'Elixir', icon: 'elixir', d: 'Full heal + brief surge of strength.', use: 'elixir' },
  map: { n: 'Tattered Map', icon: 'map', d: 'Reveals the wilds on your map screen.', use: 'map' },
});
function itemName(k) { const d = WPN[k] || ARM[k] || ITEMS[k] || ACC[k] || KEYI[k]; return d ? d.n : k; }
function invCount(k) { return G.p.bag[k] || 0; }
function giveItem(k, n) { n = n || 1; const p = G.p; p.bag[k] = (p.bag[k] || 0) + n;
  if (k === 'shard') { G.shards += n; SFX.play('shard'); toast('Ember Shard ' + G.shards + '/7 (+2 ATK)', 1); } 
  else if (n > 0) { toast('+ ' + itemName(k) + (n > 1 ? ' ×' + n : '')); SFX.play('pick'); } }
function takeItem(k, n) { n = n || 1; const p = G.p; p.bag[k] = Math.max(0, (p.bag[k] || 0) - n); }
function usePotion(big) {
  const k = big ? 'pot_l' : 'pot_s'; const p = G.p;
  if (!p.bag[k]) { toast('No ' + itemName(k)); return; }
  if (p.hp >= p.maxhp) { toast('Already hale'); return; }
  takeItem(k); healPlayer(big ? 70 : 30); SFX.play('potion');
}
function useElixir() { if (!G.p.bag.elixir) return; takeItem('elixir'); healPlayer(999); F('elixirT', 20); SFX.play('lvl'); toast('Strength surges!', 1); }
/* shop stocks: [key, price]  — key prefixed w:/a: for gear */
function shopStock(who) {
  const disc = G.hope >= 4 ? 0.85 : 1;
  const mk = (k, base) => [k, Math.round(base * disc)];
  if (who === 'ott') return {
    n: 'Merchant Ott', greet: 'Fresh from the coast! Well, fresh-ish.',
    list: [mk('pot_s', 18), mk('pot_l', 40), mk('elixir', 95), mk('a:leather', 120), mk('a:chain', 320), mk('a:sand', 640), mk('map', 60)],
  };
  if (who === 'bruna') return {
    n: 'Bruna the Smith', greet: 'Iron remembers. So do I.',
    list: [mk('w:iron', 150), mk('w:sandglass', 430), mk('a:keep', 900), mk('a:aegis', 1100)],
  };
  return { n: '', list: [] };
}
function gearKey(k) { return k.startsWith('w:') ? { t: 'w', id: k.slice(2) } : k.startsWith('a:') ? { t: 'a', id: k.slice(2) } : { t: 'i', id: k }; }
function buyItem(key, price) {
  if (G.p.coins < price) { toast('Not enough coins'); SFX.play('ui'); return; }
  const g = gearKey(key);
  if (g.t === 'w') { if (G.p.ownW.includes(g.id)) { toast('Already forged'); return; } G.p.ownW.push(g.id); equipBest(g.t, g.id); }
  else if (g.t === 'a') { if (G.p.ownA.includes(g.id)) { toast('Already owned'); return; } G.p.ownA.push(g.id); equipBest(g.t, g.id); }
  else { giveItem(g.id, 1); }
  G.p.coins -= price; SFX.play('coin'); toast('Bought ' + itemName(g.id), 1);
}
function equipBest(t, id) {
  const p = G.p;
  if (t === 'w') { if (WPN[id].atk > (WPN[p.wpn] ? WPN[p.wpn].atk : 0)) p.wpn = id; }
  if (t === 'a') { if (ARM[id].def > (ARM[p.arm] ? ARM[p.arm].def : 0)) p.arm = id; }
}
