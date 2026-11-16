// ── Media manifest ───────────────────────────────────────────────────────
// All imagery is a curated selection of 4:5 stills (900×1125) in
// ./media/photos/. Swap any `src` for your own file — keep the 4:5 ratio and
// the composition will crop with object-fit: cover. See README.md →
// "Swapping in your own imagery".

export const photos = [
  { id: 'f01', src: './media/photos/photo-01.jpg' },
  { id: 'f02', src: './media/photos/photo-02.jpg' },
  { id: 'f03', src: './media/photos/photo-03.jpg' },
  { id: 'f04', src: './media/photos/photo-04.jpg' },
  { id: 'f05', src: './media/photos/photo-05.jpg' },
  { id: 'f06', src: './media/photos/photo-06.jpg' },
  { id: 'f07', src: './media/photos/photo-07.jpg' },
  { id: 'f08', src: './media/photos/photo-08.jpg' },
  { id: 'f09', src: './media/photos/photo-09.jpg' },
  { id: 'f10', src: './media/photos/photo-10.jpg' },
  { id: 'f11', src: './media/photos/photo-11.jpg' },
  { id: 'f12', src: './media/photos/photo-12.jpg' },
  { id: 'f13', src: './media/photos/photo-13.jpg' },
  { id: 'f14', src: './media/photos/photo-14.jpg' },
  { id: 'f15', src: './media/photos/photo-15.jpg' },
  { id: 'f16', src: './media/photos/photo-16.jpg' },
  { id: 'f17', src: './media/photos/photo-17.jpg' },
  { id: 'f18', src: './media/photos/photo-18.jpg' },
  { id: 'f19', src: './media/photos/photo-19.jpg' },
  { id: 'f20', src: './media/photos/photo-20.jpg' },
  { id: 'f21', src: './media/photos/photo-21.jpg' },
  { id: 'f22', src: './media/photos/photo-22.jpg' },
];

export const photoById = Object.fromEntries(photos.map((p) => [p.id, p]));

// Order the ribbon cycles through. Repeat, shorten, or reorder as you like.
export const ribbonSequence = [
  'f05',
  'f10',
  'f02',
  'f14',
  'f07',
  'f21',
  'f09',
  'f16',
  'f03',
  'f18',
  'f19',
  'f15',
  'f11',
  'f20',
  'f06',
  'f13',
  'f01',
  'f12',
];

// The canvas showcase tabs. Each set fills the three nodes left → right.
export const canvasSets = {
  campaign: {
    images: ['f05', 'f13', 'f18'],
    prompt: 'Pull the palette warmer and keep the grain.',
    count: '4 directions',
  },
  film: {
    images: ['f15', 'f21', 'f02'],
    prompt: 'Cut a 15-second title sequence. Keep the grain.',
    count: '3 cuts',
  },
  lookbook: {
    images: ['f14', 'f04', 'f20'],
    prompt: 'Build a lookbook from the spring stills.',
    count: '6 spreads',
  },
};
