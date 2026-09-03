// Second pass: shoes and pants both still read as oversized relative to the
// doll, and pants/shoe hem widths didn't quite match at the ankle seam. This
// pass tightens both to a shared 158px target width (down from the earlier
// 174-192px range) so the pant cuff and the shoe beneath it line up, uniform
// scale (no horizontal-only squash), re-anchored to each item's own existing
// top/bottom edges (only the interior gets smaller, position is unchanged).
// Run with: node scripts/fix-shoe-pants-scale2.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo');
const CENTER_X = 300;
const TARGET_WIDTH = 158;

// Shoes anchor to the ground (groundY=810, i.e. their bottom edge); pants
// anchor to the waist (waistY=465, their top edge) — each keeps whichever
// edge it's currently anchored to, only the far edge moves as it shrinks.
const SHOES = ['sneakers', 'boots', 'high-tops', 'purple-high-tops', 'purple-sandals', 'black-lace-boots', 'cream-sneakers', 'yellow-boots', 'pink-boots', 'brown-hiking-boots', 'black-mary-janes', 'navy-sandals', 'pink-flats'];
const PANTS = ['travel-jeans', 'wide-leg-pants', 'cargo-pants', 'denim-overalls'];

async function bbox(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let top = -1, left = width, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + 3];
      if (a > 10) {
        if (top === -1) top = y;
        bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  return { top, left, right, bottom, width: right - left + 1, height: bottom - top + 1 };
}

async function rescale(item, anchorEdge) {
  const filePath = path.join(DIR, item, 'default.png');
  if (!fs.existsSync(filePath)) {
    console.log(`${item}: missing, skipped`);
    return;
  }
  const box = await bbox(filePath);
  if (box.width <= TARGET_WIDTH) {
    console.log(`${item}: already within target (${box.width}px)`);
    return;
  }
  const scale = TARGET_WIDTH / box.width;
  const newWidth = Math.round(box.width * scale);
  const newHeight = Math.round(box.height * scale);
  const cropped = await sharp(filePath).extract({ left: box.left, top: box.top, width: box.width, height: box.height }).toBuffer();
  const resized = await sharp(cropped).resize(newWidth, newHeight).toBuffer();
  const left = Math.round(CENTER_X - newWidth / 2);
  const top = anchorEdge === 'bottom' ? box.bottom - newHeight + 1 : box.top;
  const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
  fs.writeFileSync(filePath, out);
  console.log(`${item}: rescaled ${box.width}x${box.height} -> ${newWidth}x${newHeight} (anchor:${anchorEdge})`);
}

// Pants must keep reaching the ankle (fixed height, top and bottom edges
// unchanged) — only their width narrows, so the leg silhouette gets slimmer
// without leaving a gap of bare leg above the shoe.
async function rescaleWidthOnly(item) {
  const filePath = path.join(DIR, item, 'default.png');
  if (!fs.existsSync(filePath)) {
    console.log(`${item}: missing, skipped`);
    return;
  }
  const box = await bbox(filePath);
  if (box.width <= TARGET_WIDTH) {
    console.log(`${item}: already within target (${box.width}px)`);
    return;
  }
  const cropped = await sharp(filePath).extract({ left: box.left, top: box.top, width: box.width, height: box.height }).toBuffer();
  const resized = await sharp(cropped).resize(TARGET_WIDTH, box.height).toBuffer();
  const left = Math.round(CENTER_X - TARGET_WIDTH / 2);
  const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left, top: box.top }])
    .png()
    .toBuffer();
  fs.writeFileSync(filePath, out);
  console.log(`${item}: narrowed ${box.width}px -> ${TARGET_WIDTH}px (height unchanged, still reaches ankle)`);
}

async function main() {
  for (const item of SHOES) await rescale(item, 'bottom');
  for (const item of PANTS) await rescaleWidthOnly(item);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
