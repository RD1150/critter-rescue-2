import { describe, expect, it } from 'vitest';
import { PRE_READER_DIRECTIONS } from './preReaderDirections';
import { PRE_READER_AUDIO } from './characterAudio';

describe('pre-reader spoken direction inventory', () => {
  it('covers onboarding, the daily trail, all rescue action types, and three learning rounds', () => {
    const required = ['onboarding', 'dailyTrail', 'bridge', 'clearPath', 'shelter', 'guidePath', 'memory', 'pattern', 'maze', 'gather', 'tracing', 'sorting', 'counting', 'shapeFit', 'spotDifference', 'sequence', 'findTools', 'colorMatch', 'sizeOrdering', 'critterPath', 'alliteration', 'habitatMatch', 'syllableClap', 'riverRescue', 'weatherWonder', 'teamRescue', 'learningColor', 'learningShape', 'learningPattern'] as const;
    required.forEach((key) => {
      expect(PRE_READER_DIRECTIONS[key]).toMatch(/\.$/);
      const wordCount = PRE_READER_DIRECTIONS[key].split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(3);
      expect(wordCount).toBeLessThanOrEqual(10);
    });
  });

  it('has one uploaded optional audio clip for every direction', () => {
    expect(Object.keys(PRE_READER_AUDIO).sort()).toEqual(Object.keys(PRE_READER_DIRECTIONS).sort());
    Object.values(PRE_READER_AUDIO).forEach((source) => expect(source).toMatch(/^\/manus-storage\/direction-.*\.mp3$/));
  });
});
