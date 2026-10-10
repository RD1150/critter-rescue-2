import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { auditEvents, processedWebhookEvents, subscriptions } from "../../drizzle/schema";
import { getDb } from "../db";
import { requireOwner, type TenantScope } from "../policies/authz";
import { id } from "./records";
import { TRPCError } from "@trpc/server";

export const PLAN_CATALOG = {
  visionroute_coach: {
    name: "VisionRoute Coach",
    lookupKey: "visionroute_coach_monthly",
    unitAmount: 9700,
    recurring: { interval: "month" as const },
  },
  visionroute_coach_annual: {
    name: "VisionRoute Coach — Annual",
    lookupKey: "visionroute_coach_annual",
    unitAmount: 97000,
    recurring: { interval: "year" as const },
  },
} as const;

export type CheckoutPlanKey = keyof typeof PLAN_CATALOG;

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export function isCancellationEligible(currentPeriodEnd: Date, now = new Date()) {
  return currentPeriodEnd.getTime() - now.getTime() >= FIVE_DAYS_MS;
}

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Stripe test mode is not configured for this environment." });
  if (!key.startsWith("sk_test_")) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "VisionRoute Phase 1 accepts Stripe test-mode keys only." });
  return new Stripe(key);
}

async function getOrCreatePrice(stripe: Stripe, key: CheckoutPlanKey) {
  const plan = PLAN_CATALOG[key];
  const existing = await stripe.prices.list({ lookup_keys: [plan.lookupKey], active: true, limit: 1 });
  if (existing.data[0]) return existing.data[0];
  const product = await stripe.products.create({ name: plan.name, metadata: { visionroute_plan: key } });
  return stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: plan.unitAmount,
    lookup_key: plan.lookupKey,
    recurring: plan.recurring,
    metadata: { visionroute_plan: key },
  });
}

export async function createCheckoutSession(scope: TenantScope, input: { planKey: CheckoutPlanKey; origin: string; requestOrigin?: string }) {
  requireOwner(scope);
  const stripe = stripeClient();
  const price = await getOrCreatePrice(stripe, input.planKey);
  const origin = new URL(input.origin).origin;
  const configuredOrigin = process.env.VISIONROUTE_APP_ORIGIN ? new URL(process.env.VISIONROUTE_APP_ORIGIN).origin : null;
  const requestOrigin = input.requestOrigin ? new URL(input.requestOrigin).origin : null;
  if ((configuredOrigin && origin !== configuredOrigin) || (!configuredOrigin && (!requestOrigin || origin !== requestOrigin))) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Checkout return URL must match the current application origin." });
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: true,
    customer_email: scope.user.email || undefined,
    client_reference_id: scope.tenant.id,
    metadata: { tenant_id: scope.tenant.id, plan_key: input.planKey, customer_email: scope.user.email || "", customer_name: scope.user.name || "" },
    subscription_data: { metadata: { tenant_id: scope.tenant.id, plan_key: input.planKey } },
    success_url: `${origin}/?billing=success`,
    cancel_url: `${origin}/?billing=cancelled`,
  });
  if (!session.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe did not return a checkout URL." });
  return { url: session.url };
}

export async function requestCancellation(scope: TenantScope) {
  requireOwner(scope);
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The VisionRoute database is unavailable." });
  const [stored] = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, scope.tenant.id)).limit(1);
  if (!stored?.stripeSubscriptionId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "There is no active Stripe subscription to cancel." });

  const stripe = stripeClient();
  const stripeSubscription = await stripe.subscriptions.retrieve(stored.stripeSubscriptionId) as Stripe.Subscription & { current_period_end?: number };
  if (stripeSubscription.status === "canceled") throw new TRPCError({ code: "BAD_REQUEST", message: "This subscription is already canceled." });
  const currentPeriodEnd = new Date((stripeSubscription.current_period_end ?? 0) * 1000);
  if (!Number.isFinite(currentPeriodEnd.getTime())) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Stripe did not provide a renewal date for this subscription." });
  if (!isCancellationEligible(currentPeriodEnd)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Cancellation requests must be submitted at least five days before renewal." });
  }

  const updated = await stripe.subscriptions.update(stored.stripeSubscriptionId, { cancel_at_period_end: true }) as Stripe.Subscription & { current_period_end?: number };
  const updatedPeriodEnd = new Date((updated.current_period_end ?? stripeSubscription.current_period_end ?? 0) * 1000);
  await db.transaction(async tx => {
    await tx.update(subscriptions).set({ status: "canceling", currentPeriodEnd: updatedPeriodEnd }).where(eq(subscriptions.tenantId, scope.tenant.id));
    await tx.insert(auditEvents).values({ id: id(), tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: "coach", entityType: "subscription", entityId: stored.id, action: "cancellation_requested", afterSummary: { cancelAtPeriodEnd: true, currentPeriodEnd: updatedPeriodEnd.toISOString() } });
  });
  return { cancelAtPeriodEnd: true, currentPeriodEnd: updatedPeriodEnd };
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) throw new Error("Stripe webhook configuration is unavailable");
  if (!key.startsWith("sk_test_")) throw new Error("VisionRoute Phase 1 rejects live Stripe keys");
  const stripe = new Stripe(key);
  const event = stripe.webhooks.constructEvent(rawBody, signature ?? "", secret);
  const db = await getDb();
  if (!db) throw new Error("Database unavailable during Stripe webhook processing");
  const object = event.data.object as Stripe.Checkout.Session | Stripe.Subscription | Stripe.PaymentIntent;
  const metadata = "metadata" in object ? object.metadata : undefined;
  const tenantId = metadata?.tenant_id;
  return db.transaction(async tx => {
    try {
      await tx.insert(processedWebhookEvents).values({ id: event.id, provider: "stripe" });
    } catch (error) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") return { duplicate: true, type: event.type };
      throw error;
    }
    if (tenantId) {
      if (event.type === "checkout.session.completed") {
        const session = object as Stripe.Checkout.Session;
        await tx.insert(subscriptions).values({
          id: id(), tenantId,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
          planKey: metadata?.plan_key || "visionroute_coach", status: "active",
        }).onDuplicateKeyUpdate({ set: {
          stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
          planKey: metadata?.plan_key || "visionroute_coach", status: "active",
        } });
      }
      if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted" || event.type === "customer.subscription.created") {
        const subscription = object as Stripe.Subscription & { current_period_end?: number };
        await tx.update(subscriptions).set({ stripeSubscriptionId: subscription.id, status: subscription.status, currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null }).where(eq(subscriptions.tenantId, tenantId));
      }
      await tx.insert(auditEvents).values({ id: id(), tenantId, actorType: "system", entityType: "subscription", entityId: "stripe", action: `stripe_${event.type}`, afterSummary: { eventId: event.id } });
    }
    return { duplicate: false, type: event.type };
  });
}
