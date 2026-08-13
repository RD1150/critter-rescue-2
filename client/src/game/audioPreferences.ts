import { useEffect, useState } from 'react';

export type AudioPreferences = { voiceVolume: number; captionsEnabled: boolean; largeIconMode: boolean };

const STORAGE_KEY = 'critter-rescue-audio-preferences';
const EVENT_NAME = 'critter-rescue-audio-preferences-changed';
export const DEFAULT_PREFERENCES: AudioPreferences = { voiceVolume: 0.92, captionsEnabled: true, largeIconMode: false };

export function getAudioPreferences(): AudioPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      voiceVolume: typeof stored.voiceVolume === 'number' ? Math.max(0, Math.min(1, stored.voiceVolume)) : DEFAULT_PREFERENCES.voiceVolume,
      captionsEnabled: typeof stored.captionsEnabled === 'boolean' ? stored.captionsEnabled : DEFAULT_PREFERENCES.captionsEnabled,
      largeIconMode: typeof stored.largeIconMode === 'boolean' ? stored.largeIconMode : DEFAULT_PREFERENCES.largeIconMode,
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
