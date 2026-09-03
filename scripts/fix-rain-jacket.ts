// Regenerates the rain jacket — one of the 5 "canonical, do not regenerate"
// Tokyo reference assets, overridden here because its sleeves are visibly
// shorter than the body's arms (a gap of bare skin at the wrist that doesn't
// happen with any other jacket), reported directly by the user. Uses the
// well-fitting trench coat as the style/proportion reference instead of
// itself, so the sleeve-length issue doesn't reproduce.
// Run with: npx tsx scripts/fix-rain-jacket.ts
import path from 'node:path';
import dotenv from 'dotenv';
import { generateClosetAsset } from '../server/closet/generateClosetAsset';
import { buildContactSheet } from '../server/closet/contactSheet';
import type { ContactSheetCell } from '../server/closet/contactSheet';

dotenv.config({ path: '.env.local' });

const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');
function urlToLocalPath(url: string): string {
  return path.join(PUBLIC_ROOT, url.replace(/^\//, ''));
}

async function main() {
  const result = await generateClosetAsset({
    destinationId: 'tokyo',
    slot: 'outerwear',
    itemId: 'rain',
    itemPrompt: 'A bright yellow hooded rain slicker with snap-button front closure and two patch pockets, worn open over a top. The sleeves must be full-length, reaching all the way to the wrist with no gap of bare arm showing past the cuff — match the same sleeve-to-body proportion as a standard child\'s jacket, not shortened.',
    referenceAsset: '/little-jetter/catalog/tokyo/trench-coat/default.png',
    quality: 'high',
    regenerate: true,
  });

  console.log(result.qc.ok ? `done -> ${result.asset.url}` : `QC FAILED: ${result.qc.issues.join('; ')}`);
  if (result.qc.warnings.length > 0) console.log('warnings:', result.qc.warnings.join('; '));

  const cells: ContactSheetCell[] = [
    { label: 'rain (new)', imagePath: urlToLocalPath(result.asset.url), group: 'outerwear' },
    { label: 'trench-coat (reference)', imagePath: path.join(PUBLIC_ROOT, 'little-jetter/catalog/tokyo/trench-coat/default.png'), group: 'outerwear' },
  ];
  await buildContactSheet(cells, path.resolve(process.cwd(), 'docs', 'qa', 'rain-fix-check.png'));
  console.log('contact sheet written');
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
