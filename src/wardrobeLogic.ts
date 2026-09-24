type Clothing = { id: string; tags: string[] };
type Outfit = { tops: string; bottoms: string; layers: string; shoes: string; accessories: string; buddies: string };
type Closet = { tops: Clothing[]; layers: Clothing[] };

/** A newly selected piece must be visible, including shorts picked after a dress. */
export function equipPiece(current: Outfit, group: keyof Outfit, id: string, closet: Closet): Outfit {
  const next = { ...current, [group]: id };
  if (id === 'none') return next;
  const top = closet.tops.find(item => item.id === current.tops);
  const layer = closet.layers.find(item => item.id === current.layers);
  if (group === 'bottoms') {
    if (top?.tags.some(tag => ['covers-bottom', 'style:dress', 'style:pajama', 'style:swim'].includes(tag))) next.tops = 'none';
    if (layer?.tags.includes('covers-bottom')) next.layers = 'none';
  }
  if (group === 'tops' && layer?.tags.includes('covers-top')) next.layers = 'none';
  return next;
}
