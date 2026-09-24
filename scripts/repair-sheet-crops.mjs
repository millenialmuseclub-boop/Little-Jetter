import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const catalogPath = 'src/data/dressUpCatalog.json';
const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
const alphaThreshold = 10;

async function componentsFor(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const labels = new Int32Array(width * height).fill(-1);
  const components = [];
  const stack = [];
  for (let start = 0; start < width * height; start++) {
    if (labels[start] !== -1 || data[start * channels + 3] <= alphaThreshold) continue;
    const id = components.length;
    const pixels = [];
    let left = width; let right = 0; let top = height; let bottom = 0;
    stack.push(start); labels[start] = id;
    while (stack.length) {
      const current = stack.pop();
      pixels.push(current);
      const x = current % width; const y = Math.floor(current / width);
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]]) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (labels[next] === -1 && data[next * channels + 3] > alphaThreshold) { labels[next] = id; stack.push(next); }
      }
    }
    components.push({ pixels, left, right, top, bottom });
  }
  return { data, info, components };
}

async function removeSheetNeighbors(file) {
  const { data, info, components } = await componentsFor(file);
  if (components.length < 2) return { removed: 0, components: components.length };
  const main = components.reduce((best, component) => component.pixels.length > best.pixels.length ? component : best);
  const output = Buffer.from(data);
  let removed = 0;
  for (const component of components) {
    if (component === main) continue;
    const centerX = (component.left + component.right) / 2;
    const centerY = (component.top + component.bottom) / 2;
    const insideSubject = centerX >= main.left && centerX <= main.right && centerY >= main.top && centerY <= main.bottom;
    if (insideSubject) continue;
    for (const index of component.pixels) { output[index * info.channels + 3] = 0; removed++; }
  }
  if (removed) await sharp(output, { raw: info }).png().toFile(`${file}.repaired.png`);
  if (removed) await fs.rename(`${file}.repaired.png`, file);
  return { removed, components: components.length };
}

const targets = new Map();
for (const [destinationId, destination] of Object.entries(catalog.destinations)) {
  for (const item of destination.layers ?? []) {
    if (item.id === 'none' || !item.imageUrl) continue;
    targets.set(item.imageUrl, { type: 'outerwear', destinationId, itemId: item.id });
    item.enabled = true;
    delete item.disabledReason;
  }
}

const headDir = 'public/little-jetter/catalog/tokyo/head';
for (const name of (await fs.readdir(headDir)).filter((name) => name.startsWith('style-') && name.endsWith('.png'))) {
  targets.set(`/little-jetter/catalog/tokyo/head/${name}`, { type: 'head', itemId: name.slice(6, -4) });
}

const report = [];
for (const [url, metadata] of targets) {
  const file = path.join('public', ...url.replace(/^\//, '').split('/'));
  report.push({ ...metadata, url, ...(await removeSheetNeighbors(file)) });
}

await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
await fs.writeFile('docs/qa/wardrobe/sheet-crop-repair.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ assets: report.length, repaired: report.filter((entry) => entry.removed > 0).length, removedPixels: report.reduce((sum, entry) => sum + entry.removed, 0) }, null, 2));
