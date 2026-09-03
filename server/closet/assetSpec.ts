// Canonical closet doll-asset geometry, server-side copy.
// This mirrors docs/wardrobe-asset-template.md exactly — that document is written
// for humans (illustrators, prompt writers); this file is what code imports. If the
// two ever disagree, the doc is stale and should be updated to match this file.
export const CLOSET_CANVAS = { width: 600, height: 900 } as const;

export const CLOSET_ANCHORS = {
  centerX: 300,
  headCenterY: 218,
  shoulderY: 330,
  waistY: 475,
  ankleY: 760,
  groundY: 810,
} as const;

export type ClosetSlot = 'hair' | 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory';

export type SlotBounds = { left: number; top: number; width: number; height: number; layer: number };

// Measured directly from the doll's bare body silhouette (not guessed): at
// ankleY (760) the bare leg is ~150px wide, and the two bottom-garment vector
// fallbacks land at ~146-189px wide there. A shoe pair's own width at that
// line must land in the same ~150-190px range or the pant hem visibly floats
// above the shoe instead of draping down over it — this was the actual bug
// behind "shoes render smaller than the pant ankle width" (fixed 2026-09-03
// by rescaling the 3 Tokyo shoe assets to ~175px wide). The old shoes slot
// (height: 105) was itself the root cause: it forced every shoe — including
// naturally taller high-tops/boots — to downscale to fit 105px of height,
// which shrank width well below the ~150-190px target. The slot below is
// corrected for that; regenerate/rescale any new shoe asset to land in the
// same ~150-190px range at ankleY, not just "fit inside this box."
export const SLOT_BOUNDS: Record<ClosetSlot, SlotBounds> = {
  hair: { left: 190, top: 70, width: 220, height: 245, layer: 60 },
  top: { left: 145, top: 315, width: 310, height: 175, layer: 30 },
  bottom: { left: 170, top: 465, width: 260, height: 305, layer: 20 },
  outerwear: { left: 130, top: 300, width: 340, height: 275, layer: 50 },
  shoes: { left: 170, top: 590, width: 260, height: 220, layer: 40 },
  accessory: { left: 275, top: 330, width: 190, height: 270, layer: 70 },
};
