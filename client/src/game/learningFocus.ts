import type { LearningTheme } from './learningThemes';

export type LearningFocusLaunch = { kind: 'rescue'; zone: string; taskIndex: number; label: string } | { kind: 'nature'; label: string } | null;

export function getLearningFocusLaunch(theme: LearningTheme): LearningFocusLaunch {
  if (theme === 'phonics') return { kind: 'rescue', zone: 'meadow', taskIndex: 8, label: 'Listen for the /b/ sound' };
  if (theme === 'numbers') return { kind: 'rescue', zone: 'meadow', taskIndex: 5, label: 'Count three cozy berries' };
  if (theme === 'rhymes') return { kind: 'rescue', zone: 'riverside', taskIndex: 6, label: 'Find a rhyme for bee' };
  if (theme === 'nature') return { kind: 'nature', label: 'Notice today’s sanctuary clue' };
  return null;
}
