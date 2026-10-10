# VisionRoute Architecture and Data Model

## System boundaries

```mermaid
flowchart LR
  U[Coach / Client] --> W[React client]
  W -->|tRPC + session| S[Express API]
  S --> P[Authorization policy]
  P --> D[(MySQL / Drizzle)]
  S --> A[AI provider abstraction]
  S --> B[Stripe test mode]
  B -->|signed raw webhook| S
  S --> N[Notifications outbox]
```

The browser is not trusted for tenant selection, role selection or object ownership. The server maps an authenticated identity to a tenant membership, derives a `TenantScope`, and only then runs a tenant-bound domain service.

## Core relationship diagram

```mermaid
erDiagram
  USERS ||--o{ MEMBERSHIPS : joins
  TENANTS ||--o{ MEMBERSHIPS : contains
  TENANTS ||--o{ COACH_PROFILES : configures
  TENANTS ||--o{ CLIENT_PROFILES : owns
  USERS ||--o| CLIENT_PROFILES : authenticates
  CLIENT_PROFILES ||--o{ GOALS : pursues
  GOALS ||--o{ ROUTES : plans
  ROUTES ||--o{ ROUTE_VERSIONS : versions
  ROUTE_VERSIONS ||--o{ MILESTONES : sequences
  ROUTE_VERSIONS ||--o{ ACTIONS : commits
  CLIENT_PROFILES ||--o{ CHECK_INS : submits
  ROUTES ||--o{ REROUTES : recovers
  REROUTES ||--o{ REROUTE_OPTIONS : offers
  CLIENT_PROFILES ||--o{ COACH_NOTES : receives
  TENANTS ||--o{ SUBSCRIPTIONS : pays
  TENANTS ||--o{ AI_USAGE : records
  TENANTS ||--o{ AUDIT_EVENTS : audits
```

## Entity notes

| Domain | Records | Notes |
|---|---|---|
| Identity | `users`, `memberships`, `coach_profiles`, `client_profiles`, `invitations` | Global identities are separate from tenant roles. Invitation tokens are SHA-256 digests; plaintext tokens are returned once only. |
| Planning | `goals`, `routes`, `route_versions`, `milestones`, `actions`, `action_events` | A route has immutable version snapshots. Actions preserve completion/missed history. |
| Coaching cadence | `check_ins`, `reroutes`, `reroute_options`, `coach_notes` | Client reports remain source records. Major reroute options require coach approval. |
| AI | `ai_summaries`, `ai_usage` | Bounded structured context and operational usage, not unbounded transcript storage. |
| Platform support | `subscriptions`, `processed_webhook_events`, `notifications`, `analytics_events`, `audit_events`, `templates` | Billing is tenant-owned; events are de-duplicated; analytics metadata is content-minimized. |

## Route, check-in and reroute state

1. Intake creates/updates a `goal` and preserves client constraints/capacity.
2. The planning service generates a `route` in `proposed` state, a `route_version`, sequenced milestones and actions.
3. A coach approves the route. Only `approved` route state is returned to client-role readers.
4. Completing an action adds an immutable `action_event`; dashboard progress is derived from action status.
5. A weekly `check_in` stores the client’s original report and a separately labelled summary.
6. A missed action or request opens a `reroute` with four `reroute_options`.
7. Coach approval creates a new approved route version and leaves the prior version as history.

## AI boundary

`AIProvider` is the only domain boundary that speaks to an LLM. `AI_MODEL_REGISTRY` selects a feature-specific model with environment overrides. The route response is schema-validated with Zod. If the configured model or response is unavailable, the deterministic planning engine creates a transparent safe fallback route. Human approval remains required for consequential decisions.

## Future-safe design decisions

- Tenant IDs exist on all account-owned records.
- Memberships separate identity from tenant role and can support more coaches/organizations later.
- Route versions, milestones and action dependencies allow future programs, recurring work, competitions and templates without changing the basic engine.
- Branding and terminology are tenant configuration rather than separate code paths.
- Subscription, notification, audit and AI usage records are extensible without introducing a CRM.
