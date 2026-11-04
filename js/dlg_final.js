'use strict';
/* ===== finale & endings ===== */
DLG.finale_enter = () => [L('You', 'The Ember Heart hangs in its cradle of roots and iron, beating like a small stubborn sun.'),
  L('The Ember', '« ember-bearer. you carried me across the whole cold map of the world. »'),
  L('The Ember', '« ask anything. take anything. i am so tired of being carried. »'),
  { do: () => { F('finale_at', 1); } }];
DLG.finale = () => {
  const ch = [];
  if (got('pact_offer')) ch.push({ t: '«Give the Ember to the Marshal» — a legion keeps its word... probably.', f: () => doEnding('ash'), end: true });
  ch.push({ t: '«Claim the Ember for yourself» — crown first, conscience later.', f: () => doEnding('crown'), end: true });
  if (got('deepvoice')) ch.push({ t: '«Feed the Ember to the Hollow» — the dark below has waited so politely.', f: () => doEnding('dark'), end: true });
  ch.push({ t: '«Offer the Ember to the kiln» — Bramblebrook first, always.', f: () => doEnding(G.hope >= 4 && got('spared_deepking') ? 'shared' : 'keeper'), end: true });
  ch.push({ t: '«Shatter the Ember» — end the argument forever.', f: () => doEnding('cold'), end: true });
  if (got('shrine_awake')) ch.push({ t: '✦ «Ask: who lit the first morning?» ✦', f: () => doEnding('unwritten'), end: true });
  return [L('The Ember', '« choose. the kiln is cold and the morning is patient but not infinitely so. »'), { c: ch }];
};
DLG.ch3_after = () => {
  if (got('deepvoice') && G.hope < 3) return [L('You', 'The sigil is warm in your hand. The shaft to the surface waits. So does the dark below.'),
    L('The Dark', '« the king is gone. the hollow is empty. the hollow is EMPTY. »'),
    { c: [
      { t: 'Climb out. Take the sigil to the Keep. (continue)', f: () => { Game.chSet(4); addQuest('ch4'); }, go: '_close' },
      { t: 'Descend into the empty Hollow, alone, now.', f: () => doEnding('deep'), end: true }] }];
  return [L('You', 'The sigil is warm in your hand — a key that used to be a king, one way or another.'),
    { do: () => { Game.chSet(4); addQuest('ch4'); } }];
};
function doEnding(key) {
  META.endings[key] = 1; META.seen[key] = 1; META.save(); SFX.play('end');
  Game.showEnding(key);
}
