import { describe, expect, it } from "vitest";
import { PLAN_CATALOG } from "./billing";

describe("VisionRoute Stripe catalog", () => {
  it("keeps the approved Phase 1 Coach price centralized", () => {
    expect(PLAN_CATALOG.visionroute_coach.unitAmount).toBe(9700);
    expect(PLAN_CATALOG.visionroute_coach.recurring?.interval).toBe("month");
  });

  it("keeps the founding setup fee separate from recurring billing", () => {
    expect(PLAN_CATALOG.founding_white_label.unitAmount).toBe(49900);
    expect(PLAN_CATALOG.founding_white_label.recurring).toBeUndefined();
  });
});
