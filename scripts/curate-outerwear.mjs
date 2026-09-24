import fs from 'node:fs/promises';

const catalogPath = 'src/data/dressUpCatalog.json';
const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
const approved = new Set(['rain', 'denim', 'windbreaker', 'trench-coat', 'pink-hoodie', 'denim-jacket-classic', 'blue-airplane-hoodie', 'explore-hoodie', 'none']);
const disabled = [];

for (const [destinationId, destination] of Object.entries(catalog.destinations)) {
  for (const item of destination.layers ?? []) {
    item.enabled = approved.has(item.id);
    if (destinationId === 'all' && item.enabled && item.id !== 'none' && !item.tags.includes('destination:all')) {
      item.tags.push('destination:all');
    }
    if (!item.enabled) disabled.push({ destinationId, id: item.id, reason: 'failed-outerwear-visual-qc' });
  }
}

await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
await fs.writeFile('docs/qa/wardrobe/disabled-outerwear.json', JSON.stringify(disabled, null, 2) + '\n');
console.log(JSON.stringify({ approved: [...approved].filter((id) => id !== 'none'), disabled: disabled.length }, null, 2));
