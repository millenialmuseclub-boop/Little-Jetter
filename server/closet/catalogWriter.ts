import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ClosetSlot } from './assetSpec';

// Writes into the existing catalog — src/data/dressUpCatalog.json — the same file
// the client app reads. There is deliberately no second/parallel catalog: an item
// only ever "goes live" by landing here with a real imageUrl and the `illustrated`
// tag, which is exactly what already makes the client stop rendering its vector
// fallback for that item (see docs/wardrobe-asset-template.md).
const CATALOG_PATH = path.resolve(process.cwd(), 'src', 'data', 'dressUpCatalog.json');

type CatalogVariant = { id: string; swatch: string; imageUrl: string };
type CatalogItem = { id: string; name: string; description: string; imageUrl: string; slot: ClosetSlot; tags: string[]; variants?: CatalogVariant[] };
type CatalogFile = { destinations: Record<string, Record<string, CatalogItem[] | undefined> | undefined> };

const GROUP_BY_SLOT: Record<ClosetSlot, string> = {
  top: 'tops',
  bottom: 'bottoms',
  outerwear: 'layers',
  shoes: 'shoes',
  accessory: 'accessories',
  hair: 'hair',
};

// Matches the swatch hexes already used for the striped tee's four variants, so a
// new item's color dots read consistently with the one working variant set.
const SWATCH_HEX: Record<string, string> = {
  coral: '#ee6757',
  red: '#e85849',
  blue: '#4c8ca5',
  violet: '#a386ce',
  purple: '#a386ce',
  teal: '#35a5a0',
};

export type CatalogUpsertInput = {
  destinationId: string;
  slot: ClosetSlot;
  itemId: string;
  name: string;
  description: string;
  /** URL for the item with no color chosen (or its only art, if it has no variants). */
  defaultUrl: string;
  variants?: Array<{ color: string; url: string }>;
};

/**
 * Adds or replaces one item's entry under destinations[destinationId][group] in
 * dressUpCatalog.json, preserving the file's existing schema. Only call this once
 * every variant for the item has passed QC — a partially-wired item (some colors
 * real art, some still pointing at nothing) is worse than leaving it on the
 * vector fallback entirely.
 */
export async function upsertTokyoCatalogEntry(input: CatalogUpsertInput): Promise<void> {
  const raw = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf-8')) as CatalogFile;
  const group = GROUP_BY_SLOT[input.slot];

  raw.destinations[input.destinationId] ??= {};
  const destination = raw.destinations[input.destinationId]!;
  destination[group] ??= [];
  const list = destination[group]!;

  const entry: CatalogItem = {
    id: input.itemId,
    name: input.name,
    description: input.description,
    imageUrl: input.defaultUrl,
    slot: input.slot,
    tags: [`destination:${input.destinationId}`, 'illustrated'],
  };
  if (input.variants && input.variants.length > 0) {
    entry.variants = input.variants.map((variant) => ({
      id: variant.color,
      swatch: SWATCH_HEX[variant.color] ?? '#999999',
      imageUrl: variant.url,
    }));
  }

  const existingIndex = list.findIndex((item) => item.id === input.itemId);
  if (existingIndex >= 0) list[existingIndex] = entry;
  else list.push(entry);

  await fs.writeFile(CATALOG_PATH, `${JSON.stringify(raw, null, 2)}\n`);
}

/** Looks up an item's existing generic (destination "all") description, for reuse as a starting point. */
export async function getGenericDescription(group: string, itemId: string): Promise<string | undefined> {
  const raw = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf-8')) as CatalogFile;
  const items = raw.destinations.all?.[group];
  return items?.find((item) => item.id === itemId)?.description;
}
