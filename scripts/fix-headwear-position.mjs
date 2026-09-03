// pink-beret, straw-sun-hat, floral-headband (batch-2) and purple-flower-cap,
// patchwork-bucket-hat-2, puppy-cap (batch-3) were generated with slot:
// 'accessory' but no `normalizeSlot: 'hair'` override, so
// normalizeToClosetCanvas placed them in the accessory box (anchored at
// shoulderY/chest height) instead of the hair box (anchored at head height)
// — exactly the bug server/closet/tokyoManifest.ts's NORMALIZE_SLOT_OVERRIDE
// comment describes fixing for travel-cap/bucket-hat. Content width for these
// items already matches travel-cap/bucket-hat's (~189px), so no rescale is
// needed — just translate each into the same head-level position.
// Run with: node scripts/fix-headwear-position.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo');
const TARGET_LEFT = 205;
const TARGET_TOP = 125;
const ITEMS = ['floral-headband', 'pink-beret', 'straw-sun-hat', 'purple-flower-cap', 'patchwork-bucket-hat-2', 'puppy-cap'];

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
  return { top, left, right, bottom };
}

async function main() {
  for (const item of ITEMS) {
    const filePath = path.join(DIR, item, 'default.png');
    if (!fs.existsSync(filePath)) {
      console.log(`${item}: missing, skipped`);
      continue;
    }
    const box = await bbox(filePath);
    const dx = TARGET_LEFT - box.left;
    const dy = TARGET_TOP - box.top;
    if (dx === 0 && dy === 0) {
      console.log(`${item}: already aligned`);
      continue;
    }
    const src = await sharp(filePath).toBuffer();
    const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: src, left: dx, top: dy }])
      .png()
      .toBuffer();
    fs.writeFileSync(filePath, out);
    console.log(`${item}: aligned (dx=${dx}, dy=${dy})`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
