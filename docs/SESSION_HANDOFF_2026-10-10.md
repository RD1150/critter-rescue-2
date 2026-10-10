# VisionRoute Continuation Handoff — 2026-10-10

## Current state

- **Last published version:** `a6ce8208d20dea3cec1cc86ed46aaade8e67e4ef`
- **Published URL:** https://visionroute-9gbrevnb.manus.space
- **GitHub source branch:** `RD1150/critter-rescue-2:visionroute-phase1`
- **Current local work:** Phase 1.1 public marketing refinements are implemented and validated locally but have **not yet been checkpointed or published**. They intentionally remain separate from the currently live public site until commercial terms are confirmed.
- **Preview service:** uses port 3000. The revised local page is visible at the bound Preview.

## What was implemented locally

The public landing page now:

1. Leads with the business-coach outcome: **“Know what your clients did between calls.”**
2. Includes a clearly labelled, entirely fictional public walkthrough with distinct client and coach tabs. It shows reduced capacity, a missed action, a selected reroute, a coach approval decision, the protected next action while approval is pending, and a source-separated pre-call brief.
3. Narrows public messaging to independent business coaches. Sports remains a configurable product capability but is not a first-launch marketing promise.
4. Reframes white label as **Branded client portal setup** and lists included Phase 1 scope: portal name, hosted logo, color, welcome message, and terminology. Custom domains, branded sender email, and full platform-brand removal remain excluded.
5. Adds factual trust content about tenant-scoped workspaces, CSV export, coach approval boundaries, labelled AI interpretation, and the current pilot/test-mode boundary.
6. Fixes externally reported public-site issues: viewport zoom restriction removed, leftover starter-template comment removed, fictional date reconciled to 52 days, hero client/coach concepts separated, and the 62% visual now explains it measures current route actions.
7. Adds footer anchors for fictional demo, pilot pricing, branded portal, and data/AI content.

## Validation completed for the local refinement

- `pnpm check` passed.
- `pnpm test` passed: 5 files, 15 tests.
- `pnpm build` passed.
- Desktop and mobile full-page screenshots were reviewed after the public-demo update.
- `maximum-scale` and `BLOCK TO BE DELETED` no longer appear under `client/`.
- Build continues to show the existing advisory that the JavaScript bundle exceeds 500 kB; this is a non-blocking Phase 2 code-splitting opportunity.

## Confirmed commercial decisions

1. **Annual plan:** `$970/year` — two months free relative to the $97/month price.
2. **Cancellation policy:** a customer must request cancellation at least **5 days before the renewal date** to avoid the next monthly charge.

## Decisions still required before finalizing and publishing pricing

The site intentionally does not invent these terms. Confirm each one before changing customer-facing pricing/legal claims:

1. **Included allowance:** recommended starting point is **10 active clients and 1 coach** per $97/month account.
2. **Trial/card policy:** recommended starting point is **14-day trial, no card required**.
3. **Branded-portal setup promise:** recommended starting point is **5 business days plus one included revision** for the existing Phase 1 branding scope.
4. Confirm whether the annual plan uses the same active-client/coach allowance and cancellation terms. The recommended answer is yes.

## Cost discussion already completed

These are **external-component estimates**, not Manus platform/credit costs:

- Stripe’s published U.S. domestic-card fee is 2.9% + $0.30; Stripe Billing pay-as-you-go is 0.7% of billing volume.
- At $97/month, this is $3.79 total under the stated assumptions, leaving $93.21 before hosting, managed AI, support, refunds, tax, and labor.
- At $970/year, this is $35.22 total under the stated assumptions, leaving $934.78 before those costs.
- At $499 one-time setup, Stripe’s card fee is $14.77 and leaves $484.23 before labor and setup-specific cost.
- Resend’s free transactional-email tier supports 3,000 emails/month with a 100/day cap; its paid tier begins at $20/month for 50,000 emails.
- Do **not** estimate or state Manus account/platform billing. Direct any such question to https://help.manus.im.

Authoritative research used: https://stripe.com/pricing, https://resend.com/docs/knowledge-base/what-is-resend-pricing, https://resend.com/docs/add-a-domain, and https://vercel.com/docs/domains/working-with-domains/add-a-domain.

## Branded-domain decision

Custom domains and branded email sending are technically feasible but not currently built into VisionRoute’s Phase 1 deployment.

- A custom portal domain requires the customer to control DNS, then requires domain verification, routing/HTTPS support in the deployment platform, and operational support.
- Branded sender email requires a verified customer domain and DNS SPF/DKIM records; domain propagation can occasionally take up to 72 hours.
- Treat these capabilities as a later paid add-on or higher-priced concierge setup, not a silent inclusion in the $499 Phase 1 setup fee.

## Next safe sequence

1. Get the four outstanding commercial-term decisions above.
2. Update the landing-page pricing, FAQ, and cancellation wording to reflect the confirmed terms.
3. Re-run `pnpm check`, `pnpm test`, and `pnpm build`; capture a responsive screenshot if the pricing layout changes materially.
4. Update this handoff and `docs/TEST_REPORT.md` with the refined release evidence.
5. Commit and push the complete refinement to canonical `main`; push the same commit to `github/visionroute-phase1` if that branch should stay aligned.
6. Submit a publish request. The project has auto-publish disabled, so the system may require a new user approval card. Do not claim the public URL reflects Phase 1.1 until that publish job succeeds.
