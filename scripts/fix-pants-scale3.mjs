// Third pass, replacing the previous width-only narrowing which distorted
// the pant silhouette (non-uniform scale stretched the fabric horizontally
// relative to its own vertical lines, opening a visible bare-skin sliver at
// the inseam that isn't in the original art). This pass restores the
// original files first (done manually, see git history) and uniform-scales
// them instead — same shrink on both axes, so proportions/shape stay
// intact. Anchored at the top (waist) since that's the seam that meets the
// shirt hem; the shorter resulting length still safely overlaps every
// shoe's own top edge (measured 640-666), which sits well above waistY(465)
// + new height even after shrinking.
// Run with: node scripts/fix-pants-scale3.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo');
const CENTER_X = 300;
const TARGET_WIDTH = 175;
const ITEMS = ['travel-jeans', 'wide-leg-pants', 'cargo-pants', 'denim-overalls'];

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
    const top = box.top;
    const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: resized, left, top }])
      .png()
      .toBuffer();
    fs.writeFileSync(filePath, out);
    console.log(`${item}: uniform-rescaled ${box.width}x${box.height} -> ${newWidth}x${newHeight}, new bottom=${top + newHeight - 1}`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
