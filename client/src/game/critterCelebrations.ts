import type { CritterType } from './data';

export type CelebrationMotionName = 'happy-hop' | 'side-sway' | 'cozy-twirl';
export type CareCelebration = { name: string; type: CritterType; icon: string; line: string; variation: 0 | 1 | 2; variationName: string; motion: CelebrationMotionName };
type CelebrationDetail = Omit<CareCelebration, 'name' | 'type' | 'variation'>;

const BURROW_TYPES: CritterType[] = ['squirrel', 'fox', 'hedgehog', 'bear', 'beaver'];
const WING_TYPES: CritterType[] = ['owl', 'bird', 'eagle', 'bee', 'ladybug'];
const WATER_TYPES: CritterType[] = ['frog', 'otter', 'turtle', 'fish', 'duck'];

const FAMILY_VARIATIONS: Record<'burrow' | 'wing' | 'water' | 'meadow', CelebrationDetail[]> = {
  burrow: [
    { icon: '🌰', variationName: 'Tail wiggle', motion: 'side-sway', line: 'A bright little tail wiggle says thank you!' },
    { icon: '💛', variationName: 'Cozy nuzzle', motion: 'cozy-twirl', line: 'A tiny cozy nuzzle says, “That felt kind.”' },
    { icon: '🍃', variationName: 'Happy scamper', motion: 'happy-hop', line: 'A soft happy scamper circles the home.' },
  ],
  wing: [
    { icon: '🪶', variationName: 'Wing wiggle', motion: 'side-sway', line: 'A soft wing wiggle says thank you!' },
    { icon: '✨', variationName: 'Feather flutter', motion: 'happy-hop', line: 'A tiny feather flutter makes the camp sparkle.' },
    { icon: '🎵', variationName: 'Gentle glide', motion: 'cozy-twirl', line: 'A calm little glide celebrates your care.' },
  ],
  water: [
    { icon: '💧', variationName: 'Ripple hello', motion: 'happy-hop', line: 'A small ripple hello says thank you!' },
    { icon: '🫧', variationName: 'Bubble swirl', motion: 'cozy-twirl', line: 'A bubbly little swirl makes the water shine.' },
    { icon: '🌊', variationName: 'Pond sway', motion: 'side-sway', line: 'A gentle pond sway says, “I feel safe.”' },
  ],
  meadow: [
    { icon: '🌼', variationName: 'Meadow wiggle', motion: 'side-sway', line: 'A sunny little wiggle says thank you!' },
    { icon: '☀️', variationName: 'Warm stretch', motion: 'cozy-twirl', line: 'A warm stretch makes this cozy corner glow.' },
    { icon: '🌱', variationName: 'Soft hop', motion: 'happy-hop', line: 'A gentle happy hop celebrates your care.' },
  ],
};

function familyFor(type: CritterType): keyof typeof FAMILY_VARIATIONS {
  if (BURROW_TYPES.includes(type)) return 'burrow';
  if (WING_TYPES.includes(type)) return 'wing';
  if (WATER_TYPES.includes(type)) return 'water';
  return 'meadow';
}

export function getCareCelebration(name: string, type: CritterType, careMoment = 0): CareCelebration {
  const variation = (careMoment > 0 ? (careMoment - 1) % 3 : 0) as 0 | 1 | 2;
  return { name, type, variation, ...FAMILY_VARIATIONS[familyFor(type)][variation] };
}

export function getCelebrationMotion(type: CritterType, variation: 0 | 1 | 2 = 0): { hop: number; sway: number; speed: number; twist: number } {
  const base = ['bunny', 'frog', 'goat'].includes(type) ? { hop: 0.34, sway: 0.06, speed: 9.2, twist: 0.08 }
    : WING_TYPES.includes(type) ? { hop: 0.2, sway: 0.16, speed: 11, twist: 0.12 }
      : ['squirrel', 'fox', 'otter', 'lizard'].includes(type) ? { hop: 0.16, sway: 0.2, speed: 8.1, twist: 0.17 }
        : { hop: 0.1, sway: 0.09, speed: 6.5, twist: 0.08 };
  if (variation === 1) return { ...base, hop: base.hop * 0.72, sway: base.sway * 1.45, speed: base.speed * 0.9, twist: base.twist * 1.6 };
  if (variation === 2) return { ...base, hop: base.hop * 1.18, sway: base.sway * 0.75, speed: base.speed * 1.16, twist: base.twist * 0.65 };
  return base;
}
