import { describe, expect, it } from 'vitest';
import { getZoneTask, getZoneTaskCount } from './data';
import { NEST_RESCUE_STEPS, NEST_RESCUE_TOOL_ORDER } from './nestRescue';

describe('Nest Rescue definition', () => {
  it('keeps the route helpers in calm spatial-planning order', () => {
    expect(NEST_RESCUE_TOOL_ORDER).toEqual(['branchPath', 'mossBundle', 'nestCup']);
    expect(NEST_RESCUE_STEPS).toHaveLength(3);
    NEST_RESCUE_STEPS.forEach((step) => {
      expect(step.prompt).toBeTruthy();
      expect(step.success).toBeTruthy();
      expect(step.gentleRetry).toBeTruthy();
    });
  });

  it('is the final deep-woods mission without replacing earlier rescues', () => {
    const mission = getZoneTask('deepwoods', 8);
    expect(mission?.type).toBe('nestRescue');
    expect(mission?.critter.name).toBe('Wren');
    expect(getZoneTaskCount('deepwoods')).toBe(9);
  });
});
