// The shoe-pair artwork has a baked-in gap between the left/right shoe that
// is wider than the body's actual ankle gap, leaving a visible strip of
// bare leg/ankle/toe between the two shoes. Splits each pair image at its
// own natural gap (measured near the sole) and pulls both halves in to meet
// at the doll's centerline, closing the strip — no rescaling, so shoe shape
// stays undistorted, just repositioned.
// Run: node scripts/fix-shoe-gap.mjs
import sharp from 'sharp';
import path from 'node:path';

const SHOES = [
  'black-combat-boots', 'black-lace-boots', 'boots', 'brown-hiking-boots', 'cream-sneakers',
  'navy-sandals', 'pink-boots', 'purple-sandals', 'sneakers', 'yellow-boots',
];

async function run() {
  for (const id of SHOES) {
    const file = path.resolve(`public/little-jetter/catalog/tokyo/${id}/default.png`);
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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

    // Find the gap between the two shoes by scanning a row near the sole.
    const scanY = bottom - 5;
    let gapStart = -1, gapEnd = -1, inGap = false;
    for (let x = left + 15; x <= right - 15; x++) {
      const a = data[(scanY * width + x) * channels + 3];
      if (a < 10) {
        if (!inGap) { inGap = true; gapStart = x; }
        gapEnd = x;
      } else if (inGap) {
        break; // only the first gap after the left shoe
      }
    }
    if (gapStart === -1) { console.log(id, 'no gap found, skipping'); continue; }
    const gapCenter = Math.round((gapStart + gapEnd) / 2);
    const CLOSE_BY = 16; // pixels each half moves inward (toward the centerline), i.e. total overlap of 2x this

    const leftCrop = await sharp(file).extract({ left, top, width: gapCenter - left, height: bottom - top + 1 }).toBuffer();
    const rightCrop = await sharp(file).extract({ left: gapCenter, top, width: right - gapCenter + 1, height: bottom - top + 1 }).toBuffer();

    const leftW = gapCenter - left;
    // Left shoe's right edge moves from gapCenter to gapCenter+CLOSE_BY (rightward, inward).
    const newLeftEdge = gapCenter + CLOSE_BY - leftW;
    // Right shoe's left edge moves from gapCenter to gapCenter-CLOSE_BY (leftward, inward).
    const newRightEdge = gapCenter - CLOSE_BY;

    const canvas = sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
    await canvas.composite([
      { input: leftCrop, left: newLeftEdge, top },
      { input: rightCrop, left: newRightEdge, top },
    ]).png().toFile(file);
    console.log(id, `gap ${gapStart}-${gapEnd} closed, halves moved inward ${CLOSE_BY}px`);
  }
}

run();
