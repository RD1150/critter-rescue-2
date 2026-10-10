# VisionRoute

> **Turn coaching goals into execution.**

VisionRoute is a multi-tenant SaaS for coaches and clients. It converts a coaching goal into a structured, coach-approved route; focuses the client on the next right action; captures progress and check-ins; offers intelligent reroute options when reality changes; and gives the coach a source-separated pre-session brief.

**Phase 1 workflow:** `Goal → Route → Action → Check-In → Reroute → Coach Brief`

## Phase 1 scope

VisionRoute includes coach account creation, tenant branding/terminology, labelled demo data, secure client invitations, intake, feasibility/reality checks, routes/milestones/actions, a simplified Today view, capacity/readiness, check-ins, reroutes, coach approval, private notes, pre-session briefs, AI usage tracking, test-mode billing architecture, notification outbox, audit events, analytics events and CSV export.

It deliberately does **not** include CRM/pipelines, marketing, courses, scheduling, SMS, social/community, video, native mobile, medical/rehabilitation features, wearables, complex workout programming, advanced teams or Phase 2 analytics/custom-domain features.

## Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| Web client | React 19, TypeScript, Vite, Wouter, Tailwind | Marketing site, onboarding, coach/client workspaces, responsive route UI |
| Application server | Express, tRPC | OAuth/session boundary, protected API, Stripe webhook, health endpoint |
| Data | Drizzle ORM, MySQL-compatible database | Tenant-scoped relational records, constraints and additive migrations |
| Authentication | Manus OAuth + signed application session | Identity mapping and secure Preview-compatible sessions |
| AI | Provider interface + OpenAI-compatible managed endpoint | Structured route/check-in/brief capabilities with model registry and fallback |
| Payments | Stripe SDK/test mode | Checkout, raw-body signature verification, subscription state and webhook de-duplication |

The current implementation is **React/Express/MySQL**, a portable alternative to the initial Next.js/PostgreSQL preference. It preserves a standard TypeScript codebase, server-side authorization, HTTP APIs and relational migrations. The schema avoids vendor-specific behavior where practical to keep a future PostgreSQL move manageable.

See [architecture and schema](docs/ARCHITECTURE.md) and [security and tenant model](docs/SECURITY.md).

## Product model

Every coaching business is one `tenant`. Global OAuth identities live in `users`; all permission is granted through tenant `memberships`. Client data is always scoped by both `tenantId` and `clientId`. Routes are versioned, actions record events, and reroutes preserve history rather than silently overwriting a plan.

A route works backward from the destination date, assigns work to **Active**, **Maintain**, **Next** and **Park**, records a capacity-aware reality check, and waits for coach approval before it becomes client-visible. Major goals, dates, milestones, workload changes, performance benchmarks and coach-locked actions are human decisions.

## Repository layout

| Path | Responsibility |
|---|---|
| `client/src/pages/` | Marketing, onboarding, invitation and product workspace UI |
| `server/_core/` | Express runtime, OAuth/session validation, tRPC infrastructure |
| `server/policies/` | Tenant and client assignment authorization boundary |
| `server/services/` | Planning, AI, billing, audit/analytics/notification domain services |
| `drizzle/schema.ts` | Full relational model |
| `drizzle/` | Committed, additive migrations |
| `shared/visionroute.ts` | Shared validation contracts, terminology and route schemas |
| `docs/` | Architecture, security and validation evidence |
| `server/**/*.test.ts` | Planning, authorization and billing catalog tests |

## Local setup

### Prerequisites

- Node.js 22+
- pnpm 10.18.0 (pinned in `package.json`)
- A MySQL-compatible database
- OAuth/session configuration
- Optional: Stripe test keys, managed AI endpoint and a transactional email provider

### Install and run

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000`. The server uses `PORT` or `3000` by default.

### Quality checks

```bash
pnpm check       # TypeScript
pnpm test        # Unit/policy tests
pnpm build       # Production client/server build
```

## Environment variables

Never commit `.env` values.

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | MySQL-compatible Drizzle connection string |
| `MANUS_PROJECT_ID` | Managed OAuth | OAuth client/application ID |
| `MANUS_OAUTH_PORTAL_URL` | Managed OAuth | Browser authorization base |
| `MANUS_OAUTH_API_URL` | Managed OAuth | Server token and identity API base |
| `MANUS_JWT_SECRET` | Managed OAuth | Validates signed app sessions |
| `MANUS_API_URL` / `MANUS_API_KEY` | Managed AI | Server-only OpenAI-compatible API credentials |
| `VISIONROUTE_AI_MODEL` | Optional | Default AI model; defaults to `gpt-5-mini` |
| `VISIONROUTE_AI_MODEL_ROUTE` | Optional | Route-generation model override |
| `VISIONROUTE_AI_MODEL_CHECKIN` | Optional | Check-in model override |
| `VISIONROUTE_AI_MODEL_REROUTE` | Optional | Reroute model override |
| `VISIONROUTE_AI_MODEL_BRIEF` | Optional | Coach-brief model override |
| `STRIPE_SECRET_KEY` | Billing | Stripe test secret, server-only |
| `STRIPE_WEBHOOK_SECRET` | Billing | Stripe webhook signature secret, server-only |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Billing | Browser-safe Stripe publishable key |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional | Transactional email configuration for a future delivery worker |

## Database and migrations

- Schema: [`drizzle/schema.ts`](drizzle/schema.ts)
- Migrations: [`drizzle/`](drizzle/)
- Generate and apply an additive change: `pnpm db:push`
- Apply committed migrations: `pnpm db:migrate`

Do not reset or drop a database containing tenant data. Development and deployed instances may share the same managed database, so migrations must be deterministic and additive.

## Authentication and authorization

VisionRoute uses the initialized OAuth implementation to identify a user. It then resolves a server-side membership for every tenant-scoped API request. The application session uses the required `webdev_app_session` cookie and `SameSite=None; Secure` for HTTPS Preview compatibility.

- **Owner/head coach:** manages their own tenant, clients, routes, approval and billing.
- **Additional coach:** policy model allows only assigned clients and never billing by default.
- **Client/athlete:** can access only their own approved route/actions/check-ins/reroutes; never other clients, coach notes, billing or private administration.
- **Platform admin:** deliberately separated from ordinary tenant-content operations.

Every protected object lookup verifies both `tenantId` and role/assignment. A hidden UI control is never an authorization boundary.

The initial OAuth provider owns password reset. An independent email/password reset flow needs a deliberately selected third-party identity provider; it is not faked by this app.

## AI provider abstraction

`server/services/ai-provider.ts` exposes typed domain operations rather than embedding provider calls across routes. `AI_MODEL_REGISTRY` maps features to overridable model IDs. Structured route output is parsed with Zod before persistence; failures fall back to a deterministic planning engine.

The AI boundary records tenant, client, feature, model, timing and tokens when available in `ai_usage`. It uses bounded structured context rather than unbounded conversations. Sports-related prompt policy explicitly rejects diagnosis, treatment, clearance and safety claims.

AI may recommend; it never silently applies consequential coach decisions.

## Stripe test mode

1. Configure Stripe test credentials.
2. Owner billing controls create server-side Checkout Sessions for **VisionRoute Coach ($97/month)** and **Founding Coach White-Label ($499 setup + $97/month)**.
3. `POST /api/stripe/webhook` receives raw bytes before JSON parsing, verifies the signature, stores the Stripe event ID for de-duplication, then updates the tenant subscription state.
4. Test with `4242 4242 4242 4242`; do not use live card data in Phase 1.

Live keys/charges remain outside Phase 1. Production launch requires a separate billing review, live-key configuration and webhook delivery verification.

## Email, notifications and scheduled work

Notification intents are persisted in `notifications`. If a transactional provider is not configured, a requested email is marked `provider_unconfigured` rather than claimed as delivered. Add an idempotent provider worker before enabling production email.

No resident background worker is required today. The notification outbox and `markOverdueActions()` service are ready for a signed, idempotent scheduled job with retry/de-duplication records.

## Admin and test accounts

- Use a coach OAuth identity to create a workspace, including optional labelled demo data.
- Use another real OAuth identity matching a client invitation email to test client acceptance.
- Do not ship shared production credentials.
- Full Coach A/Coach B/Client A/Client B manual isolation testing needs four separate identities; automated policy tests cover direct client/coach-assignment denial paths.

## Deployment

`Dockerfile` uses Node 22 and pinned pnpm, builds the client/server, listens on `PORT`, and serves unauthenticated `GET /api/health`.

For a new host: provision MySQL, configure OAuth redirect/session secrets, apply migrations, set AI/Stripe/email secrets, configure HTTPS and Stripe’s webhook endpoint, build with `pnpm build`, start with `pnpm start`, then run the checklist in [docs/TEST_REPORT.md](docs/TEST_REPORT.md).

## Known limitations

- Password recovery is owned by the OAuth provider.
- The email outbox needs a selected provider worker for real delivery.
- Deterministic AI fallback protects reliability but human review remains mandatory.
- Advanced coach/team assignment administration is deferred, although the authorization model exists.
- Stripe checkout is test-mode only; live billing is not activated.
- Advanced white-label/custom domains, annual billing, integrations, richer reports/exports and advanced analytics are Phase 2.

## Transferability

All application code, migrations, Dockerfile, tests and documentation are standard repository files. Clone with Git or export to GitHub. OAuth, database, AI, payment, email and hosting integrations are isolated behind documented boundaries and can be replaced without rewriting core planning logic.
