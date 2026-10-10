// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { loadState } from './store';

describe('stable critter save migration', () => {
  afterEach(() => localStorage.clear());

  it('moves legacy display-name care and decoration keys to durable critter IDs', () => {
    localStorage.setItem('critter_rescue_v1', JSON.stringify({
      homeCare: { Nutty: 2, Pip: 1 },
      homeDecor: { Nutty: 'cloud-pillow' },
      carePlayWins: { Nutty: 3 },
    }));

    const state = loadState();
    expect(state.homeCare).toEqual({ 'squirrel-nutty': 2, 'bird-pip': 1 });
    expect(state.homeDecor).toEqual({ 'squirrel-nutty': 'cloud-pillow' });
    expect(state.carePlayWins).toEqual({ 'squirrel-nutty': 3 });
  });
});
