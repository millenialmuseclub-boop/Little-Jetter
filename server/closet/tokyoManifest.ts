// Generation-specific manifest for Tokyo. The list of *what's* pending lives in
// one place only — src/data/garmentManifest.ts's PENDING_TOKYO_GARMENTS, which the
// client also reads (to badge un-illustrated drawer items). This file only adds
// generation-specific metadata on top of that same list: prompts, color variants,
// and which existing reference asset to steer style from.
import { PENDING_TOKYO_GARMENTS, catalogAssetPath } from '../../src/data/garmentManifest.js';
import type { ClosetSlot } from './assetSpec.js';

export type ReferenceAssetKey = 'stripe' | 'rain' | 'travel-jeans' | 'sneakers' | 'crossbody';

export const REFERENCE_ASSET_URLS: Record<ReferenceAssetKey, string> = {
  stripe: catalogAssetPath('tokyo', 'stripe', 'coral'),
  rain: catalogAssetPath('tokyo', 'rain'),
  'travel-jeans': catalogAssetPath('tokyo', 'travel-jeans'),
  sneakers: catalogAssetPath('tokyo', 'sneakers'),
  crossbody: catalogAssetPath('tokyo', 'crossbody'),
};

const REFERENCE_ASSET_BY_SLOT: Record<ClosetSlot, ReferenceAssetKey | undefined> = {
  hair: undefined,
  top: 'stripe',
  outerwear: 'rain',
  bottom: 'travel-jeans',
  shoes: 'sneakers',
  accessory: 'crossbody',
};

const GROUP_TO_SLOT: Record<string, ClosetSlot> = {
  tops: 'top',
  bottoms: 'bottom',
  layers: 'outerwear',
  shoes: 'shoes',
  accessories: 'accessory',
};

// Per-item generation prompts for the pieces listed in PENDING_TOKYO_GARMENTS.
// Kept independent of the catalog's user-facing `description` field, which is
// written for a child reading the drawer, not for steering an image model.
const ITEM_PROMPTS: Record<string, string> = {
  sweater: 'A cozy cable-knit crew-neck sweater with ribbed cuffs and hem, slightly oversized and cloud-soft.',
  'adventure-shirt': 'A polished-but-playful button-front shirt with rolled sleeves and a breast pocket.',
  'wide-leg-pants': 'Relaxed wide-leg trousers with a soft drape, lightly cuffed at the ankle.',
  windbreaker: 'A color-blocked zip windbreaker with a stand collar and elastic cuffs, worn open over a top.',
  boots: 'Sturdy rubber puddle boots with a ridged sole and a small pull tab at the heel.',
  'high-tops': 'Colorful canvas high-top sneakers with contrast laces.',
  'travel-cap': 'A soft brimmed explorer cap with a small front patch.',
  'bucket-hat': 'A patchwork bucket hat with a scalloped brim.',
  'mini-camera': 'A small rounded travel camera with a neck strap and a bright lens ring, held at chest height.',
};

// Only pieces the reference sheet's 4-color treatment (red/blue/purple/teal)
// actually applies to. Everything else generates one default-colored asset.
const COLOR_VARIANTS: Record<string, string[]> = {
  sweater: ['red', 'blue', 'purple', 'teal'],
  'adventure-shirt': ['red', 'blue', 'purple', 'teal'],
};

// "accessory" is one catalog `slot`, but it covers two very different anchor
// points on the doll: headwear (cap, bucket hat — anchored at head level) vs
// handheld/worn-on-body items (bag, camera — anchored at chest level). The
// catalog's `slot` field stays "accessory" for both (it drives z-index and
// which fallback vector layer gets hidden), but generation must normalize
// headwear into the `hair` slot-safe bound instead of the `accessory` one, or
// the art ends up baked in at chest height. This is what fixed
// travel-cap/bucket-hat rendering on the torso instead of the head.
const NORMALIZE_SLOT_OVERRIDE: Record<string, ClosetSlot> = {
  'travel-cap': 'hair',
  'bucket-hat': 'hair',
  'sun-glasses': 'hair',
};

export type GenerationManifestEntry = {
  destinationId: 'tokyo';
  slot: ClosetSlot;
  /** Slot bounds to normalize the generated art into, if different from `slot` (see NORMALIZE_SLOT_OVERRIDE above). */
  normalizeSlot: ClosetSlot;
  itemId: string;
  name: string;
  itemPrompt: string;
  colors?: string[];
  referenceAsset: ReferenceAssetKey | undefined;
  status: 'existing' | 'pending';
};

export const TOKYO_EXISTING_ASSETS: GenerationManifestEntry[] = (
  ['stripe', 'rain', 'travel-jeans', 'sneakers', 'crossbody'] as ReferenceAssetKey[]
).map((key) => {
  const slot = (Object.entries(REFERENCE_ASSET_BY_SLOT).find(([, ref]) => ref === key)?.[0] as ClosetSlot) ?? 'accessory';
  return {
    destinationId: 'tokyo' as const,
    slot,
    normalizeSlot: slot,
    itemId: key,
    name: `Tokyo ${key} (canonical reference — do not regenerate)`,
    itemPrompt: 'Canonical reference asset — do not regenerate.',
    referenceAsset: key,
    status: 'existing' as const,
  };
});

export const TOKYO_GENERATION_MANIFEST: GenerationManifestEntry[] = [
  ...TOKYO_EXISTING_ASSETS,
  ...PENDING_TOKYO_GARMENTS.map((item): GenerationManifestEntry => {
    const slot = GROUP_TO_SLOT[item.group];
    return {
      destinationId: 'tokyo',
      slot,
      normalizeSlot: NORMALIZE_SLOT_OVERRIDE[item.itemId] ?? slot,
      itemId: item.itemId,
      name: item.name,
      itemPrompt: ITEM_PROMPTS[item.itemId] ?? item.name,
      colors: COLOR_VARIANTS[item.itemId],
      referenceAsset: REFERENCE_ASSET_BY_SLOT[slot],
      status: 'pending',
    };
  }),
];
