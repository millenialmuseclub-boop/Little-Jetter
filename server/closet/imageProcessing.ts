import sharp from 'sharp';
import { CLOSET_CANVAS, SLOT_BOUNDS } from './assetSpec.js';
import type { ClosetSlot } from './assetSpec.js';

/**
 * Trims a generated image to its non-transparent content, scales it to fit inside
 * the slot's safe bounds (never upscaling), and composites it onto a fresh
 * transparent 600x900 canvas at the slot's documented position. This is the same
 * operation scripts/normalize-wardrobe-assets.ps1 performs for hand-staged art,
 * reimplemented in Node so it also runs inside the generation pipeline/serverless
 * functions where PowerShell isn't available.
 */
export async function normalizeToClosetCanvas(sourceBuffer: Buffer, slot: ClosetSlot): Promise<Buffer> {
  const bounds = SLOT_BOUNDS[slot];
  const trimmed = await sharp(sourceBuffer).trim().ensureAlpha().png().toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();
  const trimmedWidth = trimmedMeta.width ?? bounds.width;
  const trimmedHeight = trimmedMeta.height ?? bounds.height;

  const scale = Math.min(bounds.width / trimmedWidth, bounds.height / trimmedHeight, 1);
  const drawWidth = Math.max(1, Math.round(trimmedWidth * scale));
  const drawHeight = Math.max(1, Math.round(trimmedHeight * scale));
  const resized = await sharp(trimmed)
    .resize(drawWidth, drawHeight, { fit: 'inside' })
    .png()
    .toBuffer();

  const left = Math.round(bounds.left + (bounds.width - drawWidth) / 2);
  const top = Math.round(bounds.top + (bounds.height - drawHeight) / 2);

  return sharp({
    create: {
      width: CLOSET_CANVAS.width,
      height: CLOSET_CANVAS.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
}

// `issues` are hard failures — they make `ok: false` and block catalog wiring.
// `warnings` never affect `ok`; they're heuristics with real false-positive rates
// (e.g. a camera's neck strap reads a lot like "two disconnected objects" to a
// gap-scanning check) and are surfaced for human review via the contact sheet,
// not auto-rejected.
export type QcResult = { ok: boolean; issues: string[]; warnings: string[] };

/**
 * Automatable checks only. "Matches the painterly quality of the 5 working
 * pieces" and "no leftover flat-vector fallback needed" are visual judgment
 * calls — this does not (and cannot) substitute for a human looking at the
 * composited result on the doll before it ships (see the contact sheet builder).
 */
export async function qcCheck(buffer: Buffer, slot: ClosetSlot): Promise<QcResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (metadata.width !== CLOSET_CANVAS.width || metadata.height !== CLOSET_CANVAS.height) {
    issues.push(`Canvas is ${metadata.width}x${metadata.height}, expected ${CLOSET_CANVAS.width}x${CLOSET_CANVAS.height}.`);
  }
  if (!metadata.hasAlpha) {
    issues.push('Image has no alpha channel — background will not be transparent.');
    return { ok: false, issues, warnings };
  }

  const stats = await image.stats();
  const alphaChannel = stats.channels[3];
  if (!alphaChannel || alphaChannel.max === 0) {
    issues.push('Image is fully transparent — nothing was drawn.');
    return { ok: false, issues, warnings };
  }

  // Corners must be transparent — an opaque corner usually means a stray
  // background color (or a checkerboard placeholder) got baked into the pixels.
  const corners: Array<[number, number]> = [
    [0, 0], [CLOSET_CANVAS.width - 1, 0], [0, CLOSET_CANVAS.height - 1], [CLOSET_CANVAS.width - 1, CLOSET_CANVAS.height - 1],
  ];
  const cornerPixels = await Promise.all(
    corners.map(([x, y]) => sharp(buffer).extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer()),
  );
  const opaqueCorners = cornerPixels.filter((pixel) => pixel[3] > 10).length;
  if (opaqueCorners > 0) {
    issues.push(`${opaqueCorners} of 4 canvas corners are not transparent — a background color may have been baked into the pixels.`);
  }

  // Foreground bounding box, from the alpha channel's trim. sharp reports
  // trimOffsetLeft/Top as negative (pixels removed from that edge), so the
  // box's actual position is the negation of those values.
  const { info } = await image.trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
  const fgLeft = -(info.trimOffsetLeft ?? 0);
  const fgTop = -(info.trimOffsetTop ?? 0);
  const fgWidth = info.width;
  const fgHeight = info.height;
  const fgRight = fgLeft + fgWidth;
  const fgBottom = fgTop + fgHeight;

  if (fgLeft <= 0 || fgTop <= 0 || fgRight >= CLOSET_CANVAS.width || fgBottom >= CLOSET_CANVAS.height) {
    issues.push('Foreground touches the outer canvas edge — the artwork may be clipped.');
  }

  const bounds = SLOT_BOUNDS[slot];
  const slotLeft = bounds.left;
  const slotTop = bounds.top;
  const slotRight = bounds.left + bounds.width;
  const slotBottom = bounds.top + bounds.height;
  const margin = 6; // px tolerance for rounding during composite
  if (fgLeft < slotLeft - margin || fgTop < slotTop - margin || fgRight > slotRight + margin || fgBottom > slotBottom + margin) {
    issues.push(
      `Foreground bounding box (${fgLeft},${fgTop})-(${fgRight},${fgBottom}) extends outside the "${slot}" slot region (${slotLeft},${slotTop})-(${slotRight},${slotBottom}).`,
    );
  }

  const fgArea = fgWidth * fgHeight;
  const slotArea = bounds.width * bounds.height;
  if (fgArea < slotArea * 0.08) {
    issues.push(`Foreground is only ${((fgArea / slotArea) * 100).toFixed(0)}% of the slot area — may be too small, or a stray mark rather than real artwork.`);
  } else if (fgArea > slotArea * 1.05) {
    issues.push(`Foreground bounding box exceeds the slot area (${((fgArea / slotArea) * 100).toFixed(0)}%) — likely oversized relative to the other pieces.`);
  }

  // Disconnected-object heuristic: scan several horizontal strips through the
  // foreground (not just the vertical center — a single thin connecting element,
  // like a camera's neck strap, can create a wide gap at exactly one height) for
  // alternating opaque/transparent runs. Only flag when a wide gap between two
  // substantial opaque runs shows up at MOST sampled heights, which is a much
  // stronger signal of two actually-separate objects than any single row.
  const channels = 4;
  const sampleFractions = [0.3, 0.4, 0.5, 0.6, 0.7];
  let flaggedRows = 0;
  let worstRuns = 0;
  let worstGapPct = 0;
  for (const fraction of sampleFractions) {
    const stripY = Math.min(CLOSET_CANVAS.height - 1, fgTop + Math.round(fgHeight * fraction));
    const stripRaw = await sharp(buffer).extract({ left: fgLeft, top: stripY, width: fgWidth, height: 1 }).raw().toBuffer();
    let runs = 0;
    let inOpaqueRun = false;
    let gapPixels = 0;
    let maxGap = 0;
    for (let x = 0; x < fgWidth; x++) {
      const opaque = stripRaw[x * channels + 3] > 20;
      if (opaque) {
        if (!inOpaqueRun) runs += 1;
        inOpaqueRun = true;
        maxGap = Math.max(maxGap, gapPixels);
        gapPixels = 0;
      } else {
        inOpaqueRun = false;
        gapPixels += 1;
      }
    }
    maxGap = Math.max(maxGap, gapPixels);
    if (runs >= 2 && maxGap > fgWidth * 0.18) {
      flaggedRows += 1;
      worstRuns = Math.max(worstRuns, runs);
      worstGapPct = Math.max(worstGapPct, (maxGap / fgWidth) * 100);
    }
  }
  if (flaggedRows > sampleFractions.length / 2) {
    warnings.push(
      `Detected separated opaque regions (up to ${worstRuns}, gap up to ${worstGapPct.toFixed(0)}% wide) across ${flaggedRows}/${sampleFractions.length} sampled rows — verify visually for a duplicate/disconnected object (both a shoe pair and a strapped accessory can legitimately look like this).`,
    );
  }

  return { ok: issues.length === 0, issues, warnings };
}
