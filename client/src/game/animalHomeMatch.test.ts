import { describe, expect, it } from 'vitest';
import { getZoneTask, getZoneTaskCount } from './data';
import { ANIMAL_HOME_MATCH_ROUNDS } from './animalHomeMatch';

describe('Animal Home and Care Match', () => {
  it('uses the approved four clear animal and place pairs', () => {
    expect(ANIMAL_HOME_MATCH_ROUNDS.map((round) => [round.animal, round.correctChoice])).toEqual([
      ['Dog', 'dogHouse'], ['Bird', 'birdHouse'], ['Cat', 'scratchingPost'], ['Pig', 'mudBath'],
    ]);
  });

  it('adds the matching rescue as the next Meadow mission', () => {
    expect(getZoneTask('meadow', 12)).toMatchObject({ type: 'animalHomeMatch', taskIndex: 12, critter: { name: 'Daisy' } });
    expect(getZoneTaskCount('meadow')).toBe(13);
  });
});
