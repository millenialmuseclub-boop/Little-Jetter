import fs from 'node:fs/promises';
import sharp from 'sharp';

const directory = 'public/little-jetter/catalog/tokyo/head';
for (const file of (await fs.readdir(directory)).filter((name) => name.startsWith('style-') && name.endsWith('.png')).sort()) {
  const { data, info } = await sharp(`${directory}/${file}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mask = new Uint8Array(info.width * info.height);
  for (let y = 120; y < 330; y++) for (let x = 180; x < 420; x++) {
    const index = (y * info.width + x) * 4;
    const brightness = data[index] * .299 + data[index + 1] * .587 + data[index + 2] * .114;
    if (data[index + 3] > 180 && brightness < 72) mask[y * info.width + x] = 1;
  }
  const seen = new Uint8Array(mask.length), components = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    const stack = [start]; let pixels = 0, sumX = 0, sumY = 0, left = 999, right = 0, top = 999, bottom = 0; seen[start] = 1;
    while (stack.length) {
      const current = stack.pop(), x = current % info.width, y = Math.floor(current / info.width);
      pixels++; sumX += x; sumY += y; left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      for (const next of [current - 1, current + 1, current - info.width, current + info.width]) if (next >= 0 && next < mask.length && mask[next] && !seen[next]) { seen[next] = 1; stack.push(next); }
    }
    if (pixels >= 8 && pixels <= 650) components.push({ pixels, x: sumX / pixels, y: sumY / pixels, width: right - left + 1, height: bottom - top + 1 });
  }
  let best = null;
  for (const left of components) for (const right of components) {
    if (left.x >= right.x || Math.abs(left.y - right.y) > 9) continue;
    const distance = right.x - left.x, midpoint = (left.x + right.x) / 2, vertical = (left.y + right.y) / 2;
    if (distance < 24 || distance > 100 || midpoint < 270 || midpoint > 330 || vertical < 160 || vertical > 300) continue;
    const score = Math.abs(midpoint - 300) + Math.abs(vertical - 235) * .25 + Math.abs(distance - 48) * .5 + Math.abs(left.pixels - right.pixels) * .02;
    if (!best || score < best.score) best = { score, left, right, distance: Math.round(distance * 10) / 10, midpoint: [Math.round(midpoint), Math.round(vertical)] };
  }
  console.log(file.slice(6, -4), best && { distance: best.distance, midpoint: best.midpoint, left: [Math.round(best.left.x), Math.round(best.left.y), best.left.pixels], right: [Math.round(best.right.x), Math.round(best.right.y), best.right.pixels] });
}
