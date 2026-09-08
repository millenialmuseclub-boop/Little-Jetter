import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.littlejetter.app',
  appName: 'Little Jetter',
  webDir: 'dist',
  backgroundColor: '#fff8e8',
  ios: { contentInset: 'automatic', scrollEnabled: true },
  android: { backgroundColor: '#fff8e8', allowMixedContent: false },
};

export default config;
