import sharp from 'sharp';

const ids = [
  'cap-green-boy',
  'cap-tan-boy',
  'curly-auburn-boy',
  'curly-fro-boy',
  'short-dark-boy',
  'wavy-blonde-boy',
  'wavy-brown-boy',
];

for (const id of ids) {
  const file = `public/little-jetter/catalog/tokyo/head/style-${id}.png`;
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const original = Buffer.from(data);
  const isSkin = (index) => original[index + 3] > 150 && original[index] > original[index + 1] * 1.05 && original[index] > original[index + 2] * 1.1;

  // Follow the existing lower face boundary and deepen only its last two
  // painted pixels. The center neck is intentionally skipped so this reads as
  // a jaw/chin contour rather than a line across the neck.
  for (let x = 205; x <= 395; x++) {
    let edgeY = -1;
    for (let y = 270; y <= 328; y++) {
      const index = (y * info.width + x) * 4;
      if (isSkin(index)) edgeY = y;
    }
    if (edgeY < 288 || edgeY > 325) continue;
    for (let inset = 0; inset < 2; inset++) {
      const y = edgeY - inset;
      const index = (y * info.width + x) * 4;
      if (!isSkin(index)) continue;
      const amount = inset === 0 ? 0.84 : 0.92;
      data[index] = Math.round(data[index] * amount);
      data[index + 1] = Math.round(data[index + 1] * amount);
      data[index + 2] = Math.round(data[index + 2] * amount);
    }
  }

  // Feather the hard sheet-crop edge into the matching body neck. This keeps
  // the head opaque at the chin and removes the visible horizontal cutoff.
  for (let y = 327; y <= 332; y++) {
    const opacity = Math.round(255 * ((333 - y) / 6));
    for (let x = 265; x <= 335; x++) {
      const index = (y * info.width + x) * 4;
      if (data[index + 3] > opacity) data[index + 3] = opacity;
    }
  }

  await sharp(data, { raw: info }).png().toFile(`${file}.next.png`);
  await sharp(`${file}.next.png`).toFile(file);
  await import('node:fs/promises').then(({ unlink }) => unlink(`${file}.next.png`));
  console.log(`Strengthened ${id}`);
}
