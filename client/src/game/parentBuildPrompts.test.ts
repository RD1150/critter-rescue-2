// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { createParentBuildPrompt, loadParentBuildPrompts, removeParentBuildPrompt, setParentBuildPromptEnabled } from './parentBuildPrompts';

describe('parent custom Cozy Block Studio prompts', () => {
  beforeEach(() => window.localStorage.clear());

  it('keeps a parent-authored prompt local and allows its child-facing availability to be chosen', () => {
    const [prompt] = createParentBuildPrompt('Soft tunnel', 'Can you make a soft tunnel for a friend?', true);
    expect(prompt).toMatchObject({ title: 'Soft tunnel', enabled: true });
    expect(setParentBuildPromptEnabled(prompt.id, false)[0].enabled).toBe(false);
    expect(loadParentBuildPrompts()[0].prompt).toBe('Can you make a soft tunnel for a friend?');
  });

  it('rejects overly short prompt text and removes a saved prompt only on this device', () => {
    expect(createParentBuildPrompt('Hi', 'Too short')).toEqual([]);
    const [prompt] = createParentBuildPrompt('Quiet corner', 'Can you make a quiet corner with two blocks?');
    expect(removeParentBuildPrompt(prompt.id)).toEqual([]);
  });
});
