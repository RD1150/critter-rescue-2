# Critter Rescue — Apple App Privacy and Google Play Data Safety Worksheets

**Prepared:** October 5, 2026
**Use:** Conservative draft answers for a free, closed beta of the currently audited build
**Status:** Working worksheet — do not submit unchanged without confirming hosting/logging, the signed native binaries, and final operator contact details

> These worksheets intentionally favor disclosure where a parent’s adult contact email or free-form support message is retained. They are not legal advice and are not a substitute for completing each store’s live questionnaire.

## Release assumptions

- **Audience:** preschool children, approximately ages 3–6, with a parent/caregiver.
- **Business model for beta:** free closed test; no ads, in-app purchase, subscription, payment account, or child-facing commerce.
- **Data posture:** local-first/no accounts/no cloud game saves/no child profiles/no gameplay upload.
- **Adult contact:** optional, math-gated parent form that receives adult email, category, and free-form message; records are scheduled for automatic deletion after 30 days and the deployed cleanup still requires verification.
- **Unresolved dependency:** confirm production host, storage, CDN, and database access-log/backup practices before final answers.

## Apple App Privacy worksheet

Official reference: [Apple — App privacy details](https://developer.apple.com/app-store/app-privacy-details/).

Apple defines collection as transmitting data off device in a form you or a partner can access beyond the real-time request. Apple notes that optional support data may qualify for an optional-disclosure exception only if **all** listed criteria are satisfied. Because this beta retains adult email and support text, the conservative approach is to declare it unless the final App Store Connect review verifies that the exception applies.

### Conservative data-type selections

| App Privacy question | Proposed beta answer | Basis / final verification needed |
| --- | --- | --- |
| Does the app or third-party partners collect data? | **Yes — conservatively.** | Optional adult contact form retains email and message for up to 30 days. Do not answer “No” solely because child gameplay stays local. |
| Contact Information → Email Address | **Collected; linked to the adult submitter; App Functionality / Customer Support.** | Parent contact explicitly asks for a grown-up email to reply. |
| User Content → Customer Support | **Collected; linked to the adult submitter; App Functionality / Customer Support.** | Parent free-form message is a support/bug/idea request stored alongside email. |
| User Content → Other User Content | **Consider declaring if the final form classifies free-form suggestions outside Customer Support.** | Confirm exact App Store Connect category at submission; the message is free-form text. |
| Gameplay Content | **Not collected.** | Game progress, local keepsakes, creations, and settings stay on-device and are not transmitted by application code. |
| User ID / Device ID | **Not collected by the application.** | The unused pseudo-device identifier was removed. Reassess hosting logs and any native SDK behavior before submission. |
| Diagnostics / Product Interaction | **Not collected by application code.** | No analytics/crash SDK found. Confirm actual native build includes no additional diagnostics SDK or platform integration requiring disclosure. |
| Location, Contacts, Photos/Videos, Audio recordings, Financial data, Health, Browsing/Search history | **Not collected.** | No corresponding feature, permission, or input path in current source. |
| Is data used to track users? | **No.** | No ads, cross-app identifiers, data broker, or behavioral advertising flow in audited source. |
| Is data shared with third parties for advertising/marketing? | **No.** | Do not add such services during beta. Infrastructure providers still require privacy/vendor review even when not an advertising “share.” |
| Privacy policy URL | **Required.** | Use a stable public HTTPS policy URL that has final operator, support, and privacy-request details before submission. Current route: `/privacy` on the production domain; confirm durability before store entry. |

### App Store Connect submission blockers

- [ ] Final publisher/legal entity name and contact information.
- [ ] Monitored support and privacy-request email.
- [ ] Confirm whether the contact-message form meets every condition for Apple’s optional-disclosure exception; otherwise use the conservative selections above.
- [ ] Confirm production host/storage/CDN and database logging/backup practices.
- [ ] Inspect the signed `.ipa` and every installed SDK/SDK privacy manifest.
- [ ] Complete age rating, Kids Category decision, review notes, TestFlight contact, screenshots, and accessibility fields.

## Google Play Data Safety worksheet

Official reference: [Google Play — Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).

Google requires the Data Safety form and privacy-policy link for published apps on closed, open, and production tracks. An internal-test-only app is exempt while it remains exclusively on that track. The owner remains responsible for declarations covering third-party code and services.

### Conservative Data Safety responses

| Data Safety prompt | Proposed beta answer | Basis / final verification needed |
| --- | --- | --- |
| Does the app collect or share required user data types? | **Yes — conservatively.** | Optional adult contact form retains adult email and a free-form message. |
| Data types collected | **Email address** and **Other user content** (free-form parent support/bug/idea text). | The exact console labels may change. Confirm whether Google classifies the support note as “Other user content” or a narrower category. |
| Why collected | **App functionality** and **Developer communications/customer support** only. | Reply to adult support/bug/idea submissions. Not analytics, personalization, advertising, fraud profiling, or account management. |
| Is it shared? | **No advertising/marketing sharing.** | Confirm the Google definition for infrastructure service providers against the actual host/database contracts before final submission. |
| Is data encrypted in transit? | **Do not answer until verified on signed builds.** Expected answer: **Yes**, because current production and native routing use HTTPS. | Check actual Android network-security configuration and a live TLS request. |
| Is there a deletion-request mechanism? | **Do not answer “Yes” until a monitored privacy/support email and written process exist.** | Automatic 30-day expiry is implemented, but Google asks about a way to request deletion. Publish and operate the contact route first. |
| Is collection required? | **No.** | Adult contact is optional and not required for a child to play. |
| Is child data collected? | **No child data intentionally collected by the app.** | Still verify hosting/SDK behavior and make the broad collected-data answer match the adult contact form. |
| Does the app follow the Families Policy? | **Yes only after target audience, SDK audit, privacy policy, and signed build are verified.** | The intended audience is ages 3–6; do not make the declaration prematurely. |
| Privacy policy URL | **Required.** | Stable public HTTPS policy required even if future build is changed to zero data collection. |

### Google Play Console submission blockers

- [ ] Create and verify the correct Play Console developer account.
- [ ] Decide account type **before** creation: personal if publishing as an individual; organization only if legal entity/D-U-N-S details are ready. The account owner cannot later be changed by simply switching Google accounts.
- [ ] The browser check on October 5, 2026 found a **new-account signup screen** for `mindrocketsystems@gmail.com`; it was not enrolled in Play Console. The phone screenshot showed a different signed-in Play Store account (`rdshop70@gmail.com`). Select the account that should permanently own the publisher record before paying/enrolling.
- [ ] Verify developer email/contact details and payments profile, then create the app record with package ID `com.critterrescue.game`.
- [ ] Confirm required target audience, content rating, Families declarations, Android permissions, signed `.aab`, and privacy-policy URL.
- [ ] Complete Data Safety with current answer labels and attach the final support/deletion route.
- [ ] Start with internal testing only if disclosure or support details are still incomplete; before a closed test, complete the required store records.

## Plain-language store/privacy copy (draft)

> **Critter Rescue is designed for local play.** Children do not create an account and the game does not ask them for names, photos, voice recordings, or contact details. Progress, settings, and in-game creations stay on the family’s device. Clearing app or browser data, or uninstalling the app, may erase that local progress; it does not automatically transfer to another device. Some art and audio may need an internet connection to load. A parent or caregiver may optionally contact support through the grown-up area. Please do not include child private information.

## Final consistency check

Before submission, the policy page, App Privacy, Data Safety, store listing, TestFlight/closed-test descriptions, and the actual binary must all say the **same thing**. Update this worksheet after any change involving analytics, a crash reporter, payment SDK, account/login, cloud save, child-input surface, content host, or native plugin.
