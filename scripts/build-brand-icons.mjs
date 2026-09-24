import fs from 'node:fs/promises';
import sharp from 'sharp';

const source = 'resources/brand/app-icon-master.png';
const cream = { r: 255, g: 248, b: 232, alpha: 1 };
const master = await sharp(source).resize(1024, 1024, { fit: 'cover' }).flatten({ background: cream }).png().toBuffer();

await fs.mkdir('resources/brand', { recursive: true });
await sharp(master).toFile('resources/brand/app-icon-1024.png');
await sharp(master).resize(512, 512).toFile('resources/brand/google-play-icon-512.png');
await sharp(master).toFile('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');

// Android adaptive icons need a transparent foreground so launchers can apply
// their own circle, squircle, or rounded-square mask over the cream background.
const { data, info } = await sharp(master).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let index = 0; index < data.length; index += 4) {
  const lightness = Math.min(data[index], data[index + 1], data[index + 2]);
  if (lightness > 222 && data[index] - data[index + 2] < 45) {
    data[index + 3] = Math.max(0, Math.min(255, (222 - lightness) * 16 + 64));
  }
}
const foreground = await sharp(data, { raw: info }).png().toBuffer();

for (const [density, size, foregroundSize] of [
  ['mdpi', 48, 108],
  ['hdpi', 72, 162],
  ['xhdpi', 96, 216],
  ['xxhdpi', 144, 324],
  ['xxxhdpi', 192, 432],
]) {
  const directory = `android/app/src/main/res/mipmap-${density}`;
  await fs.mkdir(directory, { recursive: true });
  for (const name of ['ic_launcher', 'ic_launcher_round']) {
    await sharp(master).resize(size, size).png().toFile(`${directory}/${name}.png`);
  }
  await sharp(foreground).resize(foregroundSize, foregroundSize).png().toFile(`${directory}/ic_launcher_foreground.png`);
}

await fs.writeFile('android/app/src/main/res/values/ic_launcher_background.xml', '<?xml version="1.0" encoding="utf-8"?><resources><color name="ic_launcher_background">#FFF8E8</color></resources>\n');

const splashMark = await sharp(master).resize(900, 900).png().toBuffer();
const splash = await sharp({ create: { width: 2732, height: 2732, channels: 4, background: cream } })
  .composite([{ input: splashMark, left: 916, top: 916 }])
  .png().toBuffer();
for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  await sharp(splash).toFile(`ios/App/App/Assets.xcassets/Splash.imageset/${name}`);
}
for (const directory of await fs.readdir('android/app/src/main/res')) {
  if (!directory.startsWith('drawable')) continue;
  const file = `android/app/src/main/res/${directory}/splash.png`;
  try {
    const metadata = await sharp(file).metadata();
    await sharp(splash).resize(metadata.width, metadata.height, { fit: 'cover' }).png().toFile(`${file}.new.png`);
    await fs.rename(`${file}.new.png`, file);
  } catch (error) {
    if (error.code !== 'ENOENT' && !String(error.message).includes('Input file is missing')) throw error;
  }
}

console.log('Generated painterly iOS, Android adaptive/legacy, splash, and store icon assets.');
