import { describe, expect, it } from 'vitest';
import { getCareCelebration, getCelebrationMotion } from './critterCelebrations';

describe('critter care celebrations', () => {
  it('gives each critter family three distinct care celebration variations', () => {
    expect(getCareCelebration('Nutty', 'squirrel').icon).toBe('🌰');
    expect(getCareCelebration('Splash', 'otter', 2).line).toContain('bubbly');
    expect(getCelebrationMotion('bunny').hop).toBeGreaterThan(getCelebrationMotion('bear').hop);
    const representatives = [['Nutty', 'squirrel'], ['Pip', 'bird'], ['Splash', 'otter'], ['Thistle', 'goat']] as const;
    representatives.forEach(([name, type]) => {
      const family = [1, 2, 3].map((careMoment) => getCareCelebration(name, type, careMoment));
      expect(new Set(family.map(({ variationName }) => variationName)).size).toBe(3);
      expect(new Set(family.map(({ motion }) => motion)).size).toBe(3);
    });
    expect(getCelebrationMotion('squirrel', 1).twist).toBeGreaterThan(getCelebrationMotion('squirrel', 0).twist);
  });
});
