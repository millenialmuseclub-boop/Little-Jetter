/// <reference types="@capawesome/capacitor-live-update" />

import type { CapacitorConfig } from '@capacitor/cli';

const otaAppId = process.env.CAPAWESOME_APP_ID;
const otaPublicKey = process.env.CAPAWESOME_PUBLIC_KEY;

const config: CapacitorConfig = {
  appId: 'com.littlejetter.app',
  appName: 'Little Jetter',
  webDir: 'dist',
  backgroundColor: '#fff8e8',
  ios: { contentInset: 'automatic', scrollEnabled: true },
  android: { backgroundColor: '#fff8e8', allowMixedContent: false },
  plugins: {
    LiveUpdate: {
      appId: otaAppId,
      publicKey: otaPublicKey,
      defaultChannel: 'production',
      autoUpdateStrategy: otaAppId && otaPublicKey ? 'background' : 'none',
      autoBlockRolledBackBundles: true,
      autoDeleteBundles: true,
      readyTimeout: 10000,
    },
  },
};

export default config;
