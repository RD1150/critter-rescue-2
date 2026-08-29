import { describe, expect, it } from 'vitest';
import { validateBetaFeedback } from './betaFeedback';

describe('parent beta feedback validation', () => {
  it('accepts a short parent bug report and trims its stored context', () => {
    expect(validateBetaFeedback({ kind: 'bug', message: 'The Listen button stayed quiet.', context: ' Parent Settings · beta ' })).toEqual({ feedback: { kind: 'bug', message: 'The Listen button stayed quiet.', context: 'Parent Settings · beta' } });
  });

  it('rejects incomplete feedback before it reaches storage', () => {
    expect(validateBetaFeedback({ kind: 'idea', message: 'x' }).error).toMatch(/choose/i);
    expect(validateBetaFeedback({ kind: 'suggestion', message: 'ok' }).error).toMatch(/few words/i);
  });
});
