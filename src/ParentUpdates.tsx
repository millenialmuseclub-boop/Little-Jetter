import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { checkForOtaUpdate, installOtaUpdate } from './lib/otaUpdater';

export function ParentUpdates() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState<string>();
  if (!Capacitor.isNativePlatform()) return null;

  async function check() {
    setBusy(true);
    setMessage('Checking for an update…');
    try {
      const result = await checkForOtaUpdate();
      if (result.kind === 'current') {
        setMessage('You have the latest available update.');
      } else if (result.kind === 'unavailable') {
        setMessage('Updates are not available in this build yet. Your game is safe.');
      } else {
        setReady(result.bundleId);
        setMessage('Update ready. Restart when you are ready to finish playing.');
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
    try { await installOtaUpdate(ready); }
    catch { setMessage('Could not restart. Please try again.'); setBusy(false); }
  }

  return <section aria-label="App updates"><h3>App updates</h3>
    <p>The latest play changes are included in this TestFlight build. Updates are optional.</p>
    <p>By choosing “Check for updates”, you agree to connect to Little Jetter’s Cloudflare file storage to check for and download an update. Normal connection information, such as an IP address and requested files, is sent. No stories, outfits, journal entries, device ID, or advertising ID are sent. Background checks are off.</p>
    <button type="button" disabled={busy} onClick={ready ? install : check}>{busy ? 'Please wait…' : ready ? 'Restart and use update' : 'Check for updates'}</button>
    <p role="status" aria-live="polite">{message}</p>
  </section>;
}
