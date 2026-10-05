# Critter Rescue — Parent-Safe Closed Beta Operations Packet

**Prepared:** October 5, 2026
**Beta shape:** Free, limited, caregiver-led test of a calm preschool game (ages 3–6)
**Not yet authorized:** Public release, subscriptions, in-app purchases, broad marketing, or claims of complete native/offline readiness

> The beta should test whether children enjoy returning to Critter Rescue and whether caregivers understand its calm, local-first design. It should not collect child names, photos, recordings, dates of birth, contact details, or behavioral profiles.

## 1. Beta operating rules

| Rule | Requirement |
| --- | --- |
| Audience | Recruit caregivers, not children. The caregiver decides whether to let a child play and supplies feedback. |
| Size | Begin with **10–15 caregiver households**. Expand only after signed-device smoke testing and a review of the first feedback set. |
| Cost and commerce | Free; no ads, subscription, purchase, reward-for-purchase, or external commercial prompt. |
| Accounts | No child accounts, profiles, cloud saves, social graph, chat, uploads, or sharing. |
| Data minimization | Ask adults only for optional support/contact details. Do not request child names, ages, schools, photos, recordings, diagnoses, or stories that identify them. |
| Support data | Parent form collects adult email, category, and message only after math gate and child-data warning. Records are scheduled for automatic deletion after 30 days; observe that cleanup in production before inviting external testers. |
| Access | Keep adult contact records accessible only to the owner and essential support operator(s). No secondary spreadsheet, analytics export, or mailing list. |
| Marketing | Do not use tester emails for marketing. Do not post children, quotes tied to identifiable families, screenshots containing personal information, or testimonials without a separate explicit adult permission process. |
| Stop conditions | Pause invitations immediately for a crash/blocked child flow, a privacy incident, accidental child-data submission, broken parental gate, broken contact route, or misleading store disclosure. |

## 2. Gate before inviting any household

All items must be complete before sending an external test invitation.

- [ ] Final publisher name, monitored adult support/privacy email, and support owner are chosen.
- [ ] Privacy page is publicly reachable over HTTPS and is completed with final contact details.
- [ ] Contact database retention purge is deployed and observed in the actual environment.
- [ ] Hosting/storage/database logging and backup retention have been confirmed with providers.
- [ ] Asset-rights register is complete for every shipped asset.
- [ ] Signed iOS and Android beta builds exist; no signing material is committed to GitHub.
- [ ] Real iOS and Android online/airplane-mode smoke tests pass.
- [ ] Apple TestFlight and Google Play records/disclosures match the shipped build.
- [ ] The user-facing beta description does not promise “fully offline,” “COPPA certified,” data portability, or cloud progress.

## 3. Caregiver invitation draft

> **Subject:** Invitation: private Critter Rescue caregiver beta
>
> Hi — I’m inviting a small group of caregivers to try **Critter Rescue**, a calm plushie-style game for young children.
>
> The test is free and takes about 10–15 minutes. A caregiver should be present. The game is designed with no ads, no child accounts, no purchases, and local device progress.
>
> Please do **not** send a child’s name, photo, recording, date of birth, school, address, or other private information. If you share feedback, use the grown-up support area or reply with only general observations.
>
> This is a test build, so it may change or have bugs. Participation is optional; you can stop at any time by deleting the test app. Clearing app data or uninstalling may erase local game progress.
>
> Privacy information: `[FINAL PRIVACY URL]`
> Adult support: `[FINAL SUPPORT EMAIL]`

Replace both bracketed values before sending. Do not send this invitation until the gate checklist is complete.

## 4. Adult-only session plan

1. Caregiver reads the invitation/privacy page and chooses whether to participate.
2. Caregiver installs the signed TestFlight or Google Play closed-test build.
3. Caregiver opens the game with the child and lets the child choose the pace.
4. Observe **without collecting or writing down the child’s identifying information**.
5. The child may stop, switch activities, or skip spoken directions at any time.
6. Caregiver uses the parent math gate to try one accessibility option and the support form if appropriate.
7. Caregiver answers the short adult-only feedback prompts below.
8. Operator does not reuse support records for marketing and verifies the deployed 30-day deletion schedule before invitations begin.

## 5. Adult feedback form / interview prompts

Ask caregivers to answer in general terms. Do not request a child’s name or any identifying detail.

| Topic | Adult-only prompt |
| --- | --- |
| First play | “Could your child find one activity to begin without feeling rushed?” |
| Clarity | “Which instruction, button, or screen was clearest? Was anything confusing?” |
| Calmness | “Did the pace, sound, and movement feel calm for your family? Did you try Reduce Motion or audio choices?” |
| Engagement | “Did your child choose to continue, return later, or prefer a particular type of activity?” |
| Accessibility | “Were touch targets, captions, optional directions, and volume controls easy to use?” |
| Reliability | “Did you see a crash, a missing image/audio item, or a blocked screen? Please describe the screen—not the child.” |
| Offline expectation | “When offline or in airplane mode, did the core app and saved local progress behave as expected? Did any media fail gracefully?” |
| Parent area | “Could you find and pass the parent math gate and understand the privacy/support information?” |
| Value hypothesis | “What would make this feel more useful or trustworthy to your family?” |
| Permission to follow up | “May we reply once about this support request? [Yes/No]” |

## 6. Required signed-device smoke script

Run this before inviting external testers, on at least one physical iPhone/iPad and one physical Android device.

| Scenario | Pass condition |
| --- | --- |
| Cold launch online | App launches to usable child entry; no crash or blocking error. |
| Core child play | Camp, one rescue, Care Pair Picnic, optional sound, and Reduce Motion work. |
| Local persistence | A completed action remains after closing and reopening the app on the same device. |
| Parent gate | Wrong math answer does not open adult tools; correct answer opens them; lock/expiry returns safely to child area. |
| Legal information | `/privacy`, `/terms`, and `/faq` equivalents open and return safely through the gate where applicable. |
| Parent contact | Validation, child-data confirmation, rate limit, successful submit, and service error copy behave as expected. Do not enter real child information. |
| Airplane mode | Core local UI and saved progress remain usable. Remote art/audio failures, if any, do not block play or falsely promise full offline media. |
| Audio/accessibility | No autoplay before interaction; captions, volume, spoken-directions preference, and Reduce Motion behave as described. |
| Device ergonomics | Large touch targets and parent controls are reachable on the physical screen. |

Record only device model, OS version, build number, pass/fail result, and a non-identifying issue summary.

## 7. Support-data handling SOP

1. Read incoming contact records only to reply, fix a bug, or assess an idea.
2. Never copy a message into a marketing system, analytics tool, shared public document, or a child profile.
3. If a message includes child personal information, stop using it, delete the record promptly, and do not ask for more child data.
4. Do not forward the message beyond essential support personnel.
5. The app schedules a database cleanup of contact rows after 30 days. Verify that cleanup in the deployed environment, and delete any manual email copies, screenshots, exports, or issue-tracker duplicates on the same 30-day schedule.
6. If an adult requests deletion, use the final monitored privacy/support route, verify the request reasonably, remove matching support records/manual copies where possible, and confirm completion. This operational process must exist before marking a store deletion-request field as available.

## 8. Platform process notes

### Apple TestFlight

- Apple’s [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/) calls for beta test information, an explanation of features to test, and a feedback email.
- Internal TestFlight can be used first; external testing may require Beta App Review. TestFlight builds are available for up to 90 days.
- Use the store/feedback email only after it is monitored and included in the privacy materials.

### Google Play closed testing

- The October 5, 2026 browser check found the current Console account at a **developer-account signup** screen, not inside an enrolled Play Console.
- Choose the long-term account owner and personal vs. organization type before enrollment. Google states the owner account cannot simply be changed later.
- Google’s [Data Safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en) says published apps on closed tracks need the form and privacy-policy link; internal-test-only apps are exempt while they remain exclusively internal.

## 9. No-go claims and language

Do **not** use any of the following without further evidence or a new review:

- “Fully offline” or “works without internet” for all art/audio.
- “COPPA certified,” “legally compliant,” “lawyer approved,” or “privacy guaranteed.”
- “No data collected” while optional support email/message retention or unverified infrastructure logs exist.
- “Cloud saved,” “backs up automatically,” or “progress transfers devices.”
- “Safe for every child,” medical/therapeutic claims, or claims that screen time is educationally guaranteed.

Use this instead:

> “Designed for local play. Progress and settings stay on the device. Some art and audio may need an internet connection to load. Parent support is optional and should never include child private information.”
