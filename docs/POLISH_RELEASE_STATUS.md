# Little Jetter polish and release status

Status: release candidate 1.1 (build 7) verified and prepared for one signed App Store upload. Existing unrelated workspace changes were preserved.

## Doll System

- 29 complete painterly heads are selectable. Each choice is a standalone transparent asset; the one remaining contaminated sheet crop is withheld.
- Visible face size is normalized around shared eye and neck landmarks. Seven legacy short-hair crops now have stronger jaw contours and feathered neck joins; the picker and on-doll sizing use the same scale values.
- Six body skin tones remain available internally; complete heads select their matching body tone so faces and necks stay cohesive.
- Head, body, clothing and hat layers share the 600 × 900 canvas. Garments remain selectable, draggable, resizable, rotatable, resettable and removable during child play.
- Hats remain independent of bags/accessories and are now included in saved looks, restoration and clear-look behavior.
- Automatic local saving covers doll, clothes, colors, hat, packing and silly stories. Malformed storage and storage failures are handled.
- **Remaining:** full independent face/nose/lip/undertone controls, separated front/back hair, and broader skin/color support for the new heads. This is not the complete modular architecture requested.

## Wardrobe

- Catalog: 193 clothing/accessory items and three buddies. All referenced image files and variants audited.
- 177 image files retained; two individually regenerated and replaced: `cream-bow-blouse/default.png` and `little-jetter-logo-tee/default.png`.
- 193 consistently framed, compressed drawer thumbnails generated. Full-size wardrobe preloading removed. Packing previews use the corresponding individual artwork where available.
- All 193 pass canvas/alpha/outer-edge checks. A dressed-doll audit also composites representative outerwear and full-piece looks against the shared body anchors. Evidence: `docs/qa/outfits/outerwear-on-doll.png` and `docs/qa/outfits/full-pieces-on-doll.png`.
- **Remaining:** the legacy sheet-derived wardrobe is not fully regenerated. Sage tank-set regeneration was rejected after repeated outputs lacked real alpha; the existing production item remains. Other sheet-derived pieces still require replacement and visual fitting checks. No new production asset was sliced from a sheet.
- Evidence: `docs/qa/wardrobe/audit.json`, category QA sheets, and `docs/qa/dolls/`. QA sheets are evidence only, never production sources.

## Animation

- Added whole-doll equip/arrival motion, hat landing, packing arrival, and two gentle breathing cycles.
- Existing drawer/stamp/celebration motion retained.
- Global reduced-motion override covers animation, transitions and scrolling; reduced motion also suppresses vibration.
- **Remaining:** blink, wave and independent hair animation were not added.

## UX / Accessibility

- Larger close buttons and color swatches, visible focus outlines, keyboard trapping and Escape for the parent/head/wardrobe dialogs.
- Explicit eye/hair controls, clearer Tops label, full-item thumbnails, remove controls, and save-failure feedback.
- Reconnected journal → buddy → packing → stamp, added visible back actions, excluded empty clothing from packing, added a water bottle, and fixed the misleading fixed packing count.
- Dresses, pajama sets, rompers, and one-piece swimwear now suppress the bottoms layer, preventing pants and shorts from showing through full-piece artwork. Backpacks and suitcases use one shared floor anchor beside the doll instead of covering the torso.
- Switching destinations preserves the doll and clothes. All 43 destinations are retained, including Accra, Mumbai, Copenhagen, Salvador, and New Orleans.
- Automated audit: all 43 destinations have backgrounds and required Explore sections; 506 current catalog/explore image references exist with none missing.
- Desktop home rendered and was captured before later changes. Static composites of the three new heads were inspected.
- Subsequent browser smoke test at 390 × 844 verified outfit randomization and braided-head selection with no reported browser errors. Fixed mobile dress-up card overflow; both cards now fit within the viewport. Evidence: `docs/qa/mobile-layout-fixed.png`. Build, lint, three unit tests, and release asset audit passed.
- **Not verified:** full dress-up regression, small/standard/large iPhone devices, Android phones, iPad/tablet portrait/landscape, screen readers, native cold start/resume/back, offline installation, slow network.

## Parent / Privacy

- Parent challenge now varies per opening; unlock expires after 15 minutes and resets on closing/backgrounding. Invalid answers receive feedback.
- Existing retailer links remain behind Parent Review. No account, ads, chat, location or analytics was added.
- Retailer photos wait for parent unlock; Google Fonts network import removed. Existing local fallback font stacks remain. `scripts/local-fonts.mjs` can vendor licensed fonts when network access is available; exact custom typography is not restored yet.
- Android backup and cleartext traffic are disabled. Predictive back support, keyboard resize behavior, light system-bar colors and native theme colors are configured. Child-data reset includes current play state and stories.
- The previous Capawesome updater was removed and replaced with Capgo's Capacitor 8 updater. It is synced into both native projects and reports successful startup, while cloud traffic remains off until the owner's Capgo account and final privacy disclosures are connected.
- **Remaining:** final binary/traffic audit and owner-approved privacy/contact text. A parental gate is not legal parental consent. [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/) and [Google Families policies](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en).

## iOS

- Bundle ID: `com.littlejetter.app`; display name: Little Jetter; version/build: 1.1 / 7. Web package: 1.1.0.
- Capacitor build/copy/sync passed. The privacy manifest is included, tracking is disabled, and non-exempt encryption is declared false for export-compliance review.
- Final painterly compass-star and paper-airplane icon exported as an opaque 1024px iOS/store master and 512px Google Play icon. Matching Android adaptive/legacy icons and native splash artwork were regenerated from the same source.
- Native compilation/archive **not run**: this host is Windows with no Xcode.
- **Blockers:** Mac/Xcode build and device testing, owner signing/team, final privacy and store metadata, remaining art/UX verification.

## Android

- Application ID: `com.littlejetter.app`; versionName 1.0; versionCode 1; compile/target SDK 36; min SDK 24.
- Capacitor sync passed. Adaptive and legacy icons and splash art replaced. Release is explicitly non-debuggable.
- Release signing reads `LITTLE_JETTER_KEYSTORE`, `LITTLE_JETTER_STORE_PASSWORD`, `LITTLE_JETTER_KEY_ALIAS`, `LITTLE_JETTER_KEY_PASSWORD`. Keystore files are ignored by Git. No credentials were created.
- Attempted `android/gradlew.bat -p android bundleRelease`: failed because JAVA_HOME is unset and Java is absent. No AAB was produced.
- **Blockers:** install the JDK/Android Studio toolchain, provide the owner upload key, then run signed build/install/back testing and complete store disclosures.

## Store Submission

### READY

- Web production build, lint, six state/interaction tests, 43-destination/reference audit, 193-asset wardrobe audit, 15-point mobile readiness audit, and final Capacitor iOS sync.
- Draft icons, splash art, metadata below and this checklist.

### NEEDS MY INPUT

- Legal owner/copyright, support email and HTTPS support URL.
- Approval of privacy policy wording and a real contact method. Existing proposed URL: `https://little-jetter.vercel.app/privacy.html`; the page still lacks an actual support contact.
- Apple developer team, signing credentials, Google upload key and Play App Signing enrollment.
- Final Kids Category/age bands, age-rating questionnaire, App Privacy and Google Data Safety answers, regional legal declarations and commerce decisions. No legal answers have been submitted.
- Optional marketing URL and final artwork/metadata review.

### BLOCKED / NOT COMPLETE

- Full wardrobe regeneration and the remaining modular doll expansion.
- Final browser and device test matrix; browser action was rejected by automatic approval review reporting a usage limit.
- Licensed custom-font download was blocked by restricted network access.
- Xcode archive, Android release AAB, signing and store screenshots.

## Draft metadata and screenshot checklist

- Name: Little Jetter.
- Subtitle: Pack, dress up, explore.
- Short description: Dress your traveler, pack a bag, and explore the world.
- Full description: Choose a destination and get ready for an imaginative journey. Dress your Little Jetter, meet a travel buddy, pack your suitcase, and collect passport stamps. Explore food, words, places and silly stories from around the world. Save favorite looks and travel memories on your device. No account is required. A separate grown-up review area controls access to external shopping links.
- Keywords draft: travel,dress up,passport,packing,geography,creative,explore,adventure.
- Category proposal: Education; Kids Category and audience settings require owner confirmation against the final product.
- Release notes draft: New traveler choices, clearer wardrobe previews, saved outfits, gentler motion, and a completed packing-to-passport journey.
- Capture real final-app screenshots: destination selection, doll customization, equipped outfit, journal, suitcase, earned stamp. Do not use static composites as app screenshots.
- iPhone: an accepted 6.9-inch set such as 1320 × 2868; smaller supported classes can use Apple's scaling rules. iPad: 2064 × 2752 portrait and 2752 × 2064 landscape. Opaque PNG/JPEG. [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).
- Android: phone screenshots, plus actual 7-inch/10-inch tablet captures for supported layouts. Use opaque PNG/JPEG; minimum two screenshots, dimensions within 320–3840px, longest edge no more than twice the shortest. Prepare 1080 × 1920 phone captures and 1024 × 500 feature artwork. [Google preview specifications](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).

## Asset generation record

Built-in image generation was used, one head or wardrobe piece per request. Style prompt: soft painterly children's-book illustration, warm golden-hour lighting, rounded textured shading, warm desaturated palette, no outline/scenery, complete standalone transparent silhouette. Subjects: cream bow blouse, cream Little Jetter airplane tee, golden-skin braids, strawberry-blonde waves with freckles, deep-skin cropped coils. Source landmark normalization and iris exports are recorded in `scripts/import-polish-assets.mjs` and `scripts/import-head-presets.mjs`. Selected production PNGs are in `public/little-jetter/catalog/tokyo/`; rejected sage/checkerboard outputs were not installed.
