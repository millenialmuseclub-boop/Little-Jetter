import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { LiveUpdate } from '@capawesome/capacitor-live-update';
import { LittleJetterApp } from './LittleJetterApp';
import './reset.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LittleJetterApp />
  </StrictMode>,
);

// Confirms that an installed OTA bundle rendered successfully. If this is not
// reached within the configured timeout, the native wrapper rolls it back.
if (Capacitor.isNativePlatform()) {
  void LiveUpdate.ready().catch((error: unknown) => {
    console.warn('Little Jetter OTA readiness check failed.', error);
  });
}
