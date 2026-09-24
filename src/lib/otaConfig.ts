const channel = (import.meta.env.VITE_OTA_CHANNEL as string | undefined) || 'production';
const baseUrl = (import.meta.env.VITE_R2_PUBLIC_BASE_URL as string | undefined)?.replace(/\/$/, '');

export const OTA_MANIFEST_URL = baseUrl
  ? `${baseUrl}/updates/little-jetter/${channel}/manifest.json`
  : undefined;
