import { describe, expect, it } from 'vitest';
import { getZoneTask, getZoneTaskCount } from './data';
import { LODGE_RESCUE_STEPS, LODGE_RESCUE_TOOL_ORDER } from './lodgeRescue';

describe('Lodge Rescue definition', () => {
  it('keeps the building helpers in a calm planning order', () => {
    expect(LODGE_RESCUE_TOOL_ORDER).toEqual(['sturdySticks', 'leafLining', 'roundDoor']);
    expect(LODGE_RESCUE_STEPS).toHaveLength(3);
    LODGE_RESCUE_STEPS.forEach((step) => {
      expect(step.prompt).toBeTruthy();
      expect(step.success).toBeTruthy();
      expect(step.gentleRetry).toBeTruthy();
    });
  });

  it('is the final Deep Woods mission without replacing earlier rescues', () => {
    const mission = getZoneTask('deepwoods', 9);
    expect(mission).toMatchObject({ type: 'lodgeRescue', zone: 'deepwoods', taskIndex: 9 });
    expect(mission?.critter).toMatchObject({ name: 'Bark', type: 'fox' });
    expect(getZoneTaskCount('deepwoods')).toBe(10);
  });
});
