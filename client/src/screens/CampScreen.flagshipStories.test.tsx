// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CampScreen from './CampScreen';

vi.mock('../components/BabylonCampScene', () => ({ default: () => <div data-testid="camp-scene" /> }));
vi.mock('../components/CritterAvatar', () => ({ default: ({ type }: { type: string }) => <span aria-label={`${type} plush`} /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn(), playNibble: vi.fn(), playPet: vi.fn(), playTrailStart: vi.fn(), playTrailTreasure: vi.fn(), playWelcome: vi.fn() }));
vi.mock('../game/characterAudio', () => ({ playDailyTrailVoice: vi.fn() }));

function renderCamp(stories: ('pip-flower-path' | 'finn-riverside-crossing' | 'wren-cozy-nest')[]) {
  const onStartFlagshipStory = vi.fn();
  const onOpenStorybook = vi.fn();
  render(<CampScreen forestHarmony={0} campFlowersCount={0} rescueCount={stories.length} companionType="fox" flagshipStoryIds={stories} onStartFlagshipStory={onStartFlagshipStory} bestieCareMoments={0} onCareBestie={vi.fn()} lastFlagshipHomecoming={null} onAcknowledgeFlagshipHomecoming={vi.fn()} unlockedZones={['meadow']} zoneTaskProgress={{ meadow: 0, riverside: 0, deepwoods: 0, mountain: 0 }} onStartRescue={vi.fn()} dailyTrail={{ dayKey: '2026-11-02', missions: [], completedKeys: [], rewardEarned: false }} lastDailyReward={null} onStartDailyTrail={vi.fn()} onAcknowledgeDailyReward={vi.fn()} homeCare={{}} onCareHome={vi.fn()} onOpenJournal={vi.fn()} onOpenMatch3={vi.fn()} onOpenNursery={vi.fn()} onOpenParentSettings={vi.fn()} onOpenLearning={vi.fn()} onOpenNatureJournal={vi.fn()} onOpenWeatherWonder={vi.fn()} celebrationPath={null} onOpenCelebrationPath={vi.fn()} onOpenTeamRescue={vi.fn()} learningTheme="all" onStartLearningFocus={vi.fn()} onOpenStorybook={onOpenStorybook} onOpenCarePlay={vi.fn()} onOpenBedtime={vi.fn()} homeDecor={{}} kindnessMoments={0} season="spring" celebration={null} onClearCelebration={vi.fn()} bedtimeReminderEnabled={false} showPlaytimeSuggestion={false} onDismissPlaytimeSuggestion={vi.fn()} lastNurseryGraduate={null} onAcknowledgeGraduate={vi.fn()} reduceMotion />);
  return { onStartFlagshipStory, onOpenStorybook };
}

describe('focused Bestie Camp flow', () => {
  it('shows Finn as the single primary next adventure after Pip', () => {
    const { onStartFlagshipStory } = renderCamp(['pip-flower-path']);
    expect(screen.getByText(/Finn needs a safe way/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Help Finn' }));
    expect(onStartFlagshipStory).toHaveBeenCalledTimes(1);
  });

  it('rests in the sanctuary and points to the Bestie Book after the third story', () => {
    const { onOpenStorybook } = renderCamp(['pip-flower-path', 'finn-riverside-crossing', 'wren-cozy-nest']);
    expect(screen.getByText('Your Bestie’s sanctuary is feeling cozy.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Bestie Book' }));
    expect(onOpenStorybook).toHaveBeenCalledTimes(1);
  });
});
