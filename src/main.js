import { initRibbon } from './modules/ribbon.js';
import { initPrompts } from './modules/prompt.js';
import { initShowcase } from './modules/showcase.js';
import { initGallery } from './modules/gallery.js';
import { initReveal } from './modules/reveal.js';

const initHeader = () => {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );

  update();
};

initRibbon(document.getElementById('ribbon'));
initPrompts();
initShowcase();
initGallery();
initReveal();
initHeader();
