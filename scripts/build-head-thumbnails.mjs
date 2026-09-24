import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = 'public/little-jetter/catalog/tokyo/head';
const outputDir = 'public/little-jetter/head-thumbnails';
await fs.mkdir(outputDir, { recursive: true });

const files = (await fs.readdir(sourceDir)).filter((name) => name.startsWith('style-') && name.endsWith('.png')).sort();
for (const name of files) {
  const input = path.join(sourceDir, name);
  const id = name.slice('style-'.length, -'.png'.length);
  // Every full head uses the same master-canvas landmarks. A fixed portrait
  // window keeps face size consistent in the picker; trimming to each hair
  // silhouette made long styles look much smaller than short styles.
  await sharp(input)
    .extract({ left: 100, top: 70, width: 400, height: 450 })
    .resize(176, 176, { fit: 'contain', background: '#00000000' })
    .webp({ quality: 88, alphaQuality: 95 })
    .toFile(path.join(outputDir, `${id}.webp`));
}

console.log(JSON.stringify({ completeHeads: files.length, thumbnails: files.length, outputDir }, null, 2));
