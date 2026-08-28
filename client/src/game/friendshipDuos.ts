import type { CritterData, CritterType } from './data';
import type { PreReaderDirectionKey } from './preReaderDirections';

export type FriendshipDuo = {
  id: 'nutty-pip' | 'splash-thistle' | 'clover-shadow';
  names: [string, string];
  types: [CritterType, CritterType];
  title: string;
  prompt: string;
  steps: Array<{ emoji: string; label: string }>;
  celebration: string;
  accent: string;
  directionKey: PreReaderDirectionKey;
};

export const FRIENDSHIP_DUOS: FriendshipDuo[] = [
  { id: 'nutty-pip', names: ['Nutty', 'Pip'], types: ['squirrel', 'bird'], title: 'Nest & Nibble', prompt: 'Nutty and Pip can share a soft leaf and a berry snack.', steps: [{ emoji: '🍃', label: 'Soft leaf' }, { emoji: '🍓', label: 'Berry snack' }], celebration: 'Nutty and Pip made a cozy little care team!', accent: '#E66B5B', directionKey: 'friendshipDuoNuttyPip' },
  { id: 'splash-thistle', names: ['Splash', 'Thistle'], types: ['otter', 'bee'], title: 'Ripple & Bloom', prompt: 'Splash and Thistle can bring a ripple and a flower to the shared garden.', steps: [{ emoji: '💧', label: 'Kind ripple' }, { emoji: '🌼', label: 'Garden bloom' }], celebration: 'Splash and Thistle cared for their shared garden together!', accent: '#5FAED6', directionKey: 'friendshipDuoSplashThistle' },
  { id: 'clover-shadow', names: ['Clover', 'Shadow'], types: ['bunny', 'hedgehog'], title: 'Moonlit Tuck', prompt: 'Clover and Shadow can tuck a little blanket beneath a friendly moon.', steps: [{ emoji: '🧶', label: 'Tiny blanket' }, { emoji: '🌙', label: 'Moonlight wish' }], celebration: 'Clover and Shadow made a quiet, caring nook together!', accent: '#8C78B7', directionKey: 'friendshipDuoCloverShadow' },
];

export function getAvailableFriendshipDuos(rescuedCritters: CritterData[]): FriendshipDuo[] {
  const names = new Set(rescuedCritters.map((critter) => critter.name));
  return FRIENDSHIP_DUOS.filter((duo) => duo.names.every((name) => names.has(name)));
}
