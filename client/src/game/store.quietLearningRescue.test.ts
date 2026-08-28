import { describe, expect, it } from 'vitest';
import { completeRescue, createFreshState } from './store';

describe('quiet learning rescue persistence', () => {
  it('records quiet counting as both a rescue and a gentle learning discovery', () => {
    const result = completeRescue(createFreshState(), 'meadow', 0, 1, 'quietCount');
    expect(result.newState.quietLearningRescues.quietCount).toBe(1);
    expect(result.newState.rescueCompletedCount).toBe(1);
    expect(result.newState.activityLog[Object.keys(result.newState.activityLog)[0]].learningRounds).toBe(1);
  });
});
