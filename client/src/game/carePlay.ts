import type { CritterType } from './data';
import type { CarePlayKind } from './store';

export interface CarePlayDetails {
  kind: CarePlayKind;
  title: string;
  prompt: string;
  celebration: string;
  itemEmoji: string;
  itemLabel: string;
  accent: string;
}

export const CARE_PLAY_DETAILS: Record<CarePlayKind, CarePlayDetails> = {
  'acorn-tidy': { kind: 'acorn-tidy', title: 'Acorn Tidy', prompt: 'Tap each shiny acorn to tuck it into the basket.', celebration: 'The acorns are tucked in. What a cozy stash!', itemEmoji: '🌰', itemLabel: 'shiny acorn', accent: '#E8B772' },
  'nest-fluff': { kind: 'nest-fluff', title: 'Nest Fluff', prompt: 'Tap each soft feather to make the nest cozy.', celebration: 'The nest is soft and ready for a rest.', itemEmoji: '🪶', itemLabel: 'soft feather', accent: '#A9CDE2' },
  'brush-bloom': { kind: 'brush-bloom', title: 'Gentle Brush', prompt: 'Tap each brush stroke to help your friend feel calm.', celebration: 'Your friend looks so soft and happy.', itemEmoji: '🪮', itemLabel: 'gentle brush', accent: '#D8B6D9' },
};

export function getCarePlayKind(type: CritterType): CarePlayKind {
  if (type === 'squirrel' || type === 'bear') return 'acorn-tidy';
  if (type === 'bird' || type === 'owl') return 'nest-fluff';
  return 'brush-bloom';
}
