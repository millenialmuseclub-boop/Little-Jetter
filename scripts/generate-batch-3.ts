// Third wardrobe-expansion batch: 18 new items (dresses/overalls, shoes,
// hats, bags), using cropped references from the user's own AI-generated
// clip-art sheets. Wired as destination:all / capsule-tagged after
// generation so they show up on the appropriate destinations immediately.
// Run with: npx tsx scripts/generate-batch-3.ts
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

type Job = { itemId: string; name: string; description: string; slot: ClosetSlot; itemPrompt: string; referenceAsset: string; capsule: 'universal' | 'cool' | 'warm' };

const JOBS: Job[] = [
  {
    itemId: 'denim-overalls', name: 'Denim overalls', description: 'A flower-patch pinafore for easy play',
    slot: 'bottom', capsule: 'universal',
    itemPrompt: `Denim pinafore overalls with adjustable straps and a small painted flower patch on the chest pocket, cropped at the waist/chest. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/overalls.png',
  },
  {
    itemId: 'pink-floral-dress', name: 'Pink floral dress', description: 'Soft ruffles and painted blossoms',
    slot: 'top', capsule: 'warm',
    itemPrompt: `A soft pink dress with short ruffled sleeves and small painted yellow flower blossoms scattered across the skirt. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/pink-floral-dress.png',
  },
  {
    itemId: 'purple-button-dress', name: 'Purple button dress', description: 'A polished collared favorite',
    slot: 'top', capsule: 'universal',
    itemPrompt: `A lavender-purple button-front dress with a white collar and long sheer sleeves, tied with a waist bow. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/purple-button-dress.png',
  },
  {
    itemId: 'teal-wrap-dress', name: 'Teal wrap dress', description: 'Flowy with painted blossoms',
    slot: 'top', capsule: 'warm',
    itemPrompt: `A teal-green wrap dress with short sleeves, a tie waist, and small painted pink flower blossoms along the skirt. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/teal-wrap-dress.png',
  },
  {
    itemId: 'navy-overalls', name: 'Navy overalls', description: 'Classic pinafore over a blouse',
    slot: 'bottom', capsule: 'cool',
    itemPrompt: `Navy denim pinafore overalls with adjustable straps, worn over a cream blouse peeking out at the collar and sleeves. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/navy-overalls.png',
  },
  {
    itemId: 'cream-sneakers', name: 'Cream sneakers', description: 'Simple and easy to run in',
    slot: 'shoes', capsule: 'universal',
    itemPrompt: 'A single worn pair of cream canvas sneakers with pink laces and small flower charms, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/cream-sneakers.png',
  },
  {
    itemId: 'yellow-boots', name: 'Yellow rain boots', description: 'Ready for every puddle',
    slot: 'shoes', capsule: 'cool',
    itemPrompt: 'A single worn pair of bright yellow rubber rain boots, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both boots visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/yellow-boots.png',
  },
  {
    itemId: 'pink-boots', name: 'Pink fleece boots', description: 'Cozy for cooler days',
    slot: 'shoes', capsule: 'cool',
    itemPrompt: 'A single worn pair of pink lace-up ankle boots with a fuzzy fleece trim, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both boots visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/pink-boots.png',
  },
  {
    itemId: 'brown-hiking-boots', name: 'Brown hiking boots', description: 'Sturdy for a trail day',
    slot: 'shoes', capsule: 'cool',
    itemPrompt: 'A single worn pair of brown lace-up hiking boots with a chunky sole, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both boots visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/brown-boots.png',
  },
  {
    itemId: 'black-mary-janes', name: 'Black mary janes', description: 'Polished and ready for anywhere',
    slot: 'shoes', capsule: 'universal',
    itemPrompt: 'A single worn pair of black mary-jane shoes with a gold buckle strap, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/black-mary-jane.png',
  },
  {
    itemId: 'navy-sandals', name: 'Navy buckle sandals', description: 'Easy for a warm day out',
    slot: 'shoes', capsule: 'warm',
    itemPrompt: 'A single worn pair of navy-blue double-strap buckle sandals with a chunky cream sole, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/navy-sandals.png',
  },
  {
    itemId: 'pink-flats', name: 'Pink ballet flats', description: 'Sweet and simple with a bow',
    slot: 'shoes', capsule: 'universal',
    itemPrompt: 'A single worn pair of soft pink ballet flats with a small bow, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/pink-flats.png',
  },
  {
    itemId: 'purple-flower-cap', name: 'Purple flower cap', description: 'A cute cap with a painted bloom',
    slot: 'accessory', capsule: 'universal',
    itemPrompt: 'A soft purple baseball cap with a small painted flower embroidered on the front, framed and scaled as it would be worn on a standing child\'s head, front-facing.',
    referenceAsset: '/_tmp_refs/purple-cap.png',
  },
  {
    itemId: 'patchwork-bucket-hat-2', name: 'Blue patchwork bucket hat', description: 'Colorful patches all around',
    slot: 'accessory', capsule: 'warm',
    itemPrompt: 'A blue bucket hat covered in colorful patchwork squares, framed and scaled as it would be worn on a standing child\'s head, front-facing.',
    referenceAsset: '/_tmp_refs/blue-bucket-hat.png',
  },
  {
    itemId: 'puppy-cap', name: 'Puppy cap', description: 'A playful cap with a cartoon pup',
    slot: 'accessory', capsule: 'universal',
    itemPrompt: 'A teal baseball cap with a small cute cartoon puppy face patch on the front, framed and scaled as it would be worn on a standing child\'s head, front-facing.',
    referenceAsset: '/_tmp_refs/shiba-cap.png',
  },
  {
    itemId: 'pink-quilted-purse', name: 'Pink quilted purse', description: 'A sweet little bag for treasures',
    slot: 'accessory', capsule: 'universal',
    itemPrompt: 'A small pink quilted crossbody purse with a bow charm and a gold chain strap, held at chest height as worn or carried by a standing child.',
    referenceAsset: '/_tmp_refs/pink-purse.png',
  },
  {
    itemId: 'black-quilted-purse', name: 'Black quilted purse', description: 'A little bag with a floral charm',
    slot: 'accessory', capsule: 'universal',
    itemPrompt: 'A small black quilted crossbody purse with a gold chain strap and a small flower charm, held at chest height as worn or carried by a standing child.',
    referenceAsset: '/_tmp_refs/black-purse.png',
  },
  {
    itemId: 'blue-backpack', name: 'Blue backpack', description: 'Roomy with a friendly patch',
    slot: 'accessory', capsule: 'universal',
    itemPrompt: 'A soft blue backpack with a small flower patch and a cute animal charm on the zipper, worn as if on a standing child\'s back, front-facing straps visible.',
    referenceAsset: '/_tmp_refs/blue-backpack.png',
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

  const sheetPath = path.resolve(process.cwd(), 'docs', 'qa', 'batch-3-contact-sheet.png');
  await buildContactSheet(contactCells, sheetPath);
  console.log(`\nContact sheet written to ${path.relative(process.cwd(), sheetPath)}`);
  console.log(`\nreference used: ${REFERENCE_ASSET_URLS.stripe}`);

  if (failures > 0) process.exitCode = 1;
}

main();
