export interface SyllableClapChoice {
  emoji: string;
  label: string;
  claps: number;
  correct: boolean;
}

export interface SyllableClapPattern {
  clue: string;
  prompt: string;
  choices: SyllableClapChoice[];
  success: string;
}

export const SYLLABLE_CLAP_PATTERNS: SyllableClapPattern[] = [
  { clue: 'Two little claps', prompt: 'Which picture has two claps in its name?', choices: [{ emoji: '🐢', label: 'turtle', claps: 2, correct: true }, { emoji: '🦋', label: 'butterfly', claps: 3, correct: false }, { emoji: '🐝', label: 'bee', claps: 1, correct: false }], success: 'Tur-tle! Two claps. Cricket loves that gentle rhythm.' },
  { clue: 'Two little claps', prompt: 'Here is one more cozy two-clap name. Which picture fits?', choices: [{ emoji: '🌰', label: 'acorn', claps: 2, correct: true }, { emoji: '🦊', label: 'fox', claps: 1, correct: false }, { emoji: '🐞', label: 'ladybug', claps: 3, correct: false }], success: 'A-corn! Two claps. You found another cozy rhythm.' },
  { clue: 'Three little claps', prompt: 'Now Cricket hears three little claps. Which picture fits?', choices: [{ emoji: '🦋', label: 'butterfly', claps: 3, correct: true }, { emoji: '🐢', label: 'turtle', claps: 2, correct: false }, { emoji: '🦉', label: 'owl', claps: 1, correct: false }], success: 'But-ter-fly! Three claps. Cricket’s meadow song is ready!' },
];
