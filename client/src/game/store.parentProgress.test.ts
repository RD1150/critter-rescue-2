import { describe, expect, it } from 'vitest';
import { buildParentProgressSummary, careForHome, completeCarePlay, completeRescue, createFreshState, recordLearningRound } from './store';

describe('parent progress summary', () => {
  it('records calm learning, rescue, and care activity in the local parent summary', () => {
    const fresh = createFreshState();
    const rescued = completeRescue(fresh, 'meadow', 0, 1).newState;
    const learned = recordLearningRound(rescued, 'color');
    const cared = careForHome(learned, 'Nutty').newState;
    const played = completeCarePlay(cared, 'Nutty', 'squirrel', 'acorn-tidy').newState;
    const summary = buildParentProgressSummary(played);

    expect(summary.today.rescueCount).toBe(1);
    expect(summary.today.learningRounds).toBe(1);
    expect(summary.today.homeCareMoments).toBe(1);
    expect(summary.today.carePlayMoments).toBe(1);
    expect(played.learningMilestones.color).toBe(1);
    expect(summary.activeDaysInWeek).toBe(1);
  });
});
