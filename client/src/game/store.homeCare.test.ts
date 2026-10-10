import { describe, expect, it } from 'vitest';
import { careForHome, createFreshState } from './store';

describe('Critter Home care', () => {
  it('persists kind feed and pet moments by stable critter ID', () => {
    const initial = createFreshState();
    const first = careForHome(initial, 'squirrel-nutty');
    const second = careForHome(first.newState, 'squirrel-nutty');
    const other = careForHome(second.newState, 'bird-pip');

    expect(first.careCount).toBe(1);
    expect(second.careCount).toBe(2);
    expect(other.newState.homeCare).toEqual({ 'squirrel-nutty': 2, 'bird-pip': 1 });
  });
});
