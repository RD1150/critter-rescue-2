import { describe, expect, it } from 'vitest';
import { careForHome, createFreshState } from './store';

describe('Critter Home care', () => {
  it('persists kind feed and pet moments by critter name', () => {
    const initial = createFreshState();
    const first = careForHome(initial, 'Nutty');
    const second = careForHome(first.newState, 'Nutty');
    const other = careForHome(second.newState, 'Pip');

    expect(first.careCount).toBe(1);
    expect(second.careCount).toBe(2);
    expect(other.newState.homeCare).toEqual({ Nutty: 2, Pip: 1 });
  });
});
