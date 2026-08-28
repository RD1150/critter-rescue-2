import type { CelebrationPathPreference } from './audioPreferences';
import type { CritterType } from './data';

export type CelebrationPath = {
  id: Exclude<CelebrationPathPreference, 'none'>;
  parentLabel: string;
  childTitle: string;
  childLine: string;
  icon: string;
  accent: string;
  surface: string;
  guideName: string;
  guideType: CritterType;
  steps: readonly { icon: string; label: string; response: string }[];
  thankYou: string;
};

export const CELEBRATION_PATHS: Record<Exclude<CelebrationPathPreference, 'none'>, CelebrationPath> = {
  pumpkinLantern: {
    id: 'pumpkinLantern', parentLabel: 'Halloween-inspired · Pumpkin & lantern', childTitle: 'Pumpkin & lantern trail', childLine: 'A cozy little path is waiting for two kind touches.', icon: '🎃', accent: '#D96B35', surface: '#FFF2E2', guideName: 'Ember', guideType: 'fox',
    steps: [{ icon: '🏮', label: 'Place a warm lantern', response: 'The path has a soft glow.' }, { icon: '🦇', label: 'Wave to the sleepy bat', response: 'A tiny bat finds a cozy corner.' }],
    thankYou: 'The pumpkin path feels warm, gentle, and ready for friends.',
  },
  harvestKindness: {
    id: 'harvestKindness', parentLabel: 'Thanksgiving-inspired · Harvest & kindness', childTitle: 'Harvest & kindness trail', childLine: 'Let’s make a little harvest corner feel cozy.', icon: '🍂', accent: '#B56C2D', surface: '#FFF4DD', guideName: 'Nutty', guideType: 'squirrel',
    steps: [{ icon: '🧺', label: 'Tuck an apple in the basket', response: 'The basket looks cared for.' }, { icon: '🍁', label: 'Share a soft leaf blanket', response: 'Two friends can snuggle nearby.' }],
    thankYou: 'The harvest corner is full of sharing and kindness.',
  },
  winterSparkle: {
    id: 'winterSparkle', parentLabel: 'Christmas-inspired · Winter sparkle', childTitle: 'Winter sparkle trail', childLine: 'Two soft winter touches can make camp feel bright.', icon: '🎄', accent: '#B84C45', surface: '#F8F4E7', guideName: 'Clover', guideType: 'bunny',
    steps: [{ icon: '✨', label: 'Hang one warm light', response: 'A small golden light twinkles softly.' }, { icon: '🧦', label: 'Set out a cozy stocking', response: 'The winter nook feels snug.' }],
    thankYou: 'The sparkle trail is cozy and ready for a quiet story.',
  },
  lightsKindness: {
    id: 'lightsKindness', parentLabel: 'Hanukkah-inspired · Lights & kindness', childTitle: 'Lights & kindness trail', childLine: 'Let’s add two peaceful lights to the cozy path.', icon: '🕎', accent: '#4E72B5', surface: '#ECF3FC', guideName: 'Sage', guideType: 'owl',
    steps: [{ icon: '🕯️', label: 'Light a little candle', response: 'A gentle light joins the path.' }, { icon: '🌀', label: 'Set a tiny dreidel nearby', response: 'The blue-and-gold corner feels cared for.' }],
    thankYou: 'The lights-and-kindness trail shines softly for every friend.',
  },
};

export const CELEBRATION_PATH_OPTIONS: readonly { value: CelebrationPathPreference; label: string }[] = [
  { value: 'none', label: 'No special trail' },
  ...Object.values(CELEBRATION_PATHS).map(({ id, parentLabel }) => ({ value: id, label: parentLabel })),
];

export function getCelebrationPath(path: CelebrationPathPreference): CelebrationPath | null {
  return path === 'none' ? null : CELEBRATION_PATHS[path];
}
