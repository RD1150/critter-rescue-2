import { randomUUID, createHash } from "node:crypto";
import { and, count, eq, gte } from "drizzle-orm";
import { auditEvents, analyticsEvents, aiUsage, notifications } from "../../drizzle/schema";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

export const id = () => randomUUID();
export const digestToken = (value: string) => createHash("sha256").update(value).digest("hex");

export async function recordAudit(input: {
  tenantId: string;
  actorUserId?: number | null;
  actorType: "client" | "coach" | "admin" | "ai" | "system";
  entityType: string;
  entityId: string;
  action: string;
  beforeSummary?: unknown;
  afterSummary?: unknown;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditEvents).values({
    id: id(), tenantId: input.tenantId, actorUserId: input.actorUserId ?? null, actorType: input.actorType,
    entityType: input.entityType, entityId: input.entityId, action: input.action,
    beforeSummary: input.beforeSummary ?? null, afterSummary: input.afterSummary ?? null,
  });
}

export async function recordAnalytics(input: { tenantId?: string | null; userId?: number | null; eventName: string; metadata?: unknown }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values({ id: id(), tenantId: input.tenantId ?? null, userId: input.userId ?? null, eventName: input.eventName, metadata: input.metadata ?? null });
}

export async function recordAiUsage(input: { tenantId: string; clientId?: string | null; feature: string; model: string; status: string; promptTokens?: number; completionTokens?: number; latencyMs?: number }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiUsage).values({ id: id(), tenantId: input.tenantId, clientId: input.clientId ?? null, feature: input.feature, model: input.model, status: input.status, promptTokens: input.promptTokens ?? null, completionTokens: input.completionTokens ?? null, latencyMs: input.latencyMs ?? null, correlationId: id() });
}

/** Persistent tenant-level ceiling; deployment can lower it with VISIONROUTE_AI_HOURLY_LIMIT. */
export async function enforceAiRateLimit(tenantId: string, feature: string) {
  const db = await getDb();
  if (!db) return;
  const limit = Math.max(1, Math.min(500, Number(process.env.VISIONROUTE_AI_HOURLY_LIMIT || 30)));
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db.select({ total: count() }).from(aiUsage).where(and(eq(aiUsage.tenantId, tenantId), eq(aiUsage.feature, feature), gte(aiUsage.createdAt, since)));
  if ((row?.total ?? 0) >= limit) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "This workspace has reached its hourly AI request limit. Try again shortly." });
}

export async function queueNotification(input: { tenantId: string; clientId?: string | null; userId?: number | null; type: string; payload?: unknown; channel?: "in_app" | "email" }) {
  const db = await getDb();
  if (!db) return;
  const canEmail = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  await db.insert(notifications).values({
    id: id(), tenantId: input.tenantId, clientId: input.clientId ?? null, userId: input.userId ?? null,
    type: input.type, channel: input.channel ?? (canEmail ? "email" : "in_app"), status: canEmail ? "queued" : "provider_unconfigured", payload: input.payload ?? null,
  });
}
