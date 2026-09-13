# Children’s App Launch Compliance and Privacy Checklist

> **Important:** I’m an AI, not a lawyer. This is an implementation-oriented compliance checklist, not formal legal advice; have qualified child-privacy and platform counsel review the final product, data flows, policies, and store declarations before relying on them.

## Executive summary

For a preschool game, the practical compliance goal is straightforward: **collect as little data as possible, keep child play free of links, ads, purchases, and sharing, place adult-only actions behind a genuine parental gate, and make every declaration match the actual app and its third-party services.** Apple and Google both scrutinize the target age, privacy practices, SDKs, advertising, and child-facing commercial or social features.[1] [2]

Critter Rescue has a strong starting posture: local-only creations and parent prompts, no child profiles, no voice recording, no child uploads, no social sharing, no child-directed purchases, and optional pre-generated—not recorded—voice guidance. It is **not yet store-submission ready**, because it needs a real parental gate, public privacy/support documentation, a full data-flow and vendor audit, native iOS/Android delivery, real-device testing, and final store disclosures.

## Essential requirements for both stores

| Requirement | What it means in practice | Why it matters for Critter Rescue |
| --- | --- | --- |
| **Accurate child audience** | Declare the real audience, content rating, and age band; do not market a preschool app as general-audience to bypass child rules. | Use the youngest intended audience honestly: Apple Kids Category **5 and under** if pursuing that category, and Google Play **Ages 5 & Under** for the stated 3–6 audience.[1] [2] |
| **Data inventory before forms** | List every item transmitted off device: app/server logs, database records, crash reports, analytics, SDKs, voice/media hosts, customer support, purchases, and ad services. Include each vendor. | Local browser-stored builds and prompts are different from server-persisted feedback. The beta-feedback feature stores free-form adult feedback on the server, so it must be included in the audit and policy. |
| **Public privacy policy** | Publish a clear, stable, publicly accessible policy describing data collected, why, retention, sharing, security, parent rights, and contact details. | Both Apple and Google require store privacy disclosures; Google requires a privacy-policy link even when an app declares no user data collection.[3] [4] |
| **Data minimization and child-safe defaults** | Do not ask for names, dates of birth, photos, voices, contacts, location, identifiers, or device permissions unless truly needed and legally reviewed. | Keep current local-only builds and prompts. Do not add child accounts, public galleries, uploads, or runtime generative sharing without a redesigned compliance model. |
| **Third-party SDK and service audit** | Check all native SDKs, web libraries, hosting, diagnostics, payments, ads, crash tools, and APIs—not just code written by the team. | Any future native wrapper, analytics, ad SDK, or error-monitoring tool changes the declarations and may be unsuitable for child-directed use. |
| **Child-appropriate content and design** | Content, imagery, language, and interactions must be appropriate for the declared child audience. Avoid manipulative monetization, dark patterns, social pressure, or unsafe interactions. | Preserve the existing no-timer, no-score, no-ranking, gentle-retry contract and parent-directed commercial boundaries. |
| **Physical-device testing and release evidence** | Test the native binary on supported real devices, including audio, captions, Reduce Motion, offline/reload behavior, touch targets, and restoration of local data. | Browser checks are valuable but do not replace iPhone/iPad/Android device tests or TestFlight/closed-testing feedback. |

## Apple App Store and Kids Category

Apple’s Kids Category requires selecting an age band, following the App Review Guidelines, protecting children’s data, and using parental gates for actions that could lead a child outside the child experience. Apple specifically identifies external links, social destinations, and purchases as examples that should be moderated by a parental gate.[1] [5]

| Apple launch requirement | Practical implementation |
| --- | --- |
| **App Store privacy details** | Complete App Privacy answers for your app and every third-party partner. Apple defines collection as transmitting data off device in a way that you or a partner can access beyond the real-time request. On-device-only processing is not “collected” for this definition, but hosting and server logs still need review.[3] |
| **Public privacy-policy URL** | Add a stable policy URL before App Store Connect submission. It must describe actual—not hoped-for—practices.[3] |
| **True parental gate** | Add an adult challenge or other age-appropriate adult-verification step before Parent Settings, feedback submission, external links, purchases, support contact, or any future sharing. A visually separate “Grown-up space” alone is not enough. |
| **No unreviewed child-data sharing** | Do not transmit personally identifiable or device information to third parties without the required parental consent. Avoid third-party analytics and advertising in a Kids Category product unless counsel verifies the limited permitted use.[1] [5] |
| **Submission completeness** | Submit a final, stable native build with functional URLs, accurate metadata, support contact, and review notes explaining non-obvious parent controls. Apple can reject incomplete, crashing, or misleading submissions.[5] |
| **Store assets and content rating** | Prepare a final app icon, device-accurate screenshots, age rating questionnaire, accessibility information, support URL, privacy label, description, and pricing/IAP details if any. Store media must accurately show the real app.[5] |

## Google Play Families requirements

Google Play requires a target-audience declaration before publishing. If children are in the audience, its Families policies apply. For a preschool app, Google instructs developers to select **Ages 5 & Under** when that is the real target.[2]

| Google Play launch requirement | Practical implementation |
| --- | --- |
| **Target Audience and Content** | Accurately select the child age group and complete the content-rating questionnaire. Google can evaluate whether the app’s imagery and wording actually target children regardless of a declaration.[2] |
| **Data safety form** | Every published app—including closed and open test tracks—must complete the Data safety form and provide a privacy-policy link. Declare all data collection/sharing, encryption in transit, deletion options, and any data collected by third-party SDKs.[4] |
| **Child data and identifiers** | A children-only app must not transmit Android advertising IDs or listed device/network identifiers, and should not request the advertising-ID permission for current targets. Avoid location and unnecessary permissions.[2] |
| **APIs and SDKs** | Use only services approved for child-directed use. For mixed-audience apps, age screening must prevent unsuitable SDKs/services from collecting child data; a preschool-only product should avoid them altogether.[2] |
| **Ads and monetization** | The safest path is no advertising. If ads are ever added, Google requires Families self-certified ad SDKs, child-appropriate ads, no personalized ads/remarketing, and non-deceptive formats. Commercial prompts must not disrupt play or pressure children.[2] |
| **Not a simple website wrapper** | Google’s Families policy says a children’s app must not merely provide a WebView of a website. Do not submit an unmodified web shell; build and test a proper Android application experience with the required native behavior and policies.[2] |
| **Adult control of social or sharing features** | If any future feature lets children exchange content or information, Google requires adult action before that capability is enabled and additional safety disclosures. The current safest approach is to keep sharing absent.[2] |

## U.S., EEA, and UK privacy baseline

In the U.S., COPPA applies to child-directed commercial online services that collect, use, or disclose children’s personal information. The FTC describes requirements that include a clear privacy policy, appropriate parental notice and verifiable consent when required, security, deletion practices, and not making participation conditional on unnecessary data. The FTC also recommends a privacy policy for child-directed services that do not collect child personal information.[6]

If the app is offered in the EEA, consent-based processing of a child’s personal data requires parent or guardian consent up to an age set by each member state between 13 and 16, and child-facing notices must be clear and understandable to children.[7] If the app is likely to be accessed by children in the UK, assess the UK Children’s Code and its fifteen standards, including its risk-assessment guidance for games and apps.[8]

## Critter Rescue: required work before broad store launch

| Priority | Required action | Why it is a launch gate |
| --- | --- | --- |
| 1 | **Implement and test a genuine parental gate.** | Parent Settings, beta feedback, support links, and any future purchase or external-link flow need adult protection. |
| 2 | **Publish privacy and support pages.** | The policy must explain the local-only creations/prompts, optional audio delivery, server-side beta feedback, retention/deletion, vendors, contact, and no child-profile position. |
| 3 | **Perform a written data-flow and vendor audit.** | Audit hosting, database, network logs, storage/CDN, audio delivery, crash/error tools, analytics, and any SDK added during native packaging. Match the results to Apple App Privacy and Google Data safety forms. |
| 4 | **Decide the native delivery approach.** | Build real iOS and Android applications—not only the current web app—and avoid an unmodified WebView shell for Google Play Families. |
| 5 | **Run a controlled 10–25-family beta.** | Use TestFlight for iOS and a Google Play testing track for Android. Test first-play comprehension, audio, captions, Reduce Motion, accessibility, local builds, deletion, offline/reload behavior, and parent controls on real devices. |
| 6 | **Prepare the store records.** | Complete content ratings, age audiences, data disclosures, screenshots, icons, descriptions, support contact, review notes, price/IAP details, and accessibility information. |
| 7 | **Maintain an asset-rights register.** | Record commercial-use rights and attribution obligations for every generated visual, voice clip, soundscape, font, and third-party asset before public release. |

## Recommended product policy for this game

Critter Rescue should continue operating as a **local-first, no-account, no-ad, no-child-commerce, no-sharing preschool game**. Custom builds and parent prompts should remain on-device. Parent feedback should stay adult-only behind the new gate, use a minimal retention period, and never request child identifiers, photos, recordings, or sensitive details. Any later feature involving accounts, cloud saves, uploads, generative child content, social interaction, targeted marketing, or purchases should trigger a fresh privacy and platform-policy review before it is built.

## References

[1]: https://developer.apple.com/kids/ "Apple — Design safe and age-appropriate experiences"
[2]: https://support.google.com/googleplay/android-developer/answer/9893335?hl=en "Google Play — Families Policies"
[3]: https://developer.apple.com/app-store/app-privacy-details/ "Apple — App privacy details"
[4]: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en "Google Play — Provide information for Google Play’s Data safety section"
[5]: https://developer.apple.com/app-store/review/guidelines/ "Apple — App Review Guidelines"
[6]: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions "FTC — Complying with COPPA: Frequently Asked Questions"
[7]: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data/are-there-any-specific-safeguards-data-about-children_en "European Commission — Specific safeguards for data about children"
[8]: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/ "ICO — Children’s code guidance and resources"
