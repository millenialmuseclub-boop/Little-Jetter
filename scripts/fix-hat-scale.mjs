// Rescales headwear overlays that render too small relative to the head
// (most caps/hats were only ~100-130px wide against a ~220px-wide head).
// Uniform scale (both dimensions by the same factor — never width-only,
// that distorts the fabric), anchored at the item's own top edge and
// horizontally centered on CLOSET_ANCHORS.centerX=300, so it still sits at
// the hairline instead of sliding down over the eyes.
// Run: node scripts/fix-hat-scale.mjs
import sharp from 'sharp';
import path from 'node:path';

const CENTER_X = 300;

// Brimmed styles (baseball caps, wide-brim sun hat) have a much taller
// bounding box relative to their width than bucket hats/headbands, since
// the brim juts forward/down — scaling those to the same 190px width as a
// bucket hat also drags the brim down over the eyes. Smaller target width
// for those specifically.
const ITEMS = [
  { id: 'bucket-hat', targetWidth: 190 },
  { id: 'patchwork-bucket-hat-2', targetWidth: 190 },
  { id: 'puppy-cap', targetWidth: 150 },
  { id: 'straw-sun-hat', targetWidth: 150 },
  { id: 'travel-cap', targetWidth: 190 },
  { id: 'purple-flower-cap', targetWidth: 150 },
  { id: 'floral-headband', targetWidth: 165 },
];

async function bbox(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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
  return { top, left, right, bottom, w: right - left + 1, h: bottom - top + 1 };
}

async function run() {
  for (const { id, targetWidth } of ITEMS) {
    const file = path.resolve(`public/little-jetter/catalog/tokyo/${id}/default.png`);
    const box = await bbox(file);
    const scale = targetWidth / box.w;
    const cropped = await sharp(file).extract({ left: box.left, top: box.top, width: box.w, height: box.h }).toBuffer();
    const newW = Math.round(box.w * scale);
    const newH = Math.round(box.h * scale);
    const resized = await sharp(cropped).resize(newW, newH).toBuffer();
    const left = Math.round(CENTER_X - newW / 2);
    const top = box.top;
    const canvas = sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
    await canvas.composite([{ input: resized, left, top }]).png().toFile(file);
    console.log(id, `w:${box.w}->${newW}`, `h:${box.h}->${newH}`);
  }
}

run();
