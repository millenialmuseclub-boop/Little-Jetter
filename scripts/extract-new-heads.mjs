// Extracts individual heads from the new transparent reference sheet via
// connected-component blob detection on a downsampled alpha mask (heads
// aren't aligned to a clean row/col grid — buns/hair heights vary — so
// projection-based gap-finding doesn't work; flood-filling isolated alpha
// blobs does). Writes raw crops to scripts/_new-heads-raw/ for inspection.
import sharp from 'sharp';
import { promises as fs } from 'node:fs';

const SRC = process.argv[2] ?? 'C:/Users/Jordann Lopez/Downloads/Codex Image Sep 4, 2026, 06_44_07 AM.png';
const OUT_DIR = process.argv[3] ?? 'scripts/_new-heads-raw';
const DOWNSAMPLE = 1;
const ALPHA_THRESHOLD = 200;
const MIN_BLOB_AREA = 200; // in downsampled pixels — filters out stray specks

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const full = sharp(SRC);
  const fullMeta = await full.metadata();
  const smallW = Math.round(fullMeta.width / DOWNSAMPLE);
  const smallH = Math.round(fullMeta.height / DOWNSAMPLE);

  const { data, info } = await sharp(SRC).resize(smallW, smallH, { kernel: 'nearest' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) mask[i] = data[i * channels + 3] > ALPHA_THRESHOLD ? 1 : 0;

  const labels = new Int32Array(width * height).fill(-1);
  const blobs = [];
  const stack = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] !== 1 || labels[idx] !== -1) continue;
      const blobId = blobs.length;
      let minX = x, maxX = x, minY = y, maxY = y, area = 0;
      stack.push(idx);
      labels[idx] = blobId;
      while (stack.length) {
        const cur = stack.pop();
        const cx = cur % width, cy = Math.floor(cur / width);
        area++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        const neighbors = [
          [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const nidx = ny * width + nx;
          if (mask[nidx] === 1 && labels[nidx] === -1) {
            labels[nidx] = blobId;
            stack.push(nidx);
          }
        }
      }
      if (area >= MIN_BLOB_AREA) blobs.push({ minX, maxX, minY, maxY, area });
    }
  }

  console.log(`Found ${blobs.length} blobs (downsampled ${width}x${height})`);
  // Sort into reading order: top-to-bottom by row cluster, then left-to-right.
  blobs.sort((a, b) => (a.minY - b.minY) || (a.minX - b.minX));

  const manifest = [];
  let index = 0;
  for (const b of blobs) {
    const pad = 6; // downsampled-space padding
    const left = Math.max(0, (b.minX - pad) * DOWNSAMPLE);
    const top = Math.max(0, (b.minY - pad) * DOWNSAMPLE);
    const right = Math.min(fullMeta.width, (b.maxX + pad + 1) * DOWNSAMPLE);
    const bottom = Math.min(fullMeta.height, (b.maxY + pad + 1) * DOWNSAMPLE);
    const w = right - left, h = bottom - top;
    const outPath = `${OUT_DIR}/head-${String(index).padStart(2, '0')}.png`;
    await sharp(SRC).extract({ left, top, width: w, height: h }).png().toFile(outPath);
    manifest.push({ index, path: outPath, left, top, width: w, height: h, area: b.area });
    index++;
  }
  await fs.writeFile(`${OUT_DIR}/manifest.json`, JSON.stringify(manifest, null, 2));
  console.log(`Extracted ${index} heads to ${OUT_DIR}`);
}

main();
