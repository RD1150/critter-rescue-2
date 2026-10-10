# VisionRoute Security and Tenant Isolation

## Security posture

VisionRoute treats tenant isolation as a server-side policy, not a UI property. No client-supplied `tenantId`, `clientId`, hidden button or route state grants access by itself.

## Request authorization flow

1. OAuth/session middleware validates the signed `webdev_app_session` token and resolves the global `users` record.
2. A protected tRPC procedure receives the authenticated user.
3. `getTenantScope(user, tenantId)` queries an **active** `memberships` record for the requested tenant.
4. A client-object procedure calls `assertClientAccess(scope, clientId)`.
5. That guard queries the client with both `client_profiles.id` and `client_profiles.tenantId`.
6. Role rules are checked before the domain service reads or mutates related goals/routes/actions/notes/check-ins/reroutes.

This blocks direct identifier manipulation across tenants before the service receives the object.

## Role matrix

| Capability | Owner/head coach | Additional coach | Client/athlete | Platform admin |
|---|---:|---:|---:|---:|
| Own tenant clients/routes | Yes | Assigned clients only | Own approved route only | No routine private-content path |
| Invite/create clients | Yes | Yes | No | No |
| Approve routes/reroutes | Yes | Yes | No | No |
| Private coach notes | Yes | Assigned clients | Never | No routine private-content path |
| Billing/export/settings | Yes | No | Never | Platform-level configuration only |
| Other tenant’s data | Never | Never | Never | Not via normal application APIs |

## Database safeguards

- Every account-owned table has non-null `tenantId` and tenant-first indexes.
- Client-owned rows include `clientId`; child records are linked by foreign keys.
- `memberships` has a unique `(tenantId, userId)` constraint.
- Client email is unique within a tenant; a global client identity link is unique.
- Route versions are unique per `(routeId, versionNumber)`.
- Stripe webhook events have a primary-key event ID for idempotency.
- Invitation tokens are stored as a hash, never as plaintext.

## Invitation safety

An invitation includes tenant, client, invited email, inviter, expiry and a SHA-256 token digest. Acceptance checks an unexpired `invited` record and requires that the signed-in user email exactly matches the invited email. The token is not stored in plaintext and is only returned at creation time for the controlled development/in-app flow.

## Data visibility

Clients are not returned coach notes, billing/subscription details, other client rows, tenant settings, unapproved routes or non-client notification data. Coaches cannot read unassigned clients when using the additional-coach role.

## AI and sensitive data

AI is called only server-side. Usage analytics capture operation metadata rather than raw private prompts. Coach briefs visibly divide source information into system data, client-reported data, coach notes and AI interpretation. AI interpretation is never rendered as fact. Sports prompts prohibit injury/illness diagnosis, medical treatment, clearance and safety claims.

## Stripe webhook safety

`/api/stripe/webhook` is registered before `express.json()`. It receives exact request bytes through `express.raw()`, verifies Stripe’s signature with `STRIPE_WEBHOOK_SECRET`, then checks the event ID before changing a subscription. Checkout redirect URLs are navigation only; access state is driven by the verified webhook record.

## Operational requirements before production

- Use HTTPS and secure secret management.
- Apply migrations with backups and no destructive resets.
- Configure a trusted transactional email sender before claiming email delivery.
- Add rate limiting at the reverse proxy/application edge and maintain per-tenant AI limits.
- Test four distinct identities for Coach A/Coach B/Client A/Client B direct-ID denial.
- Review AI model selection, data retention and support access policies.
- Keep audit events and operational logs access-restricted.
