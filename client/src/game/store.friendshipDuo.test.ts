import { describe, expect, it } from 'vitest';
import { FRIENDSHIP_DUOS } from './friendshipDuos';
import { completeFriendshipDuo, createFreshState } from './store';

describe('friendship duo persistence', () => {
  it('saves a local shared keepsake and counts one gentle duo moment', () => {
    const result = completeFriendshipDuo(createFreshState(), FRIENDSHIP_DUOS[0]);
    expect(result.newState.friendshipDuoWins['nutty-pip']).toBe(1);
    expect(result.newState.carePlayWins.Nutty).toBe(1);
    expect(result.newState.carePlayWins.Pip).toBe(1);
    expect(result.keepsake.title).toContain('Nutty & Pip');
  });
});
