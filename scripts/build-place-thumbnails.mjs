import fs from 'node:fs/promises';
import sharp from 'sharp';
const ids = Object.keys(JSON.parse(await fs.readFile('src/data/exploreContent.json', 'utf8')));
await fs.mkdir('public/little-jetter/place-thumbnails', {recursive:true});
let before = 0, after = 0;
for (const id of ids) {
  const input = `public/little-jetter/${id}-doll-backdrop.png`;
  const output = `public/little-jetter/place-thumbnails/${id}.webp`;
  await sharp(input).resize(320,240,{fit:'cover'}).webp({quality:78}).toFile(output);
  before += (await fs.stat(input)).size; after += (await fs.stat(output)).size;
}
console.log(JSON.stringify({places:ids.length,originalBytes:before,thumbnailBytes:after}));
