'use strict';
/* ===== boss intro & aftermath scenes ===== */
const BOSS_SCENES = {
  warden: {
    intro: () => [L('???', 'WHO TREADS THE SAP-DARK RING? WHO CARRIES OLD IRON INTO MY GRIEF?'),
      L('Bramble Warden', 'The Hollow whispered poison into my roots, little ember. The wood rots because I WEEP.'),
      L('Bramble Warden', 'Put me down or be mulch. The forest is past caring which.')],
    end: () => [
      { c: [
        { t: '«Spare the Warden» — mercy the blight cannot earn.', f: () => { F('spared_warden', 1); addHope(1, 'the Warden weeps gratitude'); F('grove_open', 1); G.gates.grove = 1;
            toast('The Hidden Grove opens west of the mound!', 1); toast('The blight lifts. The wood exhales.', 1); },
          steps: () => bossAfterSteps('warden') },
        { t: '«Strike it down» — end the weeping with iron.', f: () => { F('slain_warden', 1); G.p.ownW.push('fang'); equipBest('w', 'fang');
            toast('Oaken Fang taken (+9 ATK). The mound goes quiet.', 1); }, steps: () => bossAfterSteps('warden') }] }],
    spare: () => [L('Bramble Warden', '...Mercy. From meat. The Hollow told me your kind had forgotten the word.'),
      L('Bramble Warden', 'West of my mound, thorns part for you now. The Hidden Grove keeps a shrine — and my last bright seed. Take both.')],
    slay: () => [L('Bramble Warden', 'Ah... the bell... stops... tell the wood... I tried...')],
  },
  sovereign: {
    intro: () => [L('???', 'THE SAND RISES. CENTURIES OF IT.'),
      L('Dune Sovereign', 'A crowned thing stirs in gold light. "Thieves buried me with my treasure, ember-bearer. You smell of neither gold nor grave."'),
      L('Dune Sovereign', 'Kneel and be rich. Or stand and be sand.')],
    end: () => [
      { c: [
        { t: '«Spare the Sovereign» — kings deserve better than twice.', f: () => { F('spared_sovereign', 1); addHope(1, 'a king remembers kindness');
            G.p.ownW.push('sandglass'); equipBest('w', 'sandglass'); giveItem('shard', 1);
            toast('Sandglass Falchion gifted (+13 ATK)', 1); }, steps: () => bossAfterSteps('sovereign') },
        { t: '«Strike it down» — take the falchion by force.', f: () => { F('slain_sovereign', 1); G.p.ownW.push('sandglass'); equipBest('w', 'sandglass');
            toast('Sandglass Falchion claimed (+13 ATK)', 1); }, steps: () => bossAfterSteps('sovereign') }] }],
    spare: () => [L('Dune Sovereign', 'Then take the falchion — it was always a gift, wrapped in a duel. And this... a splinter of MY morning.'),
      L('Dune Sovereign', 'The Temple floor opens, ember-bearer. The Hollow below has been counting your steps.')],
    slay: () => [L('Dune Sovereign', 'Twice... buried... by strangers... the sand takes the rest.')],
  },
  deepking: {
    intro: () => [L('???', 'THE DARK CLEARS ITS THROAT. IT HAS BEEN PRACTICING.'),
      L('Hollow King', 'You carry warmth like a candle in a windstorm. Give it here and I will keep it SAFE, little flame.'),
      L('Hollow King', 'Everything I keep is safe forever. Ask the Lake. Ask the drowned bell.')],
    end: () => [
      { c: [
        { t: '«Spare the Hollow King» — even the dark deserves dusk, not death.', f: () => { F('spared_deepking', 1); addHope(1, 'the dark learns gentleness');
            G.p.ownW.push('hollow'); equipBest('w', 'hollow'); giveItem('shard', 1); giveItem('sigil', 1); F('deepshaft', 1);
            toast('Hollow Cleaver gifted (+17 ATK). Ember Sigil received!', 1); toast('A deep shaft to the Keep opens behind the throne.', 1); }, steps: () => bossAfterSteps('deepking') },
        { t: '«Strike it down» — take the sigil from its cold hand.', f: () => { F('slain_deepking', 1); G.p.ownW.push('hollow'); equipBest('w', 'hollow');
            giveItem('sigil', 1); toast('Hollow Cleaver claimed. Ember Sigil taken!', 1); }, steps: () => bossAfterSteps('deepking') }] }],
    spare: () => [L('Hollow King', '...No one has ever declined to take FROM me before. It is... a strange weather.'),
      L('Hollow King', 'Keep the sigil. Climb my shaft. And little flame — if you reach the Heart, ask it my question too: WHY MORNING?')],
    slay: () => [L('Hollow King', 'Safe... forever... is such a long...')],
  },
  marshal: {
    intro: () => [L('???', 'ARMOR MOVES WHERE ARMOR SHOULD NOT. THE THRONE ROOM LIGHTS WITH RED.'),
      L('Wraith Marshal', 'The Ember\'s warmth belongs to the Legion of the Long March, villager. We died carrying it. We will not stop.'),
      L('Wraith Marshal', 'Kneel, and I will let your village keep its little fire. Stand, and I will take the morning itself.')],
    end: () => [
      { c: [
        { t: '«Spare the Marshal» — even a legion was once just people.', f: () => { F('spared_marshal', 1); F('pact_offer', 1);
            G.p.ownW.push('sabre'); equipBest('w', 'sabre'); toast('Wraith Sabre lowered in respect (+18 ATK)', 1); }, steps: () => bossAfterSteps('marshal') },
        { t: '«Strike the Marshal down» — the march ends here.', f: () => { F('slain_marshal', 1); G.p.ownW.push('sabre'); equipBest('w', 'sabre');
            toast('Wraith Sabre claimed (+18 ATK)', 1); }, steps: () => bossAfterSteps('marshal') }] }],
    spare: () => [L('Wraith Marshal', '...Centuries of orders, and no one ever said "no, thank you" politely. The throne room is yours.'),
      L('Wraith Marshal', 'The Heart lies behind the dais. It will make you offers. It made me one once. Look how that ended.')],
    slay: () => [L('Wraith Marshal', 'The march... ends... tell them... we almost...')],
  },
};
function sparedAllCheck() { if (got('spared_warden') && got('spared_sovereign') && got('spared_deepking') && got('spared_marshal')) F('spared_all', 1); }
