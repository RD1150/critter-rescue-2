import { describe, expect, it } from 'vitest';
import { CELEBRATION_PATH_OPTIONS, CELEBRATION_PATHS, getCelebrationPath } from './celebrationPaths';

describe('seasonal celebration paths', () => {
  it('provides four distinct parent-selectable paths with two calm child actions each', () => {
    expect(Object.keys(CELEBRATION_PATHS).sort()).toEqual(['harvestKindness', 'lightsKindness', 'pumpkinLantern', 'winterSparkle']);
    Object.values(CELEBRATION_PATHS).forEach((path) => {
      expect(path.steps).toHaveLength(2);
      expect(path.childTitle).toBeTruthy();
      expect(path.thankYou).toBeTruthy();
    });
    expect(CELEBRATION_PATH_OPTIONS.map((option) => option.value)).toContain('none');
  });

  it('keeps formal holiday naming in the parent choice and uses neutral trail names in child play', () => {
    expect(CELEBRATION_PATH_OPTIONS.find((option) => option.value === 'lightsKindness')?.label).toMatch(/hanukkah/i);
    expect(getCelebrationPath('lightsKindness')?.childTitle).toBe('Lights & kindness trail');
    expect(Object.values(CELEBRATION_PATHS).map((path) => `${path.childTitle} ${path.childLine}`).join(' ')).not.toMatch(/halloween|thanksgiving|christmas|hanukkah/i);
  });
});
