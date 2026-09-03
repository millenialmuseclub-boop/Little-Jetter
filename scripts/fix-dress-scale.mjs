// The three batch-3 dresses (pink-floral-dress, purple-button-dress,
// teal-wrap-dress) were generated with slot: 'top', so normalizeToClosetCanvas
// fit the whole head-to-hem dress illustration into the 'top' slot box
// (only 175px tall) — the same box sized for a t-shirt. The full dress is
// intact in the file, just shrunk to ~150x175px sitting at shoulder height,
// so jeans show fully below it instead of being covered. Scale that content
// up (anchored at its current top edge, which already lines up with the
// shoulder) so the dress reaches down over the legs like a real dress,
// relying on the existing top-above-bottom z-order to cover the pants layer
// — the same trick the flat SVG "dress" fallback already uses.
// Run with: node scripts/fix-dress-scale.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo');
const CENTER_X = 300;
const TARGET_HEIGHT = 320; // knee-length: shoulder (~315) down to ~635, not all the way to the ankle
const TARGET_TOP = 315; // top slot's own top edge — shoulder line
// navy-overalls was generated into the 'bottom' box (top=465) even though it's
// a full pinafore-over-blouse one-piece; force its top back up to the shoulder
// like the other dresses instead of leaving it anchored at the waist.
const ITEMS = ['pink-floral-dress', 'purple-button-dress', 'teal-wrap-dress', 'navy-overalls'];

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

async function main() {
  for (const item of ITEMS) {
    const filePath = path.join(DIR, item, 'default.png');
    if (!fs.existsSync(filePath)) {
      console.log(`${item}: missing, skipped`);
      continue;
    }
    const box = await bbox(filePath);
    if (Math.abs(box.height - TARGET_HEIGHT) < 2) {
      console.log(`${item}: already at target (${box.height}px)`);
      continue;
    }
    const scale = TARGET_HEIGHT / box.height;
    const newWidth = Math.round(box.width * scale);
    const newHeight = Math.round(box.height * scale);
    const cropped = await sharp(filePath).extract({ left: box.left, top: box.top, width: box.width, height: box.height }).toBuffer();
    const resized = await sharp(cropped).resize(newWidth, newHeight).toBuffer();
    const left = Math.round(CENTER_X - newWidth / 2);
    const top = TARGET_TOP;
    const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: resized, left, top }])
      .png()
      .toBuffer();
    fs.writeFileSync(filePath, out);
    console.log(`${item}: rescaled ${box.width}x${box.height} -> ${newWidth}x${newHeight}`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
