// The AI-generated hair-color variants (generate-tokyo-head-colors.ts) drifted
// vertically/horizontally from their base (brown) head — each color was a
// separate generation call, not a local recolor, so framing wasn't guaranteed
// identical. That drift is the "heads float when you change hair color" bug:
// object-fit:contain renders each 600x900 PNG's actual pixel content wherever
// it happens to sit on the canvas, so a variant whose head sits 50px higher
// visibly jumps on swap. Fix: measure each variant's content bounding box and
// translate it (no scale) to match its style+skin's base image exactly.
// Run with: node scripts/align-head-colors.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/little-jetter/catalog/tokyo/head');
const STYLES = ['curls', 'coils', 'bob', 'short'];
const SKINS = ['porcelain', 'peach', 'golden', 'caramel', 'brown', 'deep'];

async function contentBBox(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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
  return { top, left, right, bottom };
}

async function alignTo(filePath, dx, dy) {
  if (dx === 0 && dy === 0) return false;
  const src = await sharp(filePath).toBuffer();
  const out = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: src, left: dx, top: dy }])
    .png()
    .toBuffer();
  fs.writeFileSync(filePath, out);
  return true;
}

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.png'));
  let fixed = 0;
  for (const style of STYLES) {
    for (const skin of SKINS) {
      const baseName = `${style}-${skin}.png`;
      const basePath = path.join(DIR, baseName);
      if (!fs.existsSync(basePath)) continue;
      const base = await contentBBox(basePath);
      const variants = files.filter((f) => f.startsWith(`${style}-${skin}`) && f !== baseName);
      for (const variant of variants) {
        const variantPath = path.join(DIR, variant);
        const box = await contentBBox(variantPath);
        const dx = base.left - box.left;
        const dy = base.top - box.top;
        if (dx !== 0 || dy !== 0) {
          await alignTo(variantPath, dx, dy);
          console.log(`aligned ${variant} (dx=${dx}, dy=${dy})`);
          fixed++;
        }
      }
    }
  }
  console.log(`done, ${fixed} files aligned`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
