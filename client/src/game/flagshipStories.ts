import type { CritterData, CritterType, MissionData, MissionType } from './data';

export type FlagshipStoryId = 'pip-flower-path' | 'finn-riverside-crossing' | 'wren-cozy-nest';

export interface FlagshipStory {
  id: FlagshipStoryId;
  title: string;
  eyebrow: string;
  friend: CritterData;
  missionType: MissionType;
  icon: string;
  landmark: string;
  prompt: string;
  bestieLine: string;
  homecomingTitle: string;
  homecomingMessage: string;
  memoryLine: string;
}

function friend(
  id: string,
  name: string,
  type: CritterType,
  personality: string,
  thanksLine: string,
  secondLine: string,
): CritterData {
  return {
    id,
    name,
    type,
    emoji: '',
    personality,
    introLine: `Hi! I’m ${name}.`,
    helpLine: 'We can take one gentle step at a time.',
    thanksLine,
    secondLine,
    encourageLine: 'You are helping so carefully.',
    stuckLine: 'Let’s look together.',
  };
}

const PIP = friend(
  'bird-pip',
  'Pip',
  'bird',
  'cheerful and tiny',
  '“My little path feels safe now.”',
  '“Thank you for helping me find my way home.”',
);

const FINN = friend(
  'fish-finn',
  'Finn',
  'fish',
  'sparkly and quick',
  '“The river feels kind again.”',
  '“You made a safe crossing for me.”',
);

const WREN = friend(
  'bird-wren',
  'Wren',
  'bird',
  'bright and careful',
  '“My willow nest feels soft and safe.”',
  '“Thank you for bringing the cozy pieces together.”',
);

export const FLAGSHIP_STORIES: readonly FlagshipStory[] = [
  {
    id: 'pip-flower-path',
    title: 'Pip’s Flower Path',
    eyebrow: 'First adventure',
    friend: PIP,
    missionType: 'tracing',
    icon: '🌼',
    landmark: 'a flower path and twig nest',
    prompt: 'Pip needs a little path through the flowers.',
    bestieLine: 'You can lead. I’ll stay close.',
    homecomingTitle: 'Pip is home in the sanctuary.',
    homecomingMessage: 'A flower path and a tiny twig nest now wait near camp.',
    memoryLine: 'You and your Bestie made a safe path for Pip.',
  },
  {
    id: 'finn-riverside-crossing',
    title: 'Finn’s Riverside Crossing',
    eyebrow: 'Second adventure',
    friend: FINN,
    missionType: 'riverRescue',
    icon: '🌊',
    landmark: 'a little riverside bridge',
    prompt: 'Finn needs a safe way from the riverbank to the sanctuary.',
    bestieLine: 'Let’s choose one gentle helper at a time.',
    homecomingTitle: 'Finn found the way home.',
    homecomingMessage: 'A small riverside bridge now links a quiet water nook to camp.',
    memoryLine: 'You and your Bestie helped Finn cross the riverside.',
  },
  {
    id: 'wren-cozy-nest',
    title: 'Wren’s Cozy Willow Nest',
    eyebrow: 'Third adventure',
    friend: WREN,
    missionType: 'nestRescue',
    icon: '🌿',
    landmark: 'a willow nest and lantern',
    prompt: 'Wren needs soft, safe pieces for a cozy willow nest.',
    bestieLine: 'We can make one cozy thing at a time.',
    homecomingTitle: 'Wren’s nest is ready.',
    homecomingMessage: 'A willow nest and a warm little lantern now glow beside camp.',
    memoryLine: 'You and your Bestie made a soft home for Wren.',
  },
] as const;

export function getFlagshipStory(id: FlagshipStoryId | null | undefined): FlagshipStory | null {
  return FLAGSHIP_STORIES.find((story) => story.id === id) ?? null;
}

export function getNextFlagshipStory(completed: readonly FlagshipStoryId[]): FlagshipStory | null {
  return FLAGSHIP_STORIES.find((story) => !completed.includes(story.id)) ?? null;
}

export function getFlagshipStoryFriends(completed: readonly FlagshipStoryId[]): CritterData[] {
  return FLAGSHIP_STORIES.filter((story) => completed.includes(story.id)).map((story) => story.friend);
}

export function createFlagshipMission(id: FlagshipStoryId): MissionData {
  const story = getFlagshipStory(id);
  if (!story) throw new Error(`Unknown flagship story: ${id}`);
  const taskIndex = id === 'pip-flower-path' ? 0 : id === 'finn-riverside-crossing' ? -101 : -102;
  return {
    type: story.missionType,
    zone: id === 'pip-flower-path' ? 'meadow' : id === 'finn-riverside-crossing' ? 'riverside' : 'deepwoods',
    critter: story.friend,
    scenarioText: story.prompt,
    hintText: id === 'pip-flower-path'
      ? 'Follow Pip’s glowing flower dots.'
      : id === 'finn-riverside-crossing'
        ? 'Choose the river helpers in a safe order.'
        : 'Choose the soft nest helpers in a cozy order.',
    objectCount: 3,
    difficulty: 1,
    requiresOrder: id !== 'pip-flower-path',
    taskIndex,
    introText: story.prompt,
    flagshipStoryId: story.id,
  };
}

export function getFlagshipStoryForMission(mission: MissionData): FlagshipStory | null {
  return getFlagshipStory(mission.flagshipStoryId);
}
