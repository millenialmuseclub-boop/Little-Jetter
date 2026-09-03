// navy-pleated-skirt and play-skirt are short mini skirts, so their
// generated art (naturally ~190px tall) was centered inside the 305px-tall
// bottom slot box instead of being anchored to its top (waistY=465) — the
// same behavior that works fine for full-length pants/midi skirts that fill
// the whole box top-to-bottom. That left a ~57px gap of bare torso between
// the top garment and the skirt waistband. Fix: translate each skirt up so
// its content starts exactly at waistY, matching how every bottom garment
// that reaches waistY today already sits.
// Run with: node scripts/fix-skirt-position.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo');
const WAIST_Y = 465;
const ITEMS = ['navy-pleated-skirt', 'play-skirt'];

async function firstContentRow(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 10) return y;
    }
  }
  return -1;
}

async function main() {
  for (const item of ITEMS) {
    const filePath = path.join(DIR, item, 'default.png');
    if (!fs.existsSync(filePath)) {
      console.log(`${item}: missing, skipped`);
      continue;
    }
    const top = await firstContentRow(filePath);
    const dy = WAIST_Y - top;
    if (dy === 0) {
      console.log(`${item}: already aligned`);
      continue;
    }
    const src = await sharp(filePath).toBuffer();
    const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: src, left: 0, top: dy }])
      .png()
      .toBuffer();
    fs.writeFileSync(filePath, out);
    console.log(`${item}: aligned (dy=${dy})`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
