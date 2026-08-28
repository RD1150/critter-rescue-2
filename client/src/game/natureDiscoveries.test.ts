import { describe, expect, it } from 'vitest';
import { getNatureDiscoveryForSeason, NATURE_DISCOVERIES } from './natureDiscoveries';

describe('nature discoveries', () => {
  it('offers one calm field-note discovery for every sanctuary season', () => {
    (['spring', 'summer', 'autumn', 'winter'] as const).forEach((season) => {
      const discovery = getNatureDiscoveryForSeason(season);
      expect(discovery.season).toBe(season);
      expect(NATURE_DISCOVERIES[discovery.key].gentleQuestion.length).toBeGreaterThan(10);
    });
  });
});
