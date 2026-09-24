import fs from 'node:fs/promises';
import sharp from 'sharp';

const directory = 'public/little-jetter/catalog/tokyo/head';
const files = (await fs.readdir(directory)).filter((file) => file.startsWith('style-') && file.endsWith('.png')).sort();

for (const file of files) {
  const { data, info } = await sharp(`${directory}/${file}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mask = new Uint8Array(info.width * info.height);
  for (let y = 80; y < 380; y++) for (let x = 150; x < 450; x++) {
    const index = (y * info.width + x) * 4;
    const [red, green, blue, alpha] = [data[index], data[index + 1], data[index + 2], data[index + 3]];
    if (alpha > 40 && red > 55 && red - green > 8 && green - blue > 5 && red > green * 1.06 && green > blue * 1.06) mask[y * info.width + x] = 1;
  }
  const seen = new Uint8Array(mask.length);
  let best = null;
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    const stack = [start];
    let pixels = 0, left = 999, top = 999, right = 0, bottom = 0, sumX = 0, sumY = 0;
    seen[start] = 1;
    while (stack.length) {
      const current = stack.pop();
      const x = current % info.width, y = Math.floor(current / info.width);
      pixels++; sumX += x; sumY += y;
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      for (const next of [current - 1, current + 1, current - info.width, current + info.width]) {
        if (next >= 0 && next < mask.length && mask[next] && !seen[next]) { seen[next] = 1; stack.push(next); }
      }
    }
    const centerX = sumX / pixels, centerY = sumY / pixels;
    if (pixels > 200 && centerX > 230 && centerX < 370 && centerY > 130 && centerY < 300 && (!best || pixels > best.pixels)) best = { pixels, left, top, right, bottom, centerX: Math.round(centerX), centerY: Math.round(centerY) };
  }
  console.log(file.slice(6, -4), best && { ...best, width: best.right - best.left + 1, height: best.bottom - best.top + 1 });
}
