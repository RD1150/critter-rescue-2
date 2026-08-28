// Sparse character dialogue. Text is always available; recorded audio is added only after a voice is approved.
import type { CritterType, MissionData, MissionType } from './data';

export type RescueDialogue = {
  introduction: string;
  helpCall: string;
  thankYou: string;
  voiceSetting: string;
};

const TASK_HELP: Record<MissionType, string> = {
  bridge: 'Help me build a safe path across!',
  clearPath: 'Help me clear the safe way home!',
  shelter: 'Help me make a cozy, dry shelter!',
  guidePath: 'Help me light the way home!',
  memory: 'Help me find the matching pictures!',
  pattern: 'Help me watch and copy the pattern!',
  maze: 'Help me trace the safe path!',
  gather: 'Help me collect the good things!',
  tracing: 'Help me trace the dotted path!',
  sorting: 'Help me put each thing in the right place!',
  counting: 'Help me count and tap them all!',
  shapeFit: 'Help me put every shape in its home!',
  spotDifference: 'Help me find what changed!',
  sequence: 'Help me put the pictures in order!',
  findTools: 'Help me find all the rescue tools!',
  colorMatch: 'Help me match the same colors!',
  sizeOrdering: 'Help me put these from smallest to biggest!',
  critterPath: 'Help me find the safe trail!',
  quietCount: 'Help me count three little berries!',
  pictureRhyme: 'Help me find the picture rhyme for bee!',
};

const VOICE_SETTINGS: Record<CritterType, string> = {
  bunny: 'Gentle plush bunny; bright soft warmth, comforting, clear, quiet confidence.',
  squirrel: 'Bright high cartoon squirrel; bouncy, warm, lightly squeaky, crisp words.',
  bird: 'Tiny bubbly cartoon bird; bright, chirpy, eager, easy to understand.',
  ladybug: 'Curious tiny bug; sparkling, friendly, quick, soft cartoon energy.',
  frog: 'Bubbly cartoon frog; cheerful, giggly, rounded, playful delivery.',
  fox: 'Clever woodland fox; warm medium pitch, playful, quick, lightly mischievous.',
  owl: 'Gentle storybook owl; calm, clear, observant, softly melodic.',
  otter: 'Splashy playful otter; bright, bouncy, friendly, upbeat delivery.',
  turtle: 'Patient cartoon turtle; soft low warmth, slow and reassuring pace.',
  fish: 'Sparkly little fish; bright, quick, delighted, clear bubbly delivery.',
  duck: 'Cozy caring duck; warm, gentle, comforting storybook delivery.',
  hedgehog: 'Quiet cartoon hedgehog; shy, soft, kind, gentle low warmth.',
  snail: 'Thoughtful garden snail; warm, unhurried, sweet, clear pauses.',
  lizard: 'Curious cartoon lizard; sunny, energetic, bold, friendly warmth.',
  bee: 'Busy bright bee; brisk, playful, high and cheerful without buzzing effects.',
  eagle: 'Proud friendly eagle; clear, noble, warm, encouraging medium pitch.',
  goat: 'Sweet stubborn goat; bouncy, cheerful, slightly determined cartoon voice.',
  beaver: 'Steady little builder; warm lower pitch, industrious, kind, calm.',
  bear: 'Cozy gentle bear; warm, rich, unhurried, safe storybook delivery.',
};

const INTRO_OVERRIDES: Partial<Record<string, string>> = {
  Nutty: 'Hi, I’m Nutty! I know every acorn, shortcut, and silly little trail in these woods.',
};

export function getRescueDialogue(mission: MissionData): RescueDialogue {
  return {
    introduction: INTRO_OVERRIDES[mission.critter.name] ?? mission.critter.introLine,
    helpCall: TASK_HELP[mission.type],
    thankYou: mission.critter.thanksLine.replaceAll('"', ''),
    voiceSetting: VOICE_SETTINGS[mission.critter.type],
  };
}

export function getTaskHelpLine(type: MissionType): string {
  return TASK_HELP[type];
}
