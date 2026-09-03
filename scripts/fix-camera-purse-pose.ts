// mini-camera and pink-quilted-purse were both generated as floating
// "product shot" illustrations — a full strap loop like a jewelry display
// (camera) and a strap dangling almost like a necklace with the bag rotated
// off-angle (purse) — instead of worn-on-the-body like the working
// "crossbody" reference (strap crossing one shoulder, bag resting on the
// opposite hip, front-facing). Reported as looking visually "off" on the
// doll. This is a pose/content problem, not a crop/scale one, so it needs
// regeneration rather than a geometric fix — using the correctly-posed
// crossbody bag as the style/pose reference.
// Run with: npx tsx scripts/fix-camera-purse-pose.ts
import path from 'node:path';
import dotenv from 'dotenv';
import { generateClosetAsset } from '../server/closet/generateClosetAsset';
import { buildContactSheet } from '../server/closet/contactSheet';
import type { ContactSheetCell } from '../server/closet/contactSheet';

dotenv.config({ path: '.env.local' });

const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');
function urlToLocalPath(url: string): string {
  return path.join(PUBLIC_ROOT, url.replace(/^\//, ''));
}

const POSE = 'worn slung across the body on its strap, crossing over one shoulder with the bag itself resting against the opposite hip, front-facing as if worn by a standing child — matching the exact pose, angle, and strap drape of the reference image, not a floating product photo.';

const JOBS = [
  {
    itemId: 'mini-camera',
    itemPrompt: `A small rounded red travel camera with a striped neck strap, a bright lens ring, and travel sticker details, ${POSE}`,
  },
  {
    itemId: 'pink-quilted-purse',
    itemPrompt: `A small pink quilted crossbody purse with a bow charm and a gold chain strap, ${POSE}`,
  },
];

async function main() {
  const cells: ContactSheetCell[] = [];
  for (const job of JOBS) {
    process.stdout.write(`${job.itemId} ... `);
    const result = await generateClosetAsset({
      destinationId: 'tokyo',
      slot: 'accessory',
      itemId: job.itemId,
      itemPrompt: job.itemPrompt,
      referenceAsset: '/little-jetter/catalog/tokyo/crossbody/default.png',
      quality: 'high',
      regenerate: true,
    });
    console.log(result.qc.ok ? `done -> ${result.asset.url}` : `QC FAILED: ${result.qc.issues.join('; ')}`);
    if (result.qc.warnings.length > 0) console.log('  warning:', result.qc.warnings.join('; '));
    cells.push({ label: job.itemId, imagePath: urlToLocalPath(result.asset.url), group: 'accessory' });
  }
  cells.push({ label: 'crossbody (reference)', imagePath: path.join(PUBLIC_ROOT, 'little-jetter/catalog/tokyo/crossbody/default.png'), group: 'accessory' });
  await buildContactSheet(cells, path.resolve(process.cwd(), 'docs', 'qa', 'camera-purse-pose-fix.png'));
  console.log('contact sheet written');
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
