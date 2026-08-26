import { describe, expect, it } from 'vitest';
import { completeBedtimeWindDown, createFreshState } from './store';

describe('bedtime wind-down', () => {
  it('records one local illustrated keepsake and increments the quiet-session count', () => {
    const initial = createFreshState();
    const { newState, keepsake } = completeBedtimeWindDown(initial, 'Nutty', 'squirrel');
    expect(newState.bedtimeSessions).toBe(1);
    expect(newState.keepsakes[0]).toEqual(keepsake);
    expect(keepsake.source).toBe('bedtime');
    expect(keepsake.title).toContain('Moonlight rest');
  });
});
