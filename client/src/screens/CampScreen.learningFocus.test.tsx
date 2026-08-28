// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CampScreen from './CampScreen';

vi.mock('../components/BabylonCampScene', () => ({ default: () => <div data-testid="camp-scene" /> }));
vi.mock('../components/CritterAvatar', () => ({ default: () => <div data-testid="critter-avatar" /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn(), playNibble: vi.fn(), playPet: vi.fn(), playTrailStart: vi.fn(), playTrailTreasure: vi.fn(), playWelcome: vi.fn() }));
vi.mock('../game/characterAudio', () => ({ playDailyTrailVoice: vi.fn() }));

describe('CampScreen learning focus', () => {
  it('renders and launches the saved phonics Focus action without a preview override', () => {
    const onStartLearningFocus = vi.fn();
    render(<CampScreen forestHarmony={0} campFlowersCount={0} rescueCount={2} companionType="squirrel" unlockedZones={['meadow']} zoneTaskProgress={{ meadow: 2 }} onStartRescue={vi.fn()} dailyTrail={{ dayKey: '2026-08-28', missions: [], completedKeys: [], rewardEarned: false }} lastDailyReward={null} onStartDailyTrail={vi.fn()} onAcknowledgeDailyReward={vi.fn()} homeCare={{}} onCareHome={vi.fn()} onOpenJournal={vi.fn()} onOpenMatch3={vi.fn()} onOpenNursery={vi.fn()} onOpenParentSettings={vi.fn()} onOpenLearning={vi.fn()} onOpenNatureJournal={vi.fn()} learningTheme="phonics" onStartLearningFocus={onStartLearningFocus} onOpenStorybook={vi.fn()} onOpenCarePlay={vi.fn()} onOpenBedtime={vi.fn()} homeDecor={{}} kindnessMoments={0} season="spring" celebration={null} onClearCelebration={vi.fn()} bedtimeReminderEnabled={false} showPlaytimeSuggestion={false} onDismissPlaytimeSuggestion={vi.fn()} lastNurseryGraduate={null} onAcknowledgeGraduate={vi.fn()} reduceMotion />);
    const focusButton = screen.getByRole('button', { name: /start today’s letter sounds focus/i });
    expect(focusButton).toBeTruthy();
    fireEvent.click(focusButton);
    expect(onStartLearningFocus).toHaveBeenCalledTimes(1);
  });
});
