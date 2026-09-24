import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const catalog = JSON.parse(await fs.readFile('src/data/dressUpCatalog.json', 'utf8'));
const rows = [];
const previews = {};
const hashes = new Map();
await fs.mkdir('public/little-jetter/thumbnails', { recursive: true });
await fs.mkdir('docs/qa/wardrobe', { recursive: true });
for (const [group, items] of Object.entries(catalog.destinations.all)) {
  for (const item of items) {
    const urls = [...new Set([item.imageUrl, ...(item.variants ?? []).map(v => v.imageUrl)].filter(Boolean))];
    for (const url of urls) {
      const row = { group, id: item.id, url, issues: [] };
      try {
        const file = path.join('public', url);
        const bytes = await fs.readFile(file);
        const hash = crypto.createHash('sha256').update(bytes).digest('hex');
        row.duplicateOf = hashes.get(hash);
        hashes.set(hash, url);
        const meta = await sharp(bytes).metadata();
        row.width = meta.width; row.height = meta.height; row.bytes = bytes.length;
        if (meta.width !== 600 || meta.height !== 900) row.issues.push('wrong-master-canvas');
        if (!meta.hasAlpha) row.issues.push('no-alpha');
        const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        let left = info.width, top = info.height, right = -1, bottom = -1;
        for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
          if (data[(y * info.width + x) * 4 + 3] > 12) {
            left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
          }
        }
        row.bounds = { left, top, right, bottom };
        if (right < 0) throw new Error('empty-artwork');
        if (left < 4 || top < 4 || right > info.width - 5 || bottom > info.height - 5) row.issues.push('edge-contact');
        const name = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16) + '.webp';
        await sharp(bytes).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
          .resize(160, 180, { fit: 'contain', background: '#00000000' }).webp({ quality: 88 }).toFile('public/little-jetter/thumbnails/' + name);
        previews[url] = '/little-jetter/thumbnails/' + name;
      } catch (error) { row.issues.push(String(error.message)); }
      rows.push(row);
    }
  }
}
await fs.writeFile('src/data/wardrobeThumbnails.json', JSON.stringify(previews, null, 2) + '\n');
await fs.writeFile('docs/qa/wardrobe/audit.json', JSON.stringify(rows, null, 2) + '\n');
// Contact sheets are QA evidence only, never a production source.
for (const group of new Set(rows.map(r => r.group))) {
  const entries = rows.filter(r => r.group === group && previews[r.url]);
  const parts = [];
  for (const [i, row] of entries.entries()) {
    const left = (i % 8) * 180, top = Math.floor(i / 8) * 220;
    parts.push({ input: await sharp(path.join('public', previews[row.url])).png().toBuffer(), left: left + 10, top });
    const label = row.id.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
    parts.push({ input: Buffer.from(`<svg width="180" height="40"><text x="4" y="18" font-size="10" font-family="Arial">${label}</text></svg>`), left, top: top + 180 });
  }
  if (parts.length) await sharp({ create: { width: 1440, height: Math.ceil(entries.length / 8) * 220, channels: 4, background: '#fff8e8' } }).composite(parts).png().toFile(`docs/qa/wardrobe/${group}.png`);
}
console.log(JSON.stringify({ assets: rows.length, problems: rows.filter(r => r.issues.length), thumbnailCount: Object.keys(previews).length }, null, 2));
