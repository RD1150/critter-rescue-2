import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFERENCES, getAudioPreferences, saveAudioPreferences } from './audioPreferences';

describe('audio preferences', () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    const listeners = new Map<string, Array<() => void>>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
      dispatchEvent: (event: Event) => { listeners.get(event.type)?.forEach((listener) => listener()); return true; },
      addEventListener: (type: string, listener: () => void) => listeners.set(type, [...(listeners.get(type) ?? []), listener]),
      removeEventListener: () => undefined,
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('uses accessible defaults when nothing is stored', () => {
    expect(getAudioPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('persists spoken-direction, seasonal soundscape, theme, and bedtime-reminder preferences with the other audio settings', () => {
    const next = { voiceVolume: 0.4, captionsEnabled: false, spokenDirectionsEnabled: false, soundscapeEnabled: true, soundscapeVolume: 0.18, campTheme: 'winter' as const, bedtimeReminderEnabled: true, largeIconMode: true, reduceMotion: true };
    saveAudioPreferences(next);
    expect(getAudioPreferences()).toEqual(next);
  });
});
