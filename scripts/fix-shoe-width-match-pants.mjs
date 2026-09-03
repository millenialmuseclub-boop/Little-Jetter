// Shoes were narrowed to 158px in an earlier pass, but pants were separately
// re-widened to 175px (scripts/fix-pants-scale3.mjs) to avoid distorting
// them — leaving shoes visibly pinched/narrower than the pant cuff sitting
// right above them. Widens all shoes back up to the same 175px, uniform
// scale anchored to the ground (their bottom edge), so cuff and shoe line
// up again.
// Run with: node scripts/fix-shoe-width-match-pants.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo');
const CENTER_X = 300;
const TARGET_WIDTH = 175;
const SHOES = ['sneakers', 'boots', 'high-tops', 'purple-high-tops', 'purple-sandals', 'black-lace-boots', 'cream-sneakers', 'yellow-boots', 'pink-boots', 'brown-hiking-boots', 'black-mary-janes', 'navy-sandals', 'pink-flats'];

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
  for (const item of SHOES) {
    const filePath = path.join(DIR, item, 'default.png');
    if (!fs.existsSync(filePath)) {
      console.log(`${item}: missing, skipped`);
      continue;
    }
    const box = await bbox(filePath);
    if (Math.abs(box.width - TARGET_WIDTH) < 2) {
      console.log(`${item}: already at target (${box.width}px)`);
      continue;
    }
    const scale = TARGET_WIDTH / box.width;
    const newWidth = Math.round(box.width * scale);
    const newHeight = Math.round(box.height * scale);
    const cropped = await sharp(filePath).extract({ left: box.left, top: box.top, width: box.width, height: box.height }).toBuffer();
    const resized = await sharp(cropped).resize(newWidth, newHeight).toBuffer();
    const left = Math.round(CENTER_X - newWidth / 2);
    const top = box.bottom - newHeight + 1;
    const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: resized, left, top }])
      .png()
      .toBuffer();
    fs.writeFileSync(filePath, out);
    console.log(`${item}: ${box.width}px -> ${newWidth}px`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
