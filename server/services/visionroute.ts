import { and, asc, desc, eq, inArray, lt } from "drizzle-orm";
import type { User } from "../../drizzle/schema";
import {
  actionEvents,
  actions,
  aiSummaries,
  checkIns,
  clientProfiles,
  coachNotes,
  coachProfiles,
  goals,
  invitations,
  memberships,
  milestones,
  notifications,
  rerouteOptions,
  reroutes,
  routeVersions,
  routes,
  subscriptions,
  tenants,
} from "../../drizzle/schema";
import { terminologyForCategory, type Terminology } from "@shared/visionroute";
import { getDb } from "../db";
import { assertClientAccess, getDefaultTenantScope, getTenantScope, requireCoach, requireOwner, type TenantScope } from "../policies/authz";
import { aiProvider } from "./ai-provider";
import { buildRerouteOptions, selectNextAction } from "./planning";
import { digestToken, enforceAiRateLimit, id, queueNotification, recordAiUsage, recordAnalytics, recordAudit } from "./records";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "node:crypto";

async function databaseOrThrow() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The VisionRoute database is unavailable." });
  return db;
}

function asTerminology(value: unknown, category: string): Terminology {
  const fallback = terminologyForCategory(category);
  if (!value || typeof value !== "object") return fallback;
  return { ...fallback, ...(value as Partial<Terminology>) };
}

function actorType(scope: TenantScope) {
  return scope.membership.role === "client" ? "client" as const : "coach" as const;
}

async function currentRouteForClient(tenantId: string, clientId: string) {
  const db = await databaseOrThrow();
  const result = await db.select().from(routes)
    .where(and(eq(routes.tenantId, tenantId), eq(routes.clientId, clientId)))
    .orderBy(desc(routes.updatedAt))
    .limit(1);
  return result[0] ?? null;
}

async function currentVersionForRoute(tenantId: string, routeId: string, versionNumber: number) {
  const db = await databaseOrThrow();
  const result = await db.select().from(routeVersions)
    .where(and(eq(routeVersions.tenantId, tenantId), eq(routeVersions.routeId, routeId), eq(routeVersions.versionNumber, versionNumber)))
    .limit(1);
  return result[0] ?? null;
}

export async function bootstrap(user: User) {
  const scope = await getDefaultTenantScope(user);
  if (!scope) return { user: { id: user.id, name: user.name, email: user.email }, workspace: null, dashboard: null };
  const dashboard = await getCoachDashboard(scope);
  return {
    user: { id: user.id, name: user.name, email: user.email },
    workspace: { tenant: scope.tenant, membership: scope.membership, terminology: asTerminology(scope.tenant.terminology, scope.tenant.coachingCategory) },
    dashboard,
  };
}

export async function createWorkspace(user: User, input: {
  organizationName: string; portalName?: string; coachingCategory: string; website?: string; logoUrl?: string; brandColor: string; welcomeMessage?: string; terminology?: Terminology; includeDemo: boolean;
}) {
  const db = await databaseOrThrow();
  const tenantId = id();
  const membershipId = id();
  const terminology = input.terminology ?? terminologyForCategory(input.coachingCategory);
  await db.transaction(async tx => {
    await tx.insert(tenants).values({
      id: tenantId, organizationName: input.organizationName, portalName: input.portalName || input.organizationName,
      coachingCategory: input.coachingCategory, website: input.website || null, logoUrl: input.logoUrl || null,
      brandColor: input.brandColor, welcomeMessage: input.welcomeMessage || null, terminology,
      settings: { demoWorkspace: input.includeDemo, approvalRules: ["goal", "target_date", "major_milestone", "workload", "benchmark", "locked_action"] },
    });
    await tx.insert(memberships).values({ id: membershipId, tenantId, userId: user.id, role: "owner", status: "active" });
    await tx.insert(coachProfiles).values({ id: id(), tenantId, userId: user.id, title: "Head Coach", canManageBilling: true });
    await tx.insert(subscriptions).values({ id: id(), tenantId, planKey: "visionroute_coach", status: "trialing" });
  });
  await recordAnalytics({ tenantId, userId: user.id, eventName: "coach_registered", metadata: { category: input.coachingCategory } });
  await recordAudit({ tenantId, actorUserId: user.id, actorType: "coach", entityType: "tenant", entityId: tenantId, action: "workspace_created", afterSummary: { category: input.coachingCategory } });
  if (input.includeDemo) await seedDemoWorkspace({ tenantId, userId: user.id, category: input.coachingCategory });
  return { tenantId };
}

export async function updateWorkspace(scope: TenantScope, input: {
  organizationName: string; portalName: string; website?: string; logoUrl?: string; brandColor: string; welcomeMessage?: string; terminology: Terminology;
}) {
  requireOwner(scope);
  const db = await databaseOrThrow();
  await db.update(tenants).set({
    organizationName: input.organizationName,
    portalName: input.portalName,
    website: input.website || null,
    logoUrl: input.logoUrl || null,
    brandColor: input.brandColor,
    welcomeMessage: input.welcomeMessage || null,
    terminology: input.terminology,
  }).where(eq(tenants.id, scope.tenant.id));
  await recordAudit({
    tenantId: scope.tenant.id,
    actorUserId: scope.user.id,
    actorType: "coach",
    entityType: "tenant",
    entityId: scope.tenant.id,
    action: "portal_branding_updated",
    afterSummary: { portalName: input.portalName, brandColor: input.brandColor, hasLogo: Boolean(input.logoUrl) },
  });
  return { tenantId: scope.tenant.id };
}

export async function seedDemoWorkspace(input: { tenantId: string; userId: number; category: string }) {
  const db = await databaseOrThrow();
  const clientId = id();
  const goalId = id();
  const routeId = id();
  const versionId = id();
  const targetDate = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);
  const isSports = input.category === "sports" || input.category === "athletic_performance";
  const goalTitle = isSports ? "Improve 5K race readiness by the target event" : "Launch a focused consulting offer by the target date";
  const milestoneRows = [
    { id: id(), title: isSports ? "Establish baseline" : "Finalize the offer", sequence: 1, progress: 100, status: "complete" },
    { id: id(), title: isSports ? "Build quality sessions" : "Build the sales page", sequence: 2, progress: 55, status: "active" },
    { id: id(), title: isSports ? "Peak and review" : "Begin deliberate outreach", sequence: 3, progress: 0, status: "upcoming" },
  ];
  const actionRows = [
    { id: id(), title: isSports ? "Complete baseline interval session" : "Write the offer promise and outcomes", status: "completed", category: "active" as const, sequence: 1, estimatedMinutes: 35, milestoneId: milestoneRows[0].id, completedAt: new Date(Date.now() - 3 * 86400000) },
    { id: id(), title: isSports ? "Schedule two quality training blocks" : "Draft the sales page structure", status: "pending", category: "active" as const, sequence: 2, estimatedMinutes: 40, milestoneId: milestoneRows[1].id, completedAt: null },
    { id: id(), title: isSports ? "Complete recovery mobility routine" : "Review the proof and testimonials to include", status: "pending", category: "maintain" as const, sequence: 3, estimatedMinutes: 20, milestoneId: milestoneRows[1].id, completedAt: null },
    { id: id(), title: isSports ? "Confirm event logistics" : "Create the first 15-person outreach list", status: "missed", category: "next" as const, sequence: 4, estimatedMinutes: 25, milestoneId: milestoneRows[2].id, completedAt: null },
  ];
  await db.transaction(async tx => {
    await tx.insert(clientProfiles).values({ id: clientId, tenantId: input.tenantId, assignedCoachUserId: input.userId, name: "Sample client — Jane Smith", email: "sample@visionroute.demo", invitationStatus: "active", onboardingStatus: "complete", capacity: "normal", isDemo: true, lastActivityAt: new Date(), intake: { weeklyMinutes: 180, isDemo: true } });
    await tx.insert(goals).values({ id: goalId, tenantId: input.tenantId, clientId, title: goalTitle, targetDate, priority: "active", whyItMatters: "Clearly labelled sample data used to explore the VisionRoute workflow.", constraints: { weeklyMinutes: 180 }, coachLocked: false });
    await tx.insert(routes).values({ id: routeId, tenantId: input.tenantId, clientId, goalId, status: "approved", currentVersion: 1, destination: goalTitle, targetDate, realityCheck: { isRealistic: true, estimateWeeks: 6, targetWeeks: 6, message: "Sample route is on pace.", options: [] }, approvedByUserId: input.userId, approvedAt: new Date() });
    await tx.insert(routeVersions).values({ id: versionId, tenantId: input.tenantId, routeId, versionNumber: 1, status: "approved", generatedBy: "system", snapshot: { isDemo: true }, createdByUserId: input.userId });
    await tx.insert(milestones).values(milestoneRows.map((m, index) => ({ id: m.id, tenantId: input.tenantId, routeId, routeVersionId: versionId, title: m.title, description: "Sample milestone", sequence: m.sequence, targetDate: new Date(Date.now() + (index + 1) * 14 * 86400000), progress: m.progress, status: m.status, isMajor: true })));
    await tx.insert(actions).values(actionRows.map((a, index) => ({ id: a.id, tenantId: input.tenantId, clientId, routeId, routeVersionId: versionId, milestoneId: a.milestoneId, title: a.title, description: "Sample action", category: a.category, sequence: a.sequence, estimatedMinutes: a.estimatedMinutes, dueDate: new Date(Date.now() + (index - 1) * 3 * 86400000), status: a.status, completedAt: a.completedAt, missedAt: a.status === "missed" ? new Date(Date.now() - 86400000) : null, coachLocked: false })));
    await tx.insert(checkIns).values({ id: id(), tenantId: input.tenantId, clientId, completedText: "Completed the first high-leverage action and clarified the route.", obstacleText: "Outreach preparation felt heavier than expected.", changedText: "No major changes.", prioritiesCorrect: true, needsReroute: false, capacity: "normal", aiSummary: { summary: "Sample check-in: momentum is present, but a future outreach obstacle may need attention.", risk: "Observe avoidance before adding more work." } });
    const rerouteId = id();
    await tx.insert(reroutes).values({ id: rerouteId, tenantId: input.tenantId, clientId, routeId, sourceRouteVersionId: versionId, triggerType: "missed_action", whatHappened: "Sample: I underestimated the work required to prepare outreach.", status: "approved", requiresApproval: true, resolvedAt: new Date(), resolvedByUserId: input.userId });
    await tx.insert(rerouteOptions).values({ id: id(), tenantId: input.tenantId, rerouteId, strategy: "change_route", title: "Sample approved adjustment", summary: "Reorder the route so preparation happens before outreach.", impact: { sample: true }, recommended: true, requiresApproval: true });
    await tx.insert(coachNotes).values({ id: id(), tenantId: input.tenantId, clientId, authorUserId: input.userId, body: "Sample private note: explore resistance around direct outreach before increasing marketing activity." });
  });
  await recordAnalytics({ tenantId: input.tenantId, userId: input.userId, eventName: "demo_workspace_created", metadata: { sample: true } });
}

export async function getCoachDashboard(scope: TenantScope) {
  if (scope.membership.role !== "client") await markOverdueActions(scope.tenant.id);
  const db = await databaseOrThrow();
  const clientRows = await db.select().from(clientProfiles).where(eq(clientProfiles.tenantId, scope.tenant.id)).orderBy(desc(clientProfiles.lastActivityAt));
  const permittedClients = scope.membership.role === "coach" ? clientRows.filter(client => client.assignedCoachUserId === scope.user.id) : scope.membership.role === "client" ? clientRows.filter(client => client.userId === scope.user.id) : clientRows;
  const cards = await Promise.all(permittedClients.map(async client => {
    const [goal] = await db.select().from(goals).where(and(eq(goals.tenantId, scope.tenant.id), eq(goals.clientId, client.id))).orderBy(desc(goals.updatedAt)).limit(1);
    const currentRoute = await currentRouteForClient(scope.tenant.id, client.id);
    const actionRows = await db.select().from(actions).where(and(eq(actions.tenantId, scope.tenant.id), eq(actions.clientId, client.id)));
    const completed = actionRows.filter(action => action.status === "completed").length;
    const missed = actionRows.filter(action => action.status === "missed").length;
    const total = actionRows.length;
    const activeMilestone = currentRoute ? (await db.select().from(milestones).where(and(eq(milestones.routeId, currentRoute.id), eq(milestones.status, "active"))).orderBy(asc(milestones.sequence)).limit(1))[0] : null;
    const pendingReroute = await db.select().from(reroutes).where(and(eq(reroutes.tenantId, scope.tenant.id), eq(reroutes.clientId, client.id), eq(reroutes.status, "proposed"))).limit(1);
    return {
      ...client,
      primaryGoal: goal?.title ?? "Onboarding in progress",
      routeStatus: currentRoute?.status ?? "not_generated",
      progress: total ? Math.round((completed / total) * 100) : 0,
      totalActions: total,
      completedActions: completed,
      missedActions: missed,
      currentMilestone: activeMilestone?.title ?? "Route not approved",
      rerouteStatus: pendingReroute[0] ? "review_needed" : "on_route",
      attention: missed > 0 || Boolean(pendingReroute[0]) || client.capacity === "low",
    };
  }));
  return { cards, role: scope.membership.role };
}

export async function createClientInvitation(scope: TenantScope, input: { name: string; email: string }) {
  requireCoach(scope);
  const db = await databaseOrThrow();
  const email = input.email.trim().toLowerCase();
  const existing = await db.select().from(clientProfiles).where(and(eq(clientProfiles.tenantId, scope.tenant.id), eq(clientProfiles.email, email))).limit(1);
  if (existing[0]) throw new TRPCError({ code: "CONFLICT", message: "A client with this email already exists in this workspace." });
  const clientId = id();
  const invitationId = id();
  const rawToken = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await db.transaction(async tx => {
    await tx.insert(clientProfiles).values({ id: clientId, tenantId: scope.tenant.id, assignedCoachUserId: scope.user.id, name: input.name, email, invitationStatus: "invited", onboardingStatus: "not_started", capacity: "normal", lastActivityAt: new Date() });
    await tx.insert(invitations).values({ id: invitationId, tenantId: scope.tenant.id, clientId, invitedByUserId: scope.user.id, email, tokenDigest: digestToken(rawToken), status: "invited", expiresAt });
  });
  await queueNotification({ tenantId: scope.tenant.id, clientId, type: "client_invitation", channel: "email", payload: { email, invitationId } });
  await recordAnalytics({ tenantId: scope.tenant.id, userId: scope.user.id, eventName: "first_client_invited", metadata: { onlyCount: true } });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: actorType(scope), entityType: "invitation", entityId: invitationId, action: "client_invited", afterSummary: { clientId } });
  return { clientId, invitationId, invitationToken: rawToken, expiresAt, delivery: process.env.RESEND_API_KEY && process.env.EMAIL_FROM ? "queued" : "provider_unconfigured" };
}

export async function acceptInvitation(user: User, rawToken: string) {
  const db = await databaseOrThrow();
  const invitation = (await db.select().from(invitations).where(eq(invitations.tokenDigest, digestToken(rawToken))).limit(1))[0];
  if (!invitation || invitation.status !== "invited" || invitation.expiresAt < new Date()) throw new TRPCError({ code: "NOT_FOUND", message: "This invitation is unavailable or expired." });
  const client = (await db.select().from(clientProfiles).where(and(eq(clientProfiles.id, invitation.clientId), eq(clientProfiles.tenantId, invitation.tenantId))).limit(1))[0];
  if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "The invited client record no longer exists." });
  if (!user.email || user.email.trim().toLowerCase() !== invitation.email.trim().toLowerCase()) throw new TRPCError({ code: "FORBIDDEN", message: "Sign in with the email address that received this invitation." });
  await db.transaction(async tx => {
    await tx.update(invitations).set({ status: "accepted", acceptedAt: new Date() }).where(eq(invitations.id, invitation.id));
    await tx.update(clientProfiles).set({ userId: user.id, invitationStatus: "accepted", onboardingStatus: "in_progress", lastActivityAt: new Date() }).where(eq(clientProfiles.id, client.id));
    await tx.insert(memberships).values({ id: id(), tenantId: invitation.tenantId, userId: user.id, role: "client", status: "active" }).onDuplicateKeyUpdate({ set: { status: "active" } });
  });
  await queueNotification({ tenantId: invitation.tenantId, clientId: client.id, type: "invitation_accepted", payload: { clientId: client.id } });
  await recordAnalytics({ tenantId: invitation.tenantId, userId: user.id, eventName: "invitation_accepted", metadata: { onlyCount: true } });
  return { tenantId: invitation.tenantId, clientId: client.id };
}

export async function getClientDetail(scope: TenantScope, clientId: string) {
  const db = await databaseOrThrow();
  const client = await assertClientAccess(scope, clientId);
  const [goal] = await db.select().from(goals).where(and(eq(goals.tenantId, scope.tenant.id), eq(goals.clientId, clientId))).orderBy(desc(goals.updatedAt)).limit(1);
  const route = await currentRouteForClient(scope.tenant.id, clientId);
  const isClient = scope.membership.role === "client";
  const routeAllowed = route && (!isClient || route.status === "approved") ? route : null;
  const version = routeAllowed ? await currentVersionForRoute(scope.tenant.id, routeAllowed.id, routeAllowed.currentVersion) : null;
  const milestoneRows = routeAllowed && version ? await db.select().from(milestones).where(and(eq(milestones.tenantId, scope.tenant.id), eq(milestones.routeId, routeAllowed.id), eq(milestones.routeVersionId, version.id))).orderBy(asc(milestones.sequence)) : [];
  const actionRows = routeAllowed && version ? await db.select().from(actions).where(and(eq(actions.tenantId, scope.tenant.id), eq(actions.clientId, clientId), eq(actions.routeId, routeAllowed.id), eq(actions.routeVersionId, version.id))).orderBy(asc(actions.sequence)) : [];
  const checkInRows = await db.select().from(checkIns).where(and(eq(checkIns.tenantId, scope.tenant.id), eq(checkIns.clientId, clientId))).orderBy(desc(checkIns.submittedAt)).limit(6);
  const rerouteRows = await db.select().from(reroutes).where(and(eq(reroutes.tenantId, scope.tenant.id), eq(reroutes.clientId, clientId), ...(isClient ? [inArray(reroutes.status, ["awaiting_approval", "approved", "rejected"])] : []))).orderBy(desc(reroutes.createdAt)).limit(5);
  const notes = isClient ? [] : await db.select().from(coachNotes).where(and(eq(coachNotes.tenantId, scope.tenant.id), eq(coachNotes.clientId, clientId))).orderBy(desc(coachNotes.createdAt));
  const progress = actionRows.length ? Math.round((actionRows.filter(action => action.status === "completed").length / actionRows.length) * 100) : 0;
  const nextAction = selectNextAction(actionRows, client.capacity);
  return { client, goal, route: routeAllowed, version, milestones: milestoneRows, actions: actionRows, checkIns: checkInRows, reroutes: rerouteRows, notes, progress, nextAction, terminology: asTerminology(scope.tenant.terminology, scope.tenant.coachingCategory) };
}

export async function completeIntake(scope: TenantScope, input: { clientId: string; goal: string; targetDate?: string; whyItMatters: string; weeklyMinutes: number; [key: string]: unknown }) {
  const db = await databaseOrThrow();
  const client = await assertClientAccess(scope, input.clientId, "write");
  const targetDate = input.targetDate ? new Date(input.targetDate) : null;
  if (targetDate && Number.isNaN(targetDate.getTime())) throw new TRPCError({ code: "BAD_REQUEST", message: "Target date is invalid." });
  const intake = { ...input, targetDate: targetDate?.toISOString() ?? null, category: scope.tenant.coachingCategory };
  const existingGoal = (await db.select().from(goals).where(and(eq(goals.tenantId, scope.tenant.id), eq(goals.clientId, client.id))).orderBy(desc(goals.updatedAt)).limit(1))[0];
  const currentRoute = existingGoal ? await currentRouteForClient(scope.tenant.id, client.id) : null;
  if (scope.membership.role === "client" && existingGoal && (existingGoal.coachLocked || currentRoute?.status === "approved")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Request a coach-approved reroute to change an active destination, date, or route." });
  }
  await db.transaction(async tx => {
    await tx.update(clientProfiles).set({ intake, onboardingStatus: "complete", invitationStatus: client.invitationStatus === "accepted" ? "active" : client.invitationStatus, lastActivityAt: new Date() }).where(eq(clientProfiles.id, client.id));
    if (existingGoal) {
      await tx.update(goals).set({ title: input.goal, targetDate, whyItMatters: input.whyItMatters, constraints: intake }).where(eq(goals.id, existingGoal.id));
    } else {
      await tx.insert(goals).values({ id: id(), tenantId: scope.tenant.id, clientId: client.id, title: input.goal, targetDate, priority: "active", whyItMatters: input.whyItMatters, constraints: intake, coachLocked: false });
    }
  });
  await recordAnalytics({ tenantId: scope.tenant.id, userId: scope.user.id, eventName: "onboarding_completed", metadata: { category: scope.tenant.coachingCategory } });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: actorType(scope), entityType: "client_intake", entityId: client.id, action: "onboarding_completed" });
  return { clientId: client.id };
}

export async function generateRoute(scope: TenantScope, clientId: string) {
  requireCoach(scope);
  const db = await databaseOrThrow();
  const client = await assertClientAccess(scope, clientId, "write");
  const [goal] = await db.select().from(goals).where(and(eq(goals.tenantId, scope.tenant.id), eq(goals.clientId, client.id))).orderBy(desc(goals.updatedAt)).limit(1);
  if (!goal) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Complete the client intake before generating a route." });
  const intake = (client.intake ?? {}) as Record<string, unknown>;
  const weeklyMinutes = typeof intake.weeklyMinutes === "number" ? intake.weeklyMinutes : 120;
  const started = Date.now();
  await enforceAiRateLimit(scope.tenant.id, "route_generation");
  const ai = await aiProvider.generateRoute({ goal: goal.title, targetDate: goal.targetDate, weeklyMinutes, constraints: typeof intake.constraints === "string" ? intake.constraints : null, completed: typeof intake.alreadyCompleted === "string" ? intake.alreadyCompleted : null, isSports: scope.tenant.coachingCategory === "sports" || scope.tenant.coachingCategory === "athletic_performance" });
  await recordAiUsage({ tenantId: scope.tenant.id, clientId, feature: "route_generation", model: ai.model, status: "success", promptTokens: ai.usage?.promptTokens, completionTokens: ai.usage?.completionTokens, latencyMs: Date.now() - started });
  const oldRoute = await currentRouteForClient(scope.tenant.id, clientId);
  const routeId = oldRoute?.id ?? id();
  const versionNumber = oldRoute ? oldRoute.currentVersion + 1 : 1;
  const versionId = id();
  const targetDate = goal.targetDate ?? new Date(Date.now() + ai.value.estimatedWeeks * 7 * 86400000);
  const milestoneIds = ai.value.milestones.map(() => id());
  const now = new Date();
  await db.transaction(async tx => {
    if (oldRoute) {
      await tx.update(routes).set({ status: "proposed", currentVersion: versionNumber, destination: goal.title, targetDate, realityCheck: ai.value.realityCheck, approvedAt: null, approvedByUserId: null }).where(eq(routes.id, routeId));
    } else {
      await tx.insert(routes).values({ id: routeId, tenantId: scope.tenant.id, clientId, goalId: goal.id, status: "proposed", currentVersion: versionNumber, destination: goal.title, targetDate, realityCheck: ai.value.realityCheck });
    }
    await tx.insert(routeVersions).values({ id: versionId, tenantId: scope.tenant.id, routeId, versionNumber, status: "proposed", generatedBy: ai.usedFallback ? "system" : "ai", snapshot: ai.value, createdByUserId: scope.user.id });
    await tx.insert(milestones).values(ai.value.milestones.map((milestone, index) => ({ id: milestoneIds[index], tenantId: scope.tenant.id, routeId, routeVersionId: versionId, title: milestone.title, description: milestone.description, sequence: index + 1, targetDate: new Date(now.getTime() + milestone.week * 7 * 86400000), progress: 0, status: index === 0 ? "active" : "upcoming", isMajor: true })));
    await tx.insert(actions).values(ai.value.actions.map((action, index) => ({ id: id(), tenantId: scope.tenant.id, clientId, routeId, routeVersionId: versionId, milestoneId: milestoneIds[Math.min(action.milestoneIndex, milestoneIds.length - 1)], title: action.title, description: action.description, category: action.category, sequence: index + 1, estimatedMinutes: action.estimatedMinutes, dueDate: new Date(now.getTime() + action.week * 7 * 86400000), status: "pending", coachLocked: action.coachLocked })));
    await tx.update(clientProfiles).set({ onboardingStatus: "route_proposed", lastActivityAt: new Date() }).where(eq(clientProfiles.id, clientId));
  });
  await queueNotification({ tenantId: scope.tenant.id, clientId, type: "route_awaiting_approval", payload: { routeId } });
  await recordAnalytics({ tenantId: scope.tenant.id, userId: scope.user.id, eventName: "route_generated", metadata: { fallback: ai.usedFallback } });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: ai.usedFallback ? "system" : "ai", entityType: "route", entityId: routeId, action: "route_generated", afterSummary: { versionNumber } });
  return { routeId, realityCheck: ai.value.realityCheck, status: "proposed" };
}

export async function approveRoute(scope: TenantScope, routeId: string, decision: "approve" | "reject") {
  requireCoach(scope);
  const db = await databaseOrThrow();
  const route = (await db.select().from(routes).where(and(eq(routes.id, routeId), eq(routes.tenantId, scope.tenant.id))).limit(1))[0];
  if (!route) throw new TRPCError({ code: "NOT_FOUND", message: "Route not found in this workspace." });
  await assertClientAccess(scope, route.clientId, "write");
  await db.transaction(async tx => {
    if (decision === "approve") {
      await tx.update(routes).set({ status: "approved", approvedByUserId: scope.user.id, approvedAt: new Date() }).where(eq(routes.id, route.id));
      await tx.update(routeVersions).set({ status: "approved" }).where(and(eq(routeVersions.routeId, route.id), eq(routeVersions.versionNumber, route.currentVersion)));
      await tx.update(clientProfiles).set({ onboardingStatus: "route_approved", lastActivityAt: new Date() }).where(eq(clientProfiles.id, route.clientId));
    } else {
      await tx.update(routes).set({ status: "rejected" }).where(eq(routes.id, route.id));
      await tx.update(routeVersions).set({ status: "rejected" }).where(and(eq(routeVersions.routeId, route.id), eq(routeVersions.versionNumber, route.currentVersion)));
    }
  });
  await queueNotification({ tenantId: scope.tenant.id, clientId: route.clientId, type: decision === "approve" ? "route_created" : "route_rejected", payload: { routeId } });
  await recordAnalytics({ tenantId: scope.tenant.id, userId: scope.user.id, eventName: decision === "approve" ? "route_approved" : "route_rejected", metadata: { onlyCount: true } });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: "coach", entityType: "route", entityId: routeId, action: `route_${decision}d` });
  return { routeId, status: decision === "approve" ? "approved" : "rejected" };
}

export async function setCapacity(scope: TenantScope, clientId: string, capacity: "low" | "normal" | "high") {
  const db = await databaseOrThrow();
  const client = await assertClientAccess(scope, clientId, "write");
  await db.update(clientProfiles).set({ capacity, lastActivityAt: new Date() }).where(eq(clientProfiles.id, client.id));
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: actorType(scope), entityType: "client", entityId: clientId, action: "capacity_updated", afterSummary: { capacity } });
  return { capacity };
}

export async function completeAction(scope: TenantScope, actionId: string, notes?: string) {
  const db = await databaseOrThrow();
  const action = (await db.select().from(actions).where(and(eq(actions.id, actionId), eq(actions.tenantId, scope.tenant.id))).limit(1))[0];
  if (!action) throw new TRPCError({ code: "NOT_FOUND", message: "Action not found in this workspace." });
  await assertClientAccess(scope, action.clientId, "write");
  if (scope.membership.role === "client" && action.status !== "pending") throw new TRPCError({ code: "CONFLICT", message: "This action is no longer available to complete." });
  await db.transaction(async tx => {
    await tx.update(actions).set({ status: "completed", completedAt: new Date() }).where(eq(actions.id, action.id));
    await tx.insert(actionEvents).values({ id: id(), tenantId: scope.tenant.id, clientId: action.clientId, actionId: action.id, actorUserId: scope.user.id, type: "completed", notes: notes || null, metadata: { source: "today" } });
    await tx.update(clientProfiles).set({ lastActivityAt: new Date() }).where(eq(clientProfiles.id, action.clientId));
  });
  await recordAnalytics({ tenantId: scope.tenant.id, userId: scope.user.id, eventName: "first_action_completed", metadata: { onlyCount: true } });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: actorType(scope), entityType: "action", entityId: action.id, action: "action_completed" });
  return { actionId: action.id, status: "completed" };
}

export async function submitCheckIn(scope: TenantScope, input: { clientId: string; completedText: string; obstacleText?: string; changedText?: string; prioritiesCorrect: boolean; needsReroute: boolean; capacity: "low" | "normal" | "high" }) {
  const db = await databaseOrThrow();
  const client = await assertClientAccess(scope, input.clientId, "write");
  const started = Date.now();
  await enforceAiRateLimit(scope.tenant.id, "checkin_summary");
  const ai = await aiProvider.summarizeCheckIn(input);
  await recordAiUsage({ tenantId: scope.tenant.id, clientId: client.id, feature: "checkin_summary", model: ai.model, status: "success", latencyMs: Date.now() - started });
  const checkinId = id();
  await db.transaction(async tx => {
    await tx.insert(checkIns).values({ id: checkinId, tenantId: scope.tenant.id, clientId: client.id, completedText: input.completedText, obstacleText: input.obstacleText || null, changedText: input.changedText || null, prioritiesCorrect: input.prioritiesCorrect, needsReroute: input.needsReroute, capacity: input.capacity, aiSummary: ai.value });
    await tx.insert(aiSummaries).values({ id: id(), tenantId: scope.tenant.id, clientId: client.id, sourceType: "checkin", sourceId: checkinId, summary: ai.value });
    await tx.update(clientProfiles).set({ capacity: input.capacity, lastActivityAt: new Date() }).where(eq(clientProfiles.id, client.id));
  });
  if (input.needsReroute) await queueNotification({ tenantId: scope.tenant.id, clientId: client.id, type: "reroute_requested", payload: { checkinId } });
  await recordAnalytics({ tenantId: scope.tenant.id, userId: scope.user.id, eventName: "checkin_completed", metadata: { rerouteRequested: input.needsReroute } });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: actorType(scope), entityType: "checkin", entityId: checkinId, action: "checkin_submitted" });
  return { checkinId, summary: ai.value };
}

export async function createReroute(scope: TenantScope, clientId: string, whatHappened: string, triggerType: string) {
  const db = await databaseOrThrow();
  const client = await assertClientAccess(scope, clientId, "write");
  const route = await currentRouteForClient(scope.tenant.id, client.id);
  if (!route) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A route must exist before it can be rerouted." });
  const version = await currentVersionForRoute(scope.tenant.id, route.id, route.currentVersion);
  if (!version) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Route version is unavailable." });
  const rerouteId = id();
  const options = buildRerouteOptions(whatHappened, route.targetDate);
  const optionRows = options.map(option => ({ id: id(), tenantId: scope.tenant.id, rerouteId, ...option }));
  await db.transaction(async tx => {
    await tx.insert(reroutes).values({ id: rerouteId, tenantId: scope.tenant.id, clientId: client.id, routeId: route.id, sourceRouteVersionId: version.id, triggerType, whatHappened, status: "proposed", requiresApproval: true });
    await tx.insert(rerouteOptions).values(optionRows);
  });
  await queueNotification({ tenantId: scope.tenant.id, clientId: client.id, type: "coach_review_needed", payload: { rerouteId } });
  await recordAnalytics({ tenantId: scope.tenant.id, userId: scope.user.id, eventName: "reroute_started", metadata: { triggerType } });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: actorType(scope), entityType: "reroute", entityId: rerouteId, action: "reroute_generated" });
  return { rerouteId, options: optionRows };
}

export async function resolveReroute(scope: TenantScope, rerouteId: string, optionId: string, decision: "approve" | "reject") {
  requireCoach(scope);
  const db = await databaseOrThrow();
  const reroute = (await db.select().from(reroutes).where(and(eq(reroutes.id, rerouteId), eq(reroutes.tenantId, scope.tenant.id))).limit(1))[0];
  if (!reroute) throw new TRPCError({ code: "NOT_FOUND", message: "Reroute not found in this workspace." });
  await assertClientAccess(scope, reroute.clientId, "write");
  if (reroute.status === "approved" || reroute.status === "rejected") throw new TRPCError({ code: "CONFLICT", message: "This reroute has already been resolved." });
  const option = (await db.select().from(rerouteOptions).where(and(eq(rerouteOptions.id, optionId), eq(rerouteOptions.rerouteId, rerouteId), eq(rerouteOptions.tenantId, scope.tenant.id))).limit(1))[0];
  if (!option) throw new TRPCError({ code: "NOT_FOUND", message: "Reroute option not found." });
  const route = (await db.select().from(routes).where(and(eq(routes.id, reroute.routeId), eq(routes.tenantId, scope.tenant.id))).limit(1))[0];
  if (!route) throw new TRPCError({ code: "NOT_FOUND", message: "Source route not found." });
  if (decision === "approve") {
    const sourceVersion = (await db.select().from(routeVersions).where(and(eq(routeVersions.id, reroute.sourceRouteVersionId), eq(routeVersions.tenantId, scope.tenant.id), eq(routeVersions.routeId, route.id))).limit(1))[0];
    if (!sourceVersion || sourceVersion.versionNumber !== route.currentVersion) throw new TRPCError({ code: "CONFLICT", message: "This reroute was based on an older route version. Create a fresh reroute from the current route." });
    const sourceMilestones = await db.select().from(milestones).where(and(eq(milestones.tenantId, scope.tenant.id), eq(milestones.routeVersionId, sourceVersion.id))).orderBy(asc(milestones.sequence));
    const sourceActions = await db.select().from(actions).where(and(eq(actions.tenantId, scope.tenant.id), eq(actions.routeVersionId, sourceVersion.id))).orderBy(asc(actions.sequence));
    const newVersion = route.currentVersion + 1;
    const newVersionId = id();
    const impact = (option.impact ?? {}) as { dateChangeDays?: number };
    const shiftMs = (impact.dateChangeDays ?? 0) * 86400000;
    const shiftDate = (value: Date | null) => value ? new Date(value.getTime() + shiftMs) : null;
    const targetDate = shiftDate(route.targetDate);
    const milestoneIdMap = new Map(sourceMilestones.map(milestone => [milestone.id, id()]));
    const preservedActions = option.strategy === "reduce_scope" ? sourceActions.filter(action => action.category !== "park") : sourceActions;
    await db.transaction(async tx => {
      await tx.insert(routeVersions).values({ id: newVersionId, tenantId: scope.tenant.id, routeId: route.id, versionNumber: newVersion, status: "approved", generatedBy: "coach", snapshot: { sourceSnapshot: sourceVersion.snapshot, reroute: option }, createdByUserId: scope.user.id });
      if (sourceMilestones.length) await tx.insert(milestones).values(sourceMilestones.map(milestone => ({ id: milestoneIdMap.get(milestone.id)!, tenantId: scope.tenant.id, routeId: route.id, routeVersionId: newVersionId, title: milestone.title, description: milestone.description, sequence: milestone.sequence, targetDate: shiftDate(milestone.targetDate), progress: milestone.progress, status: milestone.status, isMajor: milestone.isMajor })));
      if (preservedActions.length) await tx.insert(actions).values(preservedActions.map(action => ({ id: id(), tenantId: scope.tenant.id, clientId: action.clientId, routeId: route.id, routeVersionId: newVersionId, milestoneId: action.milestoneId ? milestoneIdMap.get(action.milestoneId) ?? null : null, title: action.title, description: action.description, category: action.category, sequence: action.sequence, estimatedMinutes: action.estimatedMinutes, dueDate: shiftDate(action.dueDate), dependencyActionId: null, status: action.status, coachLocked: action.coachLocked, completedAt: action.completedAt, missedAt: action.missedAt }))); 
      await tx.update(routes).set({ status: "approved", currentVersion: newVersion, targetDate, approvedByUserId: scope.user.id, approvedAt: new Date() }).where(eq(routes.id, route.id));
      await tx.update(reroutes).set({ status: "approved", selectedOptionId: optionId, resolvedAt: new Date(), resolvedByUserId: scope.user.id }).where(eq(reroutes.id, rerouteId));
    });
  } else {
    await db.update(reroutes).set({ status: "rejected", selectedOptionId: optionId, resolvedAt: new Date(), resolvedByUserId: scope.user.id }).where(eq(reroutes.id, rerouteId));
  }
  await queueNotification({ tenantId: scope.tenant.id, clientId: reroute.clientId, type: decision === "approve" ? "reroute_approved" : "reroute_rejected", payload: { rerouteId, optionId } });
  await recordAnalytics({ tenantId: scope.tenant.id, userId: scope.user.id, eventName: "reroute_completed", metadata: { decision, strategy: option.strategy } });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: "coach", entityType: "reroute", entityId: rerouteId, action: `reroute_${decision}d`, afterSummary: { option: option.strategy } });
  return { rerouteId, status: decision === "approve" ? "approved" : "rejected" };
}

export async function selectRerouteOption(scope: TenantScope, rerouteId: string, optionId: string) {
  const db = await databaseOrThrow();
  const reroute = (await db.select().from(reroutes).where(and(eq(reroutes.id, rerouteId), eq(reroutes.tenantId, scope.tenant.id))).limit(1))[0];
  if (!reroute) throw new TRPCError({ code: "NOT_FOUND", message: "Reroute not found in this workspace." });
  await assertClientAccess(scope, reroute.clientId, "write");
  if (reroute.status !== "proposed") throw new TRPCError({ code: "CONFLICT", message: "This reroute is already awaiting review or has been resolved." });
  const option = (await db.select().from(rerouteOptions).where(and(eq(rerouteOptions.id, optionId), eq(rerouteOptions.rerouteId, reroute.id), eq(rerouteOptions.tenantId, scope.tenant.id))).limit(1))[0];
  if (!option) throw new TRPCError({ code: "NOT_FOUND", message: "Reroute option not found." });
  await db.update(reroutes).set({ status: "awaiting_approval", selectedOptionId: option.id }).where(eq(reroutes.id, reroute.id));
  await queueNotification({ tenantId: scope.tenant.id, clientId: reroute.clientId, type: "coach_review_needed", payload: { rerouteId, optionId } });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: actorType(scope), entityType: "reroute", entityId: rerouteId, action: "reroute_option_selected", afterSummary: { strategy: option.strategy } });
  return { rerouteId, status: "awaiting_approval" };
}

export async function addCoachNote(scope: TenantScope, clientId: string, body: string) {
  requireCoach(scope);
  const db = await databaseOrThrow();
  await assertClientAccess(scope, clientId, "write");
  const noteId = id();
  await db.insert(coachNotes).values({ id: noteId, tenantId: scope.tenant.id, clientId, authorUserId: scope.user.id, body });
  await recordAudit({ tenantId: scope.tenant.id, actorUserId: scope.user.id, actorType: "coach", entityType: "coach_note", entityId: noteId, action: "coach_note_added" });
  return { noteId };
}

export async function getCoachBrief(scope: TenantScope, clientId: string) {
  requireCoach(scope);
  const db = await databaseOrThrow();
  await assertClientAccess(scope, clientId);
  const actionRows = await db.select().from(actions).where(and(eq(actions.tenantId, scope.tenant.id), eq(actions.clientId, clientId)));
  const latestCheckIn = (await db.select().from(checkIns).where(and(eq(checkIns.tenantId, scope.tenant.id), eq(checkIns.clientId, clientId))).orderBy(desc(checkIns.submittedAt)).limit(1))[0];
  const notes = await db.select().from(coachNotes).where(and(eq(coachNotes.tenantId, scope.tenant.id), eq(coachNotes.clientId, clientId))).orderBy(desc(coachNotes.createdAt)).limit(5);
  const started = Date.now();
  await enforceAiRateLimit(scope.tenant.id, "coach_brief");
  const brief = await aiProvider.buildCoachBrief({ completedActions: actionRows.filter(action => action.status === "completed").length, totalActions: actionRows.length, missedActions: actionRows.filter(action => action.status === "missed").length, checkInText: latestCheckIn?.completedText, notes: notes.map(note => note.body) });
  await recordAiUsage({ tenantId: scope.tenant.id, clientId, feature: "coach_brief", model: brief.model, status: "success", latencyMs: Date.now() - started });
  await db.insert(aiSummaries).values({ id: id(), tenantId: scope.tenant.id, clientId, sourceType: "coach_brief", sourceId: clientId, summary: brief.value });
  await recordAnalytics({ tenantId: scope.tenant.id, userId: scope.user.id, eventName: "coach_brief_viewed", metadata: { onlyCount: true } });
  return brief.value;
}

export async function getRerouteOptions(scope: TenantScope, rerouteId: string) {
  const db = await databaseOrThrow();
  const reroute = (await db.select().from(reroutes).where(and(eq(reroutes.id, rerouteId), eq(reroutes.tenantId, scope.tenant.id))).limit(1))[0];
  if (!reroute) throw new TRPCError({ code: "NOT_FOUND", message: "Reroute not found in this workspace." });
  await assertClientAccess(scope, reroute.clientId);
  return db.select().from(rerouteOptions).where(and(eq(rerouteOptions.rerouteId, rerouteId), eq(rerouteOptions.tenantId, scope.tenant.id)));
}

export async function exportClientData(scope: TenantScope) {
  requireCoach(scope);
  const db = await databaseOrThrow();
  const clients = await db.select().from(clientProfiles).where(and(eq(clientProfiles.tenantId, scope.tenant.id), ...(scope.membership.role === "coach" ? [eq(clientProfiles.assignedCoachUserId, scope.user.id)] : []))).orderBy(asc(clientProfiles.name));
  const rows = await Promise.all(clients.map(async client => {
    const goal = (await db.select().from(goals).where(and(eq(goals.tenantId, scope.tenant.id), eq(goals.clientId, client.id))).orderBy(desc(goals.updatedAt)).limit(1))[0];
    const route = await currentRouteForClient(scope.tenant.id, client.id);
    const checkins = await db.select().from(checkIns).where(and(eq(checkIns.tenantId, scope.tenant.id), eq(checkIns.clientId, client.id))).orderBy(desc(checkIns.submittedAt)).limit(1);
    return [client.name, client.email, client.invitationStatus, goal?.title ?? "", goal?.targetDate?.toISOString() ?? "", route?.status ?? "", checkins[0]?.submittedAt.toISOString() ?? ""];
  }));
  const escape = (value: string) => `"${value.replaceAll("\"", "\"\"")}"`;
  const csv = [["Client", "Email", "Invitation status", "Goal", "Target date", "Route status", "Latest check-in"], ...rows].map(row => row.map(value => escape(String(value))).join(",")).join("\n");
  return { filename: `visionroute-clients-${new Date().toISOString().slice(0, 10)}.csv`, csv };
}

export async function listNotifications(scope: TenantScope) {
  const db = await databaseOrThrow();
  if (scope.membership.role === "owner") return db.select().from(notifications).where(eq(notifications.tenantId, scope.tenant.id)).orderBy(desc(notifications.createdAt)).limit(10);
  if (scope.membership.role === "client") {
    const client = (await db.select().from(clientProfiles).where(and(eq(clientProfiles.tenantId, scope.tenant.id), eq(clientProfiles.userId, scope.user.id))).limit(1))[0];
    return client ? db.select().from(notifications).where(and(eq(notifications.tenantId, scope.tenant.id), eq(notifications.clientId, client.id))).orderBy(desc(notifications.createdAt)).limit(10) : [];
  }
  const assigned = await db.select({ id: clientProfiles.id }).from(clientProfiles).where(and(eq(clientProfiles.tenantId, scope.tenant.id), eq(clientProfiles.assignedCoachUserId, scope.user.id)));
  return assigned.length ? db.select().from(notifications).where(and(eq(notifications.tenantId, scope.tenant.id), inArray(notifications.clientId, assigned.map(client => client.id)))).orderBy(desc(notifications.createdAt)).limit(10) : [];
}

export async function markOverdueActions(tenantId: string) {
  const db = await databaseOrThrow();
  const overdue = await db.select().from(actions).where(and(eq(actions.tenantId, tenantId), eq(actions.status, "pending"), lt(actions.dueDate, new Date())));
  for (const action of overdue) {
    await db.update(actions).set({ status: "missed", missedAt: new Date() }).where(eq(actions.id, action.id));
    const route = (await db.select().from(routes).where(and(eq(routes.id, action.routeId), eq(routes.tenantId, tenantId))).limit(1))[0];
    if (!route || route.currentVersion !== (await db.select().from(routeVersions).where(eq(routeVersions.id, action.routeVersionId)).limit(1))[0]?.versionNumber) continue;
    const existing = await db.select().from(reroutes).where(and(eq(reroutes.tenantId, tenantId), eq(reroutes.clientId, action.clientId), eq(reroutes.routeId, route.id), inArray(reroutes.status, ["proposed", "awaiting_approval"]))).limit(1);
    if (existing[0]) continue;
    const rerouteId = id();
    const options = buildRerouteOptions(`A scheduled action was missed: ${action.title}`, route.targetDate);
    await db.transaction(async tx => {
      await tx.insert(reroutes).values({ id: rerouteId, tenantId, clientId: action.clientId, routeId: route.id, sourceRouteVersionId: action.routeVersionId, triggerType: "missed_action", whatHappened: `A scheduled action was missed: ${action.title}`, status: "proposed", requiresApproval: true });
      await tx.insert(rerouteOptions).values(options.map(option => ({ id: id(), tenantId, rerouteId, ...option })));
    });
    await queueNotification({ tenantId, clientId: action.clientId, type: "reroute_requested", payload: { rerouteId, trigger: "missed_action" } });
  }
  return overdue.length;
}
