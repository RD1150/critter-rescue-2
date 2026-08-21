import { describe, expect, it } from 'vitest';
import { LEARNING_ROUNDS, tilesMatch } from './CampLearningScreen';

describe('Camp Learning Trail', () => {
  it('has exactly three preschool rounds with a correct answer among the large choices', () => {
    expect(LEARNING_ROUNDS).toHaveLength(3);
    LEARNING_ROUNDS.forEach((round) => {
      expect(round.choices.some((choice) => tilesMatch(choice, round.answer))).toBe(true);
      expect(round.choices).toHaveLength(4);
    });
  });

  it('distinguishes same-color wrong-shape choices from the answer', () => {
    const round = LEARNING_ROUNDS[0];
    expect(tilesMatch(round.answer, round.choices[2])).toBe(false);
  });
});
