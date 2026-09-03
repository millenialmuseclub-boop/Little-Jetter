// Follow-up generation: fill in the missing (hairStyle, skin) combos at the
// default "brown" hair color. The first two passes only covered "golden" skin
// for short/bob/coils, and only curls got porcelain/deep — every other skin
// tone on those styles fell back to the flat SVG vector head. This generates
// the remaining 18 combos so no skin tone reverts to vector on any hairstyle.
// Run with: npx tsx scripts/generate-tokyo-head-skins.ts
import path from 'node:path';
import dotenv from 'dotenv';
import { generateClosetAsset } from '../server/closet/generateClosetAsset';
import { REFERENCE_ASSET_URLS } from '../server/closet/tokyoManifest';
import { buildContactSheet } from '../server/closet/contactSheet';
import type { ContactSheetCell } from '../server/closet/contactSheet';

dotenv.config({ path: '.env.local' });

const regenerate = process.argv.includes('--regenerate');
const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');
function urlToLocalPath(url: string): string {
  return path.join(PUBLIC_ROOT, url.replace(/^\//, ''));
}

const HAIRSTYLE_PROMPTS: Record<string, string> = {
  curls: 'a rounded halo of soft, bouncy shoulder-length curls framing the face, individual curl clusters with visible strand texture and gentle highlight/shadow modeling',
  short: 'a neat short crop, close to the head with soft feathered texture and a light side part, individual short strands visible',
  bob: 'a smooth chin-length bob with a soft inward curl at the ends, gentle sheen highlight along the crown',
  coils: 'a rounded crown of small coily puffs/afro texture, each puff softly shaded with visible coil texture and a warm highlight on top',
};

// Matches characterOptions.skin in src/LittleJetterApp.tsx.
const SKIN_PROMPTS: Record<string, string> = {
  porcelain: 'fair porcelain skin with a soft peachy undertone',
  peach: 'light warm peachy-tan skin',
  golden: 'warm golden-tan skin',
  caramel: 'warm mid-toned caramel-brown skin',
  brown: 'rich warm brown skin',
  deep: 'deep warm brown skin',
};

const HEAD_PROMPT = (hairstyle: string, skin: string) => [
  'A single painted children\'s-book illustration of a friendly child\'s HEAD, FACE, AND HAIR only — not just hair, the complete head including the painted face beneath it.',
  `Rounded, soft cartoon head shape with full cheeks, ${SKIN_PROMPTS[skin]} rendered with the same soft rounded gradient shading and warm highlight as the clothing pieces (a lit highlight toward the upper-left, gentle shadow toward the lower-right).`,
  'Large friendly dark warm-brown eyes with a round white catchlight highlight in each, soft short eyebrows, small soft blush on both cheeks, a small closed gentle smile.',
  `Hair: ${HAIRSTYLE_PROMPTS[hairstyle]}, warm chestnut-brown hair color, painted with visible individual strand/texture linework and soft directional shading — the same fabric-like shading treatment as the jacket and backpack, not a flat single-tone silhouette.`,
  'Head is cropped just below the chin/jawline — no neck, no shoulders, no torso, no body, no hands.',
].join(' ');

type HeadJob = { hairstyle: string; skin: string; color: string };

// Already covered (do not regenerate): curls x {golden,porcelain,deep}, short/bob/coils x golden.
const JOBS: HeadJob[] = [
  { hairstyle: 'curls', skin: 'peach', color: 'curls-peach' },
  { hairstyle: 'curls', skin: 'caramel', color: 'curls-caramel' },
  { hairstyle: 'curls', skin: 'brown', color: 'curls-brown' },
  ...(['short', 'bob', 'coils'] as const).flatMap((hairstyle) =>
    (['porcelain', 'peach', 'caramel', 'brown', 'deep'] as const).map((skin) => ({
      hairstyle,
      skin,
      color: `${hairstyle}-${skin}`,
    })),
  ),
];

async function main() {
  const contactCells: ContactSheetCell[] = [];
  contactCells.push({ label: 'stripe (style reference)', imagePath: urlToLocalPath(REFERENCE_ASSET_URLS.stripe), group: 'reference' });

  let failures = 0;
  for (const job of JOBS) {
    const label = `head-${job.color}`;
    const maxAttempts = 2;
    let lastFailureLog = '';
    let succeeded = false;

    for (let attempt = 1; attempt <= maxAttempts && !succeeded; attempt++) {
      process.stdout.write(`${label}${attempt > 1 ? ` (retry ${attempt - 1})` : ''} ... `);
      try {
        const result = await generateClosetAsset({
          destinationId: 'tokyo',
          slot: 'hair',
          itemId: 'head',
          itemPrompt: HEAD_PROMPT(job.hairstyle, job.skin),
          color: job.color,
          referenceAsset: REFERENCE_ASSET_URLS.stripe,
          quality: 'high',
          regenerate: attempt > 1 ? true : regenerate,
        });
        if (result.skipped) {
          console.log('already exists (skipped — pass --regenerate to redo)');
          succeeded = true;
        } else if (result.qc.ok) {
          console.log(`done -> ${result.asset.url}`);
          if (result.qc.warnings.length > 0) console.log(`  warning: ${result.qc.warnings.join('; ')}`);
          succeeded = true;
        } else {
          lastFailureLog = `QC FAILED: ${result.qc.issues.join('; ')}`;
          console.log(lastFailureLog);
        }
        if (succeeded) contactCells.push({ label, imagePath: urlToLocalPath(result.asset.url), group: job.hairstyle });
      } catch (error) {
        lastFailureLog = `ERROR: ${error instanceof Error ? error.message : String(error)}`;
        console.log(lastFailureLog);
      }
    }

    if (!succeeded) {
      failures += 1;
      console.log(`${label}: gave up after ${maxAttempts} attempts — ${lastFailureLog}`);
    }
  }

  const sheetPath = path.resolve(process.cwd(), 'docs', 'qa', 'tokyo-head-skin-contact-sheet.png');
  await buildContactSheet(contactCells, sheetPath);
  console.log(`\nContact sheet written to ${path.relative(process.cwd(), sheetPath)}`);

  if (failures > 0) process.exitCode = 1;
}

main();
