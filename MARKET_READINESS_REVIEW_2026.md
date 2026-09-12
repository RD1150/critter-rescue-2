# Current Market-Readiness Review

## Official launch requirements reviewed

Apple’s current Kids guidance says a Kids Category product must select an age band, follow App Review Guidelines, protect children’s data, and use parental gates for actions that could take a child outside the child experience. It also says Kids apps should not transmit personally identifiable or device information to third parties without explicit parental consent, and that advertising requires age-appropriate human review. [1]

Apple’s App Review Guidelines require a final, fully functional submission with accurate metadata, on-device testing, and all required review access. Kids Category apps must keep external links, purchases, and similar distractions behind a designated parental gate. [2]

Apple requires App Store privacy details for the developer’s and third-party partners’ data practices, and a public privacy-policy URL is required. It distinguishes on-device-only data from transmitted data, but requires disclosure of data that is transmitted and retained beyond a real-time service request. [3]

The FTC’s current COPPA guidance states that COPPA applies to child-directed commercial online services, including mobile apps, when they collect, use, or disclose children’s personal information. Covered operators need a clear privacy policy, appropriate parental notice and consent when required, data security and deletion practices, and may not condition participation on unnecessary information. The FTC also recommends public privacy policies for child-directed services that do not collect personal information. [4]

## Current product review — September 2026

> **Recommendation:** Critter Rescue is suitable for a small, supervised **web beta**, but it is **not yet ready for a broad public App Store launch**. The product experience has strong child-safety and quality foundations; the remaining launch gates are native delivery, real-device evidence, privacy/support documentation, and a true parental gate.

| Readiness area | Direct evidence reviewed | Assessment | What must happen before a broad launch |
| --- | --- | --- | --- |
| Core child experience | The current expansion passed 62 Vitest files / 107 tests, TypeScript validation, and a production build. The new templates, six-pair matching activity, and three-round full-hour clock activity were checked in browser and across responsive/reduced-motion previews. | **Strong for beta** | Observe actual children and caregivers using first play, audio, and learning activities without coaching. |
| Calm, age-appropriate design | Child flows use large choices, one action at a time, visual directions, optional tap-only audio, gentle retry language, no score, no countdown, no rankings, and no child-facing commerce. | **Strong for beta** | Keep this design contract in a written release checklist and regression test suite. |
| Holiday Edition | Parent Settings currently includes an enabled **Show Holiday Edition** control and four adult-labelled paths. The directly inspected child-facing Lights & kindness route uses neutral, low-pressure copy, one action at a time, and works with Reduce Motion. | **Present and suitable for beta** | Retain adult-only selection and confirm each seasonal path on physical devices before release. |
| Parent-facing controls | Adult-only screens are visually separated and describe local-only prompt storage, but source review found no implemented parental-gate logic. | **Not Kids Category ready** | Add and test a genuine parental gate before entering adult settings, external links, feedback submission, purchases, or any future sharing flow. Apple requires gates for child-sensitive actions in Kids Category apps. [1] [2] |
| Privacy and data flow | Saved creations and parent prompts are local browser storage. There is no native mobile/PWA package or analytics/advertising SDK dependency in `package.json`. However, parent beta feedback persists free-form text to the server database, and hosted web traffic may still involve platform/server logging. | **Needs documented audit** | Inventory all production hosting, analytics, logs, database, audio, and feedback flows; publish a plain-language privacy policy and ensure it matches platform disclosures. [3] [4] |
| App Store packaging | The repository has a Vite/React web app and Express server. Review found no iOS wrapper, native project, PWA manifest, service worker, or app-store packaging configuration. | **Not App Store ready** | Choose a native iOS delivery path, build a signed app, test it on physical devices, and distribute a TestFlight beta before App Review. [2] |
| Store operations | No privacy-policy or support page was found in the project root. No App Store Connect record, final icon set, age-rating submission, product metadata, native screenshots, or review notes were verified. | **Not App Store ready** | Prepare the App Store Connect record, support URL, public privacy policy, accurate data disclosures, age band/rating, screenshots from the final native app, and review notes. [2] [3] |
| Rights and release operations | Generated art, voice, sound, holiday visual motifs, and plush concept assets are present; an auditable commercial-rights register was not verified. | **Needs operational review** | Maintain a rights register with source, license, creation date, allowed use, and attribution requirements for every production asset. |

## Clear launch decision

| Decision | Current answer | Reason |
| --- | --- | --- |
| Invite a small, supervised web beta? | **Yes, with clear pre-release framing.** | The current build is playable, calm, regression-tested, and offers parent-aware controls. The beta should focus on real-family usability and audio/accessibility behavior. |
| Broad public web launch as a children’s product? | **Not yet.** | A privacy-policy/data-flow review, parent-support process, and genuine parental gate are still required. |
| Broad iOS App Store launch or Kids Category submission? | **Not yet.** | There is no verified native package, physical-device evidence, parental gate, completed App Store record, or final privacy/support disclosure set. |

## Practical beta checklist

Run a 10–25-family test on actual phones and tablets. Ask adults whether a child can begin a rescue, find a matching choice, use or ignore audio comfortably, stop play easily, and understand the parent controls. Record only adult feedback and do not request child names, images, voices, or personal details. Before any public store launch, complete the native package, parental gate, privacy/support pages, data/SDK audit, asset-rights register, and store metadata package.

## Sources

[1]: https://developer.apple.com/kids/ "Apple — Design safe and age-appropriate experiences"
[2]: https://developer.apple.com/app-store/review/guidelines/ "Apple — App Review Guidelines"
[3]: https://developer.apple.com/app-store/app-privacy-details/ "Apple — App privacy details"
[4]: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions "FTC — Complying with COPPA: Frequently Asked Questions"
