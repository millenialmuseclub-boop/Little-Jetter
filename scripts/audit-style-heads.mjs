import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const sourceDir = 'public/little-jetter/catalog/tokyo/head';
const output = 'docs/qa/style-head-audit.png';
const files = (await fs.readdir(sourceDir)).filter((name) => name.startsWith('style-') && name.endsWith('.png')).sort();
const columns = 5;
const cellWidth = 220;
const cellHeight = 350;
const composites = [];

for (const [index, name] of files.entries()) {
  const image = await sharp(path.join(sourceDir, name)).resize(200, 300, { fit: 'contain' }).png().toBuffer();
  const label = Buffer.from(`<svg width="${cellWidth}" height="40"><rect width="100%" height="100%" fill="#fffaf0"/><text x="8" y="24" font-family="Arial" font-size="13" fill="#173a47">${name.replace('style-', '').replace('.png', '')}</text></svg>`);
  const left = (index % columns) * cellWidth;
  const top = Math.floor(index / columns) * cellHeight;
  composites.push({ input: image, left: left + 10, top: top + 4 }, { input: label, left, top: top + 306 });
}

await sharp({ create: { width: columns * cellWidth, height: Math.ceil(files.length / columns) * cellHeight, channels: 4, background: '#fffaf0' } })
  .composite(composites)
  .png()
  .toFile(output);
console.log(output);
