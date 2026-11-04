'use strict';
/* ===== wilderness NPCs ===== */
DLG.nima = () => {
  const a = [L('Nima', 'Lake Miren took my son\'s lantern. He dropped it in the Barrow Cave — I know, I KNOW, he\'s seven and shouldn\'t spelunk. He takes after me.')];
  if (!G.quests['q_lantern']) a.push({ c: [{ t: 'I\'ll find it. (quest)', f: () => addQuest('q_lantern'), go: '_close' }, { t: 'Kids and caves...', go: '_close' }] });
  else if (G.quests['q_lantern'].done) a.push(L('Nima', 'He sleeps with it lit. So do I, some nights.'));
  else if (invCount('childs_lantern') > 0) a.push(L('Nima', 'His lantern! You found it — take this charm; my mother stitched luck into the wick.'),
    { do: () => { takeItem('childs_lantern'); advanceQuest('q_lantern'); questReward('q_lantern'); }, go: '_close' });
  else a.push(L('Nima', 'Barrow Cave, north-west mountains. Careful — it bites.'));
  a.push(L('Nima', 'See the pier? The Seagrot door under it stays dark... until someone carries a lit charm. Yours is lit.'));
  return a;
};
DLG.hesan = () => {
  const a = [L('Hesan', 'The dunes are honest. It is the sun that lies.')];
  if (!G.quests['q_remedy']) a.push(L('Hesan', 'Caravans sicken crossing the deep sand. My remedy needs 2 Red Pollen and 1 Cave Moss.'),
    { c: [{ t: 'I\'ll gather them. (quest)', f: () => addQuest('q_remedy'), go: '_close' }, { t: 'Herbs are your trade.', go: '_close' }] });
  else if (G.quests['q_remedy'].done) a.push(L('Hesan', 'The remedy holds. Take the cloak — storms owe me favors, now they owe you none.'));
  else if (invCount('pollen') >= 2 && invCount('moss') >= 1) a.push(L('Hesan', 'You found them all. Breathe — the desert noticed.'),
    { do: () => { takeItem('pollen', 2); takeItem('moss', 1); advanceQuest('q_remedy'); questReward('q_remedy'); }, go: '_close' });
  else a.push(L('Hesan', '2 Red Pollen from desert blooms, 1 Cave Moss from the Barrow. (' + invCount('pollen') + '/2 pollen, ' + invCount('moss') + '/1 moss)'));
  a.push(L('Hesan', 'Rumor for the road: the buried kings left a door of glass under the sinkhole. Doors open for the patient.'));
  return a;
};
DLG.rocco = () => {
  if (G.quests['q_toll'] && G.quests['q_toll'].done) return [L('Rocco', 'Toll\'s abolished. Boss\'s orders. ...My conscience. Shut up.')];
  if (!G.quests['q_toll']) return [L('Rocco', 'Toll\'s 20 coins, hero. Or your teeth. Crossroads tax, very legal.')]
    .concat([{ c: [
      { t: 'Pay the toll. (20c)', f: () => { if (G.p.coins >= 20) { G.p.coins -= 20; addQuest('q_toll'); advanceQuest('q_toll'); toast('The road is open.'); } else toast('You can\'t afford it.'); }, go: '_close' },
      { t: 'Refuse. (fight!)', f: () => { addQuest('q_toll'); advanceQuest('q_toll'); F('rocco_fight', 1); }, go: '_close' },
      { t: '(Hope speaks) «Your brother carried wood for Mara.»', cond: () => G.hope >= 3, f: () => { addQuest('q_toll'); advanceQuest('q_toll'); completeQuest('q_toll'); questReward('q_toll'); F('rocco_spared', 1); }, go: '_close' }] }]);
  return [L('Rocco', 'Move along, coinbag.')];
};
DLG.spirit = () => {
  if (G.quests['q_ghost'] && G.quests['q_ghost'].done) return [L('Pale Spirit', 'The truth keeps warmer than a lie. Go — morning-keeper.')];
  if (!G.quests['q_ghost']) return [L('Pale Spirit', 'I am the village\'s last spoken secret. I died mid-sentence, you see. Terribly rude.'),
    { c: [{ t: 'Finish your sentence. (quest)', f: () => addQuest('q_ghost'), go: '_spirit2' }, { t: 'Another time.', go: '_close' }] }];
  return [L('Pale Spirit', 'One word. That is all that keeps me here.')];
};
DLG._spirit2 = () => [L('Pale Spirit', 'The night the Ember was first lit, the founders made a bargain — and lied about its price.'),
  { c: [
    { t: '«The village deserves the truth.»', f: () => { F('truth_spirit', 1); completeQuest('q_ghost'); questReward('q_ghost'); }, go: '_spirit3' },
    { t: '«Let them keep their comfort.»', f: () => { addHope(1, 'mercy over truth'); completeQuest('q_ghost'); questReward('q_ghost'); }, go: '_spirit3' }] }];
DLG._spirit3 = () => [L('Pale Spirit', 'Then I am free. The kiln will remember you kindly... or honestly. Both are warm.'),
  L('Pale Spirit', 'One more gift: when the dark speaks below, listen — but answer with your own name.')];
DLG.zia = () => [L('Zia', 'Oasis west, temple south of it, Keep far north-east. The gate wardens only open for sigils.'),
  L('Zia', 'Storms spin in the dune heart. A sand cloak helps. Or don\'t go. Deserts respect absence.')];
DLG.mav = () => {
  if (got('keep_open')) return [L('Gatewarden Mav', 'The gate remembers the sigil. The Keep remembers you. Go.')];
  if (invCount('sigil') > 0) return [L('Mav', 'The Ember Sigil... so the Hollow King is ended, one way or another.'),
    { do: () => { F('keep_open', 1); G.gates.keep = 1; SFX.play('quest'); toast('The Ember Keep gate opens!', 1); Game.chSet(4); }, go: '_close' },
    L('Mav', 'Beyond the gate: sentries that do not tire. Do not be anything they can predict.')];
  return [L('Mav', 'No sigil, no gate. The Keep ward drinks the Ember\'s kind of light.')];
};
DLG.hermit = () => {
  const a = [L('Grove Hermit', 'Ah. The emberling, smelling of roads.')];
  if (G.shards >= 7 && !got('shrine_awake')) a.push(L('Grove Hermit', 'Seven shards... bring them to the Shrine when the grove is quiet.'),
    { do: () => { F('shrine_ready', 1); toast('The Shrine of Mornings will listen now.', 1); } });
  a.push(L('Grove Hermit', 'The Ember remembers being a sun. Ask it who lit the first morning — if you\'re ever allowed to ask anything.'));
  return a;
};
DLG.villager = () => { const v = U.pick(Math.random, ['Chilly, eh? The kiln\'s been coughing sparks all week.', 'They say the wood glows wrong at night now.', 'Ott waters his stock. I saw him. I SAW him.', 'The well splashes back if you thank it. Try it.']);
  return [L('Villager', v)]; };
