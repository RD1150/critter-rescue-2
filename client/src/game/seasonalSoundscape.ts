import { useEffect } from 'react';
import type { AudioPreferences } from './audioPreferences';
import type { SanctuarySeason } from './store';

export const SEASONAL_SOUNDSCAPE_URLS: Record<SanctuarySeason, string> = {
  spring: '/manus-storage/critter-rescue-spring_2fd83181.mp3',
  summer: '/manus-storage/critter-rescue-summer_88418f82.mp3',
  autumn: '/manus-storage/critter-rescue-autumn_562a17dc.mp3',
  winter: '/manus-storage/critter-rescue-winter_ba69ea53.mp3',
};

let activeSoundscape: HTMLAudioElement | null = null;

function stopActiveSoundscape() {
  activeSoundscape?.pause();
  activeSoundscape = null;
}

export function syncSeasonalSoundscape(preferences: Pick<AudioPreferences, 'soundscapeEnabled' | 'soundscapeVolume'>, season: SanctuarySeason): void {
  if (typeof Audio === 'undefined') return;
  if (!preferences.soundscapeEnabled) { stopActiveSoundscape(); return; }
  const url = SEASONAL_SOUNDSCAPE_URLS[season];
  if (!activeSoundscape || activeSoundscape.src !== new URL(url, window.location.href).href) {
    stopActiveSoundscape();
    activeSoundscape = new Audio(url);
    activeSoundscape.loop = true;
  }
  activeSoundscape.volume = Math.min(0.45, Math.max(0, preferences.soundscapeVolume));
  void activeSoundscape.play().catch(() => {});
}

export function useSeasonalSoundscape(preferences: AudioPreferences, season: SanctuarySeason): void {
  useEffect(() => {
    syncSeasonalSoundscape(preferences, season);
    return () => { if (!preferences.soundscapeEnabled) stopActiveSoundscape(); };
  }, [preferences.soundscapeEnabled, preferences.soundscapeVolume, season]);
}

export const SEASONAL_SOUNDSCAPE_LABELS: Record<SanctuarySeason, string> = { spring: 'Petal garden', summer: 'Firefly evening', autumn: 'Leaf dance', winter: 'Moon hush' };
