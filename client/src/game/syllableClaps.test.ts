import { describe, expect, it } from 'vitest';
import { SYLLABLE_CLAP_PATTERNS } from './syllableClaps';

describe('syllable clap patterns', () => {
  it('offers three picture-led patterns with two two-clap examples and one three-clap example', () => {
    expect(SYLLABLE_CLAP_PATTERNS).toHaveLength(3);
    expect(SYLLABLE_CLAP_PATTERNS.map((pattern) => pattern.choices.find((choice) => choice.correct)?.claps)).toEqual([2, 2, 3]);
  });

  it('keeps every pattern visual, simple, and unambiguous', () => {
    SYLLABLE_CLAP_PATTERNS.forEach((pattern) => {
      expect(pattern.choices).toHaveLength(3);
      expect(pattern.choices.filter((choice) => choice.correct)).toHaveLength(1);
      pattern.choices.forEach((choice) => {
        expect(choice.emoji.length).toBeGreaterThan(0);
        expect(choice.label.length).toBeGreaterThan(1);
        expect(choice.claps).toBeGreaterThan(0);
      });
    });
  });
});
