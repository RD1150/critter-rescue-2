import { describe, expect, it } from 'vitest';
import { resolveCampTheme } from './campThemes';

describe('camp themes', () => {
  it('uses an explicit parent-selected theme instead of the calendar season', () => {
    expect(resolveCampTheme('winter', new Date('2026-07-15T12:00:00'))).toBe('winter');
  });

  it('keeps the automatic option seasonal', () => {
    expect(resolveCampTheme('auto', new Date('2026-04-15T12:00:00'))).toBe('spring');
  });
});
