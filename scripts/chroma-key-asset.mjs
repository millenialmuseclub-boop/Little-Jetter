import sharp from 'sharp';

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: node scripts/chroma-key-asset.mjs <input> <output>');

const { data, info } = await sharp(input).resize(600, 900).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += info.channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const dominance = g - Math.max(r, b);
  const key = Math.max(0, Math.min(1, Math.min((dominance - 18) / 72, (g - 105) / 120)));
  data[i + 3] = Math.round(data[i + 3] * (1 - key));
  if (key > 0) data[i + 1] = Math.min(data[i + 1], Math.max(r, b) + 10);
}
await sharp(data, { raw: info }).png().toFile(output);
