// Generates the remaining 5 skin tones for the painterly body base (golden
// already done). Same pipeline as generate-tokyo-body.ts, looped, with the
// alpha-hardening fix (the model consistently leaves a low-but-nonzero alpha
// halo that isn't a failed generation — it just needs a hard threshold before
// trim/measure/place, discovered while debugging the golden attempt).
// Run with: npx tsx scripts/generate-tokyo-body-skins.ts
import path from 'node:path';
import { promises as fs } from 'node:fs';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { generateClosetImage } from '../server/closet/openaiClient';

dotenv.config({ path: '.env.local' });

const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');
const OUT_DIR = path.resolve(PUBLIC_ROOT, 'little-jetter', 'catalog', 'tokyo', 'body');

const SKIN_PROMPTS: Record<string, string> = {
  porcelain: 'fair porcelain skin with a soft peachy undertone',
  peach: 'light warm peachy-tan skin',
  caramel: 'warm mid-toned caramel-brown skin',
  brown: 'rich warm brown skin',
  deep: 'deep warm brown skin',
};

const BODY_PROMPT = (skin: string) => [
  'Soft painterly children\'s-book illustration style, warm golden-hour lighting, gentle rounded shading with visible soft brushwork texture, not flat vector, not photoreal, warm and slightly desaturated palette.',
  'Absolutely flat, perfectly even lighting with no vignette, no glow, no drop shadow, and no gradient anywhere in the image — every pixel outside the figure must be 100% transparent, pure alpha 0, identical to the corners.',
  'A single standing child\'s BODY ONLY: bare arms, a short visible neck, torso, and legs, wearing just a plain cream short-sleeve base-layer tee and plain teal drawstring shorts (the doll\'s underlayer, not a real outfit), bare feet.',
  `${SKIN_PROMPTS[skin]}, with soft rounded gradient shading, matching the same painterly technique as the clothing pieces.`,
  'Ordinary, average child body proportions — normal slim arms and legs, not chubby, not muscular, not stylized-round — arms held close against the sides of the torso, not spread outward, fingers relaxed and together, not splayed.',
  'Standing straight and centered, front-facing, feet together and flat on the ground.',
  'Framed from the base of the neck straight down to the feet, with the neck fully visible and uncropped — NO head, no chin, no mouth, no hair above the neck.',
  'Output canvas 1024x1536, true alpha transparency, body only, clean die-cut silhouette, no outline stroke, no background scenery of any kind.',
].join('\n');

async function generateOne(skin: string) {
  console.log(`generating body base: ${skin}...`);
  const raw = await generateClosetImage({ prompt: BODY_PROMPT(skin), quality: 'high', size: '1024x1536' });
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, `_raw-${skin}.png`), raw);

  const { data: rawPixels, info: rawInfo } = await sharp(raw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < rawInfo.width * rawInfo.height; i++) {
    const a = rawPixels[i * rawInfo.channels + 3];
    rawPixels[i * rawInfo.channels + 3] = a < 128 ? 0 : 255;
  }
  const masked = await sharp(rawPixels, { raw: { width: rawInfo.width, height: rawInfo.height, channels: rawInfo.channels } }).png().toBuffer();

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
  console.log(`  measured shoulder-band width: ${shoulderWidth}px -> scale ${scale.toFixed(3)} -> final ${drawWidth}x${drawHeight}`);

  const resized = await sharp(trimmed).resize(drawWidth, drawHeight).png().toBuffer();
  const left = Math.round(300 - drawWidth / 2);
  const top = 810 - drawHeight;
  console.log(`  placing at left=${left}, top=${top}`);

  const finalCanvas = await sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
  const finalPath = path.join(OUT_DIR, `${skin}.png`);
  await fs.writeFile(finalPath, finalCanvas);
  console.log('  wrote', path.relative(process.cwd(), finalPath));
}

async function main() {
  for (const skin of Object.keys(SKIN_PROMPTS)) {
    await generateOne(skin);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
