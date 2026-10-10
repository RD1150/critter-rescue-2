import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Global authenticated identities. A user becomes a coach or client only through a
 * tenant membership. Never infer tenant permission from this table alone.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const tenants = mysqlTable(
  "tenants",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizationName: varchar("organizationName", { length: 160 }).notNull(),
    portalName: varchar("portalName", { length: 160 }).notNull(),
    coachingCategory: varchar("coachingCategory", { length: 48 }).notNull(),
    website: varchar("website", { length: 512 }),
    logoUrl: varchar("logoUrl", { length: 1024 }),
    brandColor: varchar("brandColor", { length: 16 }).notNull().default("#0F766E"),
    welcomeMessage: text("welcomeMessage"),
    terminology: json("terminology"),
    settings: json("settings"),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("tenants_status_idx").on(table.status)]
);

export const memberships = mysqlTable(
  "memberships",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: mysqlEnum("role", ["owner", "coach", "client"]).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("memberships_tenant_user_unique").on(table.tenantId, table.userId),
    index("memberships_user_idx").on(table.userId),
    index("memberships_tenant_role_idx").on(table.tenantId, table.role),
  ]
);

export const coachProfiles = mysqlTable(
  "coach_profiles",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 96 }),
    canManageBilling: boolean("canManageBilling").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("coach_profiles_tenant_user_unique").on(table.tenantId, table.userId),
    index("coach_profiles_tenant_idx").on(table.tenantId),
  ]
);

export const clientProfiles = mysqlTable(
  "client_profiles",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    userId: int("userId").references(() => users.id, { onDelete: "set null" }),
    assignedCoachUserId: int("assignedCoachUserId").references(() => users.id, { onDelete: "set null" }),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    invitationStatus: varchar("invitationStatus", { length: 32 }).notNull().default("invited"),
    onboardingStatus: varchar("onboardingStatus", { length: 32 }).notNull().default("not_started"),
    capacity: mysqlEnum("capacity", ["low", "normal", "high"]).notNull().default("normal"),
    intake: json("intake"),
    isDemo: boolean("isDemo").notNull().default(false),
    lastActivityAt: timestamp("lastActivityAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("client_profiles_tenant_email_unique").on(table.tenantId, table.email),
    uniqueIndex("client_profiles_user_unique").on(table.userId),
    index("client_profiles_tenant_idx").on(table.tenantId),
    index("client_profiles_tenant_coach_idx").on(table.tenantId, table.assignedCoachUserId),
  ]
);

export const invitations = mysqlTable(
  "invitations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).notNull().references(() => clientProfiles.id, { onDelete: "cascade" }),
    invitedByUserId: int("invitedByUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }).notNull(),
    tokenDigest: varchar("tokenDigest", { length: 128 }).notNull().unique(),
    status: varchar("status", { length: 32 }).notNull().default("invited"),
    expiresAt: timestamp("expiresAt").notNull(),
    acceptedAt: timestamp("acceptedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("invitations_tenant_status_idx").on(table.tenantId, table.status),
    index("invitations_client_idx").on(table.clientId),
  ]
);

export const goals = mysqlTable(
  "goals",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).notNull().references(() => clientProfiles.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 280 }).notNull(),
    targetDate: timestamp("targetDate"),
    priority: mysqlEnum("priority", ["active", "maintain", "next", "park"]).notNull().default("active"),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    whyItMatters: text("whyItMatters"),
    constraints: json("constraints"),
    coachLocked: boolean("coachLocked").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("goals_tenant_client_idx").on(table.tenantId, table.clientId),
    index("goals_tenant_priority_idx").on(table.tenantId, table.priority),
  ]
);

export const routes = mysqlTable(
  "routes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).notNull().references(() => clientProfiles.id, { onDelete: "cascade" }),
    goalId: varchar("goalId", { length: 36 }).notNull().references(() => goals.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull().default("proposed"),
    currentVersion: int("currentVersion").notNull().default(1),
    destination: varchar("destination", { length: 280 }).notNull(),
    targetDate: timestamp("targetDate"),
    realityCheck: json("realityCheck"),
    approvedByUserId: int("approvedByUserId").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("routes_tenant_client_idx").on(table.tenantId, table.clientId),
    index("routes_goal_idx").on(table.goalId),
    index("routes_tenant_status_idx").on(table.tenantId, table.status),
  ]
);

export const routeVersions = mysqlTable(
  "route_versions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    routeId: varchar("routeId", { length: 36 }).notNull().references(() => routes.id, { onDelete: "cascade" }),
    versionNumber: int("versionNumber").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("proposed"),
    generatedBy: varchar("generatedBy", { length: 32 }).notNull().default("ai"),
    snapshot: json("snapshot").notNull(),
    createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("route_versions_route_version_unique").on(table.routeId, table.versionNumber),
    index("route_versions_tenant_idx").on(table.tenantId),
  ]
);

export const milestones = mysqlTable(
  "milestones",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    routeId: varchar("routeId", { length: 36 }).notNull().references(() => routes.id, { onDelete: "cascade" }),
    routeVersionId: varchar("routeVersionId", { length: 36 }).notNull().references(() => routeVersions.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 280 }).notNull(),
    description: text("description"),
    sequence: int("sequence").notNull(),
    targetDate: timestamp("targetDate"),
    progress: int("progress").notNull().default(0),
    status: varchar("status", { length: 32 }).notNull().default("upcoming"),
    isMajor: boolean("isMajor").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("milestones_tenant_route_idx").on(table.tenantId, table.routeId),
    uniqueIndex("milestones_version_sequence_unique").on(table.routeVersionId, table.sequence),
  ]
);

export const actions = mysqlTable(
  "actions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).notNull().references(() => clientProfiles.id, { onDelete: "cascade" }),
    routeId: varchar("routeId", { length: 36 }).notNull().references(() => routes.id, { onDelete: "cascade" }),
    routeVersionId: varchar("routeVersionId", { length: 36 }).notNull().references(() => routeVersions.id, { onDelete: "cascade" }),
    milestoneId: varchar("milestoneId", { length: 36 }).references(() => milestones.id, { onDelete: "set null" }),
    title: varchar("title", { length: 320 }).notNull(),
    description: text("description"),
    category: mysqlEnum("category", ["active", "maintain", "next", "park"]).notNull().default("active"),
    sequence: int("sequence").notNull(),
    estimatedMinutes: int("estimatedMinutes").notNull().default(30),
    dueDate: timestamp("dueDate"),
    dependencyActionId: varchar("dependencyActionId", { length: 36 }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    coachLocked: boolean("coachLocked").notNull().default(false),
    completedAt: timestamp("completedAt"),
    missedAt: timestamp("missedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("actions_tenant_client_status_idx").on(table.tenantId, table.clientId, table.status),
    index("actions_route_version_idx").on(table.routeVersionId),
    index("actions_due_idx").on(table.tenantId, table.dueDate),
  ]
);

export const actionEvents = mysqlTable(
  "action_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).notNull().references(() => clientProfiles.id, { onDelete: "cascade" }),
    actionId: varchar("actionId", { length: 36 }).notNull().references(() => actions.id, { onDelete: "cascade" }),
    actorUserId: int("actorUserId").references(() => users.id, { onDelete: "set null" }),
    type: varchar("type", { length: 32 }).notNull(),
    notes: text("notes"),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("action_events_tenant_action_idx").on(table.tenantId, table.actionId)]
);

export const checkIns = mysqlTable(
  "check_ins",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).notNull().references(() => clientProfiles.id, { onDelete: "cascade" }),
    completedText: text("completedText").notNull(),
    obstacleText: text("obstacleText"),
    changedText: text("changedText"),
    prioritiesCorrect: boolean("prioritiesCorrect").notNull().default(true),
    needsReroute: boolean("needsReroute").notNull().default(false),
    capacity: mysqlEnum("capacity", ["low", "normal", "high"]).notNull().default("normal"),
    aiSummary: json("aiSummary"),
    submittedAt: timestamp("submittedAt").defaultNow().notNull(),
    reviewedAt: timestamp("reviewedAt"),
    reviewedByUserId: int("reviewedByUserId").references(() => users.id, { onDelete: "set null" }),
  },
  table => [index("check_ins_tenant_client_idx").on(table.tenantId, table.clientId)]
);

export const reroutes = mysqlTable(
  "reroutes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).notNull().references(() => clientProfiles.id, { onDelete: "cascade" }),
    routeId: varchar("routeId", { length: 36 }).notNull().references(() => routes.id, { onDelete: "cascade" }),
    sourceRouteVersionId: varchar("sourceRouteVersionId", { length: 36 }).notNull().references(() => routeVersions.id, { onDelete: "cascade" }),
    triggerType: varchar("triggerType", { length: 32 }).notNull(),
    whatHappened: text("whatHappened").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("proposed"),
    selectedOptionId: varchar("selectedOptionId", { length: 36 }),
    requiresApproval: boolean("requiresApproval").notNull().default(true),
    resolvedAt: timestamp("resolvedAt"),
    resolvedByUserId: int("resolvedByUserId").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("reroutes_tenant_client_status_idx").on(table.tenantId, table.clientId, table.status)]
);

export const rerouteOptions = mysqlTable(
  "reroute_options",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    rerouteId: varchar("rerouteId", { length: 36 }).notNull().references(() => reroutes.id, { onDelete: "cascade" }),
    strategy: mysqlEnum("strategy", ["keep_destination", "move_destination", "reduce_scope", "change_route"]).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    summary: text("summary").notNull(),
    impact: json("impact"),
    recommended: boolean("recommended").notNull().default(false),
    requiresApproval: boolean("requiresApproval").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("reroute_options_tenant_reroute_idx").on(table.tenantId, table.rerouteId)]
);

export const coachNotes = mysqlTable(
  "coach_notes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).notNull().references(() => clientProfiles.id, { onDelete: "cascade" }),
    authorUserId: int("authorUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("coach_notes_tenant_client_idx").on(table.tenantId, table.clientId)]
);

export const templates = mysqlTable(
  "templates",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    type: varchar("type", { length: 48 }).notNull(),
    body: json("body").notNull(),
    isGlobal: boolean("isGlobal").notNull().default(false),
    createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("templates_tenant_type_idx").on(table.tenantId, table.type)]
);

export const aiSummaries = mysqlTable(
  "ai_summaries",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).references(() => clientProfiles.id, { onDelete: "cascade" }),
    sourceType: varchar("sourceType", { length: 48 }).notNull(),
    sourceId: varchar("sourceId", { length: 36 }),
    summary: json("summary").notNull(),
    version: int("version").notNull().default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("ai_summaries_tenant_client_source_idx").on(table.tenantId, table.clientId, table.sourceType)]
);

export const aiUsage = mysqlTable(
  "ai_usage",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 36 }).references(() => clientProfiles.id, { onDelete: "set null" }),
    feature: varchar("feature", { length: 64 }).notNull(),
    model: varchar("model", { length: 128 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    promptTokens: int("promptTokens"),
    completionTokens: int("completionTokens"),
    latencyMs: int("latencyMs"),
    correlationId: varchar("correlationId", { length: 64 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("ai_usage_tenant_feature_idx").on(table.tenantId, table.feature)]
);

export const subscriptions = mysqlTable(
  "subscriptions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
    stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
    planKey: varchar("planKey", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("trialing"),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("subscriptions_tenant_unique").on(table.tenantId), index("subscriptions_status_idx").on(table.status)]
);

export const processedWebhookEvents = mysqlTable(
  "processed_webhook_events",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    provider: varchar("provider", { length: 32 }).notNull(),
    processedAt: timestamp("processedAt").defaultNow().notNull(),
  },
  table => [index("processed_webhooks_provider_idx").on(table.provider)]
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    userId: int("userId").references(() => users.id, { onDelete: "set null" }),
    clientId: varchar("clientId", { length: 36 }).references(() => clientProfiles.id, { onDelete: "set null" }),
    type: varchar("type", { length: 64 }).notNull(),
    channel: varchar("channel", { length: 32 }).notNull().default("in_app"),
    status: varchar("status", { length: 32 }).notNull().default("queued"),
    providerMessageId: varchar("providerMessageId", { length: 255 }),
    payload: json("payload"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    sentAt: timestamp("sentAt"),
  },
  table => [index("notifications_tenant_status_idx").on(table.tenantId, table.status)]
);

export const analyticsEvents = mysqlTable(
  "analytics_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).references(() => tenants.id, { onDelete: "set null" }),
    userId: int("userId").references(() => users.id, { onDelete: "set null" }),
    eventName: varchar("eventName", { length: 80 }).notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("analytics_events_name_idx").on(table.eventName), index("analytics_events_tenant_idx").on(table.tenantId)]
);

export const auditEvents = mysqlTable(
  "audit_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 36 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    actorType: varchar("actorType", { length: 32 }).notNull(),
    actorUserId: int("actorUserId").references(() => users.id, { onDelete: "set null" }),
    entityType: varchar("entityType", { length: 64 }).notNull(),
    entityId: varchar("entityId", { length: 36 }).notNull(),
    action: varchar("action", { length: 80 }).notNull(),
    beforeSummary: json("beforeSummary"),
    afterSummary: json("afterSummary"),
    requestId: varchar("requestId", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("audit_events_tenant_entity_idx").on(table.tenantId, table.entityType, table.entityId)]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type ClientProfile = typeof clientProfiles.$inferSelect;
