import { describe, expect, it } from 'vitest';
import { getHomeDecorationRenderPlan } from './homeDecorations';
import { chooseHomeDecoration, createFreshState } from './store';

describe('Storybook home decoration render plan', () => {
  it('maps a persisted cloud pillow choice to the Babylon pillow mesh variant', () => {
    const state = chooseHomeDecoration(createFreshState(), 'Nutty', 'cloud-pillow');
    const plan = getHomeDecorationRenderPlan(state.homeDecor.Nutty);

    expect(plan).toMatchObject({ key: 'cloud-pillow', label: 'Cloud pillow', meshPrefix: 'home-pillow' });
  });
});
