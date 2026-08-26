import type { CampThemePreference } from './audioPreferences';
import { getSanctuarySeason, type SanctuarySeason } from './store';

export const CAMP_THEME_DETAILS: Record<CampThemePreference, { label: string; icon: string; description: string }> = {
  auto: { label: 'Follow the season', icon: '🧭', description: 'Lets the sanctuary gently follow the time of year.' },
  spring: { label: 'Spring bloom', icon: '🌷', description: 'Soft petals and fresh green camp accents.' },
  summer: { label: 'Sunny camp', icon: '☀️', description: 'Warm lanterns and golden summer details.' },
  autumn: { label: 'Autumn leaves', icon: '🍂', description: 'Amber leaves and cozy harvest warmth.' },
  winter: { label: 'Winter moon', icon: '❄️', description: 'Moonlit blue details and quiet snowy sparkle.' },
};

export function resolveCampTheme(preference: CampThemePreference, date = new Date()): SanctuarySeason {
  return preference === 'auto' ? getSanctuarySeason(date) : preference;
}
