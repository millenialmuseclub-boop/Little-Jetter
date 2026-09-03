// Second wardrobe-expansion batch: 12 new items across tops/outerwear, bottoms,
// shoes, and accessories, using cropped references from the user's own
// AI-generated clip-art sheets. All wired as destination:all so they show up
// on every destination immediately, not just Tokyo.
// Run with: npx tsx scripts/generate-batch-2.ts
import path from 'node:path';
import dotenv from 'dotenv';
import { generateClosetAsset } from '../server/closet/generateClosetAsset';
import { REFERENCE_ASSET_URLS } from '../server/closet/tokyoManifest';
import { buildContactSheet } from '../server/closet/contactSheet';
import type { ContactSheetCell } from '../server/closet/contactSheet';
import type { ClosetSlot } from '../server/closet/assetSpec';

dotenv.config({ path: '.env.local' });

const regenerate = process.argv.includes('--regenerate');
const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');
function urlToLocalPath(url: string): string {
  return path.join(PUBLIC_ROOT, url.replace(/^\//, ''));
}

const GARMENT_ONLY = 'Garment only — no legs, no knees, no feet, no socks, no shoes, no hands, no skin visible at all beyond what the item itself covers, just the item shaped as if worn.';

type Job = { itemId: string; name: string; description: string; slot: ClosetSlot; itemPrompt: string; referenceAsset: string };

const JOBS: Job[] = [
  {
    itemId: 'trench-coat', name: 'Tan trench coat', description: 'A classic belted trench for cooler days',
    slot: 'outerwear',
    itemPrompt: `A tan double-breasted trench coat with a tied waist belt and a wide collar, worn open over a top. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/trench.png',
  },
  {
    itemId: 'pink-hoodie', name: 'Cozy pink hoodie', description: 'Soft and warm with a fuzzy-lined hood',
    slot: 'outerwear',
    itemPrompt: `A soft pink zip-up hoodie with a fuzzy cream-lined hood and front pocket, worn open over a top. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/hoodie.png',
  },
  {
    itemId: 'floral-cardigan', name: 'Cream floral cardigan', description: 'Button-front knit with painted blossoms',
    slot: 'top',
    itemPrompt: `A cream button-front knit cardigan with small painted pink and peach flower embroidery scattered across it. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/cardigan.png',
  },
  {
    itemId: 'cargo-pants', name: 'Cream cargo pants', description: 'Roomy pockets for tiny treasures',
    slot: 'bottom',
    itemPrompt: `Relaxed cream cargo pants with large patch pockets on both thighs and an elastic waist. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/cargo.png',
  },
  {
    itemId: 'navy-pleated-skirt', name: 'Navy pleated skirt', description: 'A crisp schoolyard classic',
    slot: 'bottom',
    itemPrompt: `A navy blue pleated mini skirt with a small gold charm at the waistband. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/navyskirt.png',
  },
  {
    itemId: 'floral-midi-skirt', name: 'Green floral midi skirt', description: 'Flowy and covered in blossoms',
    slot: 'bottom',
    itemPrompt: `A forest-green A-line midi skirt with painted pink flower blossoms along one side. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/greenskirt.png',
  },
  {
    itemId: 'purple-high-tops', name: 'Purple high-top sneakers', description: 'Bold and ready to explore',
    slot: 'shoes',
    itemPrompt: 'A single worn pair of purple canvas high-top sneakers with cream laces, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/purplesneaker.png',
  },
  {
    itemId: 'purple-sandals', name: 'Purple buckle sandals', description: 'Easy on, easy off for warm days',
    slot: 'shoes',
    itemPrompt: 'A single worn pair of purple double-strap buckle sandals with a chunky cream sole, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/loafer.png',
  },
  {
    itemId: 'black-lace-boots', name: 'Black lace-up boots', description: 'Sturdy and a little bit cool',
    slot: 'shoes',
    itemPrompt: 'A single worn pair of black lace-up ankle boots with a chunky sole and small flower charm, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/blackboots.png',
  },
  {
    itemId: 'pink-beret', name: 'Pink beret', description: 'A little pop of Parisian flair',
    slot: 'accessory',
    itemPrompt: 'A soft pink knit beret, framed and scaled as it would be worn on a standing child\'s head, front-facing.',
    referenceAsset: '/_tmp_refs/beret.png',
  },
  {
    itemId: 'straw-sun-hat', name: 'Straw sun hat', description: 'Wide brim with a ribbon bow',
    slot: 'accessory',
    itemPrompt: 'A woven straw sun hat with a wide brim and a coral ribbon bow at the back, framed and scaled as it would be worn on a standing child\'s head, front-facing.',
    referenceAsset: '/_tmp_refs/sunhat.png',
  },
  {
    itemId: 'floral-headband', name: 'Floral headband', description: 'Sweet blossoms for any outfit',
    slot: 'accessory',
    itemPrompt: 'A black hairband trimmed with small pink and white flower blossoms, framed and scaled as it would be worn on a standing child\'s head, front-facing.',
    referenceAsset: '/_tmp_refs/headband.png',
  },
];

async function main() {
  const contactCells: ContactSheetCell[] = [];
  let failures = 0;

  for (const job of JOBS) {
    const label = job.itemId;
    const maxAttempts = 2;
    let lastFailureLog = '';
    let succeeded = false;

    for (let attempt = 1; attempt <= maxAttempts && !succeeded; attempt++) {
      process.stdout.write(`${label}${attempt > 1 ? ` (retry ${attempt - 1})` : ''} ... `);
      try {
        const result = await generateClosetAsset({
          destinationId: 'tokyo',
          slot: job.slot,
          itemId: job.itemId,
          itemPrompt: job.itemPrompt,
          referenceAsset: job.referenceAsset,
          quality: 'high',
          regenerate: attempt > 1 ? true : regenerate,
        });
        if (result.skipped) {
          console.log('already exists (skipped — pass --regenerate to redo)');
          succeeded = true;
        } else if (result.qc.ok) {
          console.log(`done -> ${result.asset.url}`);
          if (result.qc.warnings.length > 0) console.log(`  warning: ${result.qc.warnings.join('; ')}`);
          succeeded = true;
        } else {
          lastFailureLog = `QC FAILED: ${result.qc.issues.join('; ')}`;
          console.log(lastFailureLog);
        }
        if (succeeded) contactCells.push({ label, imagePath: urlToLocalPath(result.asset.url), group: job.slot });
      } catch (error) {
        lastFailureLog = `ERROR: ${error instanceof Error ? error.message : String(error)}`;
        console.log(lastFailureLog);
      }
    }

    if (!succeeded) {
      failures += 1;
      console.log(`${label}: gave up after ${maxAttempts} attempts — ${lastFailureLog}`);
    }
  }

  const sheetPath = path.resolve(process.cwd(), 'docs', 'qa', 'batch-2-contact-sheet.png');
  await buildContactSheet(contactCells, sheetPath);
  console.log(`\nContact sheet written to ${path.relative(process.cwd(), sheetPath)}`);
  console.log(`\nreference used: ${REFERENCE_ASSET_URLS.stripe}`);

  if (failures > 0) process.exitCode = 1;
}

main();
