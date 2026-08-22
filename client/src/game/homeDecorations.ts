import type { HomeDecoration } from './store';

export interface HomeDecorationRenderPlan {
  key: HomeDecoration;
  label: string;
  meshPrefix: string;
}

export const HOME_DECORATION_RENDER_PLANS: Record<HomeDecoration, HomeDecorationRenderPlan> = {
  'petal-garland': { key: 'petal-garland', label: 'Petal garland', meshPrefix: 'home-garland' },
  'cloud-pillow': { key: 'cloud-pillow', label: 'Cloud pillow', meshPrefix: 'home-pillow' },
  'acorn-lantern': { key: 'acorn-lantern', label: 'Acorn lantern', meshPrefix: 'home-lantern' },
  'starglow-mobile': { key: 'starglow-mobile', label: 'Starglow mobile', meshPrefix: 'home-starglow' },
  'mossy-reading-nook': { key: 'mossy-reading-nook', label: 'Mossy reading nook', meshPrefix: 'home-reading-nook' },
  'tea-time-picnic': { key: 'tea-time-picnic', label: 'Tiny tea picnic', meshPrefix: 'home-tea-picnic' },
};

export function getHomeDecorationRenderPlan(decoration: HomeDecoration): HomeDecorationRenderPlan {
  return HOME_DECORATION_RENDER_PLANS[decoration];
}

export function getHomeDecorationMeshIds(decoration: HomeDecoration, critterName: string): string[] {
  switch (decoration) {
    case 'cloud-pillow': return [`home-pillow-${critterName}`];
    case 'acorn-lantern': return [`home-lantern-${critterName}`];
    case 'starglow-mobile': return [`home-starglow-string-${critterName}`, `home-starglow-${critterName}-0`, `home-starglow-${critterName}-1`, `home-starglow-${critterName}-2`];
    case 'mossy-reading-nook': return [`home-reading-nook-mat-${critterName}`, `home-reading-nook-book-${critterName}`];
    case 'tea-time-picnic': return [`home-tea-picnic-blanket-${critterName}`, `home-tea-picnic-cup-${critterName}`];
    case 'petal-garland': return [`home-garland-${critterName}-0`, `home-garland-${critterName}-1`, `home-garland-${critterName}-2`];
  }
}
