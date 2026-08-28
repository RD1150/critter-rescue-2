import { describe, expect, it } from 'vitest';
import { FRIENDSHIP_DUOS, getAvailableFriendshipDuos } from './friendshipDuos';
import { PRE_READER_DIRECTIONS } from './preReaderDirections';

describe('friendship duos', () => {
  it('only offers a duo after both friends are rescued', () => {
    const nuttyPip = FRIENDSHIP_DUOS[0];
    expect(getAvailableFriendshipDuos([{ name: 'Nutty' } as any])).toEqual([]);
    expect(getAvailableFriendshipDuos([{ name: 'Nutty' } as any, { name: 'Pip' } as any])).toEqual([nuttyPip]);
  });

  it('keeps all duo moments to two calm, ordered care steps', () => {
    expect(FRIENDSHIP_DUOS.every((duo) => duo.steps.length === 2)).toBe(true);
  });

  it('assigns every duo an instruction that describes its own two visible steps', () => {
    expect(PRE_READER_DIRECTIONS[FRIENDSHIP_DUOS[0].directionKey]).toContain('leaf');
    expect(PRE_READER_DIRECTIONS[FRIENDSHIP_DUOS[1].directionKey]).toContain('ripple');
    expect(PRE_READER_DIRECTIONS[FRIENDSHIP_DUOS[2].directionKey]).toContain('blanket');
  });
});
