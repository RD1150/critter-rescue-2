import { describe, expect, it } from 'vitest';
import { getZoneTask, getZoneTaskCount } from './data';
import { GARDEN_SORT_BASKETS, GARDEN_SORT_ITEMS } from './gardenSort';

describe('Garden Sorting activity', () => {
  it('uses large berries and leaves with two clear visual baskets', () => {
    expect(GARDEN_SORT_ITEMS.map((item) => item.category)).toEqual(['berries', 'leaves', 'berries', 'leaves']);
    expect(Object.keys(GARDEN_SORT_BASKETS).sort()).toEqual(['berries', 'leaves']);
  });

  it('adds Daisy’s garden sorting activity to the Sunny Meadow', () => {
    expect(getZoneTask('meadow', 11)).toMatchObject({ type: 'gardenSort', taskIndex: 11, critter: { name: 'Daisy' } });
    expect(getZoneTaskCount('meadow')).toBe(12);
  });
});
