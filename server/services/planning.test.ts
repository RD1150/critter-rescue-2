import { describe, expect, it } from "vitest";
import { buildDeterministicRoute, buildRerouteOptions, calculateRealityCheck, selectNextAction } from "./planning";

describe("VisionRoute planning engine", () => {
  it("identifies an unrealistic date at the declared capacity", () => {
    const result = calculateRealityCheck({ goal: "Launch a full consulting offer with a sales page and outreach sequence", weeklyMinutes: 60, targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    expect(result.isRealistic).toBe(false);
    expect(result.options).toContain("Move the date");
  });

  it("creates structured Active, Maintain, Next and Park work", () => {
    const plan = buildDeterministicRoute({ goal: "Launch a consulting offer", weeklyMinutes: 180, targetDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000) });
    expect(plan.milestones).toHaveLength(3);
    expect(new Set(plan.actions.map((action: { category: string }) => action.category))).toEqual(new Set(["active", "maintain", "park"]));
    expect(plan.actions.some((action: { category: string }) => action.category === "active")).toBe(true);
  });

  it("protects one critical action in low capacity", () => {
    const action = selectNextAction([
      { status: "pending", category: "next", estimatedMinutes: 50, id: "later" },
      { status: "pending", category: "active", estimatedMinutes: 45, id: "now" },
    ], "low");
    expect(action?.id).toBe("now");
    expect(action?.adjustedMinutes).toBe(25);
  });

  it("always offers the four recovery paths", () => {
    const options = buildRerouteOptions("I underestimated the work", new Date());
    expect(options.map(option => option.strategy)).toEqual(["keep_destination", "move_destination", "reduce_scope", "change_route"]);
    expect(options.every(option => option.requiresApproval)).toBe(true);
  });
});
