# Little Jetter handoff

Production: https://little-jetter.vercel.app/  
Repository: https://github.com/millenialmuseclub-boop/Little-Jetter  
Current branch: `main`

## Product order

1. Kids' dress-up game
2. Travel explorer and journal
3. Parent shopping wishlist

Preserve the current visual design, layout, palette, typography, and four-tab structure. Do not merge this app with Luxe Jetter.

## Working architecture

- Main UI: `src/LittleJetterApp.tsx`
- Styles: `src/little-jetter.css`
- Generic wardrobe catalog: `src/data/dressUpCatalog.json`
- Asset specification: `docs/wardrobe-asset-template.md`
- Asset normalizer: `scripts/normalize-wardrobe-assets.ps1`
- Illustrated assets: `public/little-jetter/catalog/<destination>/<item>/`
- LTK product references: `src/catalog.ts`

The wardrobe catalog is destination → slot → item. Missing `imageUrl` values intentionally use the existing vector fallback. Color swatches appear only when an item has separately illustrated `variants`; never tint painterly artwork with CSS.

All doll assets use the `little-jetter-neutral-v1` transparent 600 × 900 canvas. Follow the documented anchors and slot bounds so new art requires no per-item positioning.

## Do not regress

- Opaque, slot-exclusive equip/swap behavior
- Click and drag-to-dress
- Saved looks, Surprise Me, and Clear Look
- Compass travel transition
- Passport-stamp gating
- Explore hotspots
- Destination filter scrolling
- Mobile destination background
- Parent-gated commerce

## Current Tokyo proof set

Painterly layers exist for the striped tee (four real color variants), cuffed jeans, open yellow raincoat, red high-tops, and crossbody bag. The open coat and smaller side-bag bounds are intentional: selected tops and bottoms must remain visibly readable.

## Required acceptance test

Do not report a dress-up change complete from state, captions, or console checks alone.

1. Open Style and scroll to the doll and closet.
2. Capture the doll stage.
3. Select every available item in each slot: top, bottom, layer, shoes, accessory.
4. Capture the same doll-stage region after every selection.
5. Confirm pixels visibly change in the selected slot—not merely the caption.
6. Confirm the drawer thumbnail matches the equipped artwork.
7. Confirm variant swatches change to distinct image files.
8. Confirm an unconverted item falls back cleanly with no broken image.
9. Repeat at a 390 px mobile viewport.
10. Run `npm run build` and `npm run lint` before committing.

## Next priority

Convert the remaining Tokyo fallbacks into individual painterly 600 × 900 overlays, one slot at a time. Keep outerwear open enough to show tops and keep accessories from obscuring the outfit. Add destinations only through catalog data and aligned assets, never destination-specific rendering code.
