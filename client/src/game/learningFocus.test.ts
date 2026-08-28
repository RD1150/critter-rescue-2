import { describe, expect, it } from 'vitest';
import { getLearningFocusLaunch } from './learningFocus';

describe('parent learning focus launch', () => {
  it('prioritizes one matching optional activity for every selected focus and leaves all-mode unrestricted', () => {
    expect(getLearningFocusLaunch('all')).toBeNull();
    expect(getLearningFocusLaunch('phonics')).toMatchObject({ kind: 'rescue', zone: 'meadow', taskIndex: 8 });
    expect(getLearningFocusLaunch('numbers')).toMatchObject({ kind: 'rescue', zone: 'meadow', taskIndex: 5 });
    expect(getLearningFocusLaunch('rhymes')).toMatchObject({ kind: 'rescue', zone: 'riverside', taskIndex: 6 });
    expect(getLearningFocusLaunch('nature')).toMatchObject({ kind: 'nature' });
  });
});
