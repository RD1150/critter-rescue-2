# VisionRoute — Phase 1 Delivery Checklist

Legend: **[x]** implemented and automatically validated, **[~]** implemented with an external/manual validation dependency, **[ ]** not delivered.

## Foundation, portability, and security

- [x] Establish the React/Express/TypeScript project foundation, responsive design system, page manifest, product navigation, and premium route-led marketing/site experience. Preserve a clean GitHub-compatible repository and standard transferable TypeScript source.
- [~] Implement server-validated session resolution, tenant memberships and role-based access for platform admin, account owner/head coach, additional coach architecture and client/athlete. Enforce tenant-aware queries and direct-object checks server-side: Account A cannot access Account B clients/routes/notes/data and Client A cannot access Client B. **Manual four-identity database validation remains required.**
- [x] Document local setup, environment variables, authentication, database/migrations, Stripe, AI, email, deployment, background work, tenant architecture, test setup, limitations and future Phase 2.

## Tenant accounts, onboarding, invitation, and branding

- [~] Support new coach account creation with name, business name, coaching category, optional website/logo, brand color, welcome message, and terminology preference. Create an owner membership and provide an optional clearly labelled demo workspace with a sample goal, route, milestones, completed/missed actions, check-in, reroute and coach brief. **Authenticated save walkthrough pending.**
- [~] Support client create/invite/accept lifecycle with email, invitation status Invited/Accepted/Active, safe invitation tokens, correct tenant joining, and server-side tenant isolation. Keep email delivery honest: queue/in-app when no external transactional email provider is configured. **Second-identity walkthrough and revoke/resend UI are deferred.**
- [x] Support AI-assisted client intake covering goal, date, why, competing attention, weekly time, completed work, obstacles, fixed/postponable commitments, success and constraints; include optional sports questions and prohibit medical diagnosis, treatment, clearance and safety claims.
- [x] Implement configuration-driven branding and terminology for a universal planning engine, including Goal/Performance Outcome, Task/Training Commitment, Milestone/Benchmark and Check-In/Training Check-In variants. Do not create different products by category.

## Goal, route, execution, capacity, and approval workflow

- [x] Model client goals, versioned routes, milestones, actions, dependencies, checkpoints, effort, route categories Active/Maintain/Next/Park, action events, route approval and audit history. Generate a proposed route from sufficient intake context, work backward from the date, and present a reality check when capacity does not support the deadline.
- [~] Build a visually strong professional Route screen with You Are Here, route line, milestones, progress and destination. Allow a coach to review, approve or reject major AI-suggested goal/date/milestone/workload/benchmark/locked-action changes; clients only view approved changes. **End-to-end coach/client walkthrough pending.**
- [x] Build client Today with the top 1–3 actions, estimated time, progress and Low/Normal/High capacity or readiness selector. Low capacity reduces workload while protecting critical priority. Include a prominent What Should I Do?/What Should I Train? action that returns one clear next action and supports Done — give me the next action.

## Check-ins, reroutes, briefs and AI

- [x] Capture weekly check-ins: completed work, obstacles, changes, priority confidence, reroute need and capacity. Preserve client reports, create coach-reviewable summaries, and update progress.
- [~] Trigger reroute from missed actions or client request; ask What happened? and offer Keep Destination, Move Destination, Reduce Scope and Change Route. Require coach approval when a selected option changes a major locked decision; show clients only the approved updated route. **End-to-end role walkthrough pending.**
- [x] Provide an AI pre-session coach brief that visibly separates system data, client-reported information, coach notes and non-factual AI interpretation; include progress, completed work, recurring delays/patterns and suggested coaching discussion.
- [~] Build a provider-neutral AI interface with structured validated responses for route generation, check-in summary and coach brief, bounded structured summaries, model/feature/tenant usage and persistent tenant rate limit. **AI intake follow-up/reroute semantic generation and real-response quality evaluation remain Phase 2 validation work.**

## Support services, billing, analytics, export and validation

- [x] Store tenant-scoped templates, AI summaries/usage, subscriptions, notifications, privacy-safe analytics events, audit events and CSV exports for clients/goals/routes/check-ins. Do not put private client content in analytics event data.
- [~] Implement Stripe test-mode subscription architecture for VisionRoute Coach ($97/month) and Founding Coach White-Label Setup ($499 one-time plus $97/month), centralized products/prices, server checkout, secure transactional webhook handling and tenant subscription status. Do not process live charges. **Real signed webhook/4242 checkout validation pending.**
- [~] Complete accessible desktop/tablet/mobile views, automated types/unit checks for planning/policy/billing catalog, manual core-workflow evidence, schema documentation/diagram, test report, known issues and explicit Phase 2 recommendations. Do not declare success based on screens alone. **Multi-identity integration and authenticated walkthroughs remain pending.**
