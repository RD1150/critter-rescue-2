import type { CritterType } from './data';

export interface TeamRescue {
  id: 'helpers-find-wren';
  helpers: { name: string; type: CritterType }[];
  friend: { name: string; type: CritterType };
  title: string;
  prompt: string;
  steps: { emoji: string; label: string }[];
  celebration: string;
}

export const TEAM_RESCUE: TeamRescue = {
  id: 'helpers-find-wren',
  helpers: [{ name: 'Nutty', type: 'squirrel' }, { name: 'Pip', type: 'bird' }],
  friend: { name: 'Wren', type: 'bird' },
  title: 'Friends Help Wren',
  prompt: 'Wren is listening for her nest. You, Nutty, and Pip can help her look in two small ways.',
  steps: [{ emoji: '🍃', label: 'Lift a leaf' }, { emoji: '🏡', label: 'Show the nest' }],
  celebration: 'Nutty and Pip helped you guide Wren home. What kind friends you are together!',
};
