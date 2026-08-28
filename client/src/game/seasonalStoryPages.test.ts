import { describe, expect, it } from 'vitest';
import { SEASONAL_STORY_PAGES, getSeasonalStoryPage } from './seasonalStoryPages';

describe('seasonal Storybook pages', () => {
  it('provides a revisitable three-moment page for every sanctuary season', () => {
    expect(Object.keys(SEASONAL_STORY_PAGES)).toHaveLength(4);
    for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
      const page = getSeasonalStoryPage(season);
      expect(page.moments).toHaveLength(3);
      expect(page.closing).toContain('whenever');
      expect(page.opening.toLowerCase()).not.toContain('timer');
    }
  });
});
