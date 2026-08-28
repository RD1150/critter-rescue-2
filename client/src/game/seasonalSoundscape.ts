import { useEffect } from 'react';
import type { AudioPreferences, SoundscapeStyle } from './audioPreferences';
import type { SanctuarySeason } from './store';

export const SEASONAL_SOUNDSCAPE_URLS: Record<SanctuarySeason, string> = {
  spring: '/manus-storage/critter-rescue-spring_2fd83181.mp3',
  summer: '/manus-storage/critter-rescue-summer_88418f82.mp3',
  autumn: '/manus-storage/critter-rescue-autumn_562a17dc.mp3',
  winter: '/manus-storage/critter-rescue-winter_ba69ea53.mp3',
};

export const CALM_RITUAL_SOUNDSCAPE_URL = '/manus-storage/critter-rescue-calm-ritual_084abd92.wav';

let activeSoundscape: HTMLAudioElement | null = null;
let parentStartedSoundscape = false;

function stopActiveSoundscape() {
  activeSoundscape?.pause();
  activeSoundscape = null;
}

export function getSoundscapeUrl(style: SoundscapeStyle, season: SanctuarySeason): string {
  return style === 'ritual' ? CALM_RITUAL_SOUNDSCAPE_URL : SEASONAL_SOUNDSCAPE_URLS[season];
}

export function syncSeasonalSoundscape(preferences: Pick<AudioPreferences, 'soundscapeEnabled' | 'soundscapeVolume' | 'soundscapeStyle'>, season: SanctuarySeason): void {
  if (typeof Audio === 'undefined') return;
  if (!preferences.soundscapeEnabled) { parentStartedSoundscape = false; stopActiveSoundscape(); return; }
  const url = getSoundscapeUrl(preferences.soundscapeStyle, season);
  if (!activeSoundscape || activeSoundscape.src !== new URL(url, window.location.href).href) {
    stopActiveSoundscape();
    activeSoundscape = new Audio(url);
    activeSoundscape.loop = true;
  }
  activeSoundscape.volume = Math.min(0.45, Math.max(0, preferences.soundscapeVolume));
  if (parentStartedSoundscape) void activeSoundscape.play().catch(() => {});
}

export function startParentSelectedSoundscape(preferences: Pick<AudioPreferences, 'soundscapeEnabled' | 'soundscapeVolume' | 'soundscapeStyle'>, season: SanctuarySeason): void {
  if (!preferences.soundscapeEnabled) { syncSeasonalSoundscape(preferences, season); return; }
  parentStartedSoundscape = true;
  syncSeasonalSoundscape(preferences, season);
}

export function useSeasonalSoundscape(preferences: AudioPreferences, season: SanctuarySeason): void {
  useEffect(() => {
    syncSeasonalSoundscape(preferences, season);
    return () => { if (!preferences.soundscapeEnabled) stopActiveSoundscape(); };
  }, [preferences.soundscapeEnabled, preferences.soundscapeVolume, preferences.soundscapeStyle, season]);
}

export const SEASONAL_SOUNDSCAPE_LABELS: Record<SanctuarySeason, string> = { spring: 'Petal garden', summer: 'Firefly evening', autumn: 'Leaf dance', winter: 'Moon hush' };
