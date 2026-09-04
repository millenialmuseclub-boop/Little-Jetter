// Crops the 2nd and 3rd destination reference sheets (14 cities each, 7x2
// grid, same convention as extract-destination-backdrops.mjs). Skips any
// city already covered by an existing -doll-backdrop.png (both sheets
// repeat a few cities from each other and from the original 14).
import sharp from 'sharp';
import fs from 'node:fs';

const OUT_DIR = 'public/little-jetter';
const COLS = 7;
const ROWS = 2;
const LABEL_HEIGHT = 62;

const SHEETS = [
  {
    src: 'C:/Users/Jordann Lopez/Downloads/Codex Image Sep 4, 2026, 06_59_57 AM.png',
    cities: ['amsterdam', 'reykjavik', 'marrakech', 'bangkok', 'singapore', 'dubai', 'santorini', 'lisbon', 'buenos-aires', 'quebec-city', 'kyoto', 'bali', 'auckland', 'rio-de-janeiro'],
  },
  {
    src: 'C:/Users/Jordann Lopez/Downloads/Codex Image Sep 4, 2026, 07_11_12 AM.png',
    cities: ['kyoto', 'bangkok', 'santorini', 'dubai', 'istanbul', 'mexico-city', 'lima', 'montreal', 'queenstown', 'petra', 'maldives', 'machu-picchu', 'zanzibar', 'vilnius'],
  },
];

async function main() {
  for (const sheet of SHEETS) {
    const meta = await sharp(sheet.src).metadata();
    const cellW = meta.width / COLS;
    const cellH = meta.height / ROWS;
    for (let i = 0; i < sheet.cities.length; i++) {
      const city = sheet.cities[i];
      const outPath = `${OUT_DIR}/${city}-doll-backdrop.png`;
      if (fs.existsSync(outPath)) { console.log(city, 'already exists, skipping'); continue; }
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const left = Math.round(col * cellW);
      const top = Math.round(row * cellH) + LABEL_HEIGHT;
      const width = Math.round(cellW);
      const height = Math.round(cellH) - LABEL_HEIGHT;
      await sharp(sheet.src).extract({ left, top, width, height }).png().toFile(outPath);
      console.log(city, `${width}x${height}`, '->', outPath);
    }
  }
}

main();
