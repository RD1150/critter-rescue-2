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
};

export function getHomeDecorationRenderPlan(decoration: HomeDecoration): HomeDecorationRenderPlan {
  return HOME_DECORATION_RENDER_PLANS[decoration];
}
