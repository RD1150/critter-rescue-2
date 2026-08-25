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
  'ripple-refill': { kind: 'ripple-refill', title: 'Ripple Refill', prompt: 'Tap each water drop to make a fresh little pond ripple.', celebration: 'The water spot looks cool, clear, and welcoming.', itemEmoji: '💧', itemLabel: 'water drop', accent: '#6EB9CE' },
  'garden-sprinkle': { kind: 'garden-sprinkle', title: 'Garden Sprinkle', prompt: 'Tap each tiny sprinkle to help the garden flowers drink.', celebration: 'The garden looks bright and happy after your care.', itemEmoji: '💦', itemLabel: 'garden sprinkle', accent: '#8FCB84' },
};

export function getCarePlayKind(type: CritterType): CarePlayKind {
  if (type === 'frog' || type === 'otter' || type === 'turtle' || type === 'fish' || type === 'duck') return 'ripple-refill';
  if (type === 'bee' || type === 'ladybug' || type === 'snail' || type === 'lizard' || type === 'goat' || type === 'bunny') return 'garden-sprinkle';
  if (type === 'squirrel' || type === 'bear') return 'acorn-tidy';
  if (type === 'bird' || type === 'owl') return 'nest-fluff';
  return 'brush-bloom';
}
