import path from 'node:path';
import sharp from 'sharp';

const replacements = [
  ['bandana-bun', 'bandana-bun-source.png'],
  ['blonde-wavy-daisy', 'blonde-wavy-daisy-source.png'],
  ['braids-auburn', 'braids-auburn-source.png'],
  ['cap-brown', 'cap-brown-source.png'],
  ['cap-tan-boy', 'cap-tan-boy-source.png'],
  ['bow-curly', 'bow-curly-source.png'],
  ['curly-auburn-boy', 'curly-auburn-boy-source.png'],
  ['messy-bun', 'messy-bun-source.png'],
  ['short-dark-boy', 'short-dark-boy-source.png'],
  ['wavy-blonde-boy', 'wavy-blonde-boy-source.png'],
  ['wavy-brown-boy', 'wavy-brown-boy-source.png'],
  ['wavy-clip', 'wavy-clip-source.png'],
];

const canvasWidth = 600;
const canvasHeight = 900;
const paintedWidth = 220;
const neckBottom = 342;

for (const [id, sourceName] of replacements) {
  const source = path.resolve('resources', 'head-replacements', sourceName);
  const output = path.resolve('public', 'little-jetter', 'catalog', 'tokyo', 'head', `style-${id}.png`);
  const painted = await sharp(source)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
    .resize({ width: paintedWidth })
    .png()
    .toBuffer();
  const metadata = await sharp(painted).metadata();
  const left = Math.round((canvasWidth - (metadata.width ?? paintedWidth)) / 2);
  const top = neckBottom - (metadata.height ?? 0) + 1;

  if (top < 0) throw new Error(`${id} is too tall for the shared head canvas.`);

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: painted, left, top }])
    .png()
    .toFile(output);

  console.log(`${id}: ${metadata.width}x${metadata.height} at ${left},${top}`);
}
