import { describe, expect, it } from 'vitest';
import { RIVER_RESCUE_STEPS, RIVER_RESCUE_TOOL_ORDER } from './riverRescue';
import { getZoneTask, getZoneTaskCount } from './data';

describe('River Rescue data', () => {
  it('defines three calm helpers in the safe planning order', () => {
    expect(RIVER_RESCUE_TOOL_ORDER).toEqual(['log', 'rope', 'guide']);
    expect(RIVER_RESCUE_STEPS).toHaveLength(3);
    expect(RIVER_RESCUE_STEPS.map((step) => step.tool)).toEqual(['Bridge log', 'Rescue rope', 'Safe trail sign']);
    RIVER_RESCUE_STEPS.forEach((step) => {
      expect(step.prompt).toBeTruthy();
      expect(step.success).toBeTruthy();
      expect(step.gentleRetry).toMatch(/first|next|before|now/i);
    });
  });

  it('adds Clover’s River Rescue as the final Riverside mission without replacing earlier missions', () => {
    const mission = getZoneTask('riverside', 9);
    expect(getZoneTaskCount('riverside')).toBe(10);
    expect(mission).toMatchObject({ type: 'riverRescue', zone: 'riverside', taskIndex: 9 });
    expect(mission?.critter).toMatchObject({ name: 'Clover', type: 'bunny' });
  });
});
