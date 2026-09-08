# Little Jetter OTA releases

The Capacitor shell includes `@capawesome/capacitor-live-update`. OTA fetching is
disabled until both configuration values are present when the native app is built:

- `CAPAWESOME_APP_ID`: the Capawesome Cloud app UUID (not the bundle identifier)
- `CAPAWESOME_PUBLIC_KEY`: the PEM RSA public key used to verify signed bundles

With both values present, the shell follows the `production` channel, downloads
updates in the background, deletes unused bundles, and automatically rolls back
and blocks a bundle that cannot render and call `LiveUpdate.ready()` within 10 seconds.

## Release boundary

Use OTA only for binary-compatible web changes already within the reviewed app:
HTML, CSS, JavaScript, content, destinations, and aligned doll/wardrobe assets.

Submit a new App Store / Play Store binary for native plugin or permission changes,
native configuration, privacy/commerce behavior changes, or materially new features.
Keep channels compatible with the native app version; do not send one universal
bundle to incompatible native releases.

## Activation and release

1. Create the Little Jetter app in Capawesome Cloud and generate an RSA signing key.
2. Build the store binary with the two variables above, then run `npm run mobile:sync`.
3. Create a version-compatible production channel in the OTA console.
4. Build the web bundle with `npm run build`, upload `dist`, sign it, and stage it.
5. Test the staged update on both installed native apps, including a forced bad-bundle
   rollback test, before promoting it to production.

Never commit a private signing key. The public verification key may be embedded in
the app; the private key belongs only in the release service's protected secrets.
