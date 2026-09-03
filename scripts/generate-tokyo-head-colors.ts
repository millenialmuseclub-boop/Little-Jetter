// Follow-up generation: hair-color variants for the Tokyo painterly heads.
// The first pass (generate-tokyo-heads.ts) baked every head with one fixed
// "warm chestnut-brown" hair color, so the hair-color picker had nothing to
// recolor once the illustrated head took over from the SVG fallback. This
// generates each of the 4 hairstyles (at the app's default "golden" skin
// tone) in the app's other 5 hair-color options.
// Run with: npx tsx scripts/generate-tokyo-head-colors.ts
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

// Matches characterOptions.hair in src/LittleJetterApp.tsx. "brown" is already
// covered by the first-pass assets (head-<style>-golden.png) — not regenerated here.
const HAIR_COLOR_PROMPTS: Record<string, string> = {
  black: 'deep warm black hair color',
  auburn: 'warm reddish-auburn hair color',
  blonde: 'warm golden-blonde hair color',
  red: 'bright warm copper-red hair color',
  blue: 'playful soft indigo-blue hair color (a fun fantasy tint, not natural)',
};

const HEAD_PROMPT = (hairstyle: string, hairColorPrompt: string) => [
  'A single painted children\'s-book illustration of a friendly child\'s HEAD, FACE, AND HAIR only — not just hair, the complete head including the painted face beneath it.',
  'Rounded, soft cartoon head shape with full cheeks, warm golden-tan skin rendered with the same soft rounded gradient shading and warm highlight as the clothing pieces (a lit highlight toward the upper-left, gentle shadow toward the lower-right).',
  'Large friendly dark warm-brown eyes with a round white catchlight highlight in each, soft short eyebrows, small soft blush on both cheeks, a small closed gentle smile.',
  `Hair: ${HAIRSTYLE_PROMPTS[hairstyle]}, ${hairColorPrompt}, painted with visible individual strand/texture linework and soft directional shading — the same fabric-like shading treatment as the jacket and backpack, not a flat single-tone silhouette.`,
  'Head is cropped just below the chin/jawline — no neck, no shoulders, no torso, no body, no hands.',
].join(' ');

type HeadJob = { hairstyle: string; hairColor: string; color: string };
const HAIRSTYLES = ['curls', 'short', 'bob', 'coils'];
const HAIR_COLORS = Object.keys(HAIR_COLOR_PROMPTS);

const JOBS: HeadJob[] = HAIRSTYLES.flatMap((hairstyle) =>
  HAIR_COLORS.map((hairColor) => ({ hairstyle, hairColor, color: `${hairstyle}-golden-${hairColor}` })),
);

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
          itemPrompt: HEAD_PROMPT(job.hairstyle, HAIR_COLOR_PROMPTS[job.hairColor]),
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

  const sheetPath = path.resolve(process.cwd(), 'docs', 'qa', 'tokyo-head-color-contact-sheet.png');
  await buildContactSheet(contactCells, sheetPath);
  console.log(`\nContact sheet written to ${path.relative(process.cwd(), sheetPath)}`);

  if (failures > 0) process.exitCode = 1;
}

main();
