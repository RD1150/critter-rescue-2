import { describe, expect, it } from 'vitest';
import { SEASONAL_SOUNDSCAPE_LABELS, SEASONAL_SOUNDSCAPE_URLS } from './seasonalSoundscape';

describe('seasonal soundscape library', () => {
  it('provides one optional uploaded soundtrack and a clear label for every sanctuary season', () => {
    expect(Object.keys(SEASONAL_SOUNDSCAPE_URLS).sort()).toEqual(['autumn', 'spring', 'summer', 'winter']);
    expect(Object.values(SEASONAL_SOUNDSCAPE_URLS).every((url) => url.startsWith('/manus-storage/critter-rescue-') && url.endsWith('.mp3'))).toBe(true);
    expect(SEASONAL_SOUNDSCAPE_LABELS).toMatchObject({ spring: 'Petal garden', summer: 'Firefly evening', autumn: 'Leaf dance', winter: 'Moon hush' });
  });
});
