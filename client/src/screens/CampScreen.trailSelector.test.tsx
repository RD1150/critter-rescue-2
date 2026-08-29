// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CampScreen from './CampScreen';

vi.mock('../components/BabylonCampScene', () => ({ default: () => <div data-testid="camp-scene" /> }));
vi.mock('../components/CritterAvatar', () => ({ default: () => <div data-testid="critter-avatar" /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn(), playNibble: vi.fn(), playPet: vi.fn(), playTrailStart: vi.fn(), playTrailTreasure: vi.fn(), playWelcome: vi.fn() }));
vi.mock('../game/characterAudio', () => ({ playDailyTrailVoice: vi.fn() }));

describe('CampScreen child-first trail selector', () => {
  it('highlights one ready trail with a simple next-step cue and keeps later trails understandable', () => {
    vi.useFakeTimers();
    const onStartRescue = vi.fn();
    const { container } = render(<CampScreen forestHarmony={20} campFlowersCount={0} rescueCount={2} companionType="fox" unlockedZones={['meadow', 'riverside']} zoneTaskProgress={{ meadow: 2, riverside: 0, deepwoods: 0, mountain: 0 }} onStartRescue={onStartRescue} dailyTrail={{ dayKey: '2026-08-29', missions: [], completedKeys: [], rewardEarned: false }} lastDailyReward={null} onStartDailyTrail={vi.fn()} onAcknowledgeDailyReward={vi.fn()} homeCare={{}} onCareHome={vi.fn()} onOpenJournal={vi.fn()} onOpenMatch3={vi.fn()} onOpenNursery={vi.fn()} onOpenParentSettings={vi.fn()} onOpenLearning={vi.fn()} onOpenNatureJournal={vi.fn()} onOpenWeatherWonder={vi.fn()} celebrationPath={null} onOpenCelebrationPath={vi.fn()} onOpenTeamRescue={vi.fn()} learningTheme="all" onStartLearningFocus={vi.fn()} onOpenStorybook={vi.fn()} onOpenCarePlay={vi.fn()} onOpenBedtime={vi.fn()} homeDecor={{}} kindnessMoments={0} season="spring" celebration={null} onClearCelebration={vi.fn()} bedtimeReminderEnabled={false} showPlaytimeSuggestion={false} onDismissPlaytimeSuggestion={vi.fn()} lastNurseryGraduate={null} onAcknowledgeGraduate={vi.fn()} reduceMotion />);

    fireEvent.click(within(container).getAllByRole('button', { name: 'Find a Friend' })[0]);
    const picker = within(container).getByRole('dialog', { name: 'Pick a rescue trail' });
    expect(within(picker).getByText(/Start with the card that says/i)).toBeTruthy();
    expect(within(picker).getByRole('button', { name: /Sunny Meadow: Ready now/i })).toBeTruthy();
    expect(within(picker).getByRole('button', { name: /Deep Woods: Not ready yet/i })).toBeTruthy();
    fireEvent.click(within(picker).getByRole('button', { name: /Sunny Meadow: Ready now/i }));
    vi.advanceTimersByTime(180);
    expect(onStartRescue).toHaveBeenCalledWith('meadow');
    vi.useRealTimers();
  });
});
