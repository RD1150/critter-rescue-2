import { describe, expect, it } from 'vitest';
import { buildDailyTrail, completeDailyTrailRescue, createFreshState, ensureDailyTrail } from './store';

describe('daily three-rescue trail', () => {
  it('creates three stable missions for one day', () => {
    const state = createFreshState();
    const first = buildDailyTrail(state, '2026-08-20');
    const second = buildDailyTrail(state, '2026-08-20');
    expect(first.missions).toHaveLength(3);
    expect(first.missions).toEqual(second.missions);
    expect(new Set(first.missions.map((mission) => mission.key)).size).toBe(3);
  });

  it('awards the trail treasure only after all three daily rescues', () => {
    let state = ensureDailyTrail(createFreshState(), '2026-08-20');
    for (const mission of state.dailyTrail.missions) state = completeDailyTrailRescue(state, mission.key).newState;
    expect(state.dailyTrail.rewardEarned).toBe(true);
    expect(state.dailyTrail.completedKeys).toHaveLength(3);
    expect(state.lastDailyReward).toContain('Trail Treasure');
  });
});
