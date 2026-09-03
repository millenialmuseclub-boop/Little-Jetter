// Wires the 18 batch-3 items (scripts/generate-batch-3.ts) into the catalog,
// following the same capsule pattern as scripts/curate-capsule-wardrobe.mjs:
// universal -> destination:all, cool -> NEEDS_LAYER destinations, warm ->
// SANDALS_FRIENDLY destinations.
import { promises as fs } from 'node:fs';

const CATALOG_PATH = 'src/data/dressUpCatalog.json';

const NEEDS_LAYER = ['tokyo', 'london', 'paris', 'nairobi', 'mexico-city', 'new-york', 'cape-town', 'vancouver', 'seoul', 'sydney', 'san-jose', 'barcelona'];
const SANDALS_FRIENDLY = ['honolulu', 'cartagena', 'rome', 'sydney', 'san-jose', 'barcelona'];
const COOL_TAGS = NEEDS_LAYER.map((d) => `destination:${d}`);
const WARM_TAGS = SANDALS_FRIENDLY.map((d) => `destination:${d}`);

const SLOT_TO_GROUP = { bottom: 'bottoms', top: 'tops', outerwear: 'layers', shoes: 'shoes', accessory: 'accessories' };

const ITEMS = [
  { itemId: 'denim-overalls', name: 'Denim overalls', description: 'A flower-patch pinafore for easy play', slot: 'bottom', capsule: 'universal' },
  { itemId: 'pink-floral-dress', name: 'Pink floral dress', description: 'Soft ruffles and painted blossoms', slot: 'top', capsule: 'warm' },
  { itemId: 'purple-button-dress', name: 'Purple button dress', description: 'A polished collared favorite', slot: 'top', capsule: 'universal' },
  { itemId: 'teal-wrap-dress', name: 'Teal wrap dress', description: 'Flowy with painted blossoms', slot: 'top', capsule: 'warm' },
  { itemId: 'navy-overalls', name: 'Navy overalls', description: 'Classic pinafore over a blouse', slot: 'bottom', capsule: 'cool' },
  { itemId: 'cream-sneakers', name: 'Cream sneakers', description: 'Simple and easy to run in', slot: 'shoes', capsule: 'universal' },
  { itemId: 'yellow-boots', name: 'Yellow rain boots', description: 'Ready for every puddle', slot: 'shoes', capsule: 'cool' },
  { itemId: 'pink-boots', name: 'Pink fleece boots', description: 'Cozy for cooler days', slot: 'shoes', capsule: 'cool' },
  { itemId: 'brown-hiking-boots', name: 'Brown hiking boots', description: 'Sturdy for a trail day', slot: 'shoes', capsule: 'cool' },
  { itemId: 'black-mary-janes', name: 'Black mary janes', description: 'Polished and ready for anywhere', slot: 'shoes', capsule: 'universal' },
  { itemId: 'navy-sandals', name: 'Navy buckle sandals', description: 'Easy for a warm day out', slot: 'shoes', capsule: 'warm' },
  { itemId: 'pink-flats', name: 'Pink ballet flats', description: 'Sweet and simple with a bow', slot: 'shoes', capsule: 'universal' },
  { itemId: 'purple-flower-cap', name: 'Purple flower cap', description: 'A cute cap with a painted bloom', slot: 'accessory', capsule: 'universal' },
  { itemId: 'patchwork-bucket-hat-2', name: 'Blue patchwork bucket hat', description: 'Colorful patches all around', slot: 'accessory', capsule: 'warm' },
  { itemId: 'puppy-cap', name: 'Puppy cap', description: 'A playful cap with a cartoon pup', slot: 'accessory', capsule: 'universal' },
  { itemId: 'pink-quilted-purse', name: 'Pink quilted purse', description: 'A sweet little bag for treasures', slot: 'accessory', capsule: 'universal' },
  { itemId: 'black-quilted-purse', name: 'Black quilted purse', description: 'A little bag with a floral charm', slot: 'accessory', capsule: 'universal' },
  { itemId: 'blue-backpack', name: 'Blue backpack', description: 'Roomy with a friendly patch', slot: 'accessory', capsule: 'universal' },
];

function tagsFor(capsule) {
  if (capsule === 'universal') return ['destination:all', 'illustrated'];
  if (capsule === 'cool') return [...COOL_TAGS, 'illustrated'];
  return [...WARM_TAGS, 'illustrated'];
}

async function main() {
  const raw = await fs.readFile(CATALOG_PATH, 'utf8');
  const catalog = JSON.parse(raw);
  const all = catalog.destinations.all;

  for (const job of ITEMS) {
    const group = SLOT_TO_GROUP[job.slot];
    if (all[group].some((item) => item.id === job.itemId)) {
      console.log(`${job.itemId}: already wired, skipped`);
      continue;
    }
    all[group].push({
      id: job.itemId,
      name: job.name,
      description: job.description,
      imageUrl: `/little-jetter/catalog/tokyo/${job.itemId}/default.png`,
      slot: job.slot,
      tags: tagsFor(job.capsule),
    });
    console.log(`${job.itemId}: wired into ${group} (${job.capsule})`);
  }

  await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
