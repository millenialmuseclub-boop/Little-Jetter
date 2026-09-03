import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Human visual-QA aid only — never a production asset source. Renders a labeled
// grid, one row per slot, of the reference pieces plus everything newly
// generated, so a person can eyeball painterly-quality/palette consistency and
// motif correctness (no Eiffel Tower, etc.) in one glance instead of opening
// files one at a time.
export type ContactSheetCell = { label: string; imagePath: string; group: string };

const CELL_WIDTH = 140;
const CELL_HEIGHT = 210;
const LABEL_HEIGHT = 26;
const PADDING = 14;

function escapeXml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function buildContactSheet(cells: ContactSheetCell[], outputPath: string): Promise<void> {
  const groups = Array.from(new Set(cells.map((cell) => cell.group)));
  const maxCols = Math.max(1, ...groups.map((group) => cells.filter((cell) => cell.group === group).length));
  const sheetWidth = PADDING + maxCols * (CELL_WIDTH + PADDING);
  const sheetHeight = PADDING + groups.length * (CELL_HEIGHT + LABEL_HEIGHT + PADDING) + PADDING;

  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  const textParts: string[] = [];

  for (let row = 0; row < groups.length; row++) {
    const group = groups[row];
    const groupCells = cells.filter((cell) => cell.group === group);
    const rowTop = PADDING + row * (CELL_HEIGHT + LABEL_HEIGHT + PADDING);
    textParts.push(`<text x="${PADDING}" y="${rowTop + 14}" font-size="15" font-family="sans-serif" font-weight="700" fill="#173a47">${escapeXml(group)}</text>`);

    for (let col = 0; col < groupCells.length; col++) {
      const cell = groupCells[col];
      const left = PADDING + col * (CELL_WIDTH + PADDING);
      const cellTop = rowTop + LABEL_HEIGHT;
      try {
        const source = await fs.readFile(cell.imagePath);
        const thumb = await sharp(source)
          .resize(CELL_WIDTH, CELL_HEIGHT, { fit: 'contain', background: { r: 244, g: 238, b: 220, alpha: 1 } })
          .png()
          .toBuffer();
        composites.push({ input: thumb, left, top: cellTop });
      } catch {
        textParts.push(
          `<rect x="${left}" y="${cellTop}" width="${CELL_WIDTH}" height="${CELL_HEIGHT}" fill="#fbe4e1" stroke="#c0392b"/>` +
            `<text x="${left + CELL_WIDTH / 2}" y="${cellTop + CELL_HEIGHT / 2}" font-size="10" font-family="sans-serif" text-anchor="middle" fill="#c0392b">missing</text>`,
        );
      }
      textParts.push(
        `<text x="${left + CELL_WIDTH / 2}" y="${cellTop + CELL_HEIGHT + 15}" font-size="10" font-family="sans-serif" text-anchor="middle" fill="#173a47">${escapeXml(cell.label)}</text>`,
      );
    }
  }

  const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetWidth}" height="${sheetHeight}">${textParts.join('')}</svg>`;
  const overlayPng = await sharp(Buffer.from(overlaySvg)).png().toBuffer();
  composites.push({ input: overlayPng, left: 0, top: 0 });

  const sheet = await sharp({
    create: { width: sheetWidth, height: sheetHeight, channels: 4, background: { r: 251, g: 246, b: 233, alpha: 1 } },
  })
    .composite(composites)
    .png()
    .toBuffer();

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, sheet);
}
