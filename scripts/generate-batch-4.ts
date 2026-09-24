// Fourth wardrobe-expansion batch: 12 new items across tops, bottoms, shoes,
// and accessories, cropped from the user's own AI-generated clip-art sheet
// (Codex Image Sep 3, 2026, 09_23_46 AM.png). Same pipeline/pattern as
// scripts/generate-batch-3.ts. Headwear items pass normalizeSlot: 'hair' up
// front (server/closet/tokyoManifest.ts's NORMALIZE_SLOT_OVERRIDE only
// applies to the generate-destination.ts manifest path, not this script) so
// they don't repeat the chest-height bug fixed in scripts/fix-headwear-position.mjs.
// Run with: npx tsx scripts/generate-batch-4.ts
import path from 'node:path';
import dotenv from 'dotenv';
import { generateClosetAsset } from '../server/closet/generateClosetAsset';
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

type Job = { itemId: string; name: string; description: string; slot: ClosetSlot; normalizeSlot?: ClosetSlot; itemPrompt: string; referenceAsset: string; capsule: 'universal' | 'cool' | 'warm' };

const JOBS: Job[] = [
  {
    itemId: 'ramen-tee', name: 'Ramen tee', description: 'A cozy bowl of noodles on cream cotton',
    slot: 'top', capsule: 'universal',
    itemPrompt: `A cream crewneck t-shirt with a hand-painted bowl of ramen noodles and Japanese text printed on the front. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/ramen-tee.png',
  },
  {
    itemId: 'purple-floral-sweater', name: 'Purple floral sweater', description: 'Cable-knit with tiny painted blossoms',
    slot: 'top', capsule: 'cool',
    itemPrompt: `A purple cable-knit crewneck sweater scattered with small painted pink and cream flower blossoms. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/purple-sweater.png',
  },
  {
    itemId: 'teal-shiba-sweater', name: 'Teal shiba sweater', description: 'A cheerful puppy face on cozy knit',
    slot: 'top', capsule: 'cool',
    itemPrompt: `A teal crewneck knit sweater with a cute cartoon shiba inu puppy face on the front. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/teal-sweater.png',
  },
  {
    itemId: 'cherry-cardigan', name: 'Cherry cardigan', description: 'Cream knit with sweet cherry embroidery',
    slot: 'top', capsule: 'cool',
    itemPrompt: `A cream button-front cardigan with a red trim collar and small embroidered cherries scattered across it. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/cherry-cardigan.png',
  },
  {
    itemId: 'yellow-plaid-skirt', name: 'Yellow plaid skirt', description: 'A classic pleated schoolyard favorite',
    slot: 'bottom', capsule: 'universal',
    itemPrompt: `A golden-yellow pleated plaid mini skirt. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/yellow-skirt.png',
  },
  {
    itemId: 'pink-bow-skirt', name: 'Pink bow skirt', description: 'Tiered ruffles with a sweet bow',
    slot: 'bottom', capsule: 'warm',
    itemPrompt: `A dusty-pink tiered ruffle mini skirt with a bow at the waistband. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/pink-bow-skirt.png',
  },
  {
    itemId: 'black-flower-shorts', name: 'Black flower shorts', description: 'Denim shorts with painted blossoms',
    slot: 'bottom', capsule: 'warm',
    itemPrompt: `Black denim shorts with a frayed hem and small painted pink and white flower blossoms scattered on the front. ${GARMENT_ONLY}`,
    referenceAsset: '/_tmp_refs/black-shorts.png',
  },
  {
    itemId: 'red-converse', name: 'Red high-top sneakers', description: 'Classic canvas, ready for anything',
    slot: 'shoes', capsule: 'universal',
    itemPrompt: 'A single worn pair of red canvas high-top sneakers with cream laces and a round toe-cap logo patch, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/red-converse.png',
  },
  {
    itemId: 'purple-converse', name: 'Purple high-top sneakers', description: 'Bold canvas with a star patch',
    slot: 'shoes', capsule: 'universal',
    itemPrompt: 'A single worn pair of purple canvas high-top sneakers with cream laces and a star toe-cap logo patch, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/purple-converse.png',
  },
  {
    itemId: 'black-combat-boots', name: 'Black combat boots', description: 'Sturdy lace-ups with a floral charm',
    slot: 'shoes', capsule: 'cool',
    itemPrompt: 'A single worn pair of black lace-up combat boots with a chunky sole and small gold and pink flower charms, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
    referenceAsset: '/_tmp_refs/black-combat.png',
  },
  {
    itemId: 'red-flat-cap', name: 'Red flat cap', description: 'A cozy newsboy cap for cool days',
    slot: 'accessory', normalizeSlot: 'hair', capsule: 'cool',
    itemPrompt: 'A rust-red felt newsboy flat cap, framed and scaled as it would be worn on a standing child\'s head, front-facing.',
    referenceAsset: '/_tmp_refs/red-cap.png',
  },
  {
    itemId: 'tokyo-bucket-hat', name: 'Tokyo bucket hat', description: 'Cream canvas with an Eiffel Tower patch',
    slot: 'accessory', normalizeSlot: 'hair', capsule: 'universal',
    itemPrompt: 'A cream bucket hat with a small red Eiffel Tower embroidery and painted pink flowers, framed and scaled as it would be worn on a standing child\'s head, front-facing.',
    referenceAsset: '/_tmp_refs/tokyo-bucket.png',
  },
  {
    itemId: 'tokyo-tote-bag', name: 'Tokyo tote bag', description: 'Canvas tote with painted blossoms',
    slot: 'accessory', capsule: 'universal',
    itemPrompt: 'A small cream canvas tote bag with "TOKYO" lettering, a red Eiffel Tower illustration, and painted pink flowers, with two short handles, held at chest height as worn or carried by a standing child.',
    referenceAsset: '/_tmp_refs/tokyo-tote.png',
  },
  {
    itemId: 'purple-fanny-pack', name: 'Purple fanny pack', description: 'A little bag with painted blossoms',
    slot: 'accessory', capsule: 'universal',
    itemPrompt: 'A small purple fanny pack with a front zip pocket and painted pink flower blossoms, worn at the waist as if on a standing child, front-facing.',
    referenceAsset: '/_tmp_refs/fanny-pack.png',
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
          normalizeSlot: job.normalizeSlot,
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
      failures++;
      console.log(`  FINAL FAILURE for ${label}: ${lastFailureLog}`);
    }
  }

  if (contactCells.length > 0) {
    await buildContactSheet(contactCells, path.resolve(process.cwd(), 'docs', 'qa', 'batch-4-contact-sheet.png'));
    console.log('Contact sheet written to docs\\qa\\batch-4-contact-sheet.png');
  }
  if (failures > 0) {
    console.log(`${failures} item(s) failed after retries.`);
    process.exitCode = 1;
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
