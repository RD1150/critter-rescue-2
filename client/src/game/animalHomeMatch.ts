export type AnimalHomeMatchChoiceId = 'dogHouse' | 'birdHouse' | 'scratchingPost' | 'mudBath' | 'pond' | 'burrow';

export type AnimalHomeMatchRound = {
  animal: string;
  animalIcon: string;
  correctChoice: AnimalHomeMatchChoiceId;
  choices: readonly AnimalHomeMatchChoiceId[];
};

export const ANIMAL_HOME_MATCH_CHOICES: Record<AnimalHomeMatchChoiceId, { label: string; icon: string; color: string }> = {
  dogHouse: { label: 'Dog house', icon: '🏠', color: '#E9826B' },
  birdHouse: { label: 'Birdhouse', icon: '🐦', color: '#6FAACA' },
  scratchingPost: { label: 'Scratching post', icon: '🪵', color: '#B98461' },
  mudBath: { label: 'Mud bath', icon: '🟤', color: '#AA795D' },
  pond: { label: 'Pond', icon: '🪷', color: '#79B7C8' },
  burrow: { label: 'Burrow', icon: '🕳️', color: '#A77B57' },
};

export const ANIMAL_HOME_MATCH_ROUNDS: readonly AnimalHomeMatchRound[] = [
  { animal: 'Dog', animalIcon: '🐶', correctChoice: 'dogHouse', choices: ['dogHouse', 'birdHouse', 'scratchingPost'] },
  { animal: 'Bird', animalIcon: '🐦', correctChoice: 'birdHouse', choices: ['birdHouse', 'mudBath', 'dogHouse'] },
  { animal: 'Cat', animalIcon: '🐱', correctChoice: 'scratchingPost', choices: ['scratchingPost', 'birdHouse', 'mudBath'] },
  { animal: 'Pig', animalIcon: '🐷', correctChoice: 'mudBath', choices: ['mudBath', 'dogHouse', 'scratchingPost'] },
  { animal: 'Duck', animalIcon: '🦆', correctChoice: 'pond', choices: ['pond', 'birdHouse', 'mudBath'] },
  { animal: 'Rabbit', animalIcon: '🐰', correctChoice: 'burrow', choices: ['burrow', 'dogHouse', 'pond'] },
];
