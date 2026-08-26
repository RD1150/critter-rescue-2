import type { SanctuarySeason } from './store';

export type CampThemeFieldNote = { icon: string; label: string; campLine: string; note: string };

export const THEME_FIELD_NOTES: Record<SanctuarySeason, CampThemeFieldNote> = {
  spring: { icon: '🌷', label: 'Spring bloom', campLine: 'Soft petals are waking around the cozy homes.', note: 'Look for tiny new blooms beside each friend’s home.' },
  summer: { icon: '☀️', label: 'Sunny camp', campLine: 'Warm lantern light makes the sanctuary glow.', note: 'A sunny day is perfect for a small kind camp moment.' },
  autumn: { icon: '🍂', label: 'Autumn leaves', campLine: 'Amber leaves are tucking the homes in cozy colors.', note: 'The rustling leaves make every nook feel extra snug.' },
  winter: { icon: '❄️', label: 'Winter moon', campLine: 'Moonlit blue sparkle keeps the sanctuary calm and bright.', note: 'The quiet winter moon watches over every plushie friend.' },
};

export function getCampThemeFieldNote(season: SanctuarySeason): CampThemeFieldNote {
  return THEME_FIELD_NOTES[season];
}
