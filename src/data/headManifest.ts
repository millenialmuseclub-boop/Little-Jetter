export type CompleteHeadAsset = {
  id: string;
  name: string;
  src: string;
  thumbnailSrc: string;
  canvasWidth: 600;
  canvasHeight: 900;
  anchor: { centerX: 300; headCenterY: 218; neckY: 330 };
  faceScale: number;
  layer: 'head';
  enabled: boolean;
  skinTone: 'light' | 'medium' | 'deep';
  hairColor: string;
  hairstyle: string;
  hairTexture: 'straight' | 'wavy' | 'curly' | 'coily' | 'braided';
  eyeColor: 'dark-brown' | 'brown' | 'hazel' | 'green' | 'blue' | 'grey';
  presentation: 'feminine' | 'masculine' | 'neutral';
  collection: 'all' | 'short' | 'long' | 'curly-coily' | 'braids-locs';
};

const anchor = { centerX: 300, headCenterY: 218, neckY: 330 } as const;

// Equal canvases from the different art batches still contain differently
// sized painted faces. Scale around the shared neck anchor to keep every head
// connected to the body while bringing the eyes and chin into one range.
const FACE_SCALE: Record<string, number> = {
  'bob-bangs': 1.02,
  'braids-dark': 0.88,
  'bucket-hat-pink': 1.08,
  'bun-auburn': 0.94,
  'bun-blonde-bow': 0.9,
  'cap-green-boy': 0.95,
  'curly-bow': 1.06,
  'curly-fro-boy': 0.76,
  'headband-curly': 1.12,
  'long-straight-dark': 1.02,
  'pigtails-bows': 1.02,
  'wavy-daisy-auburn': 1.1,
  'wavy-long-dark': 1.02,
};

// Sheet crops in this set contain parts of neighboring heads. Keep them out of
// the picker until each one has been replaced by a complete standalone asset.
const WITHHELD_HEADS = new Set([
  'wavy-blonde-boy2',
]);

function head(id: string, name: string, skinTone: CompleteHeadAsset['skinTone'], hairColor: string, hairstyle: string, hairTexture: CompleteHeadAsset['hairTexture'], eyeColor: CompleteHeadAsset['eyeColor'], presentation: CompleteHeadAsset['presentation'], collection: CompleteHeadAsset['collection']): CompleteHeadAsset {
  return { id, name, src: `/little-jetter/catalog/tokyo/head/style-${id}.png`, thumbnailSrc: `/little-jetter/head-thumbnails/${id}.webp`, canvasWidth: 600, canvasHeight: 900, anchor, faceScale: FACE_SCALE[id] ?? 1, layer: 'head', enabled: !WITHHELD_HEADS.has(id), skinTone, hairColor, hairstyle, hairTexture, eyeColor, presentation, collection };
}

export const COMPLETE_HEADS: CompleteHeadAsset[] = [
  head('bandana-bun', 'Bandana bun', 'light', 'black', 'bun', 'straight', 'brown', 'feminine', 'long'),
  head('blonde-wavy-daisy', 'Daisy waves', 'light', 'blonde', 'shoulder waves', 'wavy', 'blue', 'feminine', 'long'),
  head('bob-bangs', 'Bob and bangs', 'light', 'black', 'bob with bangs', 'straight', 'brown', 'feminine', 'short'),
  head('bob-blonde-clip', 'Blonde bob', 'light', 'blonde', 'bob with clip', 'straight', 'blue', 'feminine', 'short'),
  head('bow-curly', 'Soft bow curls', 'medium', 'dark brown', 'curly bob', 'curly', 'brown', 'feminine', 'curly-coily'),
  head('braids-auburn', 'Auburn braids', 'light', 'auburn', 'twin braids', 'braided', 'green', 'feminine', 'braids-locs'),
  head('braids-dark', 'Golden twin braids', 'medium', 'dark brown', 'twin braids', 'braided', 'brown', 'feminine', 'braids-locs'),
  head('bucket-hat-pink', 'Pink bucket hat', 'medium', 'dark brown', 'long under hat', 'wavy', 'brown', 'feminine', 'long'),
  head('bun-auburn', 'Auburn bun', 'light', 'auburn', 'high bun', 'wavy', 'green', 'feminine', 'long'),
  head('bun-blonde-bow', 'Blonde bow bun', 'light', 'blonde', 'high bun', 'wavy', 'blue', 'feminine', 'long'),
  head('cap-brown', 'Blue cap curls', 'medium', 'dark brown', 'curls under cap', 'curly', 'brown', 'neutral', 'curly-coily'),
  head('cap-green-boy', 'Green cap crop', 'light', 'brown', 'crop under cap', 'straight', 'brown', 'masculine', 'short'),
  head('cap-tan-boy', 'Tan cap crop', 'light', 'black', 'crop under cap', 'straight', 'brown', 'masculine', 'short'),
  head('curly-auburn-boy', 'Auburn curls', 'light', 'auburn', 'short curls', 'curly', 'brown', 'masculine', 'curly-coily'),
  head('curly-bow', 'Curly bow', 'deep', 'dark brown', 'curly halo', 'coily', 'brown', 'feminine', 'curly-coily'),
  head('curly-fro-boy', 'Short afro', 'deep', 'black', 'short afro', 'coily', 'dark-brown', 'masculine', 'curly-coily'),
  head('curly-fro', 'Curly afro', 'medium', 'brown', 'curly afro', 'coily', 'brown', 'feminine', 'curly-coily'),
  head('curly-topknot', 'Curly topknot', 'deep', 'black', 'curly topknot', 'coily', 'dark-brown', 'feminine', 'curly-coily'),
  head('headband-curly', 'Headband curls', 'deep', 'dark brown', 'curly halo', 'coily', 'brown', 'feminine', 'curly-coily'),
  head('long-straight-dark', 'Long dark hair', 'medium', 'black', 'long middle part', 'straight', 'brown', 'feminine', 'long'),
  head('messy-bun', 'Messy bun', 'medium', 'brown', 'messy bun', 'wavy', 'green', 'feminine', 'long'),
  head('pigtail-buns', 'Pigtail buns', 'deep', 'black', 'space buns', 'coily', 'dark-brown', 'feminine', 'curly-coily'),
  head('pigtails-bows', 'Bow pigtails', 'medium', 'brown', 'pigtails', 'wavy', 'brown', 'feminine', 'long'),
  head('short-dark-boy', 'Short dark crop', 'medium', 'black', 'side crop', 'straight', 'brown', 'masculine', 'short'),
  head('wavy-blonde-boy', 'Blonde waves', 'light', 'blonde', 'short waves', 'wavy', 'blue', 'masculine', 'short'),
  head('wavy-blonde-boy2', 'Tousled blonde', 'light', 'blonde', 'tousled crop', 'wavy', 'blue', 'masculine', 'short'),
  head('wavy-brown-boy', 'Tousled brown', 'light', 'brown', 'tousled crop', 'wavy', 'brown', 'masculine', 'short'),
  head('wavy-clip', 'Wavy hair clip', 'medium', 'brown', 'shoulder waves', 'wavy', 'brown', 'feminine', 'long'),
  head('wavy-daisy-auburn', 'Auburn daisy waves', 'light', 'auburn', 'shoulder waves', 'wavy', 'green', 'feminine', 'long'),
  head('wavy-long-dark', 'Long dark waves', 'medium', 'dark brown', 'long waves', 'wavy', 'brown', 'feminine', 'long'),
];

export const HEAD_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'short', label: 'Short hair' },
  { id: 'long', label: 'Long hair' },
  { id: 'curly-coily', label: 'Curly + coily' },
  { id: 'braids-locs', label: 'Braids + locs' },
] as const;
