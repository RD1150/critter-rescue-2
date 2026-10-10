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
  picture: { before: string; after: string; action: string };
}

export const CARE_PLAY_DETAILS: Record<CarePlayKind, CarePlayDetails> = {
  'acorn-tidy': { kind: 'acorn-tidy', title: 'Acorn Tidy', prompt: 'Tap each shiny acorn to tuck it into the basket.', celebration: 'The acorns are tucked in. What a cozy stash!', itemEmoji: '🌰', itemLabel: 'shiny acorn', accent: '#E8B772', picture: { before: '🌰  🌰  🌰', after: '🧺✨', action: 'Tuck' } },
  'nest-fluff': { kind: 'nest-fluff', title: 'Nest Fluff', prompt: 'Tap a soft feather, then place it in the nest.', celebration: 'The nest is soft and ready for a rest.', itemEmoji: '🪶', itemLabel: 'soft feather', accent: '#A9CDE2', picture: { before: '🪺', after: '🪺🪶✨', action: 'Place' } },
  'brush-bloom': { kind: 'brush-bloom', title: 'Gentle Brush', prompt: 'Tap the brush, then brush your friend until their fur looks tidy.', celebration: 'Your friend looks so soft and happy.', itemEmoji: '🪮', itemLabel: 'gentle brush', accent: '#D8B6D9', picture: { before: '〰️', after: '✨', action: 'Brush' } },
  'ripple-refill': { kind: 'ripple-refill', title: 'Ripple Refill', prompt: 'Tap a water drop, then fill the little pond.', celebration: 'The water spot looks cool, clear, and welcoming.', itemEmoji: '💧', itemLabel: 'water drop', accent: '#6EB9CE', picture: { before: '◌', after: '💧〰️', action: 'Pour' } },
  'garden-sprinkle': { kind: 'garden-sprinkle', title: 'Garden Sprinkle', prompt: 'Tap a water drop, then give each sleepy flower a drink.', celebration: 'The garden looks bright and happy after your care.', itemEmoji: '💦', itemLabel: 'garden sprinkle', accent: '#8FCB84', picture: { before: '🌱', after: '🌸✨', action: 'Water' } },
};

export function getCarePlayKind(type: CritterType): CarePlayKind {
  if (type === 'frog' || type === 'otter' || type === 'turtle' || type === 'fish' || type === 'duck' || type === 'octopus') return 'ripple-refill';
  if (type === 'bee' || type === 'ladybug' || type === 'butterfly' || type === 'snail' || type === 'lizard' || type === 'goat' || type === 'bunny') return 'garden-sprinkle';
  if (type === 'squirrel' || type === 'bear') return 'acorn-tidy';
  if (type === 'bird' || type === 'owl' || type === 'cricket') return 'nest-fluff';
  return 'brush-bloom';
}
