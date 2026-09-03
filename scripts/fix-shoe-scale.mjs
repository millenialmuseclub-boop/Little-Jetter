// server/closet/assetSpec.ts documents that a shoe's own width at ankleY
// must land in the same ~150-190px range as the doll's bare-leg/pant-hem
// width (measured from the original 3 Tokyo shoe assets, all ~174px), or the
// pant hem visibly floats above an oversized shoe. purple-high-tops (194px)
// and purple-sandals (232px) — both from generate-batch-2.ts — were never
// checked against that constraint and render noticeably too big. Rescale
// each down to the same ~175px target width, anchored bottom-center (ground
// line + horizontal center already match the other shoes) so only size
// changes, not position.
// Run with: node scripts/fix-shoe-scale.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo');
const TARGET_WIDTH = 175;
const CENTER_X = 300;
const GROUND_Y = 810;
const ITEMS = ['purple-high-tops', 'purple-sandals', 'cream-sneakers', 'black-mary-janes', 'navy-sandals', 'pink-flats'];

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
    if (box.width <= TARGET_WIDTH) {
      console.log(`${item}: already within target (${box.width}px)`);
      continue;
    }
    const scale = TARGET_WIDTH / box.width;
    const newWidth = Math.round(box.width * scale);
    const newHeight = Math.round(box.height * scale);
    const cropped = await sharp(filePath).extract({ left: box.left, top: box.top, width: box.width, height: box.height }).toBuffer();
    const resized = await sharp(cropped).resize(newWidth, newHeight).toBuffer();
    const left = Math.round(CENTER_X - newWidth / 2);
    const top = GROUND_Y - newHeight;
    const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: resized, left, top }])
      .png()
      .toBuffer();
    fs.writeFileSync(filePath, out);
    console.log(`${item}: rescaled ${box.width}px -> ${newWidth}px`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
