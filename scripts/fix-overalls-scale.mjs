// denim-overalls was generated with slot: 'bottom' (a plain-pants box,
// top=465/height=305), but the art itself is a full bib overall with straps
// reaching the shoulder — normalizeToClosetCanvas squished the whole bib +
// straps + pant legs down to fit that short box, so the straps that should
// reach the shoulder end up compressed to rib-cage height, poking out from
// under whatever top is equipped as a small mint sliver. Same class of bug
// as the batch-3 dresses (scripts/fix-dress-scale.mjs). The intact art is
// still in the file — scale it up and anchor its top at the shoulder line
// (matching CLOSET_ANCHORS.shoulderY) instead of the waist, spanning down to
// the ankle like navy-overalls' already-correct pinafore does.
// Run with: node scripts/fix-overalls-scale.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo');
const CENTER_X = 300;
const TARGET_TOP = 330; // CLOSET_ANCHORS.shoulderY — straps cross the shoulder here, not up at the neck/head
const TARGET_BOTTOM = 769;
const ITEM = 'denim-overalls';

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
  const filePath = path.join(DIR, ITEM, 'default.png');
  const box = await bbox(filePath);
  const targetHeight = TARGET_BOTTOM - TARGET_TOP;
  const scale = targetHeight / box.height;
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
  console.log(`${ITEM}: rescaled ${box.width}x${box.height} -> ${newWidth}x${newHeight}, anchored top=${top}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
