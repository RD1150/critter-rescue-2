import { describe, expect, it } from 'vitest';
import { getZoneTask, getZoneTaskCount } from './data';
import { TELLING_TIME_ROUND } from './tellingTime';

describe('Telling Time activity', () => {
  it('uses one calm full-hour reading with a visible correct clock', () => {
    expect(TELLING_TIME_ROUND.targetHour).toBe(7);
    expect(TELLING_TIME_ROUND.choiceHours).toContain(TELLING_TIME_ROUND.targetHour);
    expect(TELLING_TIME_ROUND.choiceHours).toHaveLength(3);
    expect(TELLING_TIME_ROUND.gentleRetry).toMatch(/different time/i);
  });

  it('adds Brook’s full-hour activity to the Riverside path', () => {
    expect(getZoneTask('riverside', 10)).toMatchObject({ type: 'tellingTime', taskIndex: 10, critter: { name: 'Brook', type: 'turtle' } });
    expect(getZoneTaskCount('riverside')).toBe(11);
  });
});
