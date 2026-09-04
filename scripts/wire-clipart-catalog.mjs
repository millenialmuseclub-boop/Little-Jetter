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
let added = 0;
let updated = 0;
for (const item of CLIPART_ITEMS) {
  const bucket = all[item.category];
  const tags = ['destination:all', 'illustrated', 'clipart'];
  if (item.style) tags.push(`style:${item.style}`);
  else if (item.anchor === 'hat') tags.push('style:hat');
  const existing = bucket.find((existing) => existing.id === item.id);
  if (existing) {
    const before = JSON.stringify(existing.tags);
    existing.tags = tags;
    if (JSON.stringify(existing.tags) !== before) updated++;
    continue;
  }
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
console.log('added', added, 'new,', updated, 'retagged, in dressUpCatalog.json (destinations.all)');
