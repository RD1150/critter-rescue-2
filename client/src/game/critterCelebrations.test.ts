import { describe, expect, it } from 'vitest';
import { getCareCelebration, getCelebrationMotion } from './critterCelebrations';

describe('critter care celebrations', () => {
  it('gives each critter family a distinct celebration profile', () => {
    expect(getCareCelebration('Nutty', 'squirrel').icon).toBe('🌰');
    expect(getCareCelebration('Splash', 'otter').line).toContain('bubbly');
    expect(getCelebrationMotion('bunny').hop).toBeGreaterThan(getCelebrationMotion('bear').hop);
  });
});
