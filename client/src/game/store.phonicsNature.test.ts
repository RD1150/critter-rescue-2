import { describe, expect, it } from 'vitest';
import { completeRescue, createFreshState, recordNatureDiscovery } from './store';

describe('phonics and nature local discovery records', () => {
  it('records a letter-sound rescue as gentle learning practice', () => {
    const fresh = createFreshState();
    const result = completeRescue(fresh, 'meadow', 0, 1, 'letterSound');
    expect(result.newState.quietLearningRescues.letterSound).toBe(1);
  });

  it('records alliteration and habitat matches as calm local discoveries', () => {
    const fresh = createFreshState();
    const alliteration = completeRescue(fresh, 'meadow', 0, 1, 'alliteration');
    const habitat = completeRescue(alliteration.newState, 'riverside', 0, 1, 'habitatMatch');
    expect(habitat.newState.quietLearningRescues.alliteration).toBe(1);
    expect(habitat.newState.quietLearningRescues.habitatMatch).toBe(1);
  });

  it('records each nature field note once rather than creating a score', () => {
    const fresh = createFreshState();
    const first = recordNatureDiscovery(fresh, 'spring-bud');
    const second = recordNatureDiscovery(first, 'spring-bud');
    expect(second.natureDiscoveries['spring-bud']).toBe(1);
  });
});
