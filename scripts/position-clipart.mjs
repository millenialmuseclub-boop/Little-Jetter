// Positions the 128 extracted clip-art clothing pieces onto the
// little-jetter-neutral-v1 600x900 canvas, inside their slot-safe bound,
// and writes public/little-jetter/catalog/tokyo/<id>/default.png for each.
// These are flat/laid-out illustrations, not worn-pose art, so placement is
// a naive fit-to-bound-and-center rather than anchor-matched joints — see
// docs/wardrobe-asset-template.md for why that's a known simplification.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { CLIPART_ITEMS } from './clipart-catalog.mjs';

const SRC_DIR = 'scripts/clipart-extract/batch1/items';
const OUT_ROOT = 'public/little-jetter/catalog/tokyo';

const BOUNDS = {
  top: { left: 145, top: 315, width: 310, height: 175 },
  dress: { left: 150, top: 315, width: 300, height: 420 },
  bottom: { left: 170, top: 465, width: 260, height: 305 },
  outerwear: { left: 130, top: 300, width: 340, height: 275 },
  shoes: { left: 170, top: 710, width: 260, height: 105 },
  hat: { left: 210, top: 110, width: 180, height: 150 },
  face: { left: 230, top: 175, width: 140, height: 85 },
  bag: { left: 275, top: 330, width: 190, height: 270 },
};

async function placeOne(item) {
  const srcFile = path.join(SRC_DIR, item.file || `item-${String(item.i).padStart(3, '0')}.png`);
  const bound = BOUNDS[item.anchor];
  const meta = await sharp(srcFile).metadata();
  const scale = Math.min(bound.width / meta.width, bound.height / meta.height);
  const newW = Math.max(1, Math.round(meta.width * scale));
  const newH = Math.max(1, Math.round(meta.height * scale));
  const resized = await sharp(srcFile).resize(newW, newH).toBuffer();
  const left = Math.round(bound.left + (bound.width - newW) / 2);
  const top = Math.round(bound.top + (bound.height - newH) / 2);
  const outDir = path.join(OUT_ROOT, item.id);
  fs.mkdirSync(outDir, { recursive: true });
  const canvas = sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
  await canvas.composite([{ input: resized, left, top }]).png().toFile(path.join(outDir, 'default.png'));
}

async function main() {
  for (const item of CLIPART_ITEMS) {
    await placeOne(item);
    console.log(item.id, 'placed (' + item.anchor + ')');
  }
  console.log('done,', CLIPART_ITEMS.length, 'items positioned');
}

main();
