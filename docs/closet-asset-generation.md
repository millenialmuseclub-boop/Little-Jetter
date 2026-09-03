# Closet asset generation pipeline

Server-side infrastructure for producing new painterly wardrobe assets with an
OpenAI image model, normalizing them to the doll's shared canvas, and saving
them where the catalog expects to find them. This is plumbing only — it does
not decide what gets illustrated or add anything to the catalog automatically.

## One-time setup

1. Get an OpenAI API key.
2. In `little-jetter/.env.local` (already gitignored — never commit it; `.env.example`
   is also gitignored in this repo, so it can't carry this documentation either —
   that's why it lives here instead):
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_IMAGE_MODEL=       # optional; defaults to gpt-image-2 (server/closet/openaiClient.ts)
   ADMIN_API_TOKEN=<any long random string, only needed for the deployed /api endpoints>
   ```
   None of these may ever be prefixed with `VITE_` — that would bundle them into
   the client. They're read only by `server/closet/*.ts`, `api/admin/closet/*.ts`,
   and `scripts/generate-destination.ts` (via `dotenv`), never by `src/*`. The
   admin API routes fail closed (401) on every request until `ADMIN_API_TOKEN` is set.
3. `npm install` (adds `sharp`, `@vercel/node`, `tsx`, `dotenv`).

## Running it locally (recommended path)

```bash
npm run generate:tokyo               # generates every pending Tokyo asset
npm run generate:tokyo -- --regenerate   # also redo ones that already exist
```

This writes PNGs directly into `public/little-jetter/catalog/tokyo/<item>/`,
matching the existing convention — the same place the hand-staged
`normalize-wardrobe-assets.ps1` path writes to. Review the output, run the QC
checklist in `docs/wardrobe-asset-template.md`, then add matching entries to
`src/data/dressUpCatalog.json` (`imageUrl` + the `illustrated` tag) and commit
the new files. Nothing here touches the catalog automatically — that step is
still a deliberate, reviewed edit.

## What's in the pipeline

- `server/closet/assetSpec.ts` — canonical canvas/anchor/slot-bounds constants.
- `server/closet/stylePrompt.ts` — the master style-lock prompt, per-slot framing
  instructions, and per-destination motif/palette guidance (Tokyo only, so far).
- `server/closet/openaiClient.ts` — calls OpenAI's image API, requesting a
  transparent background directly (`background: "transparent"`) rather than a
  chroma-key hack.
- `server/closet/imageProcessing.ts` — trims, scales into the item's slot-safe
  bound, and composites onto a fresh 600×900 transparent canvas; also runs
  automated QC (canvas size, alpha present, not empty).
- `server/closet/storage.ts` — a small `ClosetAssetStorage` interface with one
  adapter (`LocalFileClosetAssetStorage`, writes into `public/`). See the
  "Production caveat" below before assuming this works from a deployed endpoint.
- `server/closet/tokyoManifest.ts` — which Tokyo items still need art, their
  generation prompts, color-variant list, and which existing reference asset
  to steer style from. Reuses `src/data/garmentManifest.ts`'s
  `PENDING_TOKYO_GARMENTS` as the single source of "what's pending" — this file
  only adds generation-specific metadata on top.
- `scripts/generate-destination.ts` — the local CLI, above.
- `api/admin/closet/generate.ts` / `generate-destination.ts` — Vercel
  serverless functions wrapping the same library, for triggering generation
  from a deployed admin surface instead of a local machine.

None of this is imported by `src/LittleJetterApp.tsx` or anything in its
bundle — it lives outside `src/`'s TypeScript project (`tsconfig.server.json`,
not referenced by the root `tsconfig.json`) specifically so it can use Node
APIs (`fs`, `process`, `Buffer`) without breaking the browser build. Verify it
independently with `npm run typecheck:server`.

## Production caveat (read before relying on the deployed endpoints)

`LocalFileClosetAssetStorage` writes to the filesystem. That's correct for a
local run or a CI job that commits the result — it's exactly how this
project already ships illustrated assets. It will **not** work as a live,
deployed admin tool: Vercel's serverless filesystem is ephemeral and
read-only, so a write from `/api/admin/closet/generate` in production
succeeds in the function's own process and then vanishes. The `/api/admin/...`
routes exist and are wired correctly, but treat them as scaffolding for a real
blob/CDN-backed `ClosetAssetStorage` implementation (Vercel Blob, S3,
Cloudinary, ...) rather than something to call against the live site today.
Swap it in at `getClosetAssetStorage()` in `server/closet/storage.ts` — the
rest of the pipeline doesn't change.

## Content correction carried over from the ChatGPT reference sheet

A reference sheet used to set this pipeline's palette/style target had three
problems that are fixed structurally here, not just by instruction:

1. **Eiffel Tower motifs on Tokyo pieces.** `DESTINATION_VISUAL_LANGUAGE.tokyo`
   in `stylePrompt.ts` only offers Tokyo motifs (cherry blossom, red lantern,
   Tokyo Tower silhouette) — there is no Paris entry yet, so nothing can
   accidentally pull in Eiffel Tower imagery via this pipeline. The
   Eiffel-Tower-themed pieces from that reference sheet are a legitimate head
   start for a future Paris destination; add a `paris` entry to
   `DESTINATION_VISUAL_LANGUAGE` when that destination is actually being built,
   not before.
2. **Flat-lay orientation.** The master style prompt explicitly requires
   worn/front-facing art shaped by a standing child's body, and explicitly
   rules out flat-lay/table/mannequin/product-photo framing. (An earlier draft
   of this prompt said the opposite — see the comment in `stylePrompt.ts`.)
3. **No per-item transparency / merged sheet.** The pipeline always outputs
   one individual transparent PNG per item (and per color variant), via
   `background: "transparent"` at generation time plus alpha-aware
   normalization — never a sprite sheet.

## Note on the pasted manifest example

The task that specified this pipeline included an example Tokyo manifest
naming a few items not currently in `dressUpCatalog.json`/`garmentManifest.ts`
(`sunset-tee` and `play-all-day-skirt` exist in the catalog but aren't tagged
for Tokyo yet; `harajuku-utility-shirt` doesn't exist at all). `tokyoManifest.ts`
intentionally sticks to the ~9-item pending list already agreed in
`CLAUDE.md`/`garmentManifest.ts` rather than inventing new catalog items on its
own — adding a brand-new garment concept is a product decision, not
infrastructure. Extend `PENDING_TOKYO_GARMENTS` (and, for a new destination
tag, `dressUpCatalog.json`) first if new items are wanted, and the generation
manifest picks them up automatically.
