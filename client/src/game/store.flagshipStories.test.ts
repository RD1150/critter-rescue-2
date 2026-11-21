// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { acknowledgeFlagshipHomecoming, completeFlagshipStory, createFreshState, loadState } from './store';

describe('Bestie story persistence', () => {
  it('persists each story once, records a homecoming, and never uses counters as story truth', () => {
    const fresh = createFreshState();
    const first = completeFlagshipStory(fresh, 'pip-flower-path');
    const repeated = completeFlagshipStory(first.newState, 'pip-flower-path');

    expect(first.completed).toBe(true);
    expect(first.newState.completedFlagshipStories).toEqual(['pip-flower-path']);
    expect(first.newState.lastFlagshipHomecoming).toBe('pip-flower-path');
    expect(first.newState.keepsakes).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'flagship-pip-flower-path', title: 'Pip’s Flower Path' })]));
    expect(repeated).toMatchObject({ completed: false, alreadyCompleted: true });
    expect(repeated.newState.completedFlagshipStories).toEqual(['pip-flower-path']);
  });

  it('hydrates older local saves without erasing existing progress', () => {
    localStorage.setItem('critter_rescue_v1', JSON.stringify({ selectedCompanion: 'fox', rescueCompletedCount: 4, homeCare: { Nutty: 2 } }));
    const loaded = loadState();

    expect(loaded.selectedCompanion).toBe('fox');
    expect(loaded.rescueCompletedCount).toBe(4);
    expect(loaded.homeCare['squirrel-nutty']).toBe(2);
    expect(loaded.completedFlagshipStories).toEqual([]);
    expect(loaded.lastFlagshipHomecoming).toBeNull();
  });

  it('leaves memories, home decorations, and activity totals untouched on a replay', () => {
    const saved = acknowledgeFlagshipHomecoming(completeFlagshipStory(createFreshState(), 'pip-flower-path').newState);
    const before = JSON.stringify(saved);
    const replay = completeFlagshipStory(saved, 'pip-flower-path');
    expect(replay.newState).toBe(saved);
    expect(JSON.stringify(replay.newState)).toBe(before);
    expect(replay.newState.lastFlagshipHomecoming).toBeNull();
    expect(replay.newState.keepsakes.filter((entry) => entry.id === 'flagship-pip-flower-path')).toHaveLength(1);
  });
});
