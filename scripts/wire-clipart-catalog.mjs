// Adds the 129 positioned clip-art items into src/data/dressUpCatalog.json
// under destinations.all so they show up in every destination's drawers
// (not gated to Tokyo). Dress-type pieces (anchor 'dress') live in the
// tops bucket with an extra 'style:dress' tag so the Style tab can filter
// them into their own "Dress" view; hat-type pieces (anchor 'hat') live in
// accessories with an extra 'style:hat' tag for the same reason in
// Accessories. This keeps the existing 5-slot equip system untouched.
import fs from 'node:fs';
import path from 'node:path';
import { CLIPART_ITEMS } from './clipart-catalog.mjs';

const CATALOG_PATH = path.resolve('src/data/dressUpCatalog.json');
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
const all = catalog.destinations.all;

const SLOT_BY_ANCHOR = {
  top: 'top', dress: 'top', outerwear: 'outerwear', bottom: 'bottom',
  shoes: 'shoes', hat: 'accessory', face: 'accessory', bag: 'accessory',
};
const EXTRA_TAG_BY_ANCHOR = { dress: 'style:dress', hat: 'style:hat' };

let added = 0;
for (const item of CLIPART_ITEMS) {
  const bucket = all[item.category];
  if (bucket.some((existing) => existing.id === item.id)) continue;
  const tags = ['destination:all', 'illustrated', 'clipart'];
  const extra = EXTRA_TAG_BY_ANCHOR[item.anchor];
  if (extra) tags.push(extra);
  bucket.push({
    id: item.id,
    name: item.name,
    description: item.name,
    imageUrl: `/little-jetter/catalog/tokyo/${item.id}/default.png`,
    slot: SLOT_BY_ANCHOR[item.anchor],
    tags,
  });
  added++;
}

fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log('added', added, 'clip-art items to dressUpCatalog.json (destinations.all)');
