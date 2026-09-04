// Crops the 14-city destination reference sheet into individual backdrop
// files matching the existing tokyo-doll-backdrop.png convention (used via
// `background:url(...) center/cover` on .little-doll-destination.scene-<id>).
import sharp from 'sharp';

const SRC = 'C:/Users/Jordann Lopez/Downloads/Codex Image Sep 4, 2026, 06_53_57 AM.png';
const OUT_DIR = 'public/little-jetter';

// Row-major, matches the sheet's 7x2 grid left-to-right, top-to-bottom.
const CITIES = [
  'seoul', 'honolulu', 'new-york', 'mexico-city', 'san-jose', 'vancouver', 'barcelona',
  'paris', 'nairobi', 'london', 'cartagena', 'rome', 'cape-town', 'sydney',
];

const COLS = 7;
const ROWS = 2;

async function main() {
  const meta = await sharp(SRC).metadata();
  const cellW = meta.width / COLS;
  const cellH = meta.height / ROWS;
  const LABEL_HEIGHT = 62; // crops out the baked-in city-name text at the top of each panel

  for (let i = 0; i < CITIES.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const left = Math.round(col * cellW);
    const top = Math.round(row * cellH) + LABEL_HEIGHT;
    const width = Math.round(cellW);
    const height = Math.round(cellH) - LABEL_HEIGHT;
    const outPath = `${OUT_DIR}/${CITIES[i]}-doll-backdrop.png`;
    await sharp(SRC).extract({ left, top, width, height }).png().toFile(outPath);
    console.log(CITIES[i], `${width}x${height}`, '->', outPath);
  }
}

main();
