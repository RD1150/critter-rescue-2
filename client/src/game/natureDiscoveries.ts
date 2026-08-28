import type { SanctuarySeason } from './store';

export type NatureDiscoveryKey = 'spring-bud' | 'summer-cloud' | 'autumn-leaf' | 'winter-moon';

export interface NatureDiscovery {
  key: NatureDiscoveryKey;
  season: SanctuarySeason;
  icon: string;
  title: string;
  observation: string;
  gentleQuestion: string;
}

export const NATURE_DISCOVERIES: Record<NatureDiscoveryKey, NatureDiscovery> = {
  'spring-bud': { key: 'spring-bud', season: 'spring', icon: '🌱', title: 'Tiny green bud', observation: 'A small bud is waking up near the soft moss.', gentleQuestion: 'Can you spot something else that looks new?' },
  'summer-cloud': { key: 'summer-cloud', season: 'summer', icon: '☁️', title: 'Slow cloud', observation: 'A puffy cloud is drifting above the warm sanctuary.', gentleQuestion: 'What shape do you see in the cloud?' },
  'autumn-leaf': { key: 'autumn-leaf', season: 'autumn', icon: '🍂', title: 'Amber leaf', observation: 'A crinkly leaf has twirled down beside the campfire.', gentleQuestion: 'Can you find another warm-colored leaf?' },
  'winter-moon': { key: 'winter-moon', season: 'winter', icon: '🌙', title: 'Silver moon', observation: 'The quiet moon is shining on the sleepy snowy trees.', gentleQuestion: 'What looks soft and still tonight?' },
};

export function getNatureDiscoveryForSeason(season: SanctuarySeason): NatureDiscovery {
  return NATURE_DISCOVERIES[`${season}-${season === 'spring' ? 'bud' : season === 'summer' ? 'cloud' : season === 'autumn' ? 'leaf' : 'moon'}` as NatureDiscoveryKey];
}
