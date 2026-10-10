import { describe, expect, it } from 'vitest';
import { FRIENDSHIP_DUOS } from './friendshipDuos';
import { completeFriendshipDuo, createFreshState } from './store';

describe('friendship duo persistence', () => {
  it('saves a local shared keepsake and counts one gentle duo moment', () => {
    const result = completeFriendshipDuo(createFreshState(), FRIENDSHIP_DUOS[0]);
    expect(result.newState.friendshipDuoWins['nutty-pip']).toBe(1);
    expect(result.newState.carePlayWins['squirrel-nutty']).toBe(1);
    expect(result.newState.carePlayWins['bird-pip']).toBe(1);
    expect(result.keepsake.title).toContain('Nutty & Pip');
  });
});
