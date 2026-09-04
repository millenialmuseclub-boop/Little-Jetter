// Positions the 129 extracted clip-art clothing pieces onto the
// little-jetter-neutral-v1 600x900 canvas. These are flat/laid-out
// illustrations (not worn-pose art), and — unlike the hand-painted assets,
// which carry generous internal padding baked into their canvas so a
// fit-to-bound-width scale still reads as a natural garment width — these
// are trimmed tight to their own content. Fitting them to the FULL slot
// bound width (as a first pass did) made every piece render far wider than
// the doll's actual shoulders/hips. Fixed by calibrating a much narrower
// target width per anchor, measured directly off the existing hand-painted
// items' own content bounding boxes (stripe tee ~190px, jeans ~180px,
// rain jacket ~225px, sneakers ~113px, etc — see git history for the
// measurements), and anchoring to the top of each zone (bottom for shoes)
// the same way those assets do, instead of centering in a much larger box.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { CLIPART_ITEMS } from './clipart-catalog.mjs';

const SRC_DIR = 'scripts/clipart-extract/batch1/items';
const OUT_ROOT = 'public/little-jetter/catalog/tokyo';

// left/top define the zone's anchor corner; targetWidth is the desired
// rendered garment width (calibrated, not the full slot-safe bound);
// maxHeight caps how tall it's allowed to grow if the source is very tall
// relative to its width. anchor 'bottom' aligns the image's bottom edge to
// `top` instead of its top edge (for shoes sitting on the ground line).
const BOUNDS = {
  top: { left: 300, top: 315, targetWidth: 195, maxHeight: 220, align: 'top' },
  dress: { left: 300, top: 315, targetWidth: 235, maxHeight: 420, align: 'top' },
  bottom: { left: 300, top: 465, targetWidth: 185, maxHeight: 305, align: 'top' },
  outerwear: { left: 300, top: 300, targetWidth: 230, maxHeight: 280, align: 'top' },
  shoes: { left: 300, top: 810, targetWidth: 130, maxHeight: 140, align: 'bottom' },
  hat: { left: 300, top: 115, targetWidth: 155, maxHeight: 140, align: 'top' },
  face: { left: 300, top: 178, targetWidth: 115, maxHeight: 80, align: 'top' },
  bag: { left: 370, top: 339, targetWidth: 190, maxHeight: 260, align: 'top' },
};

async function placeOne(item) {
  const srcFile = path.join(SRC_DIR, item.file || `item-${String(item.i).padStart(3, '0')}.png`);
  const bound = BOUNDS[item.anchor];
  const meta = await sharp(srcFile).metadata();
  const scale = Math.min(bound.targetWidth / meta.width, bound.maxHeight / meta.height);
  const newW = Math.max(1, Math.round(meta.width * scale));
  const newH = Math.max(1, Math.round(meta.height * scale));
  const resized = await sharp(srcFile).resize(newW, newH).toBuffer();
  const left = Math.round(bound.left - newW / 2);
  const top = bound.align === 'bottom' ? Math.round(bound.top - newH) : Math.round(bound.top);
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
