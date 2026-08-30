# Critter Rescue Monthly Operating Cost and Break-Even Model

> **Planning estimate, not a bill or guarantee:** I am not a licensed financial advisor. This is an operating-cost analysis using public list prices and explicit assumptions. Your actual expenses depend on your hosting plan, domain registrar, App Store country, tax treatment, voice usage, support workload, and eventual subscription implementation.

## Direct Answer

There is **not enough verified billing information to state your exact current monthly expense**. The current game is hosted on a managed platform and uses a managed domain; I do not have access to your plan price, invoice, included usage, or renewal charge, and I will not estimate those platform charges. For the exact managed-hosting cost, consult the project billing details or [Manus Help](https://help.manus.im).

Excluding unknown hosting and domain charges, an iOS launch that keeps using pre-generated direction audio has a known public-cost floor of approximately **$8.25/month** for the annual Apple Developer Program membership. If you keep a paid ElevenLabs Starter plan available for future voice and music creation, the public list-price floor becomes **$14.25/month** before hosting, domain, taxes, support, test devices, creative production, or marketing.[1] [2]

## Cost Categories

| Cost category | Current or future status | Amount used in this model | Confidence and note |
|---|---|---:|---|
| Managed web hosting and project services | Current, but plan and usage are unknown | **Not estimated** | Obtain actual billing from the project’s account. This is likely the most important missing cash-cost input today. |
| Custom domain | Current, but registrar and renewal are unknown | **Not estimated** | Use the registrar renewal invoice; do not substitute a generic domain-cost estimate. |
| Apple Developer Program | Required for public App Store distribution | $99/year, or **$8.25/month** annualized | Apple publicly states $99 per membership year, subject to local currency and eligible fee waivers.[1] |
| App Store commission | Future variable cost only after paid sales | 15% or 30%, depending on program eligibility and transaction | Apple states a 30% commission for digital goods/services, with 15% under qualifying programs and qualifying subscriptions; model uses 15% only as an eligible-small-business sensitivity.[1] |
| ElevenLabs content creation | Optional future production cost | $0, $6, $11, $99, $299, or $990/month by published plan | Existing deployed clips are pre-generated assets, so ordinary playback does not call the service for each child. New narration, music, or voice work would consume the selected plan’s credits.[2] |
| Beta feedback database and application server | Included in current project delivery configuration, exact allowance unknown | **Not estimated separately** | Treat any increment as part of the managed hosting bill unless an actual invoice separates it. |
| Support, marketing, legal/privacy, test devices, and physical plush | Future, variable operating or launch cost | **Not included** | These can exceed basic software costs and should be budgeted from actual quotes and time tracking. |

## Monthly Scenarios Excluding Unknown Hosting and Domain

| Scenario | Apple annual fee, monthly equivalent | ElevenLabs assumption | Known monthly cash cost | What it means |
|---|---:|---:|---:|---|
| Current web beta with pre-generated media | $0.00 | $0.00 incremental | **$0.00 plus unknown hosting/domain** | No public App Store distribution and no new paid voice production. |
| Public iOS beta / launch-ready account | $8.25 | $0.00 incremental | **$8.25 plus unknown hosting/domain** | Apple account is paid; reuse existing pre-generated clips. |
| Lean content-production month | $8.25 | $6.00 Starter | **$14.25 plus unknown hosting/domain** | Keeps a commercial-use Starter subscription available for new voice/music work. |
| Ongoing creator-content month | $8.25 | $11.00 Creator | **$19.25 plus unknown hosting/domain** | Uses ElevenLabs’ published current Creator plan after its stated introductory offer. |
| Higher-volume production month | $8.25 | $99.00 Pro | **$107.25 plus unknown hosting/domain** | Only relevant if regular production requires the published Pro tier. |

## Subscription Contribution and Break-Even Sensitivity

The following analysis assumes a **$4.99/month** subscription and a **15% App Store commission**. It is not an after-tax profit calculation and excludes refunds, support, advertising, hosting, domain, and any payment or legal costs.

> **Net contribution per active subscriber before other costs = $4.99 × (1 − 0.15) = $4.2415/month.**

| Active paid subscribers | Monthly contribution after assumed 15% App Store commission | Covers $8.25 Apple-only known cost? | Covers $14.25 Apple + ElevenLabs Starter known cost? |
|---:|---:|---|---|
| 1 | $4.2415 | No | No |
| 4 | $16.9660 | Yes | Yes |
| 10 | $42.4150 | Yes, before unknown costs | Yes, before unknown costs |
| 20 | $84.8300 | Yes, before unknown costs | Yes, before unknown costs |
| 50 | $212.0750 | Yes, before unknown costs | Yes, before unknown costs |
| 100 | $424.1500 | Yes, before unknown costs | Yes, before unknown costs |

The arithmetic break-even against the known $14.25/month Apple-plus-Starter floor is **3.3596 subscribers**, so it rounds up to **4 paid subscribers**. This does **not** mean four subscribers make the business profitable: hosting, domain, support, refunds, marketing, taxes, app-development time, and compliance work still need to be added.

## Practical Budget Recommendation

For planning, track two separate numbers every month:

| Budget view | Formula | Use |
|---|---|---|
| Cash software cost | Actual managed hosting + actual domain + $8.25 Apple annualized + actual voice-service invoice + any paid tools | Determines whether ongoing bills are covered. |
| Fully loaded cost | Cash software cost + support labor + content-production labor + marketing spend + legal/compliance + device/testing + refunds | Determines whether the app has a sustainable business model. |

Keep all optional voice playback pre-generated and hosted as static assets, as Critter Rescue currently does. That avoids an unpredictable per-listen voice bill. Add recurring voice-service cost only in months where you actively create new materials. Do not order physical plush inventory or scale advertising until the beta establishes repeat family use, real subscription conversion, and the true hosting invoice.

## Information Needed for an Exact Model

| Missing input | How to obtain it |
|---|---|
| Managed hosting/project plan and usage bill | Review the hosting account’s billing details or contact [Manus Help](https://help.manus.im). |
| Domain renewal amount | Review the domain registrar invoice and renewal date. |
| Actual ElevenLabs plan, credits, and invoices | Review the account billing and monthly usage page. |
| Intended subscription price and App Store program eligibility | Decide during App Store setup; confirm the commission rather than assume 15%. |
| Refunds, support time, ad spend, and test-device costs | Track these during the 10–25-family beta and first paid cohort. |

## References

[1] [Apple Developer, *Apple Developer Program Membership Details*](https://developer.apple.com/programs/whats-included/)

[2] [ElevenLabs, *Pricing*](https://elevenlabs.io/pricing)
