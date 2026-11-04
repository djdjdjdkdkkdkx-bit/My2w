'use strict';
/* ===== village NPCs ===== */
DLG.mara = () => {
  if (G.chapter === 0) return DLG._prologue();
  if (G.chapter >= 5) return [L('Mara', 'The kiln waits. So do I. Go gently.')];
  const lines = { 1: 'The Whisperwood weeps sap the color of rust. Follow the west road — and keep your blade loose.',
    2: 'East, past the crossroads. The dunes eat travelers who wander without water or nerve.',
    3: 'The Barrow mouth is north-west, in the Emberrise rocks. Torches last longer than courage.',
    4: 'The Keep gate drinks sigils. You carry one. Climb, and come back changed.',
    5: 'It is time.' };
  const a = [L('Mara', lines[G.chapter] || 'Keep walking, emberling.')];
  if (qStage('q_toll') === 1 && !G.quests.q_toll.done) a.push({ c: [
    { t: 'The bandit took my coin. (pay 20 reported)', f: () => { if (G.p.coins >= 20) { G.p.coins -= 20; } advanceQuest('q_toll'); }, go: '_close' },
    { t: 'I drove him off myself.', f: () => { addHope(1, 'the toll is gone'); completeQuest('q_toll'); questReward('q_toll'); }, go: '_close' }] });
  a.push(L('Mara', 'Rest a moment — I\'ll keep the fire.'), { do: () => saveGame(true) },
    L('Mara', '(Your journey is saved.)'));
  return a;
};
DLG._prologue = () => [
  L('Mara', 'Up. UP, emberling. The kiln is cold and the village is listening to its own teeth chatter.'),
  L('Mara', 'The Ember is dimming. Without it, Bramblebrook is one long winter away from a ledger of names.'),
  L('Mara', 'You were born the night we last fed it. Maybe that means something. Prove it does.'),
  L('Mara', 'Before you go — how do you carry yourself?'),
  { c: [
    { t: '« Vigor » — I endure. ( +16 max HP )', f: () => { F('origin', 'vigor'); Game.applyOrigin(); }, go: '_prologue2' },
    { t: '« Valor » — I strike. ( +2 ATK )', f: () => { F('origin', 'valor'); Game.applyOrigin(); }, go: '_prologue2' },
    { t: '« Wits » — I notice. ( faster, keener crits )', f: () => { F('origin', 'wits'); Game.applyOrigin(); }, go: '_prologue2' }] },
];
DLG._prologue2 = () => [
  L('Mara', 'Then take this. Your mother\'s blade. It bit raiders before you drew breath.'),
  { do: () => { G.p.ownW.push('rusty'); G.p.wpn = 'rusty'; giveItem('pot_s', 2); G.p.coins += 15; advanceQuest('dawn'); advanceQuest('dawn'); } },
  L('Mara', 'Coins for the road. Ott sells potions; Bruna hammers iron. Talk to everyone — Bramblebrook remembers its own.'),
  L('Mara', 'West lies the Whisperwood, and the Warden\'s Mound. What sleeps there has stopped sleeping gently.'),
  { do: () => { Game.chSet(1); addQuest('ch1'); }, go: '_close' },
];
DLG.rowan = () => {
  const a = [];
  if (!G.quests['q_tea']) a.push(L('Rowan', 'Fever in three houses. I need Moonpetals — they hide in the tall grass of the Whisperwood.'),
    { c: [{ t: 'I\'ll gather them.', f: () => addQuest('q_tea'), go: '_close' }, { t: 'Another time.', go: '_close' }] });
  else if (G.quests['q_tea'].done) a.push(L('Rowan', 'The tea works. The village breathes easier. Thank you, emberling.'));
  else if (invCount('moonpetal') >= 3) a.push(L('Rowan', 'Moonpetals! Fresh and whole. Here — you\'ve earned this.'),
    { do: () => { takeItem('moonpetal', 3); completeQuest('q_tea'); questReward('q_tea'); }, go: '_close' });
  else a.push(L('Rowan', 'Three Moonpetals, from tall grass in the Whisperwood. (' + invCount('moonpetal') + '/3)'));
  a.push(L('Rowan', 'Travel tip: red potions heal more than they cost, if you\'re lucky with drops.'));
  return a;
};
DLG.ott = () => [L('Ott', 'Fresh from the coast! Well... fresh-ish.'), { do: () => Game.openShop('ott'), go: '_close' }];
DLG.bruna = () => {
  const a = [L('Bruna', 'Iron remembers. So do I.')];
  if (G.shards >= 7 && got('spared_all') && !G.p.ownW.includes('ember')) {
    a.push(L('Bruna', 'Seven shards... you actually gathered the morning itself.'),
      L('Bruna', 'Then hold still. This is not a sale. This is a debt the smiths of old owed.'),
      { do: () => { G.p.ownW.push('ember'); G.p.wpn = 'ember'; SFX.play('shard'); toast('EMBEREDGE forged! (+27 ATK)', 1); } },
      L('Bruna', 'The Emberedge. It hums. Don\'t apologize to it — it likes confidence.'), { go: '_close' });
  }
  const dawnOK = G.p.ownW.includes('dawn');
  if (!dawnOK && invCount('emberstone') >= 3 && G.p.coins >= 80) a.push(L('Bruna', 'Emberstone? Real emberstone?'),
    { c: [{ t: 'Forge the Dawnforged Blade. (3 emberstone + 80c)', f: () => { takeItem('emberstone', 3); G.p.coins -= 80; G.p.ownW.push('dawn'); G.p.wpn = 'dawn'; SFX.play('lvl'); toast('DAWNFORGED BLADE forged!', 1); }, go: '_close' },
      { t: 'Not yet.', go: '_close' }] });
  a.push({ do: () => Game.openShop('bruna'), go: '_close' });
  return a;
};
DLG.pip = () => {
  if (!G.quests['q_well']) return [L('Pip', 'Mister Ott says wishes cost a coin. The well eats them and never says thanks.'),
    { c: [{ t: 'Show me the well. (quest)', f: () => { addQuest('q_well'); }, go: '_close' }, { t: 'Wells don\'t take wishes, kid.', go: '_close' }] }];
  return [L('Pip', 'Did the well answer yet? Toss REAL coins. Bronze lies.')]
    .concat(G.quests.q_well.done ? [L('Pip', 'You HEARD it. The splash counted twice!')] : []);
};
DLG.tollV = () => { const q = G.quests['q_toll'];
  if (!q) return [L('Gruff', 'Toll trouble at the crossroads. Bandit named Rocco. Pays in bruises.')]
  return [L('Gruff', 'Crossroads east. Watch the treeline.')];
};
