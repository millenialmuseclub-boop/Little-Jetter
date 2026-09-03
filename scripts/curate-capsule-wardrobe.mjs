// Replaces the blanket "destination:all" on most shared wardrobe items with a
// real capsule assignment: cool-weather pieces go to the destinations that
// need a layer, warm/sandals pieces go to the destinations marked
// sandals-friendly, and only true everyday basics stay universal. Mirrors the
// needsLayer/sandalsFriendly flags already defined per destination in
// LittleJetterApp.tsx.
import { promises as fs } from 'node:fs';

const CATALOG_PATH = 'src/data/dressUpCatalog.json';

const NEEDS_LAYER = ['tokyo', 'london', 'paris', 'nairobi', 'mexico-city', 'new-york', 'cape-town', 'vancouver', 'seoul', 'sydney', 'san-jose', 'barcelona'];
const SANDALS_FRIENDLY = ['honolulu', 'cartagena', 'rome', 'sydney', 'san-jose', 'barcelona'];

const COOL_TAGS = NEEDS_LAYER.map((d) => `destination:${d}`);
const WARM_TAGS = SANDALS_FRIENDLY.map((d) => `destination:${d}`);

// Everyday basics that make sense in any climate — stay destination:all.
const UNIVERSAL = new Set([
  'stripe', 'sunset-tee', 'travel-jeans', 'cargo-pants', 'sneakers', 'purple-high-tops',
  'travel-cap', 'crossbody', 'mini-camera', 'floral-headband',
]);

const COOL = new Set([
  'floral-cardigan', 'wide-leg-pants', 'navy-pleated-skirt',
  'denim', 'windbreaker', 'trench-coat', 'pink-hoodie', 'rain',
  'boots', 'black-lace-boots', 'pink-beret',
]);

const WARM = new Set([
  'play-skirt', 'floral-midi-skirt', 'purple-sandals', 'straw-sun-hat',
  'adventure-shorts', 'sandals', 'sun-glasses',
]);

function nonDestinationTags(tags) {
  return tags.filter((t) => !t.startsWith('destination:'));
}

async function main() {
  const cat = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf-8'));
  const all = cat.destinations.all;
  let changed = 0;

  for (const group of Object.values(all)) {
    if (!Array.isArray(group)) continue;
    for (const item of group) {
      if (item.id === 'none') continue;
      const others = nonDestinationTags(item.tags);
      if (UNIVERSAL.has(item.id)) {
        item.tags = ['destination:all', ...others];
        changed++;
      } else if (COOL.has(item.id)) {
        item.tags = [...COOL_TAGS, ...others];
        changed++;
      } else if (WARM.has(item.id)) {
        item.tags = [...WARM_TAGS, ...others];
        changed++;
      }
      // Anything not in these sets (sweater, adventure-shirt, dress,
      // coral-skirt, cardigan, trail-shoes, bucket-hat) already carries a
      // curated destination-specific list from earlier work — leave as-is,
      // but strip a redundant "destination:all" if one snuck in, since that
      // would silently make the curation moot.
      else if (item.tags.includes('destination:all') && item.tags.some((t) => t.startsWith('destination:') && t !== 'destination:all')) {
        item.tags = others.length === item.tags.length ? item.tags.filter((t) => t !== 'destination:all') : item.tags.filter((t) => t !== 'destination:all');
        changed++;
      }
    }
  }

  await fs.writeFile(CATALOG_PATH, JSON.stringify(cat, null, 2) + '\n');
  console.log('curated', changed, 'items');
}

main();
