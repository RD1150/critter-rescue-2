import { describe, expect, it } from 'vitest';
import { CARE_PLAY_DETAILS, getCarePlayKind } from './carePlay';

describe('critter care play', () => {
  it('selects a gentle personality-led activity for every relevant critter group', () => {
    expect(getCarePlayKind('squirrel')).toBe('acorn-tidy');
    expect(getCarePlayKind('bird')).toBe('nest-fluff');
    expect(getCarePlayKind('hedgehog')).toBe('brush-bloom');
    expect(getCarePlayKind('otter')).toBe('ripple-refill');
    expect(getCarePlayKind('bee')).toBe('garden-sprinkle');
    expect(Object.keys(CARE_PLAY_DETAILS).sort()).toEqual(['acorn-tidy', 'brush-bloom', 'garden-sprinkle', 'nest-fluff', 'ripple-refill']);
  });
});
