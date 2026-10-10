import { describe, expect, it } from "vitest";
import { isCancellationEligible, PLAN_CATALOG } from "./billing";

describe("VisionRoute Stripe catalog", () => {
  it("keeps the approved monthly coach price centralized", () => {
    expect(PLAN_CATALOG.visionroute_coach.unitAmount).toBe(9700);
    expect(PLAN_CATALOG.visionroute_coach.recurring.interval).toBe("month");
  });

  it("keeps annual billing at two months free", () => {
    expect(PLAN_CATALOG.visionroute_coach_annual.unitAmount).toBe(97000);
    expect(PLAN_CATALOG.visionroute_coach_annual.recurring.interval).toBe("year");
    expect(PLAN_CATALOG.visionroute_coach_annual.unitAmount).toBe(PLAN_CATALOG.visionroute_coach.unitAmount * 10);
  });

  it("requires a cancellation request at least five days before renewal", () => {
    const now = new Date("2026-10-10T00:00:00.000Z");
    expect(isCancellationEligible(new Date("2026-10-15T00:00:00.000Z"), now)).toBe(true);
    expect(isCancellationEligible(new Date("2026-10-14T23:59:59.999Z"), now)).toBe(false);
  });
});
