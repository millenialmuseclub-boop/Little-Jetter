// Adds hair-color variants to every painterly head PNG that only ships the
// default "brown" bake (every skin except golden) — the hair-color picker
// silently did nothing for those skins because PAINTERLY_HEAD_ASSETS had no
// entry to fall through to. Recolors hair-colored pixels (dark, warm-hued,
// distinguished from the lighter skin tone of each specific skin) by
// replacing hue while preserving each pixel's own lightness/saturation
// shading, same hue-replace technique as recolor-eye-color.mjs. No AI
// generation involved. Run: node scripts/recolor-hair-color.mjs
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const HEAD_DIR = 'public/little-jetter/catalog/tokyo/head';
const HAIRSTYLES = ['curls', 'short', 'bob', 'coils'];

// Same iris centers as recolor-eye-color.mjs — excluded from the hair mask
// so recoloring hair never also tints the eyes. +14px on Y vs. the original
// measurement to match scripts/shift-head-down.mjs (see recolor-eye-color.mjs
// for why) — this was left un-adjusted, which is why light hair colors were
// bleeding into the eyebrow/iris area unprotected on some heads.
const EYE_CENTERS = {
  curls: [[271, 264], [325, 259]],
  short: [[261, 258], [341, 256]],
  bob: [[269, 278], [334, 276]],
  coils: [[268, 271], [342, 266]],
};
const EYE_EXCLUDE_RADIUS = 16;
// Nose bridge through chin/lip shadow, consistent across hairstyles (only
// hair shape differs between styles, not underlying face geometry).
const FACE_EXCLUDE_RECT = { left: 255, right: 375, top: 275, bottom: 345 };
const SKINS = ['porcelain', 'peach', 'golden', 'caramel', 'brown', 'deep'];
// golden already has hand-AI-generated (higher quality) bakes for these 4 —
// keep those files untouched rather than overwrite with a local recolor.
const GOLDEN_HAND_BAKED = new Set(['black', 'auburn', 'red', 'blue']);

// Matches characterOptions.hair in src/LittleJetterApp.tsx (full 18-color
// palette). 'brown' (Medium Brown) is the heads' own baked-in color —
// skipped, already correct.
const HAIR_TARGETS = {
  'platinum-blonde': [235, 225, 210],
  'light-blonde': [225, 196, 140],
  'honey-blonde': [201, 155, 90],
  'strawberry-blonde': [214, 150, 110],
  red: [180, 70, 55],
  auburn: [122, 58, 39],
  'light-brown': [150, 104, 70],
  'dark-brown': [74, 48, 34],
  black: [35, 30, 30],
  'warm-black': [40, 30, 28],
  chocolate: [92, 58, 38],
  caramel: [156, 104, 58],
  'ash-brown': [120, 100, 85],
  gray: [150, 148, 145],
  blue: [58, 92, 148],
  pink: [219, 110, 150],
  purple: [120, 70, 150],
};

// Per-skin lightness ceiling for "this pixel is hair, not skin". Skin tones
// get progressively darker (porcelain lightest -> deep darkest), so the
// hair/skin split threshold has to move with it, especially for deep where
// skin and (brown) hair sit close together in lightness.
const SKIN_HAIR_LIGHTNESS_CEILING = {
  porcelain: 0.62,
  peach: 0.58,
  golden: 0.52,
  caramel: 0.48,
  brown: 0.4,
  deep: 0.3,
};

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

async function processFile(filePath, ceiling, hairstyle, skipIds = new Set()) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const base = path.basename(filePath, '.png');

  // Precompute the hair mask once (shared across all target colors): warm,
  // moderately-saturated, dark-relative-to-this-skin pixels, minus the two
  // iris circles (irises are dark/warm too and would otherwise get caught).
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      if (data[idx + 3] < 200) continue;
      const [h, s, l] = rgbToHsl(data[idx], data[idx + 1], data[idx + 2]);
      const hueDeg = h * 360;
      const isWarmBrown = hueDeg >= 5 && hueDeg <= 45;
      if (isWarmBrown && s > 0.12 && l < ceiling) mask[y * width + x] = 1;
    }
  }
  for (const [cx, cy] of EYE_CENTERS[hairstyle] ?? []) {
    for (let dy = -EYE_EXCLUDE_RADIUS; dy <= EYE_EXCLUDE_RADIUS; dy++) {
      for (let dx = -EYE_EXCLUDE_RADIUS; dx <= EYE_EXCLUDE_RADIUS; dx++) {
        if (dx * dx + dy * dy > EYE_EXCLUDE_RADIUS * EYE_EXCLUDE_RADIUS) continue;
        const x = cx + dx, y = cy + dy;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        mask[y * width + x] = 0;
      }
    }
  }
  // Nose/mouth/chin shadow pixels are dark and warm enough on deeper skins
  // to pass the same threshold as hair (that ceiling has to sit low to
  // separate hair from skin at all on those tones) — recoloring them to a
  // light target produced visible white speckling around the mouth. Hair
  // never legitimately occupies this box, so it's always safe to exclude.
  for (let y = FACE_EXCLUDE_RECT.top; y <= FACE_EXCLUDE_RECT.bottom; y++) {
    for (let x = FACE_EXCLUDE_RECT.left; x <= FACE_EXCLUDE_RECT.right; x++) {
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      mask[y * width + x] = 0;
    }
  }

  for (const [hairId, target] of Object.entries(HAIR_TARGETS)) {
    if (skipIds.has(hairId)) continue;
    const [targetH, targetS] = rgbToHsl(...target);
    const targetLBase = rgbToHsl(...target)[2];
    const out = Buffer.from(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!mask[y * width + x]) continue;
        const idx = (y * width + x) * channels;
        const [, , l] = rgbToHsl(out[idx], out[idx + 1], out[idx + 2]);
        // Preserve this pixel's own shading by keeping it proportionally
        // offset from the target's base lightness, same as the eye script.
        const newL = Math.min(1, Math.max(0, targetLBase + (l - 0.3) * 0.6));
        const [nr, ng, nb] = hslToRgb(targetH, Math.min(1, targetS * 1.05), newL);
        out[idx] = nr; out[idx + 1] = ng; out[idx + 2] = nb;
      }
    }
    const outPath = path.join(HEAD_DIR, `${base}-${hairId}.png`);
    await sharp(out, { raw: { width, height, channels } }).png().toFile(outPath);
  }
  console.log('processed', base);
}

async function main() {
  for (const style of HAIRSTYLES) {
    for (const skin of SKINS) {
      const file = path.join(HEAD_DIR, `${style}-${skin}.png`);
      try {
        await fs.access(file);
      } catch {
        console.log('skip (missing):', file);
        continue;
      }
      const skipIds = skin === 'golden' ? GOLDEN_HAND_BAKED : new Set();
      await processFile(file, SKIN_HAIR_LIGHTNESS_CEILING[skin], style, skipIds);
    }
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
