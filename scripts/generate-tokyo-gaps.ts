// Fills the last 3 flat-vector gaps in Tokyo's wardrobe (sunset-tee, play-skirt,
// denim jacket), using cropped reference images from the user's own AI-generated
// clip-art sheets as style/shape references — those sheets have gradient (not
// transparent) backgrounds so can't be used directly, but the existing
// generation pipeline can redraw a clean-alpha version steered by them.
// Run with: npx tsx scripts/generate-tokyo-gaps.ts
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

type Job = { itemId: string; slot: ClosetSlot; itemPrompt: string; referenceAsset: string };

const JOBS: Job[] = [
  {
    itemId: 'sunset-tee',
    slot: 'top',
    itemPrompt: 'A short-sleeve crew-neck t-shirt with a warm orange-to-pink sunset gradient dye wash from hem to shoulders, plain fabric with no graphic, patch, or motif of any kind on the chest.',
    referenceAsset: '/_tmp_refs/sunset.png',
  },
  {
    itemId: 'play-skirt',
    slot: 'bottom',
    itemPrompt: 'A playful bubblegum-pink tiered ruffle skirt with two soft tiers and a matching bow at the waistband, easy elastic waist for all-day play. The skirt garment only — no legs, no knees, no feet, no socks, no shoes, no skin visible at all, just the fabric of the skirt itself shaped as if worn.',
    referenceAsset: '/_tmp_refs/skirt.png',
  },
  {
    itemId: 'denim',
    slot: 'outerwear',
    itemPrompt: 'A classic light-wash denim jacket with button-front closure, chest pockets, and a collared neckline, worn open over a top.',
    referenceAsset: '/_tmp_refs/denim.png',
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

  const sheetPath = path.resolve(process.cwd(), 'docs', 'qa', 'tokyo-gaps-contact-sheet.png');
  await buildContactSheet(contactCells, sheetPath);
  console.log(`\nContact sheet written to ${path.relative(process.cwd(), sheetPath)}`);

  if (failures > 0) process.exitCode = 1;
}

main();
