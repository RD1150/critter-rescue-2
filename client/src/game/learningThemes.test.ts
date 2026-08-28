import { describe, expect, it } from 'vitest';
import { LEARNING_THEME_DETAILS } from './learningThemes';

describe('learning themes', () => {
  it('keeps every parent-selectable learning focus labelled and child-friendly', () => {
    expect(Object.keys(LEARNING_THEME_DETAILS)).toEqual(['all', 'phonics', 'numbers', 'rhymes', 'nature']);
    Object.values(LEARNING_THEME_DETAILS).forEach((theme) => {
      expect(theme.label.length).toBeGreaterThan(2);
      expect(theme.childNote.length).toBeGreaterThan(8);
    });
  });
});
