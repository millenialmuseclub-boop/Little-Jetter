// Local, one-command wardrobe generation. Run with:
//   npm run generate:tokyo
//   npm run generate:tokyo -- --regenerate
// Reuses the exact same server/closet library the deployed /api/admin/closet
// routes call, so behavior never drifts between "run it locally" and "hit the
// live endpoint." Requires OPENAI_API_KEY in .env.local (never committed).
import path from 'node:path';
import dotenv from 'dotenv';
import { generateClosetAsset } from '../server/closet/generateClosetAsset';
import { REFERENCE_ASSET_URLS, TOKYO_GENERATION_MANIFEST } from '../server/closet/tokyoManifest';
import { getGenericDescription, upsertTokyoCatalogEntry } from '../server/closet/catalogWriter';
import { buildContactSheet } from '../server/closet/contactSheet';
import type { ContactSheetCell } from '../server/closet/contactSheet';

dotenv.config({ path: '.env.local' });

const destinationId = process.argv[2];
const regenerate = process.argv.includes('--regenerate');

const MANIFESTS: Record<string, typeof TOKYO_GENERATION_MANIFEST> = { tokyo: TOKYO_GENERATION_MANIFEST };
const GROUP_LABEL: Record<string, string> = { top: 'tops', bottom: 'bottoms', outerwear: 'layers', shoes: 'shoes', accessory: 'accessories' };
const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');

function urlToLocalPath(url: string): string {
  return path.join(PUBLIC_ROOT, url.replace(/^\//, ''));
}

async function main() {
  const manifest = destinationId ? MANIFESTS[destinationId] : undefined;
  if (!manifest) {
    console.error(`Usage: npm run generate:<destination> -- [--regenerate]\nNo manifest for "${destinationId}". Known: ${Object.keys(MANIFESTS).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  let failures = 0;
  const generatedFilenames: string[] = [];
  const rejected: string[] = [];
  const catalogUpdates: string[] = [];
  const contactCells: ContactSheetCell[] = [];

  for (const referenceKey of Object.keys(REFERENCE_ASSET_URLS) as Array<keyof typeof REFERENCE_ASSET_URLS>) {
    const url = REFERENCE_ASSET_URLS[referenceKey];
    contactCells.push({ label: `${referenceKey} (reference)`, imagePath: urlToLocalPath(url), group: 'reference' });
  }

  for (const entry of manifest) {
    if (entry.status === 'existing') {
      console.log(`reference  ${entry.itemId} (skipped — canonical asset)`);
      continue;
    }

    const colorList = entry.colors ?? [undefined];
    const resultsByColor: Array<{ color?: string; url: string }> = [];
    let entryOk = true;

    for (const color of colorList) {
      const label = color ? `${entry.itemId}-${color}` : entry.itemId;
      const maxAttempts = 2;
      let lastFailureLog = '';
      let succeeded = false;

      for (let attempt = 1; attempt <= maxAttempts && !succeeded; attempt++) {
        process.stdout.write(`${label}${attempt > 1 ? ` (retry ${attempt - 1})` : ''} ... `);
        try {
          const result = await generateClosetAsset({
            destinationId: entry.destinationId,
            slot: entry.slot,
            itemId: entry.itemId,
            itemPrompt: entry.itemPrompt,
            color,
            // Only the retry forces regeneration; the first attempt still honors
            // the caller's --regenerate flag and existing-asset skip.
            regenerate: attempt > 1 ? true : regenerate,
            referenceAsset: entry.referenceAsset ? REFERENCE_ASSET_URLS[entry.referenceAsset] : undefined,
          });
          if (result.skipped) {
            console.log('already exists (skipped — pass --regenerate to redo)');
            succeeded = true;
          } else if (result.qc.ok) {
            console.log(`done -> ${result.asset.url}`);
            if (result.qc.warnings.length > 0) {
              console.log(`  warning (review, not blocking): ${result.qc.warnings.join('; ')}`);
            }
            succeeded = true;
          } else {
            lastFailureLog = `QC FAILED: ${result.qc.issues.join('; ')}`;
            console.log(lastFailureLog);
          }
          if (succeeded) {
            resultsByColor.push({ color, url: result.asset.url });
            generatedFilenames.push(result.asset.storageKey);
            contactCells.push({ label, imagePath: urlToLocalPath(result.asset.url), group: GROUP_LABEL[entry.slot] });
          }
        } catch (error) {
          lastFailureLog = `ERROR: ${error instanceof Error ? error.message : String(error)}`;
          console.log(lastFailureLog);
        }
      }

      if (!succeeded) {
        failures += 1;
        entryOk = false;
        rejected.push(label);
        console.log(`${label}: gave up after ${maxAttempts} attempts — ${lastFailureLog}`);
      }
    }

    // Only wire the item into the catalog once every one of its colors (or its
    // single default) actually passed — a partially-real item is worse than
    // leaving it on the vector fallback.
    if (entryOk && resultsByColor.length > 0) {
      const defaultResult = resultsByColor.find((r) => r.color === undefined) ?? resultsByColor[0];
      const group = GROUP_LABEL[entry.slot];
      const description = (await getGenericDescription(group, entry.itemId)) ?? entry.name;
      await upsertTokyoCatalogEntry({
        destinationId: entry.destinationId,
        slot: entry.slot,
        itemId: entry.itemId,
        name: entry.name,
        description,
        defaultUrl: defaultResult.url,
        variants: entry.colors ? resultsByColor.filter((r): r is { color: string; url: string } => !!r.color) : undefined,
      });
      catalogUpdates.push(entry.itemId);
      console.log(`catalog updated -> destinations.${entry.destinationId}.${group} (${entry.itemId})`);
    } else if (resultsByColor.length > 0) {
      console.log(`catalog NOT updated for ${entry.itemId} — one or more color variants failed; leaving the vector fallback in place.`);
    }
  }

  if (contactCells.length > 5) {
    const sheetPath = path.resolve(process.cwd(), 'docs', 'qa', 'tokyo-contact-sheet.png');
    await buildContactSheet(contactCells, sheetPath);
    console.log(`\nContact sheet written to ${path.relative(process.cwd(), sheetPath)} (visual QA only — not a production asset).`);
  }

  console.log('\nAutomated QC only covers canvas size, alpha, transparency, slot-bounds fit, and a disconnected-object heuristic.');
  console.log('Still required before shipping any of these:');
  console.log('  - Look at the contact sheet and confirm painterly quality/palette matches the 5 reference pieces.');
  console.log('  - Confirm no Eiffel Tower or other non-Tokyo motifs slipped in.');
  console.log('  - Run the app and check doll alignment at mobile/tablet/desktop widths.');

  console.log(`\nGenerated: ${generatedFilenames.length}`);
  generatedFilenames.forEach((name) => console.log(`  ${name}`));
  console.log(`Rejected: ${rejected.length}`);
  rejected.forEach((name) => console.log(`  ${name}`));
  console.log(`Catalog entries updated: ${catalogUpdates.length ? catalogUpdates.join(', ') : 'none'}`);

  if (failures > 0) process.exitCode = 1;
}

main();
