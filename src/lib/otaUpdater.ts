import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { OTA_MANIFEST_URL } from './otaConfig';

interface OtaManifest {
  version: string;
  sha: string;
  url: string;
  checksum: string;
  sessionKey: string;
}

export type OtaCheckResult =
  | { kind: 'unavailable' }
  | { kind: 'current' }
  | { kind: 'ready'; bundleId: string };

export async function checkForOtaUpdate(): Promise<OtaCheckResult> {
  if (!Capacitor.isNativePlatform() || !OTA_MANIFEST_URL || !navigator.onLine) {
    return { kind: 'unavailable' };
  }

  const response = await fetch(OTA_MANIFEST_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Update manifest unavailable');
  const manifest = (await response.json()) as OtaManifest;
  const manifestVersion = Number(manifest.version);
  if (!Number.isFinite(manifestVersion) || !manifest.url || !manifest.checksum || !manifest.sessionKey) {
    throw new Error('Invalid update manifest');
  }

  const { bundle } = await CapacitorUpdater.current();
  const currentVersion = Number(bundle.version) || 0;
  if (manifestVersion <= currentVersion) return { kind: 'current' };

  const downloaded = await CapacitorUpdater.download({
    url: manifest.url,
    version: manifest.version,
    checksum: manifest.checksum,
    sessionKey: manifest.sessionKey,
  });
  return { kind: 'ready', bundleId: downloaded.id };
}

export async function installOtaUpdate(bundleId: string): Promise<void> {
  await CapacitorUpdater.set({ id: bundleId });
}
