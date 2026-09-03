// Generates a painterly bare-limbs body base (arms + torso + legs, wearing only
// the plain base-layer tee+shorts already used as the doll's "underwear" layer)
// to replace the flat SVG body shapes — matching the painterly quality already
// shipped for the head. Uses the user's own AI-generated reference photos for
// style. v2: includes a short visible neck (v1 was cropped flush at the
// shoulder line, leaving no neck geometry to connect to the head), and asks for
// slightly fuller/rounder toddler proportions with arms closer to the body —
// v1's lean, realistic limb width read as "clothes too big" once existing
// garments (cut to the old flat-SVG body's chunkier arms/legs) were layered on.
// Run with: npx tsx scripts/generate-tokyo-body.ts
import path from 'node:path';
import { promises as fs } from 'node:fs';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { generateClosetImage } from '../server/closet/openaiClient';

dotenv.config({ path: '.env.local' });

const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');

// Deliberately does NOT reuse MASTER_STYLE_PROMPT verbatim: its "gentle drop
// shadow for depth" line, fine for small garment cutouts, reliably blew up
// into a full-canvas radial vignette on this tall full-body figure across 3
// straight attempts. Same painterly technique, shadow instruction dropped.
const BODY_PROMPT = [
  'Soft painterly children\'s-book illustration style, warm golden-hour lighting, gentle rounded shading with visible soft brushwork texture, not flat vector, not photoreal, warm and slightly desaturated palette.',
  'Absolutely flat, perfectly even lighting with no vignette, no glow, no drop shadow, and no gradient anywhere in the image — every pixel outside the figure must be 100% transparent, pure alpha 0, identical to the corners.',
  'A single standing child\'s BODY ONLY: bare arms, a short visible neck, torso, and legs, wearing just a plain cream short-sleeve base-layer tee and plain teal drawstring shorts (the doll\'s underlayer, not a real outfit), bare feet.',
  'Warm golden-tan skin with soft rounded gradient shading, matching the same painterly technique as the clothing pieces.',
  'Ordinary, average child body proportions — normal slim arms and legs, not chubby, not muscular, not stylized-round — arms held close against the sides of the torso, not spread outward, fingers relaxed and together, not splayed.',
  'Standing straight and centered, front-facing, feet together and flat on the ground.',
  'Framed from the base of the neck straight down to the feet, with the neck fully visible and uncropped — NO head, no chin, no mouth, no hair above the neck.',
  'Output canvas 1024x1536, true alpha transparency, body only, clean die-cut silhouette, no outline stroke, no background scenery of any kind.',
].join('\n');

async function main() {
  console.log('generating body base v2 (no reference image this time)...');
  const raw = await generateClosetImage({ prompt: BODY_PROMPT, quality: 'high', size: '1024x1536' });

  const outDir = path.resolve(PUBLIC_ROOT, 'little-jetter', 'catalog', 'tokyo', 'body');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, '_raw-golden-v2.png'), raw);

  // The model consistently leaves a low-but-nonzero alpha "halo" (values ~1-8)
  // extending well beyond the real figure, with leftover warm-toned RGB baked
  // into those pixels — real background, but soft/naive viewers (and sharp's
  // default trim threshold) don't reliably treat it as such, and it visibly
  // reads as a vignette when composited against anything but white. Hard-clip
  // alpha to fully binary before doing anything else.
  const { data: rawPixels, info: rawInfo } = await sharp(raw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < rawInfo.width * rawInfo.height; i++) {
    const a = rawPixels[i * rawInfo.channels + 3];
    rawPixels[i * rawInfo.channels + 3] = a < 128 ? 0 : 255;
  }
  const masked = await sharp(rawPixels, { raw: { width: rawInfo.width, height: rawInfo.height, channels: rawInfo.channels } }).png().toBuffer();

  // Trim to content. Scale so the SHOULDER width (measured across a band just
  // below the neck — not the full bounding box, which outstretched hands can
  // inflate) matches the ~170px chest width the existing garments (stripe tee
  // ~188px, jeans ~192px trimmed) were cut for.
  const trimmed = await sharp(masked).trim({ threshold: 10 }).ensureAlpha().png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;

  const shoulderBandTop = Math.round(h * 0.1);
  const shoulderBandHeight = Math.max(1, Math.round(h * 0.06));
  const band = await sharp(trimmed).extract({ left: 0, top: shoulderBandTop, width: w, height: shoulderBandHeight }).raw().toBuffer({ resolveWithObject: true });
  let minX = w, maxX = 0;
  const { data, info } = band;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
    }
  }
  const shoulderWidth = maxX - minX;
  const targetShoulderWidth = 170;
  const scale = targetShoulderWidth / shoulderWidth;
  const drawWidth = Math.round(w * scale);
  const drawHeight = Math.round(h * scale);
  console.log(`measured shoulder-band width: ${shoulderWidth}px -> scale ${scale.toFixed(3)} -> final ${drawWidth}x${drawHeight}`);

  const resized = await sharp(trimmed).resize(drawWidth, drawHeight).png().toBuffer();

  // Anchor by FEET at groundY=810 (not by a fixed shoulder y), since the width-
  // driven scale determines total height independently now.
  const left = Math.round(300 - drawWidth / 2);
  const top = 810 - drawHeight;
  console.log(`placing at left=${left}, top=${top} (neck/shoulder line lands at y=${top})`);

  const finalCanvas = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
  const finalPath = path.join(outDir, 'golden.png');
  await fs.writeFile(finalPath, finalCanvas);
  console.log('wrote', path.relative(process.cwd(), finalPath));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
