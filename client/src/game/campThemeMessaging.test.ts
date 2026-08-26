import { describe, expect, it } from 'vitest';
import { getCampThemeFieldNote } from './campThemeMessaging';
import { resolveCampTheme } from './campThemes';

describe('seasonal camp messaging', () => {
  it.each([
    ['spring', 'Spring bloom'],
    ['summer', 'Sunny camp'],
    ['autumn', 'Autumn leaves'],
    ['winter', 'Winter moon'],
  ] as const)('maps %s to its distinct child-facing field note', (season, label) => {
    const note = getCampThemeFieldNote(season);
    expect(note.label).toBe(label);
    expect(note.campLine.length).toBeGreaterThan(12);
    expect(note.note.length).toBeGreaterThan(12);
  });

  it('uses the matching current-season note in automatic mode', () => {
    const autoSeason = resolveCampTheme('auto', new Date('2026-10-15T12:00:00'));
    expect(getCampThemeFieldNote(autoSeason).label).toBe('Autumn leaves');
  });
});
