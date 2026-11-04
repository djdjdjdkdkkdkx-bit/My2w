'use strict';
/* ===== boot ===== */
window.addEventListener('load', () => {
  try {
    Game.init();
  } catch (e) {
    console.error(e);
    const b = $('boot'); b.innerHTML = 'EMBERFALL<span>failed to stoke: ' + e.message + '</span>';
    return;
  }
  const b = $('boot'); b.classList.add('hidden'); b.classList.remove('shown');
});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
window.addEventListener('keydown', e => { if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault(); }, { passive: false });
