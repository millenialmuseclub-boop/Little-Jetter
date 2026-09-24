# Little Jetter store submission checklist

Current implementation, verification results, draft metadata, screenshot specifications and outstanding blockers are recorded in [POLISH_RELEASE_STATUS.md](POLISH_RELEASE_STATUS.md). The app is not submission-ready; completed web builds and native syncs are not signed native release builds.

Native shell: Capacitor. Bundle/application ID: `com.littlejetter.app` (confirm before creating store records).

## Required before submission

- Confirm legal entity, support email, copyright owner, and final privacy-policy wording.
- Review and approve the final 1024 × 1024 app icon and splash assets; create phone/tablet screenshots and approve description, keywords, and age-rating answers.
- Keep all retailer and affiliate links behind Parent Review; verify every external URL and affiliate disclosure.
- Complete Apple App Privacy and Google Play Data safety answers from the final binary and every included SDK. Optional updates use signed static files on Cloudflare R2 only after a grown-up requests them; background checks remain off.
- Select the correct child age groups and complete Apple Kids Category / Google Families declarations.
- Test without network connectivity, with large text, reduced motion, VoiceOver/TalkBack, and on small phones and tablets.
- On macOS: run `npm run mobile:sync`, open `ios/App/App.xcworkspace`, configure signing, archive, and upload through Xcode.
- Install Android Studio/JDK, open `android`, confirm target SDK required on submission day, create a signed Android App Bundle, and upload to an internal-testing track first.

## Current privacy posture

- No login, ads, public profiles, chat, precise location, camera, microphone, or contact access.
- Child progress is local-first.
- Parent gate protects shopping and external links.
- Privacy policy: `https://little-jetter.vercel.app/privacy.html`.
- Developer/support portfolio: `https://jordypop.vercel.app/`.
- App Store Connect Support URL: `https://jordypop.vercel.app/`.
- App Store Connect Privacy Policy URL: `https://little-jetter.vercel.app/privacy.html`.
- Google Play privacy-policy URL: `https://little-jetter.vercel.app/privacy.html`; use the jordypop portfolio for the developer website/contact reference.

Store approval is ultimately determined by Apple and Google; this repository can be technically prepared but cannot guarantee review acceptance.
