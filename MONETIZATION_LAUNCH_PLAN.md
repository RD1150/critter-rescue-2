# Critter Rescue: Monetization Launch Plan

**Prepared:** October 9, 2026
**Author:** Manus AI

## The recommended first revenue model

Launch Critter Rescue first as a **paid, one-time-purchase app** after a free, caregiver-led beta. Use a provisional **$4.99 “Founding Family” price** for the first commercial test, with the entire current game included and no advertising, in-game currency, locked child-facing prompts, or recurring charge.

This is the simplest and safest commercial route for the game as it exists today. The current product has no payment or entitlement system, and it does not yet have evidence that families will renew monthly. A paid app lets a parent decide at the store before their child enters the game. It avoids building a paywall into the child play loop and avoids promising monthly content before a realistic content cadence exists.

The $4.99 figure is a **test price, not a forecast or a proven market price**. The current five-app US benchmark supports a **$3.99–$5.99** one-time test range for a focused local-first preschool game. It does not establish a market-wide average or a willingness-to-pay result.[15] If Apple Small Business Program eligibility applies, a $4.99 sale leaves about **$4.24 before taxes, refunds, hosting, support, and marketing** after a 15% store commission. If the standard 30% rate applies, it leaves about **$3.49**. Apple’s program provides a 15% commission on paid apps and in-app purchases for eligible developers under its stated proceeds conditions.[1]

Do **not** start with ads, rewarded ads, loot boxes, or a child-facing store. Apple’s Kids Category rules require purchases to sit in a designated area behind a parental gate. Google’s Families policy restricts aggressive and manipulative commercial tactics in child-directed apps.[2] [3]

## What you need to decide

### 1. Choose the first offer

Approve this initial offer:

> **Critter Rescue — Founding Family Edition**
> One-time purchase: **$4.99**
> Includes: the current plushie sanctuary, rescues, Care Pair Picnic, learning activities, local progress, accessibility settings, seasonal paths, and future bug-fix updates.
> Excludes: ads, child accounts, cloud progress, physical goods, and any promise of a monthly content drop.

If you prefer a free download instead, the alternative is a **free starter experience plus a parent-gated, one-time “Full Sanctuary Unlock.”** That choice adds billing code, entitlement checks, purchase restoration, and careful feature-boundary design. It is a valid second option, but it is more work and creates more store-review risk than a paid app.

A $4.99/month subscription should wait. It becomes reasonable only after real families demonstrate repeat use and you can commit to a transparent, sustainable content schedule. The existing pricing assessment treats $4.99/month as a future hypothesis, not a current commercial recommendation.[4]

### 2. Choose the publisher identity and support channel

Before any external beta or paid launch, choose the exact publisher name that will appear in App Store Connect and Google Play Console. Create and actively monitor one adult support/privacy email address. Update the published Privacy Policy, Terms, FAQ, beta invitation, store listing, and support form with that final address.

You also need to decide whether Google Play will be owned by you personally or by a business entity. Google’s enrollment flow includes a developer-account type and identity verification, and the account owner should be selected deliberately.[5]

### 3. Enroll in Google Play Console

You already have an Apple Developer account. For Android, complete Google Play Console enrollment, accept the distribution agreement, pay the registration fee, choose the account type, and complete identity verification.[5] This enrollment includes a payment step that you must complete yourself.

### 4. Preserve the paid Android release option from the beginning

If you choose the $4.99 paid-app path, create the Google Play app record as **paid** before any testing release is published. Google allows an app to change from paid to free, but once it has been offered free it cannot become paid again under the same package name.[6]

Use Google Play **internal testing** for the first no-cost Android quality and caregiver beta. Google permits internal testers to install a paid app for free. Open and closed testers must purchase a paid app.[7] This lets the early beta remain free while preserving the eventual paid listing. If you later need a Google closed test for production access, plan its tester access and reimbursement or promotion process before inviting anyone.

If the Play account is a new **personal** account, Google requires a closed test with at least 12 opted-in testers for 14 continuous days before production access can be requested. Recruit adult testers, not children, and tell them clearly that the test must remain opted in for the full period.[8]

## What has to happen before the game can take money

### Finish the signed beta release path

The code is prepared for native packaging, but it is not yet a tested commercial binary. On a release machine, generate the iOS and Android Capacitor projects, configure Apple signing and the Android signing key, build signed test versions, and keep all certificates, keys, passwords, and release archives outside Git.

Then run the physical-device smoke script on at least one iPhone or iPad and one Android device. Test online and in airplane mode. Confirm child entry, a rescue, Care Pair Picnic, local progress after relaunch, audio preferences, Reduce Motion, the parent math gate, public legal pages, and adult contact validation. The known limitation is important: core UI and local progress should work offline, but some remotely delivered art and audio may not. Do not advertise the app as fully offline.[9] [10]

### Run a free, caregiver-led beta before building commerce

Invite **10–15 caregiver households** to a no-cost, no-purchase beta only after the release gate is complete. Use TestFlight for iOS and the Android internal-test track for the first Android group if the app will later be sold as a paid app. Let each household use the signed build for 10–15 minutes with a child. Ask the adults whether the child could start an activity, whether the experience felt calm, whether they returned later, and what would make it feel worth buying. Do not collect child names, photos, recordings, birth dates, schools, or behavioral profiles.[9]

Do not use beta contact details as a mailing list. Keep the current adult-only support flow, child-data warning, and 30-day support-record deletion policy. Confirm the deployed cleanup and hosting/vendor records before inviting testers.[9] [11]

### Complete store and legal operations

Before store submission, complete the final App Store and Google Play forms from the actual signed build. That includes the privacy disclosures, target audience, content rating, Kids/Families declarations, support URL, privacy-policy URL, screenshots, app description, and review notes. The game should be declared for its real preschool audience, not a broader age range merely to simplify forms.[3] [10]

Finish the asset-rights register for every shipped illustration, music clip, voice asset, logo, font, and code dependency. Also confirm the production host, media-delivery, database, access-log, and backup-retention practices. The current source review does not prove those infrastructure practices.[11]

## What I would build after you approve the revenue model

### For the recommended paid-app model

No in-game billing code is required. I would prepare the final paid-store listings, paid-app price configuration, screenshots, age-rating answers, privacy/support links, release notes, TestFlight and closed-test instructions, and the adult beta materials. Store purchase happens before installation, so there is no purchase prompt in the child experience.

### If you choose a free app with a one-time unlock

I would implement an adult-only purchase area behind the existing math gate. It would have one clearly labelled product, a transparent price, a restore-purchases action, a manage-purchases route, graceful error states, and no purchase message in child game screens. Apple requires In-App Purchase when an app unlocks features or functionality inside the app.[2] Google Play Billing supports both one-time digital products and subscriptions, but its billing guidance recommends secure entitlement handling and a backend for purchase-management work.[12]

This would require a new payment vendor and data-flow review before release. We would need to disclose any billing SDK or processor accurately, keep purchase information out of the child experience, verify transactions, restore purchases after reinstall or device change where platform rules allow, and test refund/cancellation behavior.

### If you choose subscriptions later

A subscription needs more than a Buy button. It needs adult-only purchase and cancellation information, platform-specific products and pricing, entitlement verification, restore purchases, subscription-status changes, refund handling, customer support procedures, and a believable content cadence. Google Play configures subscriptions through a product, base plan, and offer structure.[13]

Do not add a subscription until the beta supports two facts: families return, and parents understand why fresh content is worth a recurring charge. The strongest early commercial evidence would be actual settled, non-refunded adult payments after a disclosed refund period—not clicks, surveys, or waitlist signups.[14]

## A practical sequence

1. **You:** Approve the initial commercial model: paid app at $4.99, or free app plus a parent-gated one-time unlock.
2. **You:** Finalize the publisher name, a monitored support/privacy email, and Google Play Console ownership. Enroll and pay the Google registration fee if Android distribution is desired.
3. **You:** If selecting the paid-app path, set the new Google Play app record to **paid** before its first testing release. Use iOS TestFlight and Android internal testing for the no-cost initial beta.
4. **Us on the release machine:** Generate and sign iOS and Android builds, then complete the required real-device online/offline smoke test.
5. **You:** Complete the final Apple and Google disclosure forms with the actual build, confirmed vendor information, and final support details. If the Play account is new and personal, start the required 12-adult, 14-day closed test.
6. **Us:** Run the free 10–15-household caregiver beta. Fix any child-flow, reliability, privacy, or accessibility issues before charging anyone.
7. **You:** Review the beta results and approve the paid offer. If the paid-app model remains selected, configure the store price and submit. If the unlock model is selected, authorize a separate billing implementation and review.
8. **Us:** Publish only after the store records, metadata, asset rights, support operation, and tested builds are all complete.

## What you need to do now

The next three actions are yours:

1. Reply with either **“Paid app at $4.99”** or **“Free starter plus one-time unlock.”**
2. Confirm the final publisher name and the adult support/privacy email you want visible in the store and privacy materials.
3. Enroll the chosen Google account in Play Console if you want Android at launch. Use the long-term owner account and complete its payment and verification steps.
4. If you choose the paid-app option, tell me before the first Android testing release so the Play Console record is configured as paid from the start.

Once you choose the offer, I can prepare the matching store configuration, listing copy, product plan, and any necessary code work. I cannot complete payment, identity verification, Apple signing, Android keystore creation, or physical-device testing without the appropriate owner-controlled accounts and release hardware.

## References

[1]: https://developer.apple.com/app-store/small-business-program/ "App Store Small Business Program"

[2]: https://developer.apple.com/app-store/review/guidelines/ "Apple App Review Guidelines — Kids Category and In-App Purchase requirements"

[3]: https://support.google.com/googleplay/android-developer/answer/9893335?hl=en "Google Play Families Policies"

[4]: ./PARENT_SUBSCRIPTION_PRICE_VALIDATION.md "Critter Rescue Parent Subscription Price Validation"

[5]: https://support.google.com/googleplay/android-developer/answer/6112435?hl=en "Get started with Play Console"

[6]: https://support.google.com/googleplay/android-developer/answer/6334373?hl=en "Set up your app's prices"

[7]: https://support.google.com/googleplay/android-developer/answer/9845334?hl=en "Set up an open, closed, or internal test"

[8]: https://support.google.com/googleplay/android-developer/answer/14151465?hl=en "App testing requirements for new personal developer accounts"

[9]: ./CLOSED_BETA_OPERATIONS_PACKET.md "Critter Rescue Parent-Safe Closed Beta Operations Packet"

[10]: ./NATIVE_BETA_RELEASE_GUIDE.md "Critter Rescue TestFlight and Google Play Closed-Beta Release Guide"

[11]: ./RELEASE_DATA_FLOW_AND_VENDOR_REGISTER.md "Critter Rescue Pre-Beta Data-Flow and Vendor Register"

[12]: https://developer.android.com/google/play/billing "Google Play Billing"

[13]: https://support.google.com/googleplay/android-developer/answer/140504?hl=en "Create and manage subscriptions"

[14]: ./research/viability/critter-rescue-viability-assessment.md "Critter Rescue Viability and Revenue Assessment"

[15]: ./research/price-benchmark/preschool-app-price-benchmark.md "Critter Rescue US Preschool-App Price Benchmark"
