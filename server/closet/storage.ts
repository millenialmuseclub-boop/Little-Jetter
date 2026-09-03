import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { head, put } from '@vercel/blob';

export type ClosetAssetMetadata = { destinationId: string; slot: string; itemId: string; color?: string };
export type SavedClosetAsset = { url: string; storageKey: string; width: number; height: number; mimeType: string };

// Reproducibility record for one generated asset. No secrets: never put the API
// key or any bearer token in here — this is written to disk/Blob alongside the
// image and is not treated as sensitive.
export type ClosetGenerationRecord = {
  destinationId: string;
  itemId: string;
  slot: string;
  color?: string;
  filename: string;
  model: string;
  styleVersion: string;
  prompt: string;
  referenceAsset?: string;
  timestamp: string;
  storageUrl: string;
  storageKey: string;
  validation: { ok: boolean; issues: string[]; warnings: string[] };
  attempt: number;
};

export interface ClosetAssetStorage {
  /** Returns the already-saved asset for this exact (destination, item, color), or undefined if none exists yet. */
  getExistingAsset(metadata: ClosetAssetMetadata): Promise<SavedClosetAsset | undefined>;
  saveClosetAsset(buffer: Buffer, metadata: ClosetAssetMetadata): Promise<SavedClosetAsset>;
  /** Previous generation record for this asset, if any — used to compute the next attempt count. */
  getGenerationRecord(metadata: ClosetAssetMetadata): Promise<ClosetGenerationRecord | undefined>;
  saveGenerationRecord(record: ClosetGenerationRecord): Promise<void>;
}

/**
 * Default adapter: writes straight into public/little-jetter/catalog, following
 * this project's existing convention (illustrated assets are committed to the repo
 * and served statically). This is only usable where the filesystem is writable and
 * persistent — a local dev machine, or a CI job that commits the result. It will
 * NOT work from a live Vercel serverless function in production: that filesystem
 * is ephemeral and read-only, so writes would silently vanish on the next
 * invocation. Swap in a real adapter (Vercel Blob, S3, Cloudinary, ...) that
 * implements this same interface if a deployed admin endpoint needs to persist
 * assets directly; getClosetAssetStorage() below is the single place to switch it.
 */
export class LocalFileClosetAssetStorage implements ClosetAssetStorage {
  constructor(private readonly publicRoot = path.resolve(process.cwd(), 'public')) {}

  private resolve(metadata: ClosetAssetMetadata) {
    const filename = `${metadata.color ?? 'default'}.png`;
    const relativePath = path
      .join('little-jetter', 'catalog', metadata.destinationId, metadata.itemId, filename)
      .split(path.sep)
      .join('/');
    return { relativePath, absolutePath: path.join(this.publicRoot, relativePath) };
  }

  async getExistingAsset(metadata: ClosetAssetMetadata): Promise<SavedClosetAsset | undefined> {
    const { relativePath, absolutePath } = this.resolve(metadata);
    try {
      const buffer = await fs.readFile(absolutePath);
      const meta = await sharp(buffer).metadata();
      return { url: `/${relativePath}`, storageKey: relativePath, width: meta.width ?? 0, height: meta.height ?? 0, mimeType: 'image/png' };
    } catch {
      return undefined;
    }
  }

  async saveClosetAsset(buffer: Buffer, metadata: ClosetAssetMetadata): Promise<SavedClosetAsset> {
    const { relativePath, absolutePath } = this.resolve(metadata);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);
    const meta = await sharp(buffer).metadata();
    return { url: `/${relativePath}`, storageKey: relativePath, width: meta.width ?? 0, height: meta.height ?? 0, mimeType: 'image/png' };
  }

  private metadataPath(metadata: ClosetAssetMetadata) {
    return `${this.resolve(metadata).absolutePath}.json`;
  }

  async getGenerationRecord(metadata: ClosetAssetMetadata): Promise<ClosetGenerationRecord | undefined> {
    try {
      return JSON.parse(await fs.readFile(this.metadataPath(metadata), 'utf-8')) as ClosetGenerationRecord;
    } catch {
      return undefined;
    }
  }

  async saveGenerationRecord(record: ClosetGenerationRecord): Promise<void> {
    const target = this.metadataPath({ destinationId: record.destinationId, slot: record.slot, itemId: record.itemId, color: record.color });
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(record, null, 2));
  }
}

/**
 * Production adapter: Vercel Blob, the first-party persistent object storage for a
 * Vercel-deployed project — no separate vendor account, S3 bucket, or Cloudinary
 * setup needed. Requires a Blob store to be created for this project (`vercel blob
 * create-store`, or the dashboard's Storage tab) and its token available as
 * BLOB_READ_WRITE_TOKEN. Vercel injects that automatically once a store is
 * connected to the project; for local use against it, `vercel env pull` fetches it
 * into .env.local like any other project env var.
 */
export class VercelBlobClosetAssetStorage implements ClosetAssetStorage {
  private pathnameFor(metadata: ClosetAssetMetadata): string {
    const filename = `${metadata.color ?? 'default'}.png`;
    return `closet/${metadata.destinationId}/${metadata.slot}/${metadata.itemId}/${filename}`;
  }

  async getExistingAsset(metadata: ClosetAssetMetadata): Promise<SavedClosetAsset | undefined> {
    try {
      const blob = await head(this.pathnameFor(metadata));
      // Vercel Blob doesn't return image dimensions on HEAD; fetch the bytes once to read them.
      const response = await fetch(blob.url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const meta = await sharp(buffer).metadata();
      return { url: blob.url, storageKey: blob.pathname, width: meta.width ?? 0, height: meta.height ?? 0, mimeType: blob.contentType ?? 'image/png' };
    } catch {
      return undefined;
    }
  }

  async saveClosetAsset(buffer: Buffer, metadata: ClosetAssetMetadata): Promise<SavedClosetAsset> {
    const pathname = this.pathnameFor(metadata);
    const meta = await sharp(buffer).metadata();
    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: 'image/png',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return { url: blob.url, storageKey: blob.pathname, width: meta.width ?? 0, height: meta.height ?? 0, mimeType: 'image/png' };
  }

  async getGenerationRecord(metadata: ClosetAssetMetadata): Promise<ClosetGenerationRecord | undefined> {
    try {
      const blob = await head(`${this.pathnameFor(metadata)}.json`);
      const response = await fetch(blob.url);
      return (await response.json()) as ClosetGenerationRecord;
    } catch {
      return undefined;
    }
  }

  async saveGenerationRecord(record: ClosetGenerationRecord): Promise<void> {
    const pathname = `${this.pathnameFor({ destinationId: record.destinationId, slot: record.slot, itemId: record.itemId, color: record.color })}.json`;
    await put(pathname, JSON.stringify(record, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  }
}

/**
 * Selects the storage adapter by environment, per the interface above — nothing
 * else in the pipeline needs to know which one is active.
 *
 * - Local/dev (no BLOB_READ_WRITE_TOKEN): filesystem, writing into public/, which
 *   matches this project's existing "commit illustrated assets to the repo"
 *   convention.
 * - Vercel production/preview (BLOB_READ_WRITE_TOKEN present, which Vercel sets
 *   automatically once a Blob store is connected to the project): Vercel Blob,
 *   which actually persists across serverless invocations.
 */
export function getClosetAssetStorage(): ClosetAssetStorage {
  if (process.env.BLOB_READ_WRITE_TOKEN) return new VercelBlobClosetAssetStorage();
  return new LocalFileClosetAssetStorage();
}
