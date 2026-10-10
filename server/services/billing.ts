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
  founding_white_label: {
    name: "Founding Coach White-Label Setup",
    lookupKey: "visionroute_founding_setup",
    unitAmount: 49900,
    recurring: undefined,
  },
} as const;

type CheckoutPlanKey = "visionroute_coach" | "founding_white_label";

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
    ...(plan.recurring ? { recurring: plan.recurring } : {}),
    metadata: { visionroute_plan: key },
  });
}

export async function createCheckoutSession(scope: TenantScope, input: { planKey: "visionroute_coach" | "founding_white_label"; origin: string; requestOrigin?: string }) {
  requireOwner(scope);
  const stripe = stripeClient();
  const monthly = await getOrCreatePrice(stripe, "visionroute_coach");
  const setup = input.planKey === "founding_white_label" ? await getOrCreatePrice(stripe, "founding_white_label") : null;
  const origin = new URL(input.origin).origin;
  const configuredOrigin = process.env.VISIONROUTE_APP_ORIGIN ? new URL(process.env.VISIONROUTE_APP_ORIGIN).origin : null;
  const requestOrigin = input.requestOrigin ? new URL(input.requestOrigin).origin : null;
  if ((configuredOrigin && origin !== configuredOrigin) || (!configuredOrigin && (!requestOrigin || origin !== requestOrigin))) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Checkout return URL must match the current application origin." });
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: monthly.id, quantity: 1 }, ...(setup ? [{ price: setup.id, quantity: 1 }] : [])],
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
        const subscription = object as Stripe.Subscription;
        await tx.update(subscriptions).set({ stripeSubscriptionId: subscription.id, status: subscription.status }).where(eq(subscriptions.tenantId, tenantId));
      }
      await tx.insert(auditEvents).values({ id: id(), tenantId, actorType: "system", entityType: "subscription", entityId: "stripe", action: `stripe_${event.type}`, afterSummary: { eventId: event.id } });
    }
    return { duplicate: false, type: event.type };
  });
}
