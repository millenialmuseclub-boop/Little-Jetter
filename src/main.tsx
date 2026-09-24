import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { LittleJetterApp } from './LittleJetterApp';
import { PlayBoundary } from './PlayBoundary';
import './reset.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlayBoundary><LittleJetterApp /></PlayBoundary>
  </StrictMode>,
);

if (Capacitor.isNativePlatform()) {
  void CapacitorUpdater.notifyAppReady().catch((error: unknown) => {
    console.warn('App-ready notification failed.', error);
  });
}
