import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

export function ParentUpdates() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState<string>();
  if (!Capacitor.isNativePlatform()) return null;

  async function check() {
    setBusy(true);
    setMessage('Checking for an update…');
    try {
      const latest = await CapacitorUpdater.getLatest();
      if (latest.breaking || latest.major) {
        setMessage('This update needs a new version from TestFlight or the App Store.');
      } else if (latest.kind === 'blocked') {
        setMessage('This update is not available for this build. Check TestFlight for a new version.');
      } else if (latest.error && latest.kind !== 'up_to_date') {
        throw new Error('Update service unavailable');
      } else if (!latest.url) {
        setMessage('You have the latest available update.');
      } else {
        const current = await CapacitorUpdater.current();
        const builtin = await CapacitorUpdater.getBuiltinVersion();
        const version = current.bundle.version === 'builtin' ? builtin.version : current.bundle.version;
        const parts = (value: string) => value.split('.').map(Number);
        const next = parts(latest.version), installed = parts(version);
        const firstDifference = [0, 1, 2].find(i => (next[i] || 0) !== (installed[i] || 0));
        if (!/^\d+\.\d+\.\d+$/.test(latest.version) || firstDifference === undefined || (next[firstDifference] || 0) < (installed[firstDifference] || 0)) {
          setMessage('You have the latest available update.');
        } else {
          setMessage('Downloading. You can keep playing; the app will not restart on its own.');
          const bundle = await CapacitorUpdater.download({ ...latest, url: latest.url });
          setReady(bundle.id);
          setMessage('Update ready. Restart when you are ready to finish playing.');
        }
      }
    } catch {
      setMessage('Could not get the update. Your game is safe. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function install() {
    if (!ready) return;
    setBusy(true);
    try { await CapacitorUpdater.set({ id: ready }); }
    catch { setMessage('Could not restart. Please try again.'); setBusy(false); }
  }

  return <section aria-label="App updates"><h3>App updates</h3>
    <p>The latest play changes are included in this TestFlight build. Updates are optional.</p>
    <p>By choosing “Check for updates”, you agree to send this app’s version, a generated device ID, device and operating-system details, and connection information to Capgo to check for and download an update. No stories, outfits or journal entries are sent. Background update checks and update statistics are off.</p>
    <button type="button" disabled={busy} onClick={ready ? install : check}>{busy ? 'Please wait…' : ready ? 'Restart and use update' : 'Check for updates'}</button>
    <p role="status" aria-live="polite">{message}</p>
  </section>;
}
