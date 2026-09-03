// Central reference for the painterly asset drop-in pipeline.
// `dressUpCatalog.json` stays the single source of truth for which assets are live
// (an item is "illustrated" once it has a real `imageUrl` + the `illustrated` tag there).
// This file only adds: (1) the canonical path convention, so a contributor never has
// to hand-type `/little-jetter/catalog/...` paths, and (2) a typed list of what's still
// pending, so "what's left" doesn't require re-deriving it from the catalog by hand.
import dressUpCatalog from './dressUpCatalog.json' with { type: 'json' };

export const ASSET_TEMPLATE = {
  id: dressUpCatalog.template.id,
  width: dressUpCatalog.template.width,
  height: dressUpCatalog.template.height,
  anchors: dressUpCatalog.template.anchors,
} as const;

/**
 * Canonical location for a garment asset, following the existing convention:
 * `public/little-jetter/catalog/<destination>/<itemId>/<variantId ?? 'default'>.png`
 * Use this instead of hand-typing paths when wiring a new `imageUrl` into dressUpCatalog.json.
 */
export function catalogAssetPath(destinationId: string, itemId: string, variantId?: string): string {
  return `/little-jetter/catalog/${destinationId}/${itemId}/${variantId ?? 'default'}.png`;
}

type ManifestCatalogItem = { imageUrl?: string; variants?: { imageUrl: string }[] };
type ManifestCatalogDestination = Record<string, ManifestCatalogItem[] | undefined>;

/**
 * Every real (illustrated) image URL for a destination — base items and color
 * variants alike. Used to warm the browser cache the moment a destination is
 * selected, so wardrobe drawers open with art already loaded instead of flashing in.
 */
export function destinationAssetUrls(destinationId: string): string[] {
  const destinationCatalog = (dressUpCatalog.destinations as Record<string, ManifestCatalogDestination | undefined>)[destinationId];
  if (!destinationCatalog) return [];
  const urls = new Set<string>();
  Object.values(destinationCatalog).forEach((items) => {
    items?.forEach((item) => {
      if (item.imageUrl) urls.add(item.imageUrl);
      item.variants?.forEach((variant) => urls.add(variant.imageUrl));
    });
  });
  return Array.from(urls);
}

export type PendingGarment = {
  destinationId: string;
  group: 'tops' | 'bottoms' | 'layers' | 'shoes' | 'accessories';
  itemId: string;
  name: string;
  /** Where the finished PNG/WEBP belongs once illustrated. */
  suggestedPath: string;
  /** Set when the piece should get separate color-variant art, like the striped tee. */
  variantIds?: string[];
};

// Kept in sync with CLAUDE.md's "Pending manual asset drop-ins" list.
// When an item's art lands: drop the file at `suggestedPath`, add a matching entry
// under `destinations.tokyo` in dressUpCatalog.json with `imageUrl` + the `illustrated`
// tag, then delete its row here. The drawer's "Sketch" badge clears itself automatically.
export const PENDING_TOKYO_GARMENTS: PendingGarment[] = [
  { destinationId: 'tokyo', group: 'tops', itemId: 'sweater', name: 'Cloud-soft sweater', suggestedPath: catalogAssetPath('tokyo', 'sweater') },
  { destinationId: 'tokyo', group: 'tops', itemId: 'adventure-shirt', name: 'Adventure shirt', suggestedPath: catalogAssetPath('tokyo', 'adventure-shirt') },
  { destinationId: 'tokyo', group: 'bottoms', itemId: 'wide-leg-pants', name: 'Wide-leg pants', suggestedPath: catalogAssetPath('tokyo', 'wide-leg-pants') },
  { destinationId: 'tokyo', group: 'layers', itemId: 'windbreaker', name: 'Color-block windbreaker', suggestedPath: catalogAssetPath('tokyo', 'windbreaker') },
  { destinationId: 'tokyo', group: 'shoes', itemId: 'boots', name: 'Puddle boots', suggestedPath: catalogAssetPath('tokyo', 'boots') },
  { destinationId: 'tokyo', group: 'shoes', itemId: 'high-tops', name: 'Colorful high-tops', suggestedPath: catalogAssetPath('tokyo', 'high-tops') },
  { destinationId: 'tokyo', group: 'accessories', itemId: 'travel-cap', name: 'Explorer cap', suggestedPath: catalogAssetPath('tokyo', 'travel-cap') },
  { destinationId: 'tokyo', group: 'accessories', itemId: 'bucket-hat', name: 'Patchwork bucket hat', suggestedPath: catalogAssetPath('tokyo', 'bucket-hat') },
  { destinationId: 'tokyo', group: 'accessories', itemId: 'mini-camera', name: 'Mini travel camera', suggestedPath: catalogAssetPath('tokyo', 'mini-camera') },
];
