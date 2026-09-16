# Critter Rescue: TestFlight and Google Play Closed-Beta Release Guide

> **Scope:** This project is configured to package the existing React/Vite game as a local Capacitor native application. It does not ship as a remote website wrapper. The native shell bundles `dist/public` and uses the reviewed HTTPS production origin only for durable media and the math-gated adult parent-contact endpoint.

## Before creating a native build

The first beta build should be created only after the launch gates in `APP_STORE_GOOGLE_PLAY_CHILDREN_COMPLIANCE.md` are reviewed. In particular, a genuine parental gate, public privacy and support pages, and a complete vendor/data-flow audit remain required before broad store submission.

| Release field | Configured value | Owner must verify before upload |
| --- | --- | --- |
| App name | `Critter Rescue` | Confirm this is the final market-facing name. |
| Bundle / application ID | `com.critterrescue.game` | Confirm it is unused in Apple Developer and Play Console; changing it after tester distribution creates a different app record. |
| Web asset source | `dist/public` | Run `pnpm native:sync` after every approved game change. |
| Default production origin | `https://crittergame-jtesdgpd.manus.space` | If moving hosting, set `VITE_NATIVE_APP_ORIGIN` in a local `.env.native` before `pnpm build:native`. |
| Parent contact | Available only after the in-app math gate | Confirm the production contact endpoint and privacy disclosure remain accurate before upload. |
| Permissions | No camera, microphone, location, contacts, advertising ID, Bluetooth, or photo-library permission is requested by this configuration. | Audit the generated Xcode and Android projects after every dependency change. |

## One-time local setup

Native signing must occur on a release machine with the appropriate platform tools. Keep signing credentials, Apple certificates/profiles, Android keystores, `.env.native`, and generated release archives out of Git.

```bash
cd critter-rescue-game
cp .env.native.example .env.native
pnpm install
pnpm cap:add:ios       # macOS with Xcode only; run once
pnpm cap:add:android   # macOS, Linux, or Windows with Android Studio; run once
```

The generated `ios/` and `android/` projects should be committed after the release owner creates and reviews them. Do not commit `ios/App/App/GoogleService-Info.plist`, Android keystores, `key.properties`, signing passwords, or any `.env.native` file.

## Build and sync the native shell

```bash
pnpm native:sync
pnpm cap:assets
```

`native:sync` creates a native-mode Vite bundle in `dist/public`, then runs Capacitor sync. Capacitor’s sync command copies the built web bundle from `webDir` into native projects.[1]

Before each upload, run:

```bash
pnpm check
pnpm test
pnpm build
pnpm native:sync
pnpm exec cap doctor
```

## iOS: TestFlight

1. In Apple Developer, register the explicit App ID `com.critterrescue.game`, then create the app record in App Store Connect.
2. Open the generated project with `pnpm cap:open:ios`. In Xcode, select the Critter Rescue target, set the Apple development team, configure signing, set the marketing version and increment the build number.
3. Verify no unnecessary capabilities or privacy-sensitive usage descriptions are present. Add a `PrivacyInfo.xcprivacy` manifest if required by Xcode or any dependency.
4. Archive the **Release** configuration in Xcode and distribute the archive to App Store Connect. Add internal testers first, then external testers after Beta App Review as required.
5. Complete App Store Connect metadata, App Privacy answers, age rating, privacy-policy URL, support URL, screenshots, review notes, and TestFlight “What to Test.”

Apple treats Capacitor builds as normal native apps; use Apple’s current submission guidance for the final archive and metadata.[2]

## Android: Google Play closed beta

1. In Play Console, create the app record with package name `com.critterrescue.game` and accurately select **Ages 5 & Under** for the intended preschool audience.
2. Open the generated project with `pnpm cap:open:android`. In Android Studio, set `versionCode` and `versionName`, review manifest permissions, configure a release signing key, and produce a signed Android App Bundle (`.aab`).
3. Upload the `.aab` to a **Closed testing** track; add the tester email list or Google Group and draft concise “What’s new” / tester instructions.
4. Complete the target-audience, content-rating, Data safety, privacy-policy, ads, and app-access declarations. Reconcile every answer with the written data/vendor audit.
5. Use pre-launch reports and a real-device test set before expanding testers. Keep ad SDKs, social sharing, location, and device identifiers absent unless their child-directed compliance is separately reviewed.

Google treats Capacitor builds as normal native apps; follow Play Console’s current launch checklist and Families policy requirements.[3] [4]

## Beta test script for families

Ask each adult tester to use the app with a child for 10–15 minutes, then report only their own observations. Test: first play, readable captions, optional Nutty audio, spoken-directions off, Reduce Motion on, a rescue, activity library, local build save/load/delete, parent controls, Holiday Edition, airplane-mode/reload behavior, and return after relaunch. Do not ask testers to submit a child’s name, image, recording, or personal story.

## References

[1]: https://capacitorjs.com/docs/getting-started "Capacitor — Installing and synchronizing a web app"
[2]: https://developer.apple.com/app-store/submissions/ "Apple — Submitting apps to the App Store"
[3]: https://capacitorjs.com/docs/android/deploying-to-google-play "Capacitor — Deploying an Android app to Google Play"
[4]: https://support.google.com/googleplay/android-developer/answer/9893335?hl=en "Google Play — Families Policies"
