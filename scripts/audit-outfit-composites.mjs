import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const catalog = JSON.parse(await fs.readFile('src/data/dressUpCatalog.json', 'utf8'));
const root = 'public';
const qaRoot = 'docs/qa/outfits';
await fs.mkdir(qaRoot, { recursive: true });

const base = {
  body: '/little-jetter/catalog/tokyo/body/golden.png',
  head: '/little-jetter/catalog/tokyo/head/curls-golden-black.png',
  top: '/little-jetter/catalog/tokyo/stripe/coral.png',
  bottom: '/little-jetter/catalog/tokyo/cargo-pants/default.png',
  shoes: '/little-jetter/catalog/tokyo/cream-sneakers/default.png',
};

const file = (url) => path.join(root, url);
const image = (url) => ({ input: file(url), left: 0, top: 0 });

async function dollFor({ top = base.top, bottom = base.bottom, layer }) {
  const stack = [image(base.body), image(base.shoes)];
  if (bottom) stack.push(image(bottom));
  if (top) stack.push(image(top));
  if (layer) stack.push(image(layer));
  stack.push(image(base.head));
  return sharp({ create: { width: 600, height: 900, channels: 4, background: '#00000000' } })
    .composite(stack)
    .png()
    .toBuffer();
}

async function sheet(name, entries) {
  const columns = 6;
  const cellWidth = 210;
  const cellHeight = 340;
  const composites = [];
  for (const [index, entry] of entries.entries()) {
    const left = (index % columns) * cellWidth;
    const top = Math.floor(index / columns) * cellHeight;
    const rendered = await dollFor(entry);
    const preview = await sharp(rendered).resize(200, 300, { fit: 'contain' }).png().toBuffer();
    const label = entry.label.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
    const caption = Buffer.from(`<svg width="${cellWidth}" height="40"><rect width="100%" height="100%" fill="#fff8e8"/><text x="6" y="22" font-family="Arial" font-size="12" fill="#173a47">${label}</text></svg>`);
    composites.push({ input: preview, left: left + 5, top }, { input: caption, left, top: top + 300 });
  }
  const rows = Math.ceil(entries.length / columns);
  await sharp({ create: { width: columns * cellWidth, height: rows * cellHeight, channels: 4, background: '#fff8e8' } })
    .composite(composites)
    .png()
    .toFile(path.join(qaRoot, name));
}

const layers = catalog.destinations.all.layers
  .filter((item) => item.id !== 'none' && item.imageUrl)
  .map((item) => ({ label: item.name, layer: item.imageUrl }));

const fullPieces = catalog.destinations.all.tops
  .filter((item) => item.imageUrl && item.tags.some((tag) => tag === 'covers-bottom' || tag === 'style:dress' || tag === 'style:pajama' || tag === 'style:swim'))
  .map((item) => ({ label: item.name, top: item.imageUrl, bottom: null }));

await sheet('outerwear-on-doll.png', layers);
await sheet('full-pieces-on-doll.png', fullPieces);
console.log(JSON.stringify({ outerwear: layers.length, fullPieces: fullPieces.length }));
