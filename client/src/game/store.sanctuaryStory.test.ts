import { describe, expect, it } from 'vitest';
import { chooseHomeDecoration, createFreshState, getSanctuarySeason, rememberSeasonalMoment } from './store';

describe('sanctuary story state', () => {
  it('persists a home decoration per rescued friend', () => {
    const fresh = createFreshState();
    const decorated = chooseHomeDecoration(fresh, 'Nutty', 'acorn-lantern');
    const changed = chooseHomeDecoration(decorated, 'Nutty', 'cloud-pillow');

    expect(changed.homeDecor.Nutty).toBe('cloud-pillow');
  });

  it('stores each seasonal keepsake once and chooses seasons by local month', () => {
    const fresh = createFreshState();
    const first = rememberSeasonalMoment(fresh, 'summer');
    const repeat = rememberSeasonalMoment(first, 'summer');

    expect(repeat.seasonalKeepsakes).toEqual(['summer']);
    expect(getSanctuarySeason(new Date(2026, 3, 12))).toBe('spring');
    expect(getSanctuarySeason(new Date(2026, 11, 12))).toBe('winter');
  });
});
