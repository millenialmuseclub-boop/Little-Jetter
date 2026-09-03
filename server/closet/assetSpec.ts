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

export const SLOT_BOUNDS: Record<ClosetSlot, SlotBounds> = {
  hair: { left: 190, top: 70, width: 220, height: 245, layer: 60 },
  top: { left: 145, top: 315, width: 310, height: 175, layer: 30 },
  bottom: { left: 170, top: 465, width: 260, height: 305, layer: 20 },
  outerwear: { left: 130, top: 300, width: 340, height: 275, layer: 50 },
  shoes: { left: 170, top: 710, width: 260, height: 105, layer: 40 },
  accessory: { left: 275, top: 330, width: 190, height: 270, layer: 70 },
};
