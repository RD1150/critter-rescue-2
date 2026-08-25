import { describe, expect, it } from 'vitest';
import { getKindnessMoments, getNextSanctuaryGrowth, getSanctuaryGrowth } from './sanctuaryGrowth';

describe('Sanctuary Growth through Kindness', () => {
  it('unlocks visible camp improvements from gentle care without a score target', () => {
    expect(getSanctuaryGrowth(0).title).toBe('Kindness Seeds');
    expect(getSanctuaryGrowth(3).propKey).toBe('kindness-arbor');
    expect(getSanctuaryGrowth(8).propKey).toBe('ripple-bowl');
    expect(getSanctuaryGrowth(15).propKey).toBe('bloom-garden');
    expect(getNextSanctuaryGrowth(8)?.unlockAt).toBe(15);
  });

  it('counts home care, nursery care, and care play as equal kinds of kindness', () => {
    expect(getKindnessMoments({ Nutty: 2, Pip: 1 }, 3, { Nutty: 1, Pip: 2 })).toBe(9);
  });
});
