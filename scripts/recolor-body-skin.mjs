// Recolors the ONE approved painterly body-base image (golden.png) to the
// app's other 5 skin tones by shifting hue+saturation on skin-classified
// pixels only, while preserving each pixel's own lightness — so the existing
// painterly shading/highlights/shadows carry over naturally instead of being
// flattened. No new AI generation involved (deliberately: this is the
// safety-conscious alternative to generating more bare-limb child-figure
// images after one such request was rejected by the model's own moderation).
import sharp from 'sharp';
import { promises as fs } from 'node:fs';

const SRC = 'public/little-jetter/catalog/tokyo/body/golden.png';
const OUT_DIR = 'public/little-jetter/catalog/tokyo/body';

// Targets are each head asset's OWN actual average skin color (sampled
// directly from the shipped PNGs — see scripts/_sample_head_skin.mjs output),
// not the character.skin swatch hex. The AI-generated heads and this locally
// recolored body are two different pipelines; matching the body to the
// swatch hex made it visually mismatch the head, since the head generation
// never hit that exact hex either. Matching the body to the head directly is
// what actually makes them look like the same skin. 'golden' is the source
// image's own tone (skipped — already close).
const TARGETS = {
  porcelain: 'rgb(251,172,129)',
  peach: 'rgb(252,172,122)',
  caramel: 'rgb(227,122,61)',
  brown: 'rgb(209,95,49)',
  deep: 'rgb(199,92,46)',
};

function parseColor(str) {
  const m = str.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return hexToRgb(str);
}

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

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Measured from the golden source image's mid-tone skin (not a highlight or
// shadow) — the reference point that pixel-level lightness deltas are taken
// against, so relative shading carries over instead of being replaced by an
// absolute (and, for dark targets, washed-out) lightness value.
const SOURCE_BASE_L = 0.64;

async function main() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Core mask: tight thresholds, avoids bleeding onto the shirt/shorts.
  const core = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * channels;
    if (data[idx + 3] < 10) continue;
    const [h, s, l] = rgbToHsl(data[idx], data[idx + 1], data[idx + 2]);
    const hueDeg = h * 360;
    if (s > 0.6 && l < 0.8 && hueDeg >= 15 && hueDeg <= 35) core[i] = 1;
  }
  // Dilate by 1px into pixels that are at least plausibly skin-toned (looser
  // hue/lightness band), to catch antialiased edge pixels the tight mask
  // rejects — those are spatially isolated from the shirt/shorts (several px
  // away), so widening only near an already-confirmed skin pixel is safe.
  const mask = new Uint8Array(core);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (core[i]) continue;
      const idx = i * channels;
      if (data[idx + 3] < 10) continue;
      const [h, l] = rgbToHsl(data[idx], data[idx + 1], data[idx + 2]);
      const hueDeg = h * 360;
      if (hueDeg < 8 || hueDeg > 55 || l > 0.97) continue;
      let nearCore = false;
      for (let dy = -3; dy <= 3 && !nearCore; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;
          if (core[ny * width + nx]) { nearCore = true; break; }
        }
      }
      if (nearCore) mask[i] = 1;
    }
  }

  for (const [skinId, hex] of Object.entries(TARGETS)) {
    const [tr, tg, tb] = parseColor(hex);
    const [targetH, targetS, targetL] = rgbToHsl(tr, tg, tb);
    const out = Buffer.from(data);

    for (let i = 0; i < width * height; i++) {
      if (!mask[i]) continue;
      const idx = i * channels;
      const [, , l] = rgbToHsl(data[idx], data[idx + 1], data[idx + 2]);
      const delta = l - SOURCE_BASE_L;
      const newL = Math.min(1, Math.max(0, targetL + delta));
      const [nr, ng, nb] = hslToRgb(targetH, targetS, newL);
      out[idx] = nr; out[idx + 1] = ng; out[idx + 2] = nb;
    }

    await fs.mkdir(OUT_DIR, { recursive: true });
    await sharp(out, { raw: { width, height, channels } }).png().toFile(`${OUT_DIR}/${skinId}.png`);
    console.log('wrote', `${OUT_DIR}/${skinId}.png`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
