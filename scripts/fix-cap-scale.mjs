// Caps and bucket hats (travel-cap, bucket-hat, purple-flower-cap,
// patchwork-bucket-hat-2, puppy-cap, straw-sun-hat) were all sitting low
// enough on the head to cover an eye or more — confirmed via direct
// composite renders against the actual head/body art. Berets and the
// headband didn't have this problem (excluded here). Scaled each down
// uniformly (same shrink both axes, preserving shape) anchored at its
// existing top edge, so the crown stays at the hairline and the brim comes
// up off the eyes instead of drifting down onto them.
// Run with: node scripts/fix-cap-scale.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo');
const CENTER_X = 300;
const SCALE = 0.68;
const ITEMS = ['travel-cap', 'bucket-hat', 'purple-flower-cap', 'patchwork-bucket-hat-2', 'puppy-cap', 'straw-sun-hat'];

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
    const newWidth = Math.round(box.width * SCALE);
    const newHeight = Math.round(box.height * SCALE);
    const cropped = await sharp(filePath).extract({ left: box.left, top: box.top, width: box.width, height: box.height }).toBuffer();
    const resized = await sharp(cropped).resize(newWidth, newHeight).toBuffer();
    const left = Math.round(CENTER_X - newWidth / 2);
    const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: resized, left, top: box.top }])
      .png()
      .toBuffer();
    fs.writeFileSync(filePath, out);
    console.log(`${item}: ${box.width}x${box.height} -> ${newWidth}x${newHeight}, bottom now ${box.top + newHeight}`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
