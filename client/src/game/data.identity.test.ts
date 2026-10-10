import { describe, expect, it } from 'vitest';
import { getRescuedCritters, getZoneTask } from './data';

describe('stable critter identities', () => {
  it('keeps every rescued friend unique and gives specialty friends their matching types', () => {
    const friends = getRescuedCritters({ meadow: 99, riverside: 99, deepwoods: 99, mountain: 99 });
    expect(new Set(friends.map((friend) => friend.id)).size).toBe(friends.length);
    expect(friends.find((friend) => friend.name === 'Buttercup')).toMatchObject({ id: 'butterfly-buttercup', type: 'butterfly' });
    expect(friends.find((friend) => friend.name === 'Cricket')).toMatchObject({ id: 'cricket-cricket', type: 'cricket' });
    expect(friends.find((friend) => friend.name === 'Bubbles')).toMatchObject({ id: 'octopus-bubbles', type: 'octopus' });
    expect(friends.find((friend) => friend.name === 'Puddle')).toMatchObject({ type: 'frog' });
    expect(friends.find((friend) => friend.name === 'Ridge')).toMatchObject({ type: 'lizard' });
  });

  it('uses the renamed Ridge identity in Deep Woods rescue copy', () => {
    const mission = getZoneTask('deepwoods', 4);
    expect(mission?.critter).toMatchObject({ id: 'lizard-ridge', name: 'Ridge', type: 'lizard' });
    expect(mission?.scenarioText).toContain('Ridge');
  });
});
