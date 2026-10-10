import { describe, expect, it } from "vitest";
import { canAccessClientRecord } from "./authz";

describe("tenant and client access policy", () => {
  const clientA = { clientUserId: 101, assignedCoachUserId: 201 };

  it("allows an owner in the tenant to access any client in that tenant", () => {
    expect(canAccessClientRecord({ role: "owner", actorUserId: 301, ...clientA })).toBe(true);
  });

  it("prevents a client from accessing another client by direct identifier", () => {
    expect(canAccessClientRecord({ role: "client", actorUserId: 102, ...clientA })).toBe(false);
    expect(canAccessClientRecord({ role: "client", actorUserId: 101, ...clientA })).toBe(true);
  });

  it("prevents an additional coach from accessing an unassigned client", () => {
    expect(canAccessClientRecord({ role: "coach", actorUserId: 202, ...clientA })).toBe(false);
    expect(canAccessClientRecord({ role: "coach", actorUserId: 201, ...clientA })).toBe(true);
  });
});
