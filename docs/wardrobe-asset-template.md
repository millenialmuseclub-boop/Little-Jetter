# Little Jetter wardrobe asset contract

Every illustrated doll asset uses the same `little-jetter-neutral-v1` coordinate system. This contract is intentionally independent of destination and is the only template the catalog renderer accepts.

The canvas, anchor, and slot-bounds numbers below are also encoded in code at [`server/closet/assetSpec.ts`](../server/closet/assetSpec.ts) — that file is what the generation pipeline actually imports. If this document and that file ever disagree, the code is stale relative to this doc (or vice versa); fix whichever one drifted rather than trusting either blindly.

## Master canvas

- Canvas: **600 × 900 px**, transparent RGBA PNG or lossless WebP
- Pose: front-facing neutral child pose, arms relaxed, feet planted
- Center line: **x = 300**
- Head center: **x = 300, y = 218**
- Shoulder line: **y = 330**
- Waist line: **y = 475**
- Ankle line: **y = 760**
- Ground line: **y = 810**

## Slot-safe bounds

| Slot | Left | Top | Width | Height | Layer |
| --- | ---: | ---: | ---: | ---: | ---: |
| Hair | 190 | 70 | 220 | 245 | 60 |
| Top | 145 | 315 | 310 | 175 | 30 |
| Bottom | 170 | 465 | 260 | 305 | 20 |
| Outerwear | 130 | 300 | 340 | 275 | 50 |
| Shoes | 170 | 710 | 260 | 105 | 40 |
| Accessory | 275 | 330 | 190 | 270 | 70 |

Artwork must stay inside its slot-safe bound but remain on the full 600 × 900 canvas. Never crop an export to the visible garment. Do not add a cast shadow outside the garment; the application owns inter-layer depth.

## Catalog and variants

The catalog is keyed `destination → slot → item`. Each item has `id`, `name`, `description`, `imageUrl`, `slot`, and `tags`, with optional `variants`. A variant is a separately illustrated, shaded asset on this same canvas—not a CSS tint. The UI shows color swatches only when at least two valid variant images exist.

Items with a blank `imageUrl` deliberately fall back to the existing vector renderer. This makes incomplete destination collections safe to publish while artwork is added incrementally.

## Source normalization

Two normalization paths exist and do the same geometric job (trim → fit inside the slot-safe bound → place on a transparent 600 × 900 canvas) with different inputs:

- **Hand-staged art**: stage on a pure `#00FF00` background and run `scripts/normalize-wardrobe-assets.ps1`. Windows/PowerShell only.
- **Model-generated art**: the `/api/admin/closet/generate*` pipeline (`server/closet/imageProcessing.ts`) requests true alpha directly from the image model (no chroma key needed) and normalizes in Node with `sharp`, so it also runs inside serverless functions. See `docs/closet-asset-generation.md` for how to run it.

## Motif and orientation rules (per destination)

- Motifs must belong to the destination being illustrated — never borrow another country's icon (e.g. no Eiffel Tower on Tokyo pieces). Tokyo's allowed motifs are defined in `server/closet/stylePrompt.ts` (`DESTINATION_VISUAL_LANGUAGE`).
- Every asset is drawn **worn/front-facing** — shaped as if sitting on a standing child's body so it lines up with the shoulder/waist/ankle anchors above — never a flat-lay product-photography angle, even if the flat-lay is otherwise well-illustrated. This is the single most common way a nice-looking reference image turns out unusable for this game.

## QC checklist before adding an asset to the catalog

1. Canvas is exactly 600 × 900 with a real alpha channel (automated by `qcCheck()` in the generation pipeline).
2. Composited onto the doll, the garment lands on the documented anchor points — no per-item CSS position/transform hacks.
3. Painterly quality and palette match the five existing reference pieces (raincoat, striped tee, jeans, crossbody bag, red high-tops). Human judgment call — automated QC cannot verify this.
4. Fully transparent background, no stray flat-lay table/background pixels left over from trimming.
5. Correct destination motifs only, or none — never another destination's icon.
6. Once added with its real `imageUrl` and the `illustrated` tag, the item's drawer "Sketch" badge disappears automatically.
