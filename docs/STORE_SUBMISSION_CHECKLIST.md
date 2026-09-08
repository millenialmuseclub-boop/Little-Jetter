# Little Jetter store submission checklist

Native shell: Capacitor. Bundle/application ID: `com.littlejetter.app` (confirm before creating store records).

## Required before submission

- Confirm legal entity, support email, support URL, copyright owner, and privacy-policy wording.
- Create final 1024 × 1024 app icon, splash assets, phone/tablet screenshots, description, keywords, and age-rating answers.
- Keep all retailer and affiliate links behind Parent Review; verify every external URL and affiliate disclosure.
- Complete Apple App Privacy and Google Play Data safety answers from the final binary and every included SDK.
- Select the correct child age groups and complete Apple Kids Category / Google Families declarations.
- Test without network connectivity, with large text, reduced motion, VoiceOver/TalkBack, and on small phones and tablets.
- On macOS: run `npm run mobile:sync`, open `ios/App/App.xcworkspace`, configure signing, archive, and upload through Xcode.
- In Android Studio: open `android`, confirm target SDK required on submission day, create a signed Android App Bundle, and upload to an internal-testing track first.

## Current privacy posture

- No login, ads, public profiles, chat, precise location, camera, microphone, or contact access.
- Child progress is local-first.
- Parent gate protects shopping and external links.
- Privacy policy: `https://little-jetter.vercel.app/privacy.html`.

Store approval is ultimately determined by Apple and Google; this repository can be technically prepared but cannot guarantee review acceptance.
