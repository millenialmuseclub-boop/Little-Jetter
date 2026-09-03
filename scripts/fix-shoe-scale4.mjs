// Shrinks the shoe overlays further (still too big per user feedback after
// the previous 158->175 width match). Uniform scale, anchored at ground
// (bottom) and horizontally centered on CLOSET_ANCHORS.centerX=300, so foot
// shape isn't distorted. Run: node scripts/fix-shoe-scale4.mjs
import sharp from 'sharp';
import path from 'node:path';

const CENTER_X = 300;
const GROUND_Y = 810;
const TARGET_WIDTH = 145;

const SHOES = [
  'black-combat-boots', 'black-lace-boots', 'boots', 'brown-hiking-boots', 'cream-sneakers',
  'navy-sandals', 'pink-boots', 'purple-sandals', 'sneakers', 'yellow-boots',
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
  for (const item of SHOES) {
    const file = path.resolve(`public/little-jetter/catalog/tokyo/${item}/default.png`);
    const box = await bbox(file);
    const scale = TARGET_WIDTH / box.w;
    const cropped = await sharp(file).extract({ left: box.left, top: box.top, width: box.w, height: box.h }).toBuffer();
    const newW = Math.round(box.w * scale);
    const newH = Math.round(box.h * scale);
    const resized = await sharp(cropped).resize(newW, newH).toBuffer();
    const left = Math.round(CENTER_X - newW / 2);
    const top = GROUND_Y - newH;
    const canvas = sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
    await canvas.composite([{ input: resized, left, top }]).png().toFile(file);
    console.log(item, `w:${box.w}->${newW}`, `h:${box.h}->${newH}`);
  }
}

run();
