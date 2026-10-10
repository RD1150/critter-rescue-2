# Critter Rescue — Adult-Only Paid Acquisition Test Brief

**Prepared:** October 9, 2026
**Author:** Manus AI
**Status:** Planning only. This brief does not authorize ad spending, campaign creation, tracking installation, or publication.

## Recommendation

Use a small **Google/YouTube adult-only campaign** as the first paid acquisition experiment after Critter Rescue has completed the signed-build, real-device, and caregiver-beta release gates. The ad should lead an adult to the applicable App Store or Google Play product page. It should not lead a child into an in-app purchase flow.

Google Ads supports demographic targeting by age and parental status for several campaign types, including Demand Gen, Display, and Video. It also explicitly prohibits advertisers from targeting ads to children under 13 or teens under 18. [1]

The audience selection is an advertising-platform estimate, not verified household information. It is a way to reach likely adult caregivers without the owner personally recruiting families.

## Campaign objective and measurement

The first goal is **not** 1,000 buyers. The first goal is to learn whether an adult-only message can earn the first **10–25 settled, non-refunded purchases** at a cost that could work with the selected store price.

Track only aggregate adult business results:

| Measure | What to record | Do not record |
|---|---|---|
| Acquisition | Campaign, platform, country, date, creative variant, store/product-page visits where reported, and paid purchases from store sales reports | Child identity, child age, child device identifier, play history, or behavioral profile |
| Economics | Daily spend, store price, platform fee, refunds, and estimated cost per settled purchase | A conclusion that the campaign is profitable before all actual costs are known |
| Product signal | Non-identifying adult feedback about why they purchased or refunded | Child names, photos, recordings, school, diagnosis, or individual feedback without adult controls |

Do not install an advertising SDK, behavioral-retargeting system, or child behavioral analytics inside the game for this campaign. The FTC states that child-directed services remain responsible for third-party data collection that occurs through them. [2]

## First campaign setup

### Platform and destination

Start with a **Google/YouTube Video or Demand Gen campaign** and select the store listing that matches the device. Create separate iOS and Android destinations rather than sending an adult to the wrong store.

Run TikTok only as a second channel after the first adult campaign produces a useful result. TikTok has advertising protections for minors and states that ad material must not generate excessive appeal to a product for minors. [3]

### Adult audience guardrails

Use the following as the initial audience configuration, subject to what is actually available in the advertising account at setup time:

| Setting | First-test choice | Reason |
|---|---|---|
| Geography | United States only | The current price and store research use U.S. assumptions. |
| Age | 25–54 only | Keeps the campaign clearly adult-oriented. |
| Parental status | Parent | Uses Google’s supported adult demographic segment. [1] |
| Unknown age | Exclude for the first safety-focused test | Limits reach, but avoids knowingly broadening beyond the adult age band. |
| Child and teen targeting | Do not select or optimize toward it | Google does not permit advertisers to target ads only to children under 13 or teens under 18. [1] |
| Customer lists, child data, app retargeting | Do not use | The game’s privacy design does not justify this collection or profiling. |

Do not claim that every person reached is a parent. Audience settings are estimates. The ad should simply speak to the adult viewer, such as “A calm plushie rescue game for families with young children.”

## Two ad concepts to test

Use only game footage, original Critter Rescue art, and clear adult-facing captions. Do not use recognizable children, testimonials tied to children, child voices, or before-and-after learning claims.

### Creative A — Calm plushie rescue

> **Headline:** A calm plushie rescue game for ages 3–6
>
> **Body:** Help cozy animal friends through gentle rescue and care activities. No ads. No child accounts. Grown-up settings stay separate.
>
> **Call to action:** See the game

**Visual sequence:** a plushie asks for help, one simple care or matching activity, then the peaceful sanctuary and parent-settings screen.

### Creative B — Gentle learning through play

> **Headline:** Gentle learning in a cozy animal-care world
>
> **Body:** Picture matching, early learning activities, and quiet rescue play—made for grown-ups to choose with their child.
>
> **Call to action:** Explore Critter Rescue

**Visual sequence:** one picture-match interaction, a simple rescue task, and a calm completion moment. Do not display scores, streaks, timers, or purchase prompts.

## Claims and language to avoid

Do not use the following in ads, store assets, or creator instructions unless new evidence supports them:

- “Safe for every child,” “screen time without guilt,” or any medical, therapeutic, or guaranteed educational result;
- “COPPA certified,” “lawyer approved,” “fully offline,” or “no data collected”;
- “Your child needs this,” “make your preschooler smarter,” or other pressure-based language;
- child-facing pricing, urgency, rewards for purchasing, or “ask your parent” prompts.

TikTok’s child-safety policy prohibits creative that could endanger minors or generate excessive appeal to a product for minors. [3]

## Test rules and decision point

Before launching, choose a fixed low test cap that the owner is comfortable losing. Use the same audience, location, and destination for both concepts so the message is the main difference. Do not make a budget decision based on impressions or likes.

At the end of the test, compare:

1. store-page visits or qualified clicks;
2. settled, non-refunded paid purchases;
3. estimated acquisition cost per settled purchaser; and
4. adult feedback that explains the purchase decision.

A campaign cannot be economically sustainable if its cost per buyer exceeds the store proceeds after platform fees, before hosting, refunds, support, content, and other costs. At a proposed $9.99 base-game price, the pre-other-cost proceeds are $8.49 under a 15% platform-fee sensitivity and $6.99 under a 30% sensitivity. The campaign should therefore be treated as a learning test unless its cost per settled buyer is comfortably lower than the applicable proceeds.

## Prerequisites before any paid campaign

Do not start this campaign until all of the following have happened:

- the final publisher identity and monitored adult support contact are chosen;
- the final privacy, store, and support disclosures match the actual build;
- signed iOS and Android test builds have passed the real-device online and airplane-mode smoke test;
- the caregiver-led beta has identified and resolved critical usability, parental-gate, privacy, and reliability problems;
- the actual paid price is approved; and
- the owner has decided the test budget and has opened the relevant advertising account.

The campaign will be adult-facing. It is not a substitute for caregiver beta testing, and it must not change Critter Rescue’s no-ads-in-the-child-experience design.

## References

[1]: https://support.google.com/google-ads/answer/2580383?hl=en "Google Ads demographic targeting"

[2]: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions "FTC COPPA Frequently Asked Questions"

[3]: https://ads.tiktok.com/resources/help/article/protecting-minors-on-tiktok-advertising-initiatives "TikTok protections for minors in advertising"
