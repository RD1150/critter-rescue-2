export const PARENT_GATE_SESSION_KEY = 'critter-rescue-parent-gate-expires-at';
export const PARENT_GATE_DURATION_MS = 15 * 60 * 1000;

export type ParentMathChallenge = {
  first: number;
  second: number;
  answer: number;
};

export function createParentMathChallenge(random = Math.random): ParentMathChallenge {
  const first = 12 + Math.floor(random() * 8);
  const second = 5 + Math.floor(random() * 5);
  return { first, second, answer: first + second };
}

export function isCorrectParentMathAnswer(value: string, challenge: ParentMathChallenge): boolean {
  return /^\d{1,3}$/.test(value.trim()) && Number(value.trim()) === challenge.answer;
}

export function getParentGateExpiry(): number | null {
  if (typeof window === 'undefined') return null;
  const value = Number(window.sessionStorage.getItem(PARENT_GATE_SESSION_KEY));
  return Number.isFinite(value) && value > Date.now() ? value : null;
}

export function hasParentGateAccess(now = Date.now()): boolean {
  const expiry = getParentGateExpiry();
  return Boolean(expiry && expiry > now);
}

export function grantParentGateAccess(now = Date.now()): number {
  const expiry = now + PARENT_GATE_DURATION_MS;
  if (typeof window !== 'undefined') window.sessionStorage.setItem(PARENT_GATE_SESSION_KEY, String(expiry));
  return expiry;
}

export function revokeParentGateAccess(): void {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(PARENT_GATE_SESSION_KEY);
}
