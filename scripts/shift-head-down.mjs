// Nudges every painterly head PNG down a few pixels so the hair/jaw overlaps
// the shirt collar band instead of leaving a visible gap ring around the
// neck — the "heads float on" complaint. Pure vertical translation (no
// scaling), so no distortion; content that would fall off the bottom of the
// 600x900 canvas is clipped (heads bottom out around y=331, canvas is 900
// tall, so there's ample room). Run: node scripts/shift-head-down.mjs
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const HEAD_DIR = 'public/little-jetter/catalog/tokyo/head';
const SHIFT_Y = 14;

async function run() {
  const files = (await fs.readdir(HEAD_DIR)).filter((f) => f.endsWith('.png'));
  for (const f of files) {
    const file = path.join(HEAD_DIR, f);
    const buf = await sharp(file).toBuffer();
    await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: buf, left: 0, top: SHIFT_Y }])
      .png().toFile(file);
  }
  console.log(`shifted ${files.length} head assets down ${SHIFT_Y}px`);
}

run();
