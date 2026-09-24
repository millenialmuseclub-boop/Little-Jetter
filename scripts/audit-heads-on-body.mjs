import fs from 'node:fs/promises';
import sharp from 'sharp';

const manifest = await fs.readFile('src/data/headManifest.ts', 'utf8');
const scaleBlock = manifest.match(/const FACE_SCALE:[\s\S]*?= \{([\s\S]*?)\n\};/)?.[1] ?? '';
const scales = Object.fromEntries([...scaleBlock.matchAll(/'([^']+)':\s*([\d.]+)/g)].map((match) => [match[1], Number(match[2])]));
const entries = [...manifest.matchAll(/head\('([^']+)',\s*'([^']+)',\s*'([^']+)'/g)]
  .map((match) => ({ id: match[1], name: match[2], skin: match[3] }))
  .filter(({ id }) => id !== 'wavy-blonde-boy2');
const bodyBySkin = { light: 'porcelain', medium: 'golden', deep: 'deep' };

async function scaledHead(id, scale) {
  const input = `public/little-jetter/catalog/tokyo/head/style-${id}.png`;
  if (scale === 1) return fs.readFile(input);
  const width = Math.round(600 * scale), height = Math.round(900 * scale);
  const resized = await sharp(input).resize(width, height).png().toBuffer();
  if (scale > 1) {
    return sharp(resized).extract({ left: Math.round(300 * scale - 300), top: Math.round(330 * scale - 330), width: 600, height: 900 }).png().toBuffer();
  }
  return sharp({ create: { width: 600, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left: Math.round(300 - 300 * scale), top: Math.round(330 - 330 * scale) }])
    .png().toBuffer();
}

const cells = [];
for (const entry of entries) {
  const body = `public/little-jetter/catalog/tokyo/body/${bodyBySkin[entry.skin]}.png`;
  const head = await scaledHead(entry.id, scales[entry.id] ?? 1);
  const dressed = await sharp({ create: { width: 600, height: 900, channels: 4, background: '#edf3e9' } })
    .composite([{ input: body, top: 0, left: 0 }, { input: head, top: 0, left: 0 }])
    .png().toBuffer();
  const portrait = await sharp(dressed).extract({ left: 100, top: 40, width: 400, height: 440 })
    .resize(240, 264)
    .extend({ bottom: 36, background: '#fff8e8' })
    .composite([{ input: Buffer.from(`<svg width="240" height="36"><text x="120" y="24" text-anchor="middle" font-family="Arial" font-size="13" fill="#173a47">${entry.name.replaceAll('&', '&amp;')}</text></svg>`), left: 0, top: 264 }])
    .png().toBuffer();
  cells.push(portrait);
}

const columns = 4, rows = Math.ceil(cells.length / columns);
const sheet = sharp({ create: { width: columns * 240, height: rows * 300, channels: 4, background: '#fff8e8' } });
await sheet.composite(cells.map((input, index) => ({ input, left: (index % columns) * 240, top: Math.floor(index / columns) * 300 }))).png().toFile('docs/qa/heads-on-body.png');
console.log(`Wrote docs/qa/heads-on-body.png with ${cells.length} enabled heads.`);
