'use strict';
/* ===== quests, endings DB ===== */
const DLG = {}; // dialogue registry (filled by dlg_*.js)
function L(w, t) { return { w, t }; }
const QDB = {
  dawn: { n: 'A Cold Kiln', steps: ['Wake and speak with Mara at the kiln.', 'Take the Rusty Blade she offers.'] },
  ch1: { n: 'The Wilting Grove', steps: ['Find the Warden\'s Mound in the Whisperwood, west.', 'End the Bramble Warden\'s blight — or spare it.'] },
  ch2: { n: 'Sand & Starlight', steps: ['Cross east to the Ashen Dunes.', 'Reach the Sunken Temple and face the Dune Sovereign.'] },
  ch3: { n: 'The Hollow Below', steps: ['Enter the Barrow Cave in the Emberrise mountains, north-west.', 'Descend to the Deep Hollow. Face the Hollow King.'] },
  ch4: { n: 'The Ember Keep', steps: ['Take the Ember Sigil to the Keep gate, north-east.', 'Climb to the throne. Face the Wraith Marshal.'] },
  fin: { n: 'The Ember Heart', steps: ['Enter the Heart chamber behind the throne.'] },
  q_tea: { n: 'Petalfall Tea', steps: ['Gather 3 Moonpetals from tall grass in the Whisperwood.', 'Bring them to Rowan.'] },
  q_lantern: { n: 'The Lost Lantern', steps: ['Find the child\'s lantern in the Barrow Cave.', 'Return it to Nima at the lake.'], key: 'childs_lantern' },
  q_remedy: { n: 'The Hermit\'s Remedy', steps: ['Gather 2 Red Pollen (dunes) and 1 Cave Moss (Barrow).', 'Bring them to Hesan at the oasis.'] },
  q_toll: { n: 'The Bandit\'s Toll', steps: ['Deal with the bandit at the crossroads.', 'Report to Mara, or keep the coin.'] },
  q_well: { n: 'A Wish in the Well', steps: ['Toss a coin for Pip\'s wish at the village well.'] },
  q_ghost: { n: 'The Last Word', steps: ['Speak with the pale spirit among the graves.'] },
};
function addQuest(id) { if (!G.quests[id]) { G.quests[id] = { s: 0, done: false }; toast('New quest: ' + QDB[id].n, 1); SFX.play('quest'); } }
function qStage(id) { const q = G.quests[id]; return q ? q.s : -1; }
function advanceQuest(id) { const q = G.quests[id]; if (!q || q.done) return; q.s++; if (q.s >= QDB[id].steps.length) completeQuest(id); else { toast(QDB[id].n + ': ' + QDB[id].steps[q.s]); SFX.play('quest'); } }
function completeQuest(id, silent) { const q = G.quests[id]; if (!q || q.done) return; q.done = true; if (!silent) { toast('Quest complete: ' + QDB[id].n, 1); SFX.play('quest'); } }
function questReward(id) {
  const R = { q_tea: { c: 30, hope: 1, items: { pot_s: 2 } }, q_lantern: { c: 40, hope: 1, acc: 'lantern' },
    q_remedy: { c: 50, hope: 1, acc: 'cloak' }, q_toll: { c: 20, hope: 1 }, q_well: { c: 0, hope: 0 }, q_ghost: { hope: 1 } }[id];
  if (!R) return; if (R.c) { G.p.coins += R.c; toast('+' + R.c + ' coins', 1); }
  if (R.acc && !G.p.ownC.includes(R.acc)) { G.p.ownC.push(R.acc); G.p.acc = G.p.acc || R.acc; toast('Charm: ' + ACC[R.acc].n, 1); SFX.play('chest'); }
  if (R.hope) addHope(R.hope);
}
const CHAPTERS = [
  { n: 'Prologue', t: 'THE COLD KILN' },
  { n: 'Chapter I', t: 'THE WILTING GROVE' },
  { n: 'Chapter II', t: 'SAND & STARLIGHT' },
  { n: 'Chapter III', t: 'THE HOLLOW BELOW' },
  { n: 'Chapter IV', t: 'THE EMBER KEEP' },
  { n: 'Finale', t: 'THE EMBER HEART' },
];
const ENDINGS = {
  ash: { kind: 'bad', t: 'ASH ADAM', txt: 'You pressed the warm stone into the Marshal\'s gray palm.\nThe legion bowed. The kiln went dark by morning.\nThey say a new king walks the ash roads now, wearing your face,\nand that no bird has sung since.' },
  crown: { kind: 'bad', t: 'THE HOLLOW CROWN', txt: 'The Ember fits the hand like it was always yours.\nPower first. People after. People never.\nThe crown they forge for you is beautiful, and empty, and cold,\nand every mirror in the Keep refuses to show your eyes.' },
  dark: { kind: 'bad', t: 'THE LONG DARK', txt: 'You feed the Hollow, and the Hollow is grateful.\nGrateful things do not let go.\nDeep beneath the lake, a small warm light learns to breathe alone —\nand the world above forgets there ever was a morning.' },
  cold: { kind: 'bad', t: 'COLD HORIZON', txt: 'It takes one blow. The Ember cracks like an egg of glass.\nNo explosion. No scream. Just... less.\nWinters come that have names now. The kiln is a monument.\nYou keep the pieces in your pocket. They never warm again.' },
  deep: { kind: 'bad', t: 'STARLESS DEEP', txt: 'You descend too soon, too alone, too unarmored by hope.\nThe Hollow King\'s lantern-light leads somewhere that is not a place.\nSomewhere, a village waits for a hero who is not coming home.\nThe dark is patient. The dark has all the time there is.' },
  keeper: { kind: 'good', t: 'KEEPER\'S DAWN', txt: 'The Ember sinks into the kiln like a key into a lock.\nWarmth runs through the village walls like a heard heartbeat.\nThey ask you to stay. You do.\nEvery year on Emberfall eve, children gather to watch you open the kiln,\nand every year the first morning pours out gold.' },
  shared: { kind: 'good', t: 'THE SHARED DAWN', txt: 'You do not hoard the morning. You divide it.\nSilver lanterns from the Hollow King\'s hoard, kindled one by one,\ncarry small suns into every window of the world.\nNo king. No keeper. Just neighbors, and light, and no more dark to fear.' },
  unwritten: { kind: 'secret', t: 'THE UNWRITTEN MORNING', txt: 'You ask the Ember the question the Shrine taught you:\n"Who lit the first morning?"\nThe Ember opens like an eye, and shows you — not the answer —\nthe moment before. The blank page. The unwritten dawn.\nAnd quietly, kindly, it hands you the pen.\nSomewhere, a new story begins where this one ends. Perhaps yours. Perhaps better.' },
};
const END_ORDER = ['ash', 'crown', 'dark', 'cold', 'deep', 'keeper', 'shared', 'unwritten'];
function endingsFound() { return END_ORDER.filter(k => META.endings[k]).length; }
