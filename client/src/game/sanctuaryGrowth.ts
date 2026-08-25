export interface SanctuaryGrowthStage {
  level: number;
  title: string;
  message: string;
  unlockAt: number;
  icon: string;
  propKey: 'kindness-arbor' | 'ripple-bowl' | 'bloom-garden' | null;
}

export const SANCTUARY_GROWTH_STAGES: SanctuaryGrowthStage[] = [
  { level: 0, title: 'Kindness Seeds', message: 'Each gentle care moment helps the sanctuary feel more like home.', unlockAt: 0, icon: '🌱', propKey: null },
  { level: 1, title: 'Welcome Arbor', message: 'A little arch of welcome has grown beside the campfire.', unlockAt: 3, icon: '🌿', propKey: 'kindness-arbor' },
  { level: 2, title: 'Ripple Bowl', message: 'A calm water bowl now welcomes pond friends and quiet moments.', unlockAt: 8, icon: '💧', propKey: 'ripple-bowl' },
  { level: 3, title: 'Bloom Garden', message: 'A shared garden is blooming with every kind action.', unlockAt: 15, icon: '🌼', propKey: 'bloom-garden' },
];

export function getSanctuaryGrowth(kindnessMoments: number): SanctuaryGrowthStage {
  return [...SANCTUARY_GROWTH_STAGES].reverse().find((stage) => kindnessMoments >= stage.unlockAt) ?? SANCTUARY_GROWTH_STAGES[0];
}

export function getNextSanctuaryGrowth(kindnessMoments: number): SanctuaryGrowthStage | null {
  return SANCTUARY_GROWTH_STAGES.find((stage) => stage.unlockAt > kindnessMoments) ?? null;
}

export function getKindnessMoments(homeCare: Record<string, number>, nurseryVisits: number, carePlayWins: Record<string, number>): number {
  return Object.values(homeCare).reduce((total, count) => total + count, 0)
    + nurseryVisits
    + Object.values(carePlayWins).reduce((total, count) => total + count, 0);
}
