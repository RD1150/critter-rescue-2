// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CampScreen from './CampScreen';

vi.mock('../components/BabylonCampScene', () => ({ default: () => <div data-testid="camp-scene" /> }));
vi.mock('../components/CritterAvatar', () => ({ default: () => <div data-testid="critter-avatar" /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn(), playNibble: vi.fn(), playPet: vi.fn(), playTrailStart: vi.fn(), playTrailTreasure: vi.fn(), playWelcome: vi.fn() }));
vi.mock('../game/characterAudio', () => ({ playDailyTrailVoice: vi.fn() }));

const renderFirstGuide = () => {
  window.localStorage.setItem('critter-rescue-audio-preferences', JSON.stringify({ spokenDirectionsEnabled: true, captionsEnabled: true }));
  const onStartRescue = vi.fn();
  const view = render(<CampScreen forestHarmony={0} campFlowersCount={0} rescueCount={0} companionType="fox" unlockedZones={['meadow']} zoneTaskProgress={{ meadow: 0 }} onStartRescue={onStartRescue} dailyTrail={{ dayKey: '2026-08-29', missions: [], completedKeys: [], rewardEarned: false }} lastDailyReward={null} onStartDailyTrail={vi.fn()} onAcknowledgeDailyReward={vi.fn()} homeCare={{}} onCareHome={vi.fn()} onOpenJournal={vi.fn()} onOpenMatch3={vi.fn()} onOpenNursery={vi.fn()} onOpenParentSettings={vi.fn()} onOpenLearning={vi.fn()} onOpenNatureJournal={vi.fn()} onOpenWeatherWonder={vi.fn()} celebrationPath={null} onOpenCelebrationPath={vi.fn()} onOpenTeamRescue={vi.fn()} learningTheme="all" onStartLearningFocus={vi.fn()} onOpenStorybook={vi.fn()} onOpenCarePlay={vi.fn()} onOpenBedtime={vi.fn()} homeDecor={{}} kindnessMoments={0} season="spring" celebration={null} onClearCelebration={vi.fn()} bedtimeReminderEnabled={false} showPlaytimeSuggestion={false} onDismissPlaytimeSuggestion={vi.fn()} lastNurseryGraduate={null} onAcknowledgeGraduate={vi.fn()} reduceMotion />);
  return { onStartRescue, ...view };
};

describe('CampScreen first-play rescue guide', () => {
  it('presents Pip as one calm rescue path with one picture cue, one Listen control, and a distinct secondary action', () => {
    const { container } = renderFirstGuide();
    const guide = within(container).getByRole('dialog', { name: 'Pip needs a little path.' });
    expect(within(guide).getByRole('heading', { name: 'Pip needs a little path.' })).toBeTruthy();
    expect(screen.getByText('“We’ll do this together.”')).toBeTruthy();
    expect(within(guide).getByRole('button', { name: /Listen to direction:/ })).toBeTruthy();
    expect(within(guide).getByRole('img', { name: /Picture clue:/ })).toBeTruthy();
    expect(within(guide).getByRole('button', { name: 'Help Pip' })).toBeTruthy();
    expect(within(guide).getByRole('button', { name: 'Explore the sanctuary' })).toBeTruthy();
    expect(within(guide).queryByText(/Three easy steps/i)).toBeNull();
  });

  it('uses a compact Critter Rescue fallback mark if the sanctuary logo cannot load', () => {
    const { container } = renderFirstGuide();
    fireEvent.error(within(container).getByAltText('Critter Rescue'));
    expect(within(container).getByRole('img', { name: 'Critter Rescue' })).toBeTruthy();
    expect(within(container).getByText('CR')).toBeTruthy();
  });

  it('lets a child explore first without starting or removing access to the game', () => {
    const { onStartRescue, container } = renderFirstGuide();
    fireEvent.click(within(container).getByRole('button', { name: 'Explore the sanctuary' }));
    expect(within(container).queryByRole('heading', { name: 'Pip needs a little path.' })).toBeNull();
    expect(onStartRescue).not.toHaveBeenCalled();
    expect(within(container).getByRole('button', { name: 'Open storybook' })).toBeTruthy();
    expect(within(container).getByRole('button', { name: 'Open parent settings' })).toBeTruthy();
  });
});
