import { describe, expect, it } from 'vitest';
import { getHomeDecorationMeshIds, getHomeDecorationRenderPlan } from './homeDecorations';
import { chooseHomeDecoration, createFreshState } from './store';

describe('Storybook home decoration render plan', () => {
  it('maps a persisted cloud pillow choice to the Babylon pillow mesh variant', () => {
    const state = chooseHomeDecoration(createFreshState(), 'Nutty', 'cloud-pillow');
    const plan = getHomeDecorationRenderPlan(state.homeDecor.Nutty);

    expect(plan).toMatchObject({ key: 'cloud-pillow', label: 'Cloud pillow', meshPrefix: 'home-pillow' });
  });

  it('provides a named Babylon mesh plan for all six home decoration choices', () => {
    const choices = ['petal-garland', 'cloud-pillow', 'acorn-lantern', 'starglow-mobile', 'mossy-reading-nook', 'tea-time-picnic'] as const;
    expect(choices.map((choice) => getHomeDecorationRenderPlan(choice).meshPrefix)).toEqual([
      'home-garland', 'home-pillow', 'home-lantern', 'home-starglow', 'home-reading-nook', 'home-tea-picnic',
    ]);
  });

  it('exposes the exact Babylon mesh identifiers for every new saved decoration branch', () => {
    expect(getHomeDecorationMeshIds('starglow-mobile', 'Nutty')).toEqual(['home-starglow-string-Nutty', 'home-starglow-Nutty-0', 'home-starglow-Nutty-1', 'home-starglow-Nutty-2']);
    expect(getHomeDecorationMeshIds('mossy-reading-nook', 'Nutty')).toEqual(['home-reading-nook-mat-Nutty', 'home-reading-nook-book-Nutty']);
    expect(getHomeDecorationMeshIds('tea-time-picnic', 'Nutty')).toEqual(['home-tea-picnic-blanket-Nutty', 'home-tea-picnic-cup-Nutty']);
  });
});
