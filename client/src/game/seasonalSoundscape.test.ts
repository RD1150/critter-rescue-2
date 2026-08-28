import { describe, expect, it } from 'vitest';
import { CALM_RITUAL_SOUNDSCAPE_URL, getSoundscapeUrl, SEASONAL_SOUNDSCAPE_LABELS, SEASONAL_SOUNDSCAPE_URLS } from './seasonalSoundscape';

describe('seasonal soundscape library', () => {
  it('provides one optional uploaded soundtrack and a clear label for every sanctuary season', () => {
    expect(Object.keys(SEASONAL_SOUNDSCAPE_URLS).sort()).toEqual(['autumn', 'spring', 'summer', 'winter']);
    expect(Object.values(SEASONAL_SOUNDSCAPE_URLS).every((url) => url.startsWith('/manus-storage/critter-rescue-') && url.endsWith('.mp3'))).toBe(true);
    expect(SEASONAL_SOUNDSCAPE_LABELS).toMatchObject({ spring: 'Petal garden', summer: 'Firefly evening', autumn: 'Leaf dance', winter: 'Moon hush' });
  });

  it('offers the new calm ritual loop without replacing the parent-selected seasonal option', () => {
    expect(CALM_RITUAL_SOUNDSCAPE_URL).toBe('/manus-storage/critter-rescue-calm-ritual_084abd92.wav');
    expect(getSoundscapeUrl('ritual', 'winter')).toBe(CALM_RITUAL_SOUNDSCAPE_URL);
    expect(getSoundscapeUrl('seasonal', 'winter')).toBe(SEASONAL_SOUNDSCAPE_URLS.winter);
  });
});
