// Removes stray fragments (bits of a neighboring head's hair that bled into
// a crop) from each raw extracted head by keeping only the single largest
// connected alpha blob and zeroing everything else. Full-resolution flood
// fill this time (individual crops are small, unlike the full sheet).
import sharp from 'sharp';

const RAW_DIR = 'scripts/_new-heads-raw';
const ALPHA_THRESHOLD = 10;

const FILES = [
  'head-00', 'head-01a', 'head-01b', 'head-02', 'head-03', 'head-04', 'head-05',
  'head-06', 'head-07', 'head-08', 'head-09', 'head-10', 'head-11', 'head-12a',
  'head-12b', 'head-13', 'head-14', 'head-15', 'head-16', 'head-17a', 'head-17b',
  'head-18', 'head-19', 'head-20', 'head-21', 'head-22', 'head-23', 'head-24',
  'head-25', 'head-26',
];

async function main() {
  for (const name of FILES) {
    const file = `${RAW_DIR}/${name}.png`;
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;

    const mask = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) mask[i] = data[i * channels + 3] > ALPHA_THRESHOLD ? 1 : 0;

    const labels = new Int32Array(width * height).fill(-1);
    let bestBlobId = -1, bestArea = 0;
    const blobPixels = [];
    const stack = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (mask[idx] !== 1 || labels[idx] !== -1) continue;
        const blobId = blobPixels.length;
        const pixels = [];
        stack.push(idx);
        labels[idx] = blobId;
        while (stack.length) {
          const cur = stack.pop();
          pixels.push(cur);
          const cx = cur % width, cy = Math.floor(cur / width);
          const neighbors = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1], [cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1], [cx + 1, cy + 1]];
          for (const [nx, ny] of neighbors) {
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            const nidx = ny * width + nx;
            if (mask[nidx] === 1 && labels[nidx] === -1) { labels[nidx] = blobId; stack.push(nidx); }
          }
        }
        blobPixels.push(pixels);
        if (pixels.length > bestArea) { bestArea = pixels.length; bestBlobId = blobId; }
      }
    }

    if (bestBlobId === -1) { console.log(name, 'no content found, skipping'); continue; }

    const out = Buffer.from(data);
    for (let i = 0; i < width * height; i++) {
      if (labels[i] !== bestBlobId) out[i * channels + 3] = 0;
    }
    await sharp(out, { raw: { width, height, channels } }).png().toFile(file);
    console.log(name, `kept blob ${bestArea}px, removed ${blobPixels.length - 1} stray blob(s)`);
  }
}

main();
