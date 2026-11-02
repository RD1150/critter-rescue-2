import { describe, expect, it } from 'vitest';
import { createFlagshipMission, FLAGSHIP_STORIES, getFlagshipStoryForMission, getNextFlagshipStory } from './flagshipStories';

describe('focused Bestie stories', () => {
  it('keeps Pip, Finn, and Wren in one durable, calm story order', () => {
    expect(FLAGSHIP_STORIES.map((story) => story.id)).toEqual([
      'pip-flower-path',
      'finn-riverside-crossing',
      'wren-cozy-nest',
    ]);
    expect(new Set(FLAGSHIP_STORIES.map((story) => story.friend.id)).size).toBe(3);
    expect(getNextFlagshipStory([])?.friend.name).toBe('Pip');
    expect(getNextFlagshipStory(['pip-flower-path'])?.friend.name).toBe('Finn');
    expect(getNextFlagshipStory(['pip-flower-path', 'finn-riverside-crossing'])?.friend.name).toBe('Wren');
    expect(getNextFlagshipStory(['pip-flower-path', 'finn-riverside-crossing', 'wren-cozy-nest'])).toBeNull();
  });

  it('creates story missions without depending on broad zone task positions', () => {
    const riverMission = createFlagshipMission('finn-riverside-crossing');
    const nestMission = createFlagshipMission('wren-cozy-nest');

    expect(riverMission).toMatchObject({ type: 'riverRescue', taskIndex: -101, flagshipStoryId: 'finn-riverside-crossing', critter: { name: 'Finn' } });
    expect(nestMission).toMatchObject({ type: 'nestRescue', taskIndex: -102, flagshipStoryId: 'wren-cozy-nest', critter: { name: 'Wren' } });
    expect(getFlagshipStoryForMission(riverMission)?.landmark).toContain('bridge');
    expect(getFlagshipStoryForMission(nestMission)?.landmark).toContain('nest');
  });
});
