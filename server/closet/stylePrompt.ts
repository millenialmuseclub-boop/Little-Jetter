import { CLOSET_CANVAS } from './assetSpec';
import type { ClosetSlot } from './assetSpec';

// Bump this whenever MASTER_STYLE_PROMPT, SLOT_FRAMING_INSTRUCTIONS, or a
// destination's visual language changes in a way that would make an asset
// generated under the old prompt visually inconsistent with new ones. Recorded
// per-asset in generation metadata so a drifted batch can be identified later.
export const STYLE_VERSION = 'closet-style-v1';

// Single source for the painterly look shared by every destination's wardrobe.
// Do not inline or duplicate this string anywhere else — import it.
//
// NOTE: the orientation clause below intentionally does NOT say "not worn, not on
// a mannequin, flat-lay product angle." A prior draft of this prompt (copied from a
// generic children's-illustration template) said exactly that, which is backwards
// for this project: the five working Tokyo reference assets are drawn front-facing
// and worn — shaped as if sitting on a standing child's body — so they land on the
// doll's shoulder/waist/ankle anchors. A flat-lay product photo, however painterly,
// will not register correctly when composited. This is corrected here.
export const MASTER_STYLE_PROMPT = [
  'Soft painterly children\'s-book illustration style, warm golden-hour lighting,',
  'gentle rounded shading with visible soft brushwork texture, not flat vector, not photoreal,',
  'warm and slightly desaturated palette, gentle drop shadow for depth,',
  'clean die-cut silhouette on a fully transparent background, no outline stroke,',
  'no background scenery, no character body visible, object only, centered, front-facing, straight-on,',
  'drawn worn — shaped by a standing child\'s body underneath it (shoulders, waist, and legs implied by the garment\'s silhouette) — not a flat-lay, not laid on a table, not a mannequin, not a 3/4-angle product photo.',
].join(' ');

export type DestinationVisualLanguage = {
  /** Small, destination-specific motifs a piece may optionally carry — never another destination's. */
  motifs: string[];
  paletteNote: string;
};

// Add a new destination here only once its own reference assets exist; an
// unlisted destination simply gets no extra motif/palette guidance layered on.
export const DESTINATION_VISUAL_LANGUAGE: Record<string, DestinationVisualLanguage> = {
  tokyo: {
    motifs: [
      'a single small cherry blossom sprig',
      'a red paper lantern silhouette',
      'a subtle Tokyo Tower silhouette accent',
    ],
    paletteNote: 'warm reds, soft indigo-blues, muted violet, and dusty teal, evoking lantern-lit city streets',
  },
  // Paris is deliberately not defined yet. The Eiffel-Tower-patch reference sheet
  // that prompted this correction is a legitimate head start for Paris once that
  // destination is actually being built — keep it out of the Tokyo pipeline until then.
};

export const SLOT_FRAMING_INSTRUCTIONS: Record<ClosetSlot, string> = {
  hair: 'Framed to the head only, front-facing, as worn on a standing child.',
  top: 'Framed to the torso, chest, and upper arms only, shaped as if worn on a standing child from shoulder line to waist line; no legs, no head.',
  bottom: 'Framed to the hips and legs only, shaped as if worn on a standing child from waist line to ankle line; no torso, no head.',
  outerwear: 'Framed to the torso and arms as an open or layered outer garment, shaped as if worn open over a top on a standing child; no legs, no head.',
  shoes: 'A single worn pair, front-facing, planted on the ground as if on a standing child\'s feet; toes forward, both shoes visible and evenly weighted.',
  accessory: 'Framed and scaled as it would be worn or carried by a standing child (on the head, across the body, or held at chest height, as appropriate to the item); not laid flat.',
};

export function buildGenerationPrompt(input: { destinationId: string; slot: ClosetSlot; itemPrompt: string; color?: string }): string {
  const destination = DESTINATION_VISUAL_LANGUAGE[input.destinationId];
  const lines = [
    MASTER_STYLE_PROMPT,
    destination
      ? `Destination palette: ${destination.paletteNote}. If a motif fits naturally, use exactly one small ${input.destinationId} motif such as ${destination.motifs.join(' or ')} — never a motif from any other country or city.`
      : '',
    SLOT_FRAMING_INSTRUCTIONS[input.slot],
    input.color ? `Primary color for this piece: ${input.color}.` : '',
    `Item: ${input.itemPrompt}`,
    `Output canvas ${CLOSET_CANVAS.width}x${CLOSET_CANVAS.height}, true alpha transparency, garment/item only.`,
  ];
  return lines.filter(Boolean).join('\n');
}
