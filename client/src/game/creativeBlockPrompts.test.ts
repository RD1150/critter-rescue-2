import { describe, expect, it } from 'vitest';
import { CREATIVE_BLOCK_PROMPTS, getCreativeBlockPrompt } from './creativeBlockPrompts';

describe('Cozy Block Studio inspiration prompts', () => {
  it('keeps eight pre-authored, picture-led ideas available without runtime generation', () => {
    expect(CREATIVE_BLOCK_PROMPTS.map((prompt) => prompt.id)).toEqual(['littleBridge', 'cozyHome', 'tallTower', 'flowerSpot', 'sunnyWindow', 'twoColorBuild', 'friendlyDoor', 'makePath']);
    CREATIVE_BLOCK_PROMPTS.forEach((prompt) => {
      expect(prompt.prompt).toMatch(/[?.]$/);
      expect(prompt.image).toMatch(/^\/manus-storage\/critter-rescue-build-prompt-.*\.png$/);
    });
  });

  it('finds a selected prompt or safely leaves a child free to build independently', () => {
    expect(getCreativeBlockPrompt('littleBridge')?.title).toBe('Little Bridge');
    expect(getCreativeBlockPrompt(null)).toBeNull();
  });
});
