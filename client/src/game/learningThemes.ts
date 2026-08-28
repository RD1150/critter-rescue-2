export type LearningTheme = 'all' | 'phonics' | 'numbers' | 'rhymes' | 'nature';

export const LEARNING_THEME_DETAILS: Record<LearningTheme, { icon: string; label: string; description: string; childNote: string }> = {
  all: { icon: '🌈', label: 'A little of everything', description: 'Keeps all gentle learning activities available.', childNote: 'Today we can follow any cozy clue.' },
  phonics: { icon: '🔤', label: 'Letter sounds', description: 'Gives picture-led letter-sound rescues a small spotlight.', childNote: 'Today we can listen for first sounds.' },
  numbers: { icon: '🍓', label: 'Counting', description: 'Gives visual counting activities a small spotlight.', childNote: 'Today we can count little treasures.' },
  rhymes: { icon: '🎵', label: 'Rhymes', description: 'Gives picture-rhyme activities a small spotlight.', childNote: 'Today we can listen for words that sound alike.' },
  nature: { icon: '🌦️', label: 'Nature & weather', description: 'Gives seasonal discoveries and weather observations a small spotlight.', childNote: 'Today we can notice what the sanctuary is doing.' },
};
