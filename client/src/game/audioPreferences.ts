import { useEffect, useState } from 'react';
import type { SanctuarySeason } from './store';

export type CampThemePreference = 'auto' | SanctuarySeason;
export type AudioPreferences = { voiceVolume: number; captionsEnabled: boolean; spokenDirectionsEnabled: boolean; soundscapeEnabled: boolean; soundscapeVolume: number; campTheme: CampThemePreference; largeIconMode: boolean; reduceMotion: boolean };

const STORAGE_KEY = 'critter-rescue-audio-preferences';
const EVENT_NAME = 'critter-rescue-audio-preferences-changed';
export const DEFAULT_PREFERENCES: AudioPreferences = { voiceVolume: 0.92, captionsEnabled: true, spokenDirectionsEnabled: true, soundscapeEnabled: false, soundscapeVolume: 0.22, campTheme: 'auto', largeIconMode: false, reduceMotion: false };

export function getAudioPreferences(): AudioPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      voiceVolume: typeof stored.voiceVolume === 'number' ? Math.max(0, Math.min(1, stored.voiceVolume)) : DEFAULT_PREFERENCES.voiceVolume,
      captionsEnabled: typeof stored.captionsEnabled === 'boolean' ? stored.captionsEnabled : DEFAULT_PREFERENCES.captionsEnabled,
      spokenDirectionsEnabled: typeof stored.spokenDirectionsEnabled === 'boolean' ? stored.spokenDirectionsEnabled : DEFAULT_PREFERENCES.spokenDirectionsEnabled,
      soundscapeEnabled: typeof stored.soundscapeEnabled === 'boolean' ? stored.soundscapeEnabled : DEFAULT_PREFERENCES.soundscapeEnabled,
      soundscapeVolume: typeof stored.soundscapeVolume === 'number' ? Math.max(0, Math.min(0.45, stored.soundscapeVolume)) : DEFAULT_PREFERENCES.soundscapeVolume,
      campTheme: ['auto', 'spring', 'summer', 'autumn', 'winter'].includes(stored.campTheme) ? stored.campTheme as CampThemePreference : DEFAULT_PREFERENCES.campTheme,
      largeIconMode: typeof stored.largeIconMode === 'boolean' ? stored.largeIconMode : DEFAULT_PREFERENCES.largeIconMode,
      reduceMotion: typeof stored.reduceMotion === 'boolean' ? stored.reduceMotion : DEFAULT_PREFERENCES.reduceMotion,
    };
  } catch { return DEFAULT_PREFERENCES; }
}

export function saveAudioPreferences(next: AudioPreferences): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useAudioPreferences(): [AudioPreferences, (next: AudioPreferences) => void] {
  const [preferences, setPreferences] = useState(getAudioPreferences);
  useEffect(() => {
    const sync = () => setPreferences(getAudioPreferences());
    window.addEventListener(EVENT_NAME, sync);
    return () => window.removeEventListener(EVENT_NAME, sync);
  }, []);
  const update = (next: AudioPreferences) => { saveAudioPreferences(next); setPreferences(next); };
  return [preferences, update];
}
