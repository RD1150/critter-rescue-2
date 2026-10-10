import { and, eq } from "drizzle-orm";
import type { User } from "../../drizzle/schema";
import { clientProfiles, memberships, tenants } from "../../drizzle/schema";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

export type TenantRole = "owner" | "coach" | "client";

export type TenantScope = {
  tenant: typeof tenants.$inferSelect;
  membership: typeof memberships.$inferSelect;
  user: User;
};

async function databaseOrThrow() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The VisionRoute database is unavailable." });
  return db;
}

export async function getTenantScope(user: User, tenantId: string): Promise<TenantScope> {
  const db = await databaseOrThrow();
  const rows = await db.select({ tenant: tenants, membership: memberships })
    .from(memberships)
    .innerJoin(tenants, eq(memberships.tenantId, tenants.id))
    .where(and(eq(memberships.tenantId, tenantId), eq(memberships.userId, user.id), eq(memberships.status, "active")))
    .limit(1);
  if (!rows[0]) throw new TRPCError({ code: "FORBIDDEN", message: "This workspace is not available to this account." });
  return { tenant: rows[0].tenant, membership: rows[0].membership, user };
}

export async function getDefaultTenantScope(user: User): Promise<TenantScope | null> {
  const db = await databaseOrThrow();
  const rows = await db.select({ tenant: tenants, membership: memberships })
    .from(memberships)
    .innerJoin(tenants, eq(memberships.tenantId, tenants.id))
    .where(and(eq(memberships.userId, user.id), eq(memberships.status, "active")))
    .limit(1);
  return rows[0] ? { tenant: rows[0].tenant, membership: rows[0].membership, user } : null;
}

export function requireCoach(scope: TenantScope) {
  if (scope.membership.role === "client") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Coach access is required for this action." });
  }
}

export function requireOwner(scope: TenantScope) {
  if (scope.membership.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Account owner access is required for this action." });
  }
}

/** Pure policy predicate used by the database guard and isolation tests. */
export function canAccessClientRecord(input: {
  role: TenantRole;
  actorUserId: number;
  clientUserId: number | null;
  assignedCoachUserId: number | null;
}) {
  if (input.role === "owner") return true;
  if (input.role === "client") return input.clientUserId === input.actorUserId;
  return input.assignedCoachUserId === input.actorUserId;
}

/**
 * Enforces both tenant and client assignment scope. This policy must be used for every
 * client record lookup; client IDs alone are never a permission boundary.
 */
export async function assertClientAccess(scope: TenantScope, clientId: string, mode: "read" | "write" = "read") {
  const db = await databaseOrThrow();
  const client = await db.select().from(clientProfiles)
    .where(and(eq(clientProfiles.id, clientId), eq(clientProfiles.tenantId, scope.tenant.id)))
    .limit(1);
  const profile = client[0];
  if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Client record not found in this workspace." });

  if (!canAccessClientRecord({ role: scope.membership.role, actorUserId: scope.user.id, clientUserId: profile.userId, assignedCoachUserId: profile.assignedCoachUserId })) {
    const message = scope.membership.role === "client"
      ? "Clients can only access their own route."
      : "This client is not assigned to this coach.";
    throw new TRPCError({ code: "FORBIDDEN", message });
  }
  return profile;
}
