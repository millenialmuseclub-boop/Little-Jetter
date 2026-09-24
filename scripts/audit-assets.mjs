import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicRoot = path.join(root, 'public');
const catalog = JSON.parse(await readFile(path.join(root, 'src/data/dressUpCatalog.json'), 'utf8'));
const canonical = { width: catalog.template.width, height: catalog.template.height };

function publicPath(url) {
  return path.join(publicRoot, url.replace(/^\//, '').split('/').join(path.sep));
}

function alphaComponents(alpha, width) {
  const visited = new Uint8Array(alpha.length);
  const sizes = [];
  for (let start = 0; start < alpha.length; start += 1) {
    if (visited[start] || alpha[start] < 24) continue;
    let size = 0;
    const queue = [start];
    visited[start] = 1;
    while (queue.length) {
      const index = queue.pop();
      size += 1;
      const x = index % width;
      const neighbors = [index - width, index + width];
      if (x > 0) neighbors.push(index - 1);
      if (x < width - 1) neighbors.push(index + 1);
      for (const next of neighbors) {
        if (next >= 0 && next < alpha.length && !visited[next] && alpha[next] >= 24) {
          visited[next] = 1;
          queue.push(next);
        }
      }
    }
    if (size >= 8) sizes.push(size);
  }
  return sizes.sort((a, b) => b - a);
}

async function inspectAsset(record) {
  const file = publicPath(record.imageUrl);
  const failures = [];
  let bytes;
  try {
    bytes = await readFile(file);
  } catch {
    return { ...record, status: 'rejected', failures: ['missing-file'] };
  }
  const image = sharp(bytes, { failOn: 'error' });
  const metadata = await image.metadata();
  if (metadata.width !== canonical.width || metadata.height !== canonical.height) failures.push(`wrong-dimensions:${metadata.width}x${metadata.height}`);
  if (!metadata.hasAlpha) failures.push('missing-alpha-channel');
  const { data, info } = await image.ensureAlpha().resize(120, 180, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const alpha = new Uint8Array(info.width * info.height);
  let visible = 0;
  let edge = 0;
  for (let i = 0; i < alpha.length; i += 1) {
    const value = data[(i * 4) + 3];
    alpha[i] = value;
    if (value >= 24) {
      visible += 1;
      const x = i % info.width;
      const y = Math.floor(i / info.width);
      if (x === 0 || y === 0 || x === info.width - 1 || y === info.height - 1) edge += 1;
    }
  }
  if (visible < 30) failures.push('empty-or-nearly-empty-alpha');
  if (edge > 0) failures.push('visible-pixels-touch-canvas-edge');
  const components = alphaComponents(alpha, info.width);
  if (record.slot === 'outerwear' && components[1] && components[1] / components[0] > 0.08) failures.push('multiple-large-alpha-components');
  if (!record.enabled) failures.push(record.disabledReason || 'disabled-by-visual-qc');
  return {
    ...record,
    status: failures.length ? 'rejected' : 'accepted',
    failures,
    width: metadata.width,
    height: metadata.height,
    hasAlpha: Boolean(metadata.hasAlpha),
    visiblePixelRatio: Number((visible / alpha.length).toFixed(4)),
    alphaComponents: components.slice(0, 5),
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

const garmentRecords = [];
for (const [destinationId, groups] of Object.entries(catalog.destinations)) {
  for (const [group, items] of Object.entries(groups)) {
    for (const item of items) {
      if (!item.imageUrl) continue;
      const variants = item.variants?.length ? item.variants : [{ id: 'default', imageUrl: item.imageUrl, thumbnailUrl: item.thumbnailUrl }];
      for (const variant of variants) garmentRecords.push({
        kind: 'garment',
        id: `${destinationId}:${group}:${item.id}:${variant.id || 'default'}`,
        destinationId,
        group,
        itemId: item.id,
        variantId: variant.id || 'default',
        slot: item.slot,
        imageUrl: variant.imageUrl,
        thumbnailUrl: variant.thumbnailUrl || item.thumbnailUrl,
        enabled: item.enabled !== false,
        disabledReason: item.disabledReason,
      });
    }
  }
}

const headDir = path.join(publicRoot, 'little-jetter/catalog/tokyo/head');
const headFiles = (await readdir(headDir)).filter((name) => /^style-.+\.png$/i.test(name));
const headRecords = headFiles.map((name) => ({
  kind: 'head',
  id: name.slice(6, -4),
  slot: 'head',
  imageUrl: `/little-jetter/catalog/tokyo/head/${name}`,
  thumbnailUrl: `/little-jetter/head-thumbnails/${name.slice(6, -4)}.webp`,
  enabled: true,
}));

const records = [];
for (const record of [...headRecords, ...garmentRecords]) records.push(await inspectAsset(record));
for (const record of records) {
  if (record.thumbnailUrl) {
    try { await readFile(publicPath(record.thumbnailUrl)); }
    catch { record.status = 'rejected'; record.failures.push('missing-thumbnail'); }
  }
}

const hashes = new Map();
for (const record of records) {
  if (!record.sha256) continue;
  const matches = hashes.get(record.sha256) || [];
  matches.push(record.id);
  hashes.set(record.sha256, matches);
}
const duplicates = [...hashes.values()].filter((ids) => ids.length > 1);
const duplicateIds = [...new Set(records.map((record) => record.id).filter((id, index, ids) => ids.indexOf(id) !== index))];
const accepted = records.filter((record) => record.status === 'accepted');
const rejected = records.filter((record) => record.status === 'rejected');
const report = {
  generatedAt: new Date().toISOString(),
  template: catalog.template,
  summary: {
    total: records.length,
    accepted: accepted.length,
    rejected: rejected.length,
    heads: headRecords.length,
    enabledOuterwear: garmentRecords.filter((record) => record.slot === 'outerwear' && record.enabled).length,
    disabledOuterwear: garmentRecords.filter((record) => record.slot === 'outerwear' && !record.enabled).length,
    duplicateContentGroups: duplicates.length,
    duplicateIds: duplicateIds.length,
  },
  duplicateIds,
  duplicateContent: duplicates,
  rejected: rejected.map(({ id, kind, imageUrl, failures }) => ({ id, kind, imageUrl, failures })),
  records,
};
await mkdir(path.join(root, 'docs/qa'), { recursive: true });
await writeFile(path.join(root, 'docs/qa/asset-qc.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
if (duplicateIds.length) process.exitCode = 1;
