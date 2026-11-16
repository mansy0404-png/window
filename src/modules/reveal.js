export function initReveal() {
  const elements = [...document.querySelectorAll('[data-reveal]')];
  if (!elements.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (reduced.matches || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  elements.forEach((el) => observer.observe(el));
}
