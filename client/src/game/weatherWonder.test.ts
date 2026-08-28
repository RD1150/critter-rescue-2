// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { createFreshState, loadState, recordWeatherWonder } from './store';
import { WEATHER_WONDERS } from './weatherWonder';

describe('seasonal weather wonders', () => {
  beforeEach(() => localStorage.clear());

  it('offers every sanctuary season exactly two simple, named steps', () => {
    expect(Object.keys(WEATHER_WONDERS).sort()).toEqual(['autumn', 'spring', 'summer', 'winter']);
    Object.values(WEATHER_WONDERS).forEach((wonder) => {
      expect(wonder.steps).toHaveLength(2);
      expect(wonder.critter.name.length).toBeGreaterThan(2);
      expect(wonder.critter.carePrompt.length).toBeGreaterThan(10);
      wonder.steps.forEach((step) => {
        expect(step.label.length).toBeGreaterThan(3);
        expect(step.response.length).toBeGreaterThan(3);
      });
    });
  });

  it('records only the selected season and saves one gentle learning round', () => {
    const next = recordWeatherWonder(createFreshState(), 'winter');
    expect(next.weatherWonders).toEqual({ spring: 0, summer: 0, autumn: 0, winter: 1 });
    expect(Object.values(next.activityLog)[0]?.learningRounds).toBe(1);
    expect(JSON.parse(localStorage.getItem('critter_rescue_v1') ?? '{}').weatherWonders.winter).toBe(1);
  });

  it('hydrates older device-only saves with empty seasonal weather records', () => {
    const older = { ...createFreshState() } as Partial<ReturnType<typeof createFreshState>>;
    delete older.weatherWonders;
    localStorage.setItem('critter_rescue_v1', JSON.stringify(older));
    expect(loadState().weatherWonders).toEqual({ spring: 0, summer: 0, autumn: 0, winter: 0 });
  });
});
