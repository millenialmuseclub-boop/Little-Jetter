import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildGenerationPrompt, STYLE_VERSION } from './stylePrompt';
import { generateClosetImage } from './openaiClient';
import { normalizeToClosetCanvas, qcCheck } from './imageProcessing';
import { getClosetAssetStorage } from './storage';
import type { ClosetSlot } from './assetSpec';
import type { QcResult } from './imageProcessing';
import type { SavedClosetAsset } from './storage';

const GENERATION_MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2';

export type GenerateClosetAssetInput = {
  destinationId: string;
  slot: ClosetSlot;
  itemId: string;
  itemPrompt: string;
  color?: string;
  /** Public-root-relative path (e.g. "/little-jetter/catalog/tokyo/stripe/coral.png") to an existing asset to steer style from. */
  referenceAsset?: string;
  quality?: 'low' | 'medium' | 'high';
  /** Force regeneration even if an asset already exists at this (destination, item, color). */
  regenerate?: boolean;
};

export type GenerateClosetAssetResult = {
  asset: SavedClosetAsset;
  qc: QcResult;
  /** True when an existing asset was reused instead of calling the image model. */
  skipped: boolean;
};

async function readReferenceImage(referenceAsset: string): Promise<Buffer> {
  const relative = referenceAsset.replace(/^\//, '');
  return fs.readFile(path.resolve(process.cwd(), 'public', relative));
}

export async function generateClosetAsset(input: GenerateClosetAssetInput): Promise<GenerateClosetAssetResult> {
  const storage = getClosetAssetStorage();
  const metadata = { destinationId: input.destinationId, slot: input.slot, itemId: input.itemId, color: input.color };

  if (!input.regenerate) {
    const existing = await storage.getExistingAsset(metadata);
    const previousRecord = existing ? await storage.getGenerationRecord(metadata) : undefined;
    // Only treat it as done if we know it actually passed QC. A file can exist on
    // disk from a prior failed attempt (saveClosetAsset always writes, even when
    // QC rejects the result) — silently reusing that would ship the bad asset.
    if (existing && previousRecord?.validation.ok) {
      return { asset: existing, qc: previousRecord.validation, skipped: true };
    }
  }

  const prompt = buildGenerationPrompt({
    destinationId: input.destinationId,
    slot: input.slot,
    itemPrompt: input.itemPrompt,
    color: input.color,
  });

  const referenceImage = input.referenceAsset ? await readReferenceImage(input.referenceAsset) : undefined;
  const raw = await generateClosetImage({ prompt, referenceImage, quality: input.quality });
  const normalized = await normalizeToClosetCanvas(raw, input.slot);
  const qc = await qcCheck(normalized, input.slot);
  const asset = await storage.saveClosetAsset(normalized, metadata);

  const previous = await storage.getGenerationRecord(metadata);
  await storage.saveGenerationRecord({
    destinationId: input.destinationId,
    itemId: input.itemId,
    slot: input.slot,
    color: input.color,
    filename: asset.storageKey.split('/').pop() ?? '',
    model: GENERATION_MODEL,
    styleVersion: STYLE_VERSION,
    prompt,
    referenceAsset: input.referenceAsset,
    timestamp: new Date().toISOString(),
    storageUrl: asset.url,
    storageKey: asset.storageKey,
    validation: qc,
    attempt: (previous?.attempt ?? 0) + 1,
  });

  return { asset, qc, skipped: false };
}
