export function initGallery() {
  const grid = document.getElementById('gallery-grid');
  const filters = [...document.querySelectorAll('.filter')];
  if (!grid || !filters.length) return;

  const tiles = [...grid.querySelectorAll('.tile')];

  const apply = (value) => {
    filters.forEach((button) => {
      const active = button.dataset.filter === value;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const visible = [];

    tiles.forEach((tile) => {
      const tags = (tile.dataset.tags || '').split(/\s+/);
      const show = value === 'all' || tags.includes(value);
      tile.classList.remove('is-entering');
      tile.hidden = !show;
      if (show) visible.push(tile);
    });

    // Force a style flush so the entry animation can restart.
    void grid.offsetWidth;

    visible.forEach((tile, i) => {
      tile.style.setProperty('--d', `${Math.min(i * 45, 320)}ms`);
      tile.classList.add('is-entering');
    });
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.filter));
  });
}
