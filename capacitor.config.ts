import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.littlejetter.app',
  appName: 'Little Jetter',
  webDir: 'dist',
  backgroundColor: '#fff8e8',
  ios: { contentInset: 'automatic', scrollEnabled: true },
  android: { backgroundColor: '#fff8e8', allowMixedContent: false },
  plugins: {
    CapacitorUpdater: {
      // Zero-server OTA: the grown-up-only UI fetches a static manifest from
      // Cloudflare R2. The plugin never contacts Capgo's hosted service.
      autoUpdate: false,
      publicKey:
        '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA0TnpGNshjZhpvuwuJ1dGINYNwvbTYGblK+ryNQ8UrvQsxzg8UhDb\no9oibq1hhPy8tU0PrnuHJY6GLhCzeCzLvR9cF3GQexWXTctqMXape3yv1YxTz3/G\n8CsXNVwFEOtC1pqLXlB3sMjOdpTEn9CWgJFMcKg40Egdsd1ZqkJmqoJSJqiCNX7u\nANcdN14fBpl2K22MHBQzAXEBUm7UX5cB9A2LlrPMgDXs7YaRrNSeZiy8HorAXzPj\nGOP/MS1/Y73LuR4Xt/qvE7CPRIsbQxfAGwgEfoZHlKcHwJGg5eSmyNrr3DZfywPC\nwDSoZDS4ag/Gr1yzK9bN4RTSUAj6Z94BhwIDAQAB\n-----END RSA PUBLIC KEY-----\n',
      // Native release jobs must set this to their commit timestamp.
      version: process.env.APP_BUILD_VERSION ?? '0',
      appReadyTimeout: 10000,
    },
  },
};

export default config;
