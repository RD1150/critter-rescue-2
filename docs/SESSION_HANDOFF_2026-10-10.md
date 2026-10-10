# VisionRoute Continuation Handoff — 2026-10-10

## Current state

- **Last independently confirmed published version:** `a6ce8208d20dea3cec1cc86ed46aaade8e67e4ef`
- **Published URL:** https://visionroute-9gbrevnb.manus.space
- **Prior public-proof checkpoint:** `5453b61`. The user reported publishing it through the Dashboard; do not independently claim its deployment state without a confirmed publish result.
- **Current pending checkpoint:** self-service pricing, annual Stripe test checkout, and five-day cancellation enforcement are locally complete and validated. This change has not yet been checkpointed or published.
- **GitHub source branch:** `RD1150/critter-rescue-2:visionroute-phase1`
- **Preview service:** port 3000.

## Current public/product offer

- **VisionRoute Coach:** `$97/month`.
- **VisionRoute Coach Annual:** `$970/year`, equal to two months free versus monthly billing.
- **Included:** self-service portal name, hosted logo, color, welcome message, and configurable terminology; no $499 setup fee.
- **Cancellation policy:** account owners may request cancellation at period end only when at least five days remain before renewal. The request is owner-only, updates Stripe with `cancel_at_period_end`, records an audit event, and retains access through the paid period.
- **Not included:** custom domains, branded sender email, and full platform-brand removal. These require DNS ownership/verification, provider support, and additional operational work; treat them as a later concierge add-on only if demand warrants it.
- **Not yet decided:** active-client allowance, coach-seat allowance, trial duration, and card requirement. The public page states that these founder-pilot terms are confirmed before checkout rather than inventing them.

## Implemented public-site proof and trust improvements

1. Business-coach headline: **“Know what your clients did between calls.”**
2. A public fictional walkthrough with coach/client views: missed action, lower capacity, selected reroute, coach approval, protected next action, and source-separated pre-call brief.
3. Business-coach-first marketing; sports stays a configurable product capability, not a public launch promise.
4. Transparent self-service branding scope and explicit exclusions.
5. Tenant/AI/approval/test-mode trust content and footer anchors.
6. Accessibility and consistency fixes: pinch zoom restored, starter comment removed, client/coach visuals separated, example date reconciled, and route-progress meaning labelled.

## Validation evidence

- `pnpm check` passed.
- `pnpm test` passed: **5 files, 16 tests**.
- `pnpm build` passed.
- Desktop and mobile full-page pricing/marketing screenshots were reviewed.
- No retired `$499` / founding-white-label product references remain in client, server, README, test report, or delivery checklist.
- The build emits the existing non-blocking JavaScript-chunk-size advisory; route-level code splitting remains a Phase 2 improvement.

## Cost context already discussed

External components only, not Manus platform/credit costs:

- Stripe published U.S. domestic-card fee: 2.9% + $0.30; Stripe Billing pay-as-you-go: 0.7% of billing volume.
- At $97/month: $3.79 under the stated assumptions, leaving $93.21 before hosting, managed AI, support, refunds, tax, and labor.
- At $970/year: $35.22 under the stated assumptions, leaving $934.78 before those costs.
- Resend free transactional tier: 3,000 emails/month with a 100/day cap; paid tier begins at $20/month for 50,000 emails.
- Do **not** estimate Manus account/platform billing. Direct that question to https://help.manus.im.

Sources used: https://stripe.com/pricing, https://resend.com/docs/knowledge-base/what-is-resend-pricing, https://resend.com/docs/add-a-domain, and https://vercel.com/docs/domains/working-with-domains/add-a-domain.

## Next safe sequence

1. Commit and push the pending self-service pricing/cancellation revision to canonical `main` and the GitHub source branch.
2. Submit a publish request for that exact checkpoint; auto-publish is disabled and a user approval card may be required.
3. Before enabling live billing, decide active-client/seat limits, trial/card policy, and complete a signed Stripe test checkout + webhook + cancellation walkthrough for both billing intervals.
4. Keep branded sender email and custom-domain commitments out of the self-service offer until a supported deployment/domain workflow exists.
