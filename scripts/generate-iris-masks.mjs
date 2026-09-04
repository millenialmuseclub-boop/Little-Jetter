// Replaces the old approach of baking a separate full head PNG per
// (hairstyle, skin, hairColor, eyeColor) combination — which only ever
// covered the default "Medium Brown" hair bake (168 files) before hitting
// Vercel's per-day upload-count limit, so eye color silently did nothing for
// any other hair color.
//
// Instead this generates one small "iris mask" PNG per hairstyle (4 files
// total, position is consistent across every skin within a style) — alpha
// channel true where the golden baseline's iris pixels are, everywhere else
// transparent. The app then renders this as a CSS mask-image on a colored
// div with mix-blend-mode:'color' directly over the head, which recolors
// just the iris using the browser's own blend engine — works for every
// (hairstyle, skin, hairColor) combination since it's decoupled from which
// head image is actually showing.
//
// Run: node scripts/generate-iris-masks.mjs
import sharp from 'sharp';
import path from 'node:path';

const HEAD_DIR = 'public/little-jetter/catalog/tokyo/head';

// Same corrected centers as recolor-eye-color.mjs (measured post shift-head-down.mjs).
const EYE_CENTERS = {
  curls: [[271, 264], [325, 259]],
  short: [[261, 258], [341, 256]],
  bob: [[269, 278], [334, 276]],
  coils: [[268, 271], [342, 266]],
};
const EYE_RADIUS = 12;

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

async function run() {
  for (const [hairstyle, centers] of Object.entries(EYE_CENTERS)) {
    const sourceFile = path.join(HEAD_DIR, `${hairstyle}-golden.png`);
    const { data, info } = await sharp(sourceFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    const out = Buffer.alloc(width * height * 4);
    for (const [cx, cy] of centers) {
      for (let dy = -EYE_RADIUS; dy <= EYE_RADIUS; dy++) {
        for (let dx = -EYE_RADIUS; dx <= EYE_RADIUS; dx++) {
          if (dx * dx + dy * dy > EYE_RADIUS * EYE_RADIUS) continue;
          const x = cx + dx, y = cy + dy;
          if (x < 0 || x >= width || y < 0 || y >= height) continue;
          const srcIdx = (y * width + x) * channels;
          if (data[srcIdx + 3] < 200) continue;
          const [, , l] = rgbToHsl(data[srcIdx], data[srcIdx + 1], data[srcIdx + 2]);
          if (l > 0.35) continue; // skip the white catchlight dot
          const dstIdx = (y * width + x) * 4;
          out[dstIdx] = 255; out[dstIdx + 1] = 255; out[dstIdx + 2] = 255; out[dstIdx + 3] = 255;
        }
      }
    }
    const outPath = path.join(HEAD_DIR, `${hairstyle}-iris-mask.png`);
    await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
    console.log('wrote', outPath);
  }
}

run().catch((e) => { console.error(e); process.exitCode = 1; });
