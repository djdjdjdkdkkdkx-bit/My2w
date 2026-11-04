'use strict';
/* ===== chapter beat scenes ===== */
DLG.ch1_start = () => [
  L('You', 'The road west hums. Not with insects — with something older, like a struck bell that never quite stops.'),
  L('You', 'The Whisperwood leans toward the village, the way a listener leans toward a secret.'),
  L('You', 'Somewhere in that green dark, the Warden\'s Mound is beating like a second heart.'),
];
DLG.ch2_start = () => [
  L('You', 'East of the crossroads, the grass gives up. Sand takes the horizon like a debt collector.'),
  L('You', 'Zia\'s caravan tracks lead to the oasis — and beyond it, the Sunken Temple, half-drowned in gold light.'),
];
DLG.ch3_start = () => [
  L('You', 'The Barrow Cave breathes cold from the mountain\'s teeth. Moss glows. Something below glows back.'),
  L('You', 'The Hollow is patient. The Hollow has been counting the days since anyone came with a lit lantern.'),
];
DLG.sign_village = () => [L('Signpost', '« Bramblebrook — pop. 61, hopeful. / Whisperwood WEST — do not feed the trees. / Dunes EAST — carry water & nerve. »')];
DLG.sign_forest = () => [L('Signpost', '« Warden\'s Mound — 2 leagues. Blight zone: sap is corrosive to optimism. »')];
DLG.sign_desert = () => [L('Signpost', '« Sunken Temple — the sand remembers being a floor. Oasis: WEST. Keep: NORTH-EAST. »')];
DLG.sign_mtn = () => [L('Signpost', '« Barrow Cave — mind the moss, mind the dark, mind your lantern. »')];
DLG.well = () => {
  const a = [L('Well', 'The water is dark and patient and very good at keeping secrets.')];
  if (F('well_shard')) a.push(L('Well', 'Something bright settles at the bottom, satisfied.'));
  return a;
};
DLG.kiln = () => [L('Kiln', 'The great kiln\'s throat glows faintly, like a held breath.')].concat(G.chapter >= 5 ? [L('Kiln', 'It waits for the Ember. It has always waited.')] : []);
DLG.tablet = () => {
  if (!F('deepvoice')) return [L('Stone Tablet', 'Carved deep: « THE HOLLOW HUNGERS NOT FOR FLESH BUT FOR MORNING. »'),
    { do: () => { F('deepvoice', 1); toast('You feel the dark below take note of you.', 0); } },
    L('You', '...The words stay warm in your ears. Uncomfortably warm.')];
  return [L('Stone Tablet', '« THE HOLLOW HUNGERS NOT FOR FLESH BUT FOR MORNING. »')];
};
DLG.shrine = () => {
  if (G.shards >= 7 || got('shrine_awake')) return DLG._shrineGo();
  return [L('Shrine of Mornings', 'The shrine\'s star-glass is clouded. It counts your Ember Shards and finds you wanting.'),
    L('Shrine of Mornings', '(' + G.shards + '/7 shards. The shrine sleeps on.)')];
};
DLG._shrineGo = () => [L('Shrine of Mornings', 'Seven points of light find their sockets in the star-glass.'),
  { do: () => { F('shrine_awake', 1); SFX.play('shard'); toast('The Shrine of Mornings is awake. A question has been planted in you.', 1); addHope(1, 'the shrine listens'); } },
  L('Shrine of Mornings', '« Ember-bearer: when you stand before the Heart, ASK: who lit the first morning? »'),
  L('Shrine of Mornings', '« Ask, and be answered. Ask, and be un-written. »')];
DLG.grove_enter = () => [L('You', 'Past the Warden\'s mercy, the blight simply... stops. Flowers grow in a perfect ring.'),
  L('You', 'The Hidden Grove. The air tastes like the beginning of a good day.')];
DLG.seagrot_enter = () => [L('You', 'Your lantern charm throws light far down the flooded dark. The Seagrot accepts you.'),
  L('You', 'Something glittering sleeps on a ledge below.')];
