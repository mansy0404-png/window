import { canvasSets, photoById } from '../data/media.js';

export function initShowcase() {
  const tabs = [...document.querySelectorAll('.canvas-ui__tab')];
  const board = document.getElementById('canvas-board');
  if (!tabs.length || !board) return;

  const nodes = [...board.querySelectorAll('.node img')];
  const prompt = document.querySelector('[data-canvas-prompt]');
  const count = document.querySelector('.canvas-ui__count');
  const section = document.getElementById('canvas');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let autoTimer = 0;
  let autoIndex = 0;
  let userLocked = false;
  let activeKey = 'campaign';

  const apply = (key) => {
    const set = canvasSets[key];
    if (!set) return;
    activeKey = key;

    tabs.forEach((tab) => {
      const active = tab.dataset.set === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    nodes.forEach((img, i) => {
      const src = photoById[set.images[i]]?.src;
      if (!src || img.getAttribute('src') === src) return;
      img.classList.add('is-swapping');
      const preload = new Image();
      preload.onload = () => {
        img.src = src;
        requestAnimationFrame(() => img.classList.remove('is-swapping'));
      };
      preload.src = src;
    });

    if (prompt) {
      prompt.style.opacity = '0';
      window.setTimeout(() => {
        prompt.textContent = set.prompt;
        prompt.style.opacity = '1';
      }, 220);
    }

    if (count) count.textContent = set.count;
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      userLocked = true;
      window.clearInterval(autoTimer);
      apply(tab.dataset.set);
    });
  });

  // Sync initial roving tabindex / aria state.
  apply(activeKey);

  const startAuto = () => {
    if (reduced.matches || userLocked) return;
    window.clearInterval(autoTimer);
    const keys = Object.keys(canvasSets);
    autoIndex = keys.indexOf(activeKey);
    autoTimer = window.setInterval(() => {
      autoIndex = (autoIndex + 1) % keys.length;
      apply(keys[autoIndex]);
    }, 8200);
  };

  const stopAuto = () => window.clearInterval(autoTimer);

  if (section && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) startAuto();
        else stopAuto();
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else if (section?.getBoundingClientRect().top < window.innerHeight) startAuto();
  });

  tabs.forEach((tab) => {
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const current = tabs.findIndex((t) => t.dataset.set === activeKey);
      const dir = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(current + dir + tabs.length) % tabs.length];
      next.focus();
      next.click();
    });
  });
}
