import { z } from "zod";

export const COACHING_CATEGORIES = [
  "business",
  "entrepreneur",
  "sports",
  "athletic_performance",
  "personal_training",
] as const;

export const CAPACITY_LEVELS = ["low", "normal", "high"] as const;
export const PRIORITY_BUCKETS = ["active", "maintain", "next", "park"] as const;

export const defaultTerminology = {
  goal: "Goal",
  action: "Action",
  milestone: "Milestone",
  checkIn: "Check-in",
  reroute: "Reroute",
  capacity: "Capacity",
  nextAction: "What should I do?",
} as const;

export const sportsTerminology = {
  goal: "Performance Outcome",
  action: "Training Commitment",
  milestone: "Benchmark",
  checkIn: "Training Check-In",
  reroute: "Plan Adjustment",
  capacity: "Readiness",
  nextAction: "What should I train?",
} as const;

export type Terminology = {
  goal: string;
  action: string;
  milestone: string;
  checkIn: string;
  reroute: string;
  capacity: string;
  nextAction: string;
};

export const terminologyForCategory = (category: string): Terminology =>
  category === "sports" || category === "athletic_performance"
    ? { ...sportsTerminology }
    : { ...defaultTerminology };

export const createTenantInput = z.object({
  organizationName: z.string().min(2).max(160),
  portalName: z.string().min(2).max(160).optional(),
  coachingCategory: z.enum(COACHING_CATEGORIES),
  website: z.string().url().max(512).optional().or(z.literal("")),
  logoUrl: z.string().url().max(1024).optional().or(z.literal("")),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#0F766E"),
  welcomeMessage: z.string().max(1200).optional(),
  terminology: z.object({
    goal: z.string().min(1).max(48),
    action: z.string().min(1).max(48),
    milestone: z.string().min(1).max(48),
    checkIn: z.string().min(1).max(48),
    reroute: z.string().min(1).max(48),
    capacity: z.string().min(1).max(48),
    nextAction: z.string().min(1).max(72),
  }).optional(),
  includeDemo: z.boolean().default(true),
});

export const updateTenantInput = z.object({
  tenantId: z.string().uuid(),
  organizationName: z.string().min(2).max(160),
  portalName: z.string().min(2).max(160),
  website: z.string().url().max(512).optional().or(z.literal("")),
  logoUrl: z.string().url().max(1024).optional().or(z.literal("")),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  welcomeMessage: z.string().max(1200).optional(),
  terminology: z.object({
    goal: z.string().min(1).max(48),
    action: z.string().min(1).max(48),
    milestone: z.string().min(1).max(48),
    checkIn: z.string().min(1).max(48),
    reroute: z.string().min(1).max(48),
    capacity: z.string().min(1).max(48),
    nextAction: z.string().min(1).max(72),
  }),
});

export const inviteClientInput = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(2).max(160),
  email: z.string().email().max(320),
});

export const intakeInput = z.object({
  tenantId: z.string().uuid(),
  clientId: z.string().uuid(),
  goal: z.string().min(5).max(600),
  targetDate: z.string().datetime().optional(),
  whyItMatters: z.string().min(3).max(1200),
  competingAttention: z.string().max(1200).optional(),
  weeklyMinutes: z.number().int().min(30).max(10080),
  alreadyCompleted: z.string().max(1200).optional(),
  obstacles: z.string().max(1200).optional(),
  fixedCommitments: z.string().max(1200).optional(),
  canPostpone: z.string().max(1200).optional(),
  successDefinition: z.string().max(1200).optional(),
  constraints: z.string().max(1200).optional(),
  sport: z.string().max(160).optional(),
  discipline: z.string().max(160).optional(),
  currentPerformance: z.string().max(400).optional(),
  targetPerformance: z.string().max(400).optional(),
  trainingAvailability: z.string().max(1200).optional(),
  equipmentAvailability: z.string().max(800).optional(),
  facilityAvailability: z.string().max(800).optional(),
  travelSchedule: z.string().max(800).optional(),
  coachLimitations: z.string().max(800).optional(),
});

export const capacityInput = z.object({
  tenantId: z.string().uuid(),
  clientId: z.string().uuid(),
  capacity: z.enum(CAPACITY_LEVELS),
});

export const generateRouteInput = z.object({
  tenantId: z.string().uuid(),
  clientId: z.string().uuid(),
});

export const actionInput = z.object({
  tenantId: z.string().uuid(),
  actionId: z.string().uuid(),
  notes: z.string().max(1200).optional(),
});

export const checkInInput = z.object({
  tenantId: z.string().uuid(),
  clientId: z.string().uuid(),
  completedText: z.string().min(1).max(2000),
  obstacleText: z.string().max(2000).optional(),
  changedText: z.string().max(2000).optional(),
  prioritiesCorrect: z.boolean(),
  needsReroute: z.boolean(),
  capacity: z.enum(CAPACITY_LEVELS),
});

export const rerouteInput = z.object({
  tenantId: z.string().uuid(),
  clientId: z.string().uuid(),
  whatHappened: z.string().min(2).max(1200),
  triggerType: z.enum(["missed_action", "client_request", "check_in"]),
});

export const resolveRerouteInput = z.object({
  tenantId: z.string().uuid(),
  rerouteId: z.string().uuid(),
  optionId: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
});

export const selectRerouteOptionInput = z.object({
  tenantId: z.string().uuid(),
  rerouteId: z.string().uuid(),
  optionId: z.string().uuid(),
});

export const coachNoteInput = z.object({
  tenantId: z.string().uuid(),
  clientId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export const routePlanSchema = z.object({
  estimatedWeeks: z.number().int().positive(),
  realityCheck: z.object({
    isRealistic: z.boolean(),
    estimateWeeks: z.number().int().positive(),
    targetWeeks: z.number().int().positive().nullable(),
    message: z.string(),
    options: z.array(z.string()).min(1),
  }),
  milestones: z.array(z.object({
    title: z.string().min(1).max(280),
    description: z.string().max(800),
    week: z.number().int().positive(),
  })).min(3).max(6),
  actions: z.array(z.object({
    title: z.string().min(1).max(320),
    description: z.string().max(800),
    category: z.enum(PRIORITY_BUCKETS),
    milestoneIndex: z.number().int().min(0),
    week: z.number().int().positive(),
    estimatedMinutes: z.number().int().min(10).max(480),
    coachLocked: z.boolean().default(false),
  })).min(4).max(12),
});

export type RoutePlan = z.infer<typeof routePlanSchema>;

export const coachBriefSchema = z.object({
  systemData: z.array(z.string()),
  clientReported: z.array(z.string()),
  coachNotes: z.array(z.string()),
  aiInterpretation: z.array(z.string()),
  suggestedDiscussion: z.string(),
});

export type CoachBrief = z.infer<typeof coachBriefSchema>;
