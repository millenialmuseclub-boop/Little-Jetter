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
- Client-side pending/preload helper: `src/data/garmentManifest.ts`
- Asset specification: `docs/wardrobe-asset-template.md`
- Asset normalizer (hand-staged art): `scripts/normalize-wardrobe-assets.ps1`
- Asset generation pipeline (model-generated art): `server/closet/`, `api/admin/closet/`, `docs/closet-asset-generation.md`
- Illustrated assets: `public/little-jetter/catalog/<destination>/<item>/`
- LTK product references: `src/catalog.ts`

`server/`, `api/`, and `scripts/*.ts` are server-only Node code, deliberately kept outside `src/`'s TypeScript project so they can use `fs`/`process`/`Buffer` without breaking the browser build (checked separately with `npm run typecheck:server`). Never import anything from `server/` into `src/LittleJetterApp.tsx` or its dependency graph.

The wardrobe catalog is destination → slot → item. Missing `imageUrl` values intentionally use the existing vector fallback. Color swatches appear only when an item has separately illustrated `variants`; never tint painterly artwork with CSS.

All doll assets use the `little-jetter-neutral-v1` transparent 600 × 900 canvas. Follow the documented anchors and slot bounds so new art requires no per-item positioning.

## Do not regress

- Opaque, slot-exclusive equip/swap behavior
- Click and drag-to-dress
- Saved looks, Surprise Me, and Clear Look
- Compass travel transition
- Passport-stamp gating
- Explore sub-pages (Gratitude/Kindness journal, Gastronomy, Mad-libs memory, Vocabulary, Sites to see) driven by `src/data/exploreContent.json`
- Destination filter scrolling
- Mobile destination background
- Parent-gated commerce

## Current Tokyo proof set

Painterly layers exist for the striped tee (four real color variants), cuffed jeans, open yellow raincoat, red high-tops, and crossbody bag. The open coat and smaller side-bag bounds are intentional: selected tops and bottoms must remain visibly readable.

Resolved this pass:
- Slot-exclusive swap/equip bug (drawer selections now genuinely re-render the doll and correctly displace the previous item in the same slot).
- Broken "Tokyo red high-tops" drawer thumbnail — `.little-garment-preview.preview-shoes .little-catalog-preview` was scaling 3x from the box's dead center, but the sneaker artwork sits low on the 600 × 900 canvas (~80% down), pushing the magnified region off-frame. Fixed with `transform-origin:50% 84%` in `src/little-jetter.css`.
- Drawer items without painterly art now carry a small "Sketch" badge (`.little-sketch-badge` in `src/little-jetter.css`, wired from the `illustrated` tag in `LittleJetterApp.tsx`) so the flat-vector/painterly mix reads as intentional in-progress state rather than a bug.

## Pending asset drop-ins

These ~9 items still render via the SVG vector fallback. A generation pipeline now exists (`server/closet/`, `docs/closet-asset-generation.md`) — run `npm run generate:tokyo` locally with `OPENAI_API_KEY` set to produce candidates, then review against the QC checklist in `docs/wardrobe-asset-template.md` before adding entries to the catalog. Drop finished files into `public/little-jetter/catalog/<destination>/<item>/default.png` and add the matching `imageUrl` + `illustrated` tag under `destinations.tokyo` in `src/data/dressUpCatalog.json` — no code changes should be required beyond that. The exact pending list lives in `src/data/garmentManifest.ts` (`PENDING_TOKYO_GARMENTS`), which both the drawer's "Sketch" badge and the generation manifest read from — update it there, not by hand in multiple places.

- Tops: Cloud-soft sweater, Adventure shirt (plus color variants to match the striped-tee treatment)
- Bottoms: Wide-leg pants
- Layers: Color-block windbreaker
- Shoes: Puddle boots, Colorful high-tops
- Accessories: Explorer cap, Patchwork bucket hat, Mini travel camera

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
10. Run `npm run build` and `npm run lint` before committing. If `server/`, `api/`, or `scripts/*.ts` changed, also run `npm run typecheck:server`.

## Next priority

Convert the remaining Tokyo fallbacks (listed above) into individual painterly 600 × 900 overlays, one slot at a time. Keep outerwear open enough to show tops and keep accessories from obscuring the outfit. Add destinations only through catalog data and aligned assets, never destination-specific rendering code. Once an item's PNG is dropped in and its `imageUrl`/`illustrated` tag is added, its "Sketch" badge disappears automatically.
