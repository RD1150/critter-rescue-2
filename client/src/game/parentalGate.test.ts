// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PARENT_GATE_DURATION_MS, PARENT_GATE_SESSION_KEY, createParentMathChallenge, getParentGateExpiry, grantParentGateAccess, hasParentGateAccess, isCorrectParentMathAnswer, revokeParentGateAccess } from './parentalGate';

describe('parental math gate', () => {
  afterEach(() => window.sessionStorage.clear());

  it('uses an adult-oriented addition question and accepts only its numeric answer', () => {
    const challenge = createParentMathChallenge(() => 0);
    expect(challenge).toEqual({ first: 12, second: 5, answer: 17 });
    expect(isCorrectParentMathAnswer('17', challenge)).toBe(true);
    expect(isCorrectParentMathAnswer('16', challenge)).toBe(false);
    expect(isCorrectParentMathAnswer('seventeen', challenge)).toBe(false);
  });

  it('grants time-limited session access and supports an explicit lock', () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    expect(hasParentGateAccess(now)).toBe(false);
    expect(grantParentGateAccess(now)).toBe(now + PARENT_GATE_DURATION_MS);
    expect(getParentGateExpiry()).toBeTruthy();
    expect(hasParentGateAccess(now + 1)).toBe(true);
    revokeParentGateAccess();
    expect(window.sessionStorage.getItem(PARENT_GATE_SESSION_KEY)).toBeNull();
    vi.restoreAllMocks();
  });
});
