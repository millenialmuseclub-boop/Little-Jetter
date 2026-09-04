// Trims each raw head crop to its true content bbox, uniform-scales to
// match our existing head width convention (~220px on the shared 600x900
// canvas), and positions it bottom-anchored to roughly line up with the
// existing curls/bob/short/coils heads (bottom ~345, matching
// shift-head-down.mjs's post-shift convention) so it sits at the same
// collar/neck line once composited on the body.
import sharp from 'sharp';
import { promises as fs } from 'node:fs';

const RAW_DIR = 'scripts/_new-heads-raw';
const OUT_DIR = 'public/little-jetter/catalog/tokyo/head/new';
const TARGET_WIDTH = 220;
const BOTTOM_ANCHOR = 345;
const CENTER_X = 300;

const FILES = [
  'head-00', 'head-01a', 'head-01b', 'head-02', 'head-03', 'head-04', 'head-05',
  'head-06', 'head-07', 'head-08', 'head-09', 'head-10', 'head-11', 'head-12a',
  'head-12b', 'head-13', 'head-14', 'head-15', 'head-16', 'head-17a', 'head-17b',
  'head-18', 'head-19', 'head-20', 'head-21', 'head-22', 'head-23', 'head-24',
  'head-25', 'head-26',
];

async function bbox(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let top = -1, left = width, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + 3];
      if (a > 30) {
        if (top === -1) top = y;
        bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  return { top, left, right, bottom, w: right - left + 1, h: bottom - top + 1 };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const manifest = [];
  for (const name of FILES) {
    const file = `${RAW_DIR}/${name}.png`;
    const box = await bbox(file);
    const cropped = await sharp(file).extract({ left: box.left, top: box.top, width: box.w, height: box.h }).toBuffer();
    const scale = TARGET_WIDTH / box.w;
    const newW = Math.round(box.w * scale);
    const newH = Math.round(box.h * scale);
    const resized = await sharp(cropped).resize(newW, newH).toBuffer();
    const left = CENTER_X - Math.round(newW / 2);
    const top = BOTTOM_ANCHOR - newH;
    const outPath = `${OUT_DIR}/${name}.png`;
    await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: resized, left, top }])
      .png().toFile(outPath);
    manifest.push({ name, outPath, newW, newH, top, left });
    console.log(name, `${box.w}x${box.h} -> ${newW}x${newH}`);
  }
  await fs.writeFile(`${OUT_DIR}/manifest.json`, JSON.stringify(manifest, null, 2));
  console.log(`Positioned ${FILES.length} heads`);
}

main();
