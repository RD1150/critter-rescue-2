import type { RoutePlan } from "@shared/visionroute";

export type PlanningContext = {
  goal: string;
  targetDate?: Date | null;
  weeklyMinutes: number;
  constraints?: string | null;
  completed?: string | null;
  isSports?: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function calculateRealityCheck(context: PlanningContext) {
  const estimatedMinutes = Math.max(360, context.goal.length * 4 + 420);
  const estimateWeeks = Math.max(3, Math.ceil(estimatedMinutes / Math.max(context.weeklyMinutes, 30)));
  const targetWeeks = context.targetDate
    ? Math.max(1, Math.ceil((context.targetDate.getTime() - Date.now()) / (7 * DAY_MS)))
    : null;
  const isRealistic = targetWeeks === null || estimateWeeks <= targetWeeks;

  return {
    isRealistic,
    estimateWeeks,
    targetWeeks,
    message: isRealistic
      ? `At your current available capacity, this route is paced for approximately ${estimateWeeks} weeks.`
      : `At your current available capacity, this route is estimated to require approximately ${estimateWeeks} weeks. Your target date is ${targetWeeks} weeks away.`,
    options: isRealistic
      ? ["Protect the current pace", "Reserve capacity for the highest-leverage actions"]
      : ["Increase available effort", "Move the date", "Reduce scope", "Prioritize the most important outcome"],
  };
}

export function buildDeterministicRoute(context: PlanningContext): RoutePlan {
  const realityCheck = calculateRealityCheck(context);
  const totalWeeks = realityCheck.targetWeeks && realityCheck.isRealistic
    ? realityCheck.targetWeeks
    : realityCheck.estimateWeeks;
  const targetDate = context.targetDate ?? addDays(new Date(), totalWeeks * 7);
  const focusLabel = context.isSports ? "training commitment" : "execution commitment";

  const milestones = [
    {
      title: `Clarify the highest-leverage outcome`,
      description: `Define what “done” looks like for ${context.goal} and protect the constraints that matter.`,
      week: 1,
    },
    {
      title: `Build the core ${context.isSports ? "training" : "execution"} system`,
      description: `Create the repeatable structure, sequence, and support needed to make progress visible.`,
      week: Math.max(2, Math.ceil(totalWeeks * 0.45)),
    },
    {
      title: `Prove progress and close the gap`,
      description: `Use feedback, check-ins, and a final focused push to arrive at the destination.`,
      week: totalWeeks,
    },
  ];

  const actions: RoutePlan["actions"] = [
    {
      title: `Define the next measurable version of the goal`,
      description: `Spend 25 minutes turning the desired outcome into a clear definition of done and one immediate ${focusLabel}.`,
      category: "active",
      milestoneIndex: 0,
      week: 1,
      estimatedMinutes: 25,
      coachLocked: false,
    },
    {
      title: `Block a realistic weekly execution window`,
      description: `Choose a recurring time that fits your known constraints rather than relying on spare time.`,
      category: "active",
      milestoneIndex: 0,
      week: 1,
      estimatedMinutes: 20,
      coachLocked: false,
    },
    {
      title: `Complete the first focused work block`,
      description: `Take the smallest meaningful action that moves the core outcome forward.`,
      category: "active",
      milestoneIndex: 1,
      week: Math.max(1, Math.ceil(totalWeeks * 0.25)),
      estimatedMinutes: Math.min(60, Math.max(25, Math.round(context.weeklyMinutes / 3))),
      coachLocked: false,
    },
    {
      title: `Maintain the baseline commitment`,
      description: `Keep the minimum recurring activity that protects momentum while the active priority is underway.`,
      category: "maintain",
      milestoneIndex: 1,
      week: Math.max(2, Math.ceil(totalWeeks * 0.5)),
      estimatedMinutes: 20,
      coachLocked: false,
    },
    {
      title: `Review evidence and adjust the next sequence`,
      description: `Use your check-in to identify what worked, what changed, and the next action worth protecting.`,
      category: "active",
      milestoneIndex: 2,
      week: Math.max(2, totalWeeks - 1),
      estimatedMinutes: 25,
      coachLocked: false,
    },
    {
      title: `Park nonessential work until the active route is stable`,
      description: `Keep this intentionally postponed so it does not compete with the primary destination.`,
      category: "park",
      milestoneIndex: 2,
      week: totalWeeks,
      estimatedMinutes: 15,
      coachLocked: false,
    },
  ];

  // Ensure the calendar direction is derived from the requested target date.
  for (const action of actions) {
    action.week = Math.min(Math.max(action.week, 1), totalWeeks);
  }
  void targetDate;

  return { estimatedWeeks: realityCheck.estimateWeeks, realityCheck, milestones, actions };
}

export function selectNextAction<T extends { status: string; category: string; estimatedMinutes: number }>(
  actions: T[],
  capacity: "low" | "normal" | "high"
) {
  const ordered = actions.filter(action => action.status === "pending")
    .sort((a, b) => {
      const bucket = { active: 0, maintain: 1, next: 2, park: 3 } as Record<string, number>;
      return (bucket[a.category] ?? 9) - (bucket[b.category] ?? 9);
    });
  const candidate = ordered.find(action => capacity !== "low" || action.category === "active") ?? ordered[0];
  if (!candidate) return null;
  return {
    ...candidate,
    adjustedMinutes: capacity === "low" ? Math.min(candidate.estimatedMinutes, 25) : candidate.estimatedMinutes,
    guidance: capacity === "low"
      ? "Low capacity selected — protect this one critical step, then stop."
      : "Complete this one action before opening the next item.",
  };
}

export function buildRerouteOptions(whatHappened: string, targetDate?: Date | null) {
  const currentDate = targetDate ? targetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "the current destination date";
  return [
    {
      strategy: "keep_destination" as const,
      title: "Keep the destination",
      summary: `Keep ${currentDate}, protect the critical sequence, and exchange lower-value work for focused effort.`,
      impact: { dateChangeDays: 0, workload: "higher focus", basis: whatHappened },
      recommended: true,
      requiresApproval: true,
    },
    {
      strategy: "move_destination" as const,
      title: "Move the destination",
      summary: "Extend the date so the same scope can be completed at a realistic pace.",
      impact: { dateChangeDays: 14, workload: "steady", basis: whatHappened },
      recommended: false,
      requiresApproval: true,
    },
    {
      strategy: "reduce_scope" as const,
      title: "Reduce the scope",
      summary: "Keep the date, but define the smallest outcome that still makes the route worthwhile.",
      impact: { dateChangeDays: 0, workload: "reduced scope", basis: whatHappened },
      recommended: false,
      requiresApproval: true,
    },
    {
      strategy: "change_route" as const,
      title: "Change the route",
      summary: "Reorder work or substitute a lower-friction action while keeping the primary outcome visible.",
      impact: { dateChangeDays: 0, workload: "re-sequenced", basis: whatHappened },
      recommended: false,
      requiresApproval: true,
    },
  ];
}
