import { photoById, ribbonSequence } from '../data/media.js';

const TAU = Math.PI * 2;
const SIZES = [
  [1, 1.22],
  [1.18, 0.92],
  [0.88, 1.12],
  [1.3, 1.02],
  [1, 1.34],
  [1.12, 1.18],
];

const clamp = (min, value, max) => Math.min(max, Math.max(min, value));
const rand = (min, max) => min + Math.random() * (max - min);

function cardCountFor(width) {
  if (width >= 1200) return 16;
  if (width >= 820) return 13;
  if (width >= 560) return 11;
  return 8;
}

class Ribbon {
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector('.ribbon__stage');
    this.cards = [];
    this.phase = 0;
    this.time = 0;
    this.count = 0;
    this.width = 0;
    this.height = 0;
    this.scroll = 0;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this.running = false;
    this.visible = true;
    this.frame = 0;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.lastTime = performance.now();

    this.bind();
    this.observe();
    this.resize();

    if (this.reduced.matches) {
      this.render();
    } else {
      this.start();
    }
  }

  bind() {
    this.onPointer = (event) => {
      const rect = this.root.getBoundingClientRect();
      this.pointer.tx = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
      this.pointer.ty = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    };

    this.onScroll = () => {
      this.scroll = window.scrollY;
    };

    this.onResize = () => {
      if (this.resizeFrame) return;
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        this.resize();
        if (this.reduced.matches) this.render();
      });
    };

    this.onReducedChange = () => {
      if (this.reduced.matches) {
        this.stop();
        this.render();
      } else {
        this.lastTime = performance.now();
        this.start();
      }
    };

    this.onVisibility = () => {
      if (document.hidden) this.stop();
      else if (!this.reduced.matches) this.start();
    };

    window.addEventListener('pointermove', this.onPointer, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    this.reduced.addEventListener?.('change', this.onReducedChange);
  }

  observe() {
    if (!('IntersectionObserver' in window)) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        this.visible = entries[0]?.isIntersecting ?? true;
        if (this.visible && !this.reduced.matches) {
          this.lastTime = performance.now();
          this.start();
        } else {
          this.stop();
        }
      },
      { threshold: 0 },
    );
    this.observer.observe(this.root);
  }

  resize() {
    const width = this.root.clientWidth;
    const height = this.root.clientHeight;
    if (!width || !height) return;

    const nextCount = cardCountFor(width);
    const shouldRebuild = nextCount !== this.count || !this.cards.length;
    this.width = width;
    this.height = height;

    if (shouldRebuild) {
      this.count = nextCount;
      this.build();
    }
    this.render();
  }

  makeCard(index) {
    const [wf, hf] = SIZES[index % SIZES.length];
    const base = clamp(92, this.width * 0.108, 168);
    const width = Math.round(base * wf);
    const height = Math.round(base * hf);

    const el = document.createElement('figure');
    el.className = 'ribbon-card';
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;

    const a = document.createElement('img');
    const b = document.createElement('img');
    a.alt = '';
    b.alt = '';
    a.decoding = 'async';
    b.decoding = 'async';
    a.draggable = false;
    b.draggable = false;
    a.width = 900;
    a.height = 1125;
    b.width = 900;
    b.height = 1125;

    const first = photoById[ribbonSequence[index % ribbonSequence.length]];
    a.src = first.src;
    b.src = first.src;
    a.classList.add('is-visible');

    el.append(a, b);
    this.stage.append(el);

    return {
      el,
      images: [a, b],
      width,
      height,
      offset: (index / this.count + rand(-0.012, 0.012) + 1) % 1,
      seed: rand(0, TAU),
      lane: rand(-1, 1),
      laneY: rand(-1, 1),
      tilt: rand(-7, 7),
      nextImage: 1,
      currentSrc: first.src,
      swapIn: rand(4, 15),
    };
  }

  build() {
    this.stage.replaceChildren();
    this.cards = [];
    for (let i = 0; i < this.count; i += 1) {
      this.cards.push(this.makeCard(i));
    }
  }

  assignImage(card) {
    if (!card.el.isConnected) return;
    let entry = photoById[ribbonSequence[Math.floor(Math.random() * ribbonSequence.length)]];
    if (entry.src === card.currentSrc) {
      const index = ribbonSequence.findIndex((id) => photoById[id].src !== card.currentSrc);
      entry = photoById[ribbonSequence[Math.max(0, index)]];
    }

    const img = card.images[card.nextImage];
    const preload = new Image();
    preload.decoding = 'async';
    preload.onload = () => {
      if (!card.el.isConnected) return;
      img.src = entry.src;
      card.images.forEach((layer) => layer.classList.remove('is-visible'));
      img.classList.add('is-visible');
      card.currentSrc = entry.src;
    };
    preload.src = entry.src;
    card.nextImage = 1 - card.nextImage;
    card.swapIn = rand(6, 14);
  }

  render() {
    if (!this.width || !this.height) return;

    const { width, height, pointer } = this;
    pointer.x += (pointer.tx - pointer.x) * 0.055;
    pointer.y += (pointer.ty - pointer.y) * 0.055;
    const drift = clamp(-160, this.scroll * 0.045, 160);

    for (const card of this.cards) {
      const t = (this.phase + card.offset) % 1;
      const angle = t * TAU;

      const x = 0.5 + 0.465 * Math.sin(angle) + card.lane * 0.022;
      const y = 0.5 + 0.335 * Math.sin(2 * angle) + card.laneY * 0.02;
      const z = Math.sin(2 * angle + card.seed) * 150 + 20;

      const slope = (0.67 * Math.cos(2 * angle) * height) / (0.465 * Math.cos(angle) * width || 1);
      const rotateZ = (Math.atan(slope) * 180) / Math.PI * 0.3 + card.tilt;
      const rotateY = (x - 0.5) * 26 + Math.sin(angle * 1.3 + card.seed) * 9;
      const rotateX = Math.cos(angle * 2 + card.seed) * 7;
      const scale = 0.94 + ((z + 150) / 300) * 0.12;

      const depth = (z + 150) / 300;
      const ox = pointer.x * depth * 13;
      const oy = pointer.y * depth * 10;

      card.el.style.transform = `translate3d(${(x * width - card.width / 2 + ox).toFixed(2)}px, ${(
        y * height -
        card.height / 2 +
        oy -
        drift
      ).toFixed(2)}px, ${z.toFixed(1)}px) rotateZ(${rotateZ.toFixed(2)}deg) rotateY(${rotateY.toFixed(
        2,
      )}deg) rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      card.el.style.opacity = Math.min(1, 0.68 + depth * 0.32).toFixed(3);
      card.el.style.zIndex = String(Math.round(depth * 10));
    }
  }

  tick(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.time += dt;
    this.phase = (this.phase + dt / 55) % 1;

    for (const card of this.cards) {
      card.swapIn -= dt;
      if (card.swapIn <= 0) this.assignImage(card);
    }

    this.render();
    this.frame = requestAnimationFrame((next) => this.tick(next));
  }

  start() {
    if (this.running || this.reduced.matches || !this.visible || document.hidden) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame((now) => this.tick(now));
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }
}

export function initRibbon(root) {
  if (!root) return null;
  return new Ribbon(root);
}
