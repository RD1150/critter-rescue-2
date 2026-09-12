import { describe, expect, it } from 'vitest';
import { getZoneTask, getZoneTaskCount } from './data';
import { TELLING_TIME_ROUNDS } from './tellingTime';

describe('Telling Time activity', () => {
  it('uses three calm full-hour readings with a visible correct clock for every round', () => {
    expect(TELLING_TIME_ROUNDS.map((round) => round.targetHour)).toEqual([7, 3, 10]);
    TELLING_TIME_ROUNDS.forEach((round) => {
      expect(round.choiceHours).toContain(round.targetHour);
      expect(round.choiceHours).toHaveLength(3);
      expect(round.gentleRetry).toMatch(/different time/i);
    });
  });

  it('adds Brook’s full-hour activity to the Riverside path', () => {
    expect(getZoneTask('riverside', 10)).toMatchObject({ type: 'tellingTime', taskIndex: 10, critter: { name: 'Brook', type: 'turtle' } });
    expect(getZoneTaskCount('riverside')).toBe(11);
  });
});
