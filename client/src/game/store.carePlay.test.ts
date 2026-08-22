import { describe, expect, it } from 'vitest';
import { buildParentProgressSummary, completeCarePlay, createFreshState } from './store';

describe('care-play keepsakes', () => {
  it('records a local illustrated keepsake and a calm parent-progress contribution without personal media', () => {
    const result = completeCarePlay(createFreshState(), 'Nutty', 'squirrel', 'acorn-tidy');
    const summary = buildParentProgressSummary(result.newState);

    expect(result.newState.carePlayWins.Nutty).toBe(1);
    expect(summary.today.carePlayMoments).toBe(1);
    expect(result.newState.keepsakes).toHaveLength(1);
    expect(result.keepsake).toMatchObject({ source: 'care-play', critterName: 'Nutty', critterType: 'squirrel' });
    expect(Object.keys(result.keepsake).sort()).toEqual(['createdAt', 'critterName', 'critterType', 'id', 'message', 'source', 'title']);
  });
});
