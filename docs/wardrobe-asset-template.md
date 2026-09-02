# Little Jetter wardrobe asset contract

Every illustrated doll asset uses the same `little-jetter-neutral-v1` coordinate system. This contract is intentionally independent of destination and is the only template the catalog renderer accepts.

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

Generated source art may be staged on a pure `#00FF00` background and normalized with `scripts/normalize-wardrobe-assets.ps1`. The script removes the chroma field and fits the foreground into the slot-safe bound on a transparent 600 × 900 canvas. Production image generation should output true alpha directly whenever possible.
