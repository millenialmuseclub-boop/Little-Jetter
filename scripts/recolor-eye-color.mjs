// Adds eye-color variants to every existing painterly head PNG. The heads
// were generated with a fixed dark-brown iris regardless of the app's eye
// color picker, so that picker did nothing once a painterly head took over
// from the SVG fallback — same class of bug as the earlier hair-color gap.
// Recolors only iris-colored pixels near each eye's measured center (per
// hairstyle — head geometry shifts slightly between styles), leaving the
// white sclera/catchlight untouched. No AI generation involved.
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const HEAD_DIR = 'public/little-jetter/catalog/tokyo/head';

// Matches characterOptions.eyes in src/LittleJetterApp.tsx (full 8-color
// palette). 'brown' is the heads' own baked-in color — skipped, already
// correct.
const EYE_TARGETS = {
  'light-brown': [150, 110, 60],
  hazel: [141, 116, 64],
  green: [78, 128, 96],
  blue: [72, 135, 170],
  'light-blue': [140, 190, 220],
  gray: [113, 128, 136],
  amber: [180, 120, 40],
};

// Measured per-hairstyle iris centers (average of dark-pixel clusters in the
// golden variant of each style — head geometry is consistent across skin
// tones within a style, since only color changed, not shape/position).
// +14px on Y vs. the original measurement: scripts/shift-head-down.mjs
// nudged every head asset down 14px afterward to fix a "floating head"
// alignment bug, which silently desynced these coordinates from the actual
// art (they landed on the eyebrows instead of the irises).
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

const SOURCE_BASE_L = 0.18; // typical iris lightness in the shipped heads

async function processFile(filePath, hairstyle) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const centers = EYE_CENTERS[hairstyle];
  const base = path.basename(filePath, '.png');

  for (const [eyeId, target] of Object.entries(EYE_TARGETS)) {
    const [targetH, targetS, targetL] = rgbToHsl(...target);
    const out = Buffer.from(data);
    for (const [cx, cy] of centers) {
      for (let dy = -EYE_RADIUS; dy <= EYE_RADIUS; dy++) {
        for (let dx = -EYE_RADIUS; dx <= EYE_RADIUS; dx++) {
          if (dx * dx + dy * dy > EYE_RADIUS * EYE_RADIUS) continue;
          const x = cx + dx, y = cy + dy;
          if (x < 0 || x >= width || y < 0 || y >= height) continue;
          const idx = (y * width + x) * channels;
          if (out[idx + 3] < 200) continue;
          const [, , l] = rgbToHsl(out[idx], out[idx + 1], out[idx + 2]);
          // Only recolor genuinely dark iris pixels — skips the white
          // catchlight dot and any skin/highlight bleeding into the radius.
          if (l > 0.35) continue;
          const delta = l - SOURCE_BASE_L;
          const newL = Math.min(1, Math.max(0, targetL + delta));
          const [nr, ng, nb] = hslToRgb(targetH, targetS, newL);
          out[idx] = nr; out[idx + 1] = ng; out[idx + 2] = nb;
        }
      }
    }
    const outPath = path.join(HEAD_DIR, `${base}-eyes-${eyeId}.png`);
    await sharp(out, { raw: { width, height, channels } }).png().toFile(outPath);
  }
  console.log('processed', base);
}

const STYLES = ['curls', 'short', 'bob', 'coils'];
const SKINS = ['porcelain', 'peach', 'golden', 'caramel', 'brown', 'deep'];
// Only the default "Medium Brown" hair bake (<style>-<skin>.png, no color
// suffix) gets eye-color overlays — see painterlyHeadUrl in
// src/LittleJetterApp.tsx for why. Without this filter, every hair-color
// variant (17 of them per base) would also get the full eye-color set,
// ~17x-ing an already-large asset directory for a subtle iris-only change.
function isBaselineHeadFile(f) {
  return STYLES.some((s) => SKINS.some((k) => f === `${s}-${k}.png`));
}

async function main() {
  const files = await fs.readdir(HEAD_DIR);
  const pngs = files.filter((f) => f.endsWith('.png') && !f.includes('-eyes-') && isBaselineHeadFile(f));
  for (const f of pngs) {
    const hairstyle = f.split('-')[0];
    if (!EYE_CENTERS[hairstyle]) { console.log('skip (unknown hairstyle):', f); continue; }
    await processFile(path.join(HEAD_DIR, f), hairstyle);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
