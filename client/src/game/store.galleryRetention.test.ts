import { describe, expect, it } from 'vitest';
import { clearKeepsakes, completeCarePlay, createFreshState, removeKeepsake, restoreKeepsakes } from './store';

describe('parent-safe gallery retention', () => {
  it('removes local illustrated keepsakes and restores them only through an explicit parent action', () => {
    const first = completeCarePlay(createFreshState(), 'Splash', 'otter', 'ripple-refill').newState;
    const second = completeCarePlay(first, 'Thistle', 'bee', 'garden-sprinkle').newState;
    const removed = removeKeepsake(second, second.keepsakes[0].id);
    expect(removed.newState.keepsakes).toHaveLength(1);
    expect(removed.removed?.critterName).toBe('Thistle');
    const restored = restoreKeepsakes(removed.newState, [removed.removed!]);
    expect(restored.keepsakes).toHaveLength(2);
    const cleared = clearKeepsakes(restored);
    expect(cleared.newState.keepsakes).toHaveLength(0);
    expect(restoreKeepsakes(cleared.newState, cleared.cleared).keepsakes).toHaveLength(2);
  });
});
