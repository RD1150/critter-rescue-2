// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { loadCreativeBlockBuilds, removeCreativeBlockBuild, saveCreativeBlockBuild } from './creativeBlockCreations';

describe('local Cozy Block Studio creations', () => {
  beforeEach(() => window.localStorage.clear());

  it('stores a named nine-space build locally without requiring an account or upload', () => {
    const saved = saveCreativeBlockBuild('  My  bridge  ', ['skyBase', null, 'coralWall', null, null, null, null, null, null]);
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('My bridge');
    expect(saved[0].spaces.slice(0, 3)).toEqual(['skyBase', null, 'coralWall']);
    expect(saved[0].spaces).toHaveLength(9);
    expect(loadCreativeBlockBuilds()).toEqual(saved);
  });

  it('keeps malformed stored data from breaking the studio and removes a selected creation locally', () => {
    window.localStorage.setItem('critter-rescue-creative-block-builds', '{not valid json');
    expect(loadCreativeBlockBuilds()).toEqual([]);
    const [saved] = saveCreativeBlockBuild('', Array(9).fill(null));
    expect(removeCreativeBlockBuild(saved.id)).toEqual([]);
  });
});
