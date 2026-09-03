import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateClosetAsset } from '../../../server/closet/generateClosetAsset';
import { REFERENCE_ASSET_URLS, TOKYO_GENERATION_MANIFEST } from '../../../server/closet/tokyoManifest';
import type { GenerationManifestEntry } from '../../../server/closet/tokyoManifest';

// Add a destination's manifest here once it has one (see server/closet/tokyoManifest.ts).
const MANIFESTS: Record<string, GenerationManifestEntry[]> = {
  tokyo: TOKYO_GENERATION_MANIFEST,
};

function isAuthorized(req: VercelRequest): boolean {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return false;
  return req.headers.authorization === `Bearer ${token}`;
}

type ItemResult = { itemId: string; color?: string; status: 'generated' | 'skipped' | 'reference' | 'error'; detail?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { destination, regenerate } = (req.body ?? {}) as { destination?: string; regenerate?: boolean };
  const manifest = destination ? MANIFESTS[destination] : undefined;
  if (!manifest) {
    res.status(400).json({ error: `No generation manifest for destination "${destination}".` });
    return;
  }

  const results: ItemResult[] = [];

  for (const entry of manifest) {
    if (entry.status === 'existing') {
      results.push({ itemId: entry.itemId, status: 'reference', detail: 'Canonical reference asset — never regenerated.' });
      continue;
    }
    for (const color of entry.colors ?? [undefined]) {
      try {
        const result = await generateClosetAsset({
          destinationId: entry.destinationId,
          slot: entry.slot,
          itemId: entry.itemId,
          itemPrompt: entry.itemPrompt,
          color,
          regenerate,
          referenceAsset: entry.referenceAsset ? REFERENCE_ASSET_URLS[entry.referenceAsset] : undefined,
        });
        results.push({
          itemId: entry.itemId,
          color,
          status: result.skipped ? 'skipped' : result.qc.ok ? 'generated' : 'error',
          detail: result.skipped ? 'Already exists.' : result.qc.ok ? result.asset.url : result.qc.issues.join('; '),
        });
      } catch (error) {
        results.push({ itemId: entry.itemId, color, status: 'error', detail: error instanceof Error ? error.message : 'Unknown error.' });
      }
    }
  }

  res.status(200).json({ destination, results });
}
