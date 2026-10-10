CREATE TABLE `action_events` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36) NOT NULL,
	`actionId` varchar(36) NOT NULL,
	`actorUserId` int,
	`type` varchar(32) NOT NULL,
	`notes` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `action_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `actions` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36) NOT NULL,
	`routeId` varchar(36) NOT NULL,
	`routeVersionId` varchar(36) NOT NULL,
	`milestoneId` varchar(36),
	`title` varchar(320) NOT NULL,
	`description` text,
	`category` enum('active','maintain','next','park') NOT NULL DEFAULT 'active',
	`sequence` int NOT NULL,
	`estimatedMinutes` int NOT NULL DEFAULT 30,
	`dueDate` timestamp,
	`dependencyActionId` varchar(36),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`coachLocked` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`missedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_summaries` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36),
	`sourceType` varchar(48) NOT NULL,
	`sourceId` varchar(36),
	`summary` json NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_summaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_usage` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36),
	`feature` varchar(64) NOT NULL,
	`model` varchar(128) NOT NULL,
	`status` varchar(32) NOT NULL,
	`promptTokens` int,
	`completionTokens` int,
	`latencyMs` int,
	`correlationId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36),
	`userId` int,
	`eventName` varchar(80) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`actorType` varchar(32) NOT NULL,
	`actorUserId` int,
	`entityType` varchar(64) NOT NULL,
	`entityId` varchar(36) NOT NULL,
	`action` varchar(80) NOT NULL,
	`beforeSummary` json,
	`afterSummary` json,
	`requestId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `check_ins` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36) NOT NULL,
	`completedText` text NOT NULL,
	`obstacleText` text,
	`changedText` text,
	`prioritiesCorrect` boolean NOT NULL DEFAULT true,
	`needsReroute` boolean NOT NULL DEFAULT false,
	`capacity` enum('low','normal','high') NOT NULL DEFAULT 'normal',
	`aiSummary` json,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedByUserId` int,
	CONSTRAINT `check_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_profiles` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`userId` int,
	`assignedCoachUserId` int,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`invitationStatus` varchar(32) NOT NULL DEFAULT 'invited',
	`onboardingStatus` varchar(32) NOT NULL DEFAULT 'not_started',
	`capacity` enum('low','normal','high') NOT NULL DEFAULT 'normal',
	`intake` json,
	`isDemo` boolean NOT NULL DEFAULT false,
	`lastActivityAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_profiles_tenant_email_unique` UNIQUE(`tenantId`,`email`),
	CONSTRAINT `client_profiles_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `coach_notes` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36) NOT NULL,
	`authorUserId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_profiles` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(96),
	`canManageBilling` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `coach_profiles_tenant_user_unique` UNIQUE(`tenantId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36) NOT NULL,
	`title` varchar(280) NOT NULL,
	`targetDate` timestamp,
	`priority` enum('active','maintain','next','park') NOT NULL DEFAULT 'active',
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`whyItMatters` text,
	`constraints` json,
	`coachLocked` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36) NOT NULL,
	`invitedByUserId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`tokenDigest` varchar(128) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'invited',
	`expiresAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_tokenDigest_unique` UNIQUE(`tokenDigest`)
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','coach','client') NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `memberships_tenant_user_unique` UNIQUE(`tenantId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`routeId` varchar(36) NOT NULL,
	`routeVersionId` varchar(36) NOT NULL,
	`title` varchar(280) NOT NULL,
	`description` text,
	`sequence` int NOT NULL,
	`targetDate` timestamp,
	`progress` int NOT NULL DEFAULT 0,
	`status` varchar(32) NOT NULL DEFAULT 'upcoming',
	`isMajor` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`),
	CONSTRAINT `milestones_version_sequence_unique` UNIQUE(`routeVersionId`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`userId` int,
	`clientId` varchar(36),
	`type` varchar(64) NOT NULL,
	`channel` varchar(32) NOT NULL DEFAULT 'in_app',
	`status` varchar(32) NOT NULL DEFAULT 'queued',
	`providerMessageId` varchar(255),
	`payload` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`sentAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processed_webhook_events` (
	`id` varchar(255) NOT NULL,
	`provider` varchar(32) NOT NULL,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processed_webhook_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reroute_options` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`rerouteId` varchar(36) NOT NULL,
	`strategy` enum('keep_destination','move_destination','reduce_scope','change_route') NOT NULL,
	`title` varchar(160) NOT NULL,
	`summary` text NOT NULL,
	`impact` json,
	`recommended` boolean NOT NULL DEFAULT false,
	`requiresApproval` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reroute_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reroutes` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36) NOT NULL,
	`routeId` varchar(36) NOT NULL,
	`sourceRouteVersionId` varchar(36) NOT NULL,
	`triggerType` varchar(32) NOT NULL,
	`whatHappened` text NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'proposed',
	`selectedOptionId` varchar(36),
	`requiresApproval` boolean NOT NULL DEFAULT true,
	`resolvedAt` timestamp,
	`resolvedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reroutes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `route_versions` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`routeId` varchar(36) NOT NULL,
	`versionNumber` int NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'proposed',
	`generatedBy` varchar(32) NOT NULL DEFAULT 'ai',
	`snapshot` json NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `route_versions_id` PRIMARY KEY(`id`),
	CONSTRAINT `route_versions_route_version_unique` UNIQUE(`routeId`,`versionNumber`)
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`clientId` varchar(36) NOT NULL,
	`goalId` varchar(36) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'proposed',
	`currentVersion` int NOT NULL DEFAULT 1,
	`destination` varchar(280) NOT NULL,
	`targetDate` timestamp,
	`realityCheck` json,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36) NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`planKey` varchar(64) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'trialing',
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_tenant_unique` UNIQUE(`tenantId`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` varchar(36) NOT NULL,
	`tenantId` varchar(36),
	`name` varchar(160) NOT NULL,
	`type` varchar(48) NOT NULL,
	`body` json NOT NULL,
	`isGlobal` boolean NOT NULL DEFAULT false,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` varchar(36) NOT NULL,
	`organizationName` varchar(160) NOT NULL,
	`portalName` varchar(160) NOT NULL,
	`coachingCategory` varchar(48) NOT NULL,
	`website` varchar(512),
	`logoUrl` varchar(1024),
	`brandColor` varchar(16) NOT NULL DEFAULT '#0F766E',
	`welcomeMessage` text,
	`terminology` json,
	`settings` json,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `action_events` ADD CONSTRAINT `action_events_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `action_events` ADD CONSTRAINT `action_events_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `action_events` ADD CONSTRAINT `action_events_actionId_actions_id_fk` FOREIGN KEY (`actionId`) REFERENCES `actions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `action_events` ADD CONSTRAINT `action_events_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_routeId_routes_id_fk` FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_routeVersionId_route_versions_id_fk` FOREIGN KEY (`routeVersionId`) REFERENCES `route_versions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_milestoneId_milestones_id_fk` FOREIGN KEY (`milestoneId`) REFERENCES `milestones`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_summaries` ADD CONSTRAINT `ai_summaries_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_summaries` ADD CONSTRAINT `ai_summaries_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_usage` ADD CONSTRAINT `ai_usage_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_usage` ADD CONSTRAINT `ai_usage_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_events` ADD CONSTRAINT `audit_events_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_events` ADD CONSTRAINT `audit_events_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_profiles` ADD CONSTRAINT `client_profiles_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_profiles` ADD CONSTRAINT `client_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_profiles` ADD CONSTRAINT `client_profiles_assignedCoachUserId_users_id_fk` FOREIGN KEY (`assignedCoachUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_notes` ADD CONSTRAINT `coach_notes_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_notes` ADD CONSTRAINT `coach_notes_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_notes` ADD CONSTRAINT `coach_notes_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_profiles` ADD CONSTRAINT `coach_profiles_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_profiles` ADD CONSTRAINT `coach_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `goals` ADD CONSTRAINT `goals_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `goals` ADD CONSTRAINT `goals_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_invitedByUserId_users_id_fk` FOREIGN KEY (`invitedByUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_routeId_routes_id_fk` FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_routeVersionId_route_versions_id_fk` FOREIGN KEY (`routeVersionId`) REFERENCES `route_versions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reroute_options` ADD CONSTRAINT `reroute_options_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reroute_options` ADD CONSTRAINT `reroute_options_rerouteId_reroutes_id_fk` FOREIGN KEY (`rerouteId`) REFERENCES `reroutes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reroutes` ADD CONSTRAINT `reroutes_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reroutes` ADD CONSTRAINT `reroutes_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reroutes` ADD CONSTRAINT `reroutes_routeId_routes_id_fk` FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reroutes` ADD CONSTRAINT `reroutes_sourceRouteVersionId_route_versions_id_fk` FOREIGN KEY (`sourceRouteVersionId`) REFERENCES `route_versions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reroutes` ADD CONSTRAINT `reroutes_resolvedByUserId_users_id_fk` FOREIGN KEY (`resolvedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_versions` ADD CONSTRAINT `route_versions_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_versions` ADD CONSTRAINT `route_versions_routeId_routes_id_fk` FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_versions` ADD CONSTRAINT `route_versions_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `routes` ADD CONSTRAINT `routes_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `routes` ADD CONSTRAINT `routes_clientId_client_profiles_id_fk` FOREIGN KEY (`clientId`) REFERENCES `client_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `routes` ADD CONSTRAINT `routes_goalId_goals_id_fk` FOREIGN KEY (`goalId`) REFERENCES `goals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `routes` ADD CONSTRAINT `routes_approvedByUserId_users_id_fk` FOREIGN KEY (`approvedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `templates` ADD CONSTRAINT `templates_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `templates` ADD CONSTRAINT `templates_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `action_events_tenant_action_idx` ON `action_events` (`tenantId`,`actionId`);--> statement-breakpoint
CREATE INDEX `actions_tenant_client_status_idx` ON `actions` (`tenantId`,`clientId`,`status`);--> statement-breakpoint
CREATE INDEX `actions_route_version_idx` ON `actions` (`routeVersionId`);--> statement-breakpoint
CREATE INDEX `actions_due_idx` ON `actions` (`tenantId`,`dueDate`);--> statement-breakpoint
CREATE INDEX `ai_summaries_tenant_client_source_idx` ON `ai_summaries` (`tenantId`,`clientId`,`sourceType`);--> statement-breakpoint
CREATE INDEX `ai_usage_tenant_feature_idx` ON `ai_usage` (`tenantId`,`feature`);--> statement-breakpoint
CREATE INDEX `analytics_events_name_idx` ON `analytics_events` (`eventName`);--> statement-breakpoint
CREATE INDEX `analytics_events_tenant_idx` ON `analytics_events` (`tenantId`);--> statement-breakpoint
CREATE INDEX `audit_events_tenant_entity_idx` ON `audit_events` (`tenantId`,`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `check_ins_tenant_client_idx` ON `check_ins` (`tenantId`,`clientId`);--> statement-breakpoint
CREATE INDEX `client_profiles_tenant_idx` ON `client_profiles` (`tenantId`);--> statement-breakpoint
CREATE INDEX `client_profiles_tenant_coach_idx` ON `client_profiles` (`tenantId`,`assignedCoachUserId`);--> statement-breakpoint
CREATE INDEX `coach_notes_tenant_client_idx` ON `coach_notes` (`tenantId`,`clientId`);--> statement-breakpoint
CREATE INDEX `coach_profiles_tenant_idx` ON `coach_profiles` (`tenantId`);--> statement-breakpoint
CREATE INDEX `goals_tenant_client_idx` ON `goals` (`tenantId`,`clientId`);--> statement-breakpoint
CREATE INDEX `goals_tenant_priority_idx` ON `goals` (`tenantId`,`priority`);--> statement-breakpoint
CREATE INDEX `invitations_tenant_status_idx` ON `invitations` (`tenantId`,`status`);--> statement-breakpoint
CREATE INDEX `invitations_client_idx` ON `invitations` (`clientId`);--> statement-breakpoint
CREATE INDEX `memberships_user_idx` ON `memberships` (`userId`);--> statement-breakpoint
CREATE INDEX `memberships_tenant_role_idx` ON `memberships` (`tenantId`,`role`);--> statement-breakpoint
CREATE INDEX `milestones_tenant_route_idx` ON `milestones` (`tenantId`,`routeId`);--> statement-breakpoint
CREATE INDEX `notifications_tenant_status_idx` ON `notifications` (`tenantId`,`status`);--> statement-breakpoint
CREATE INDEX `processed_webhooks_provider_idx` ON `processed_webhook_events` (`provider`);--> statement-breakpoint
CREATE INDEX `reroute_options_tenant_reroute_idx` ON `reroute_options` (`tenantId`,`rerouteId`);--> statement-breakpoint
CREATE INDEX `reroutes_tenant_client_status_idx` ON `reroutes` (`tenantId`,`clientId`,`status`);--> statement-breakpoint
CREATE INDEX `route_versions_tenant_idx` ON `route_versions` (`tenantId`);--> statement-breakpoint
CREATE INDEX `routes_tenant_client_idx` ON `routes` (`tenantId`,`clientId`);--> statement-breakpoint
CREATE INDEX `routes_goal_idx` ON `routes` (`goalId`);--> statement-breakpoint
CREATE INDEX `routes_tenant_status_idx` ON `routes` (`tenantId`,`status`);--> statement-breakpoint
CREATE INDEX `subscriptions_status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `templates_tenant_type_idx` ON `templates` (`tenantId`,`type`);--> statement-breakpoint
CREATE INDEX `tenants_status_idx` ON `tenants` (`status`);