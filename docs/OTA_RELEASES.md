# Little Jetter zero-server OTA

Little Jetter uses the same subscription-free pattern as Let Them Eat Cake. The app checks a static Cloudflare R2 manifest only after a grown-up requests an update. The Capacitor updater plugin downloads, verifies, decrypts, and activates the bundle; it does not use Capgo's hosted service.

## Release shape

- Bundles: `updates/little-jetter/<channel>/bundles/<git-sha>.zip`
- Manifest: `updates/little-jetter/<channel>/manifest.json`
- Channels: `staging` and `production`
- Version: publishing commit timestamp, compared numerically with the native build timestamp
- Activation: a grown-up downloads and explicitly restarts; `notifyAppReady()` preserves rollback protection

## GitHub configuration

Reuse the existing Cake R2 infrastructure and matching signing key:

- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `R2_BUCKET_NAME`, `CAPGO_PRIVATE_KEY`
- Variable: `R2_PUBLIC_BASE_URL`

The private key must match the public key embedded in `capacitor.config.ts`. Never commit it. The shared R2 bucket is safe because Little Jetter uses its own `updates/little-jetter/` namespace.

## Required native transition

Existing Little Jetter installations still know only the former Capgo-hosted lookup. The new public key, static manifest URL, and numeric native version must ship in one new App Store/Play Store binary. Build that binary with:

- `APP_BUILD_VERSION=<git commit timestamp>`
- `VITE_R2_PUBLIC_BASE_URL=<public R2 base URL>`
- `VITE_OTA_CHANNEL=production`

After that binary is installed, future compatible HTML/CSS/JS/content/asset changes can use **Publish Little Jetter OTA (zero-server)**. Native plugins, permissions, entitlements, native configuration, signing-key rotation, and materially reviewable native behavior still require a store update.

Always publish to staging and verify on an installed staging build before production. A failed startup rolls back automatically. To correct a content defect, publish a new, later commit; an older manifest cannot downgrade devices already updated.
