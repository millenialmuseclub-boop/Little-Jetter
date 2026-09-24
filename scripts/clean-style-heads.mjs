import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const headDir = 'public/little-jetter/catalog/tokyo/head';
const alphaThreshold = 10;
const cleanupRegions = {
  // Neighboring heads touched the intended hair, so connected-component
  // cleanup alone cannot distinguish them. These rectangles remove only the
  // known sheet-overlap regions while preserving braids and the main hair.
  'style-braids-dark.png': [{ left: 230, top: 310, right: 370, bottom: 390 }],
  'style-short-dark-boy.png': [{ left: 180, top: 95, right: 282, bottom: 142 }],
};

async function clean(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const labels = new Int32Array(width * height).fill(-1);
  const blobs = [];
  const stack = [];

  for (let index = 0; index < width * height; index++) {
    if (data[index * channels + 3] <= alphaThreshold || labels[index] !== -1) continue;
    const blobId = blobs.length;
    const pixels = [];
    stack.push(index);
    labels[index] = blobId;
    while (stack.length) {
      const current = stack.pop();
      pixels.push(current);
      const x = current % width;
      const y = Math.floor(current / width);
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]]) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (data[next * channels + 3] > alphaThreshold && labels[next] === -1) {
          labels[next] = blobId;
          stack.push(next);
        }
      }
    }
    blobs.push(pixels);
  }

  const regions = cleanupRegions[path.basename(file)] ?? [];
  if (blobs.length < 2 && !regions.length) return 0;
  const keep = blobs.reduce((best, pixels, index) => pixels.length > blobs[best].length ? index : best, 0);
  const output = Buffer.from(data);
  let removed = 0;
  for (let index = 0; index < width * height; index++) {
    if (labels[index] !== -1 && labels[index] !== keep) {
      output[index * channels + 3] = 0;
      removed++;
    }
  }
  for (const region of regions) {
    for (let y = region.top; y < region.bottom; y++) {
      for (let x = region.left; x < region.right; x++) {
        const alpha = (y * width + x) * channels + 3;
        if (output[alpha]) { output[alpha] = 0; removed++; }
      }
    }
  }
  await sharp(output, { raw: { width, height, channels } }).png().toFile(`${file}.clean.png`);
  await fs.rename(`${file}.clean.png`, file);
  return removed;
}

const files = (await fs.readdir(headDir)).filter((name) => name.startsWith('style-') && name.endsWith('.png'));
for (const name of files) {
  const removed = await clean(path.join(headDir, name));
  console.log(`${name}: removed ${removed} stray pixels`);
}
