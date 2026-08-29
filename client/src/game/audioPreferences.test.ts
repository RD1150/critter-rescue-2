import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFERENCES, getAudioPreferences, saveAudioPreferences } from './audioPreferences';
import { getLearningFocusLaunch } from './learningFocus';

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

  it('persists spoken-direction, soundscape style, Holiday Edition, camp and learning themes, bedtime-reminder, and gentle playtime preferences with the other audio settings', () => {
    const next = { voiceVolume: 0.4, captionsEnabled: false, spokenDirectionsEnabled: false, directionVolumeCheckComplete: true, soundscapeEnabled: true, soundscapeVolume: 0.18, soundscapeStyle: 'ritual' as const, celebrationPath: 'lightsKindness' as const, holidayEditionEnabled: true, campTheme: 'winter' as const, learningTheme: 'phonics' as const, bedtimeReminderEnabled: true, playtimeDurationMinutes: 20 as const, largeIconMode: true, reduceMotion: true };
    saveAudioPreferences(next);
    expect(getAudioPreferences()).toEqual(next);
  });

  it('drives the matching camp focus activity from the saved family learning theme', () => {
    (['phonics', 'numbers', 'rhymes', 'nature'] as const).forEach((learningTheme) => {
      saveAudioPreferences({ ...DEFAULT_PREFERENCES, learningTheme });
      expect(getLearningFocusLaunch(getAudioPreferences().learningTheme)).not.toBeNull();
    });
    saveAudioPreferences({ ...DEFAULT_PREFERENCES, learningTheme: 'all' });
    expect(getLearningFocusLaunch(getAudioPreferences().learningTheme)).toBeNull();
  });
});
