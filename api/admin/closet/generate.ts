import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateClosetAsset } from '../../../server/closet/generateClosetAsset.js';
import { REFERENCE_ASSET_URLS } from '../../../server/closet/tokyoManifest.js';
import type { ReferenceAssetKey } from '../../../server/closet/tokyoManifest.js';
import type { ClosetSlot } from '../../../server/closet/assetSpec.js';

type RequestBody = {
  destination?: string;
  slot?: ClosetSlot;
  itemId?: string;
  name?: string;
  description?: string;
  prompt?: string;
  color?: string;
  referenceAsset?: ReferenceAssetKey;
  regenerate?: boolean;
  quality?: 'low' | 'medium' | 'high';
};

function isAuthorized(req: VercelRequest): boolean {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return false; // fail closed: refuse every request until an operator sets a token
  return req.headers.authorization === `Bearer ${token}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const body = (req.body ?? {}) as RequestBody;
  if (!body.destination || !body.slot || !body.itemId || !body.prompt) {
    res.status(400).json({ error: 'destination, slot, itemId, and prompt are required.' });
    return;
  }

  try {
    const result = await generateClosetAsset({
      destinationId: body.destination,
      slot: body.slot,
      itemId: body.itemId,
      itemPrompt: body.prompt,
      color: body.color,
      referenceAsset: body.referenceAsset ? REFERENCE_ASSET_URLS[body.referenceAsset] : undefined,
      regenerate: body.regenerate,
      quality: body.quality,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed.' });
  }
}
