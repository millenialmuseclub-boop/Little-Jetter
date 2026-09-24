import fs from 'node:fs/promises';
import sharp from 'sharp';

const failures = [];
const read = (file) => fs.readFile(file, 'utf8');
const readIfPresent = (file) => read(file).catch(() => null);
const [config, androidManifest, androidBuild, iosInfo, privacy, packageJson] = await Promise.all([
  read('capacitor.config.ts'),
  readIfPresent('android/app/src/main/AndroidManifest.xml'),
  readIfPresent('android/app/build.gradle'),
  read('ios/App/App/Info.plist'),
  read('ios/App/App/PrivacyInfo.xcprivacy'),
  read('package.json').then(JSON.parse),
]);

// The android/ native project is not tracked/shipped for this iOS-only
// release track. Its checks only run when the directory is actually
// present (e.g. a local dev machine that ran `cap add android`), so they
// never block the iOS CI workflow, which never has it checked out.
const androidPresent = androidManifest !== null && androidBuild !== null;

let checks = 0;
const expect = (condition, message) => { checks += 1; if (!condition) failures.push(message); };
expect(config.includes("appId: 'com.littlejetter.app'"), 'Capacitor app ID is missing or changed');
expect(!JSON.stringify(packageJson).includes('capacitor-live-update'), 'Old Capawesome updater is still packaged');
expect(Boolean(packageJson.dependencies?.['@capgo/capacitor-updater']), 'Capgo Capacitor updater is not installed');
expect(config.includes("autoUpdate: 'off'"), 'Automatic background update checks must remain off for child play');
if (androidPresent) {
  expect(androidManifest.includes('android:allowBackup="false"'), 'Android backup must remain disabled');
  expect(androidManifest.includes('android:usesCleartextTraffic="false"'), 'Android cleartext traffic must remain disabled');
  expect((androidManifest.match(/<uses-permission/g) ?? []).length === 1 && androidManifest.includes('android.permission.INTERNET'), 'Android should request only INTERNET');
  expect(androidBuild.includes('applicationId "com.littlejetter.app"'), 'Android application ID is missing or changed');
  expect(androidBuild.includes('debuggable false'), 'Android release build must be non-debuggable');
}
expect(iosInfo.includes('<key>ITSAppUsesNonExemptEncryption</key>') && iosInfo.includes('<false/>'), 'iOS export-compliance declaration is missing');
expect(privacy.includes('<key>NSPrivacyTracking</key><false/>'), 'iOS privacy manifest must declare no tracking');

for (const [file, width, height] of [
  ['resources/brand/app-icon-1024.png', 1024, 1024],
  ['resources/brand/google-play-icon-512.png', 512, 512],
]) {
  const metadata = await sharp(file).metadata();
  expect(metadata.width === width && metadata.height === height, `${file} must be ${width} × ${height}`);
  expect(!metadata.hasAlpha, `${file} must be an opaque store icon`);
}

const report = { passed: failures.length === 0, checks, androidChecked: androidPresent, failures };
await fs.writeFile('docs/qa/mobile-readiness.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
