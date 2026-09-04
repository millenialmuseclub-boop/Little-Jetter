// The body's base art (public/little-jetter/catalog/tokyo/body/<skin>.png)
// has painted-on shorts baked into the bare-limbs base (visible as a fallback
// under any bottom garment), roughly 167-168px wide at the waist. Most
// illustrated bottoms are at least that wide already, but wide-leg-pants'
// silhouette tapers inward at the waist (only ~98px there) before flaring
// out toward the hem, so the body's shorts peek out at the sides above the
// waistband. Widens just the top ~80px band (waist to upper thigh) with a
// per-row horizontal stretch that tapers to no-op by the point the pants'
// own flare already exceeds the needed width — the flare/hem shape below
// that point is untouched.
import sharp from 'sharp';

const FILES = (process.argv[2] ? [process.argv[2]] : [
  'travel-jeans', 'black-flower-shorts', 'cargo-pants', 'floral-midi-skirt',
  'navy-pleated-skirt', 'pink-bow-skirt', 'play-skirt', 'yellow-plaid-skirt',
]).map((id) => `public/little-jetter/catalog/tokyo/${id}/default.png`);
const TARGET_WAIST_WIDTH = 168;
const TAPER_ROWS = 80; // rows (from the garment's own top) over which the correction fades out

async function processFile(FILE) {
  const { data, info } = await sharp(FILE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let top = -1;
  for (let y = 0; y < height && top === -1; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 10) { top = y; break; }
    }
  }

  const out = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y++) {
    const rowsFromTop = y - top;
    let stretch = 1;
    if (rowsFromTop >= 0 && rowsFromTop < TAPER_ROWS) {
      // Measure this row's current content width to size the correction.
      let left = -1, right = -1;
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * channels + 3] > 10) { if (left === -1) left = x; right = x; }
      }
      if (left !== -1) {
        const curW = right - left + 1;
        const neededStretch = Math.min(2.2, TARGET_WAIST_WIDTH / curW);
        const fade = 1 - rowsFromTop / TAPER_ROWS; // 1 at the very top, 0 at TAPER_ROWS
        stretch = 1 + (neededStretch - 1) * fade;
      }
    }
    if (stretch === 1) {
      data.copy(out, y * width * channels, y * width * channels, (y + 1) * width * channels);
      continue;
    }
    // Horizontally resample this single row by `stretch`, centered on its own midpoint.
    let left = -1, right = -1;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 10) { if (left === -1) left = x; right = x; }
    }
    const cx = (left + right) / 2;
    for (let x = 0; x < width; x++) {
      const srcX = Math.round(cx + (x - cx) / stretch);
      const dstIdx = (y * width + x) * channels;
      if (srcX < 0 || srcX >= width) { out[dstIdx + 3] = 0; continue; }
      const srcIdx = (y * width + srcX) * channels;
      out[dstIdx] = data[srcIdx]; out[dstIdx + 1] = data[srcIdx + 1]; out[dstIdx + 2] = data[srcIdx + 2]; out[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  await sharp(out, { raw: { width, height, channels } }).png().toFile(FILE);
  console.log(FILE, 'done, top row was', top);
}

async function main() {
  for (const file of FILES) await processFile(file);
}

main();
