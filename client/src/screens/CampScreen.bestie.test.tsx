// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CampScreen from './CampScreen';
import { getStarterCompanion, type CritterData } from '../game/data';
import { getAudioPreferences, saveAudioPreferences } from '../game/audioPreferences';
import { hasCharacterAudio, playCharacterAudio } from '../game/characterAudio';
import { playNibble, playPet } from '../game/sounds';
import { CELEBRATION_PATHS } from '../game/celebrationPaths';

vi.mock('../components/BabylonCampScene', () => ({
  default: ({ onCompanionClick, onHomeClick, rescuedCritters }: { onCompanionClick: () => void; onHomeClick: (friend: CritterData) => void; rescuedCritters: CritterData[] }) => <div data-testid="camp-scene"><button onClick={onCompanionClick}>Scene companion</button><button onClick={() => onHomeClick(rescuedCritters[0])}>Scene home</button></div>,
}));
vi.mock('../components/CritterAvatar', () => ({
  default: ({ type, size, expression, animate }: { type: string; size: number; expression: string; animate?: boolean }) => <span role="img" aria-label={`${type} plush`} data-size={size} data-expression={expression} data-animate={Boolean(animate)} />,
}));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn(), playNibble: vi.fn(), playPet: vi.fn(), playTrailStart: vi.fn(), playTrailTreasure: vi.fn(), playWelcome: vi.fn() }));
vi.mock('../game/characterAudio', () => ({ playDailyTrailVoice: vi.fn(), playCharacterAudio: vi.fn(), hasCharacterAudio: vi.fn(() => true) }));

type CampProps = React.ComponentProps<typeof CampScreen>;
function renderCamp(overrides: Partial<CampProps> = {}, wrapper?: React.ComponentType<{ children: React.ReactNode }>) {
  const props: CampProps = {
    forestHarmony: 0, campFlowersCount: 0, rescueCount: 1, companionType: 'fox',
    flagshipStoryIds: ['pip-flower-path'], onStartFlagshipStory: vi.fn(), bestieCareMoments: 987,
    onCareBestie: vi.fn(() => 988), lastFlagshipHomecoming: null, onAcknowledgeFlagshipHomecoming: vi.fn(),
    unlockedZones: ['meadow'], zoneTaskProgress: { meadow: 0 }, onStartRescue: vi.fn(),
    dailyTrail: { dayKey: '2026-11-21', missions: [], completedKeys: [], rewardEarned: false },
    lastDailyReward: null, onStartDailyTrail: vi.fn(), onAcknowledgeDailyReward: vi.fn(),
    homeCare: { 'pip-flower-path': 4321 }, onCareHome: vi.fn(() => 1),
    onOpenJournal: vi.fn(), onOpenMatch3: vi.fn(), onOpenNursery: vi.fn(), onOpenParentSettings: vi.fn(),
    onOpenLearning: vi.fn(), onOpenNatureJournal: vi.fn(), onOpenWeatherWonder: vi.fn(),
    celebrationPath: null, onOpenCelebrationPath: vi.fn(), onOpenTeamRescue: vi.fn(),
    learningTheme: 'phonics', onStartLearningFocus: vi.fn(), onOpenStorybook: vi.fn(),
    onOpenCarePlay: vi.fn(), onOpenBedtime: vi.fn(), homeDecor: {}, kindnessMoments: 0,
    season: 'spring', celebration: null, onClearCelebration: vi.fn(),
    bedtimeReminderEnabled: false, showPlaytimeSuggestion: false, onDismissPlaytimeSuggestion: vi.fn(),
    lastNurseryGraduate: null, onAcknowledgeGraduate: vi.fn(), reduceMotion: false,
    ...overrides,
  };
  const view = render(<CampScreen {...props} />, { wrapper });
  return { props, ...view };
}
function openBestie(name = 'Ember') {
  fireEvent.click(screen.getByRole('button', { name: `Visit ${name}` }));
  return screen.getByRole('region', { name: 'Bestie nook' });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(hasCharacterAudio).mockReturnValue(true);
  window.localStorage.clear();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('CampScreen picture-led Bestie visits', () => {
  it('opens with a visible named picture control while keeping rescue the primary action', () => {
    const { props } = renderCamp();
    const visit = screen.getByRole('button', { name: 'Visit Ember' });
    expect(visit.textContent).toContain('Visit Ember');
    expect(visit.style.minHeight).toBe('48px');
    expect(visit.style.minWidth).toBe('44px');
    expect(visit.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('fox plush');
    expect(visit.className).not.toContain('btn-coral');
    expect(screen.getByRole('button', { name: 'Help Finn' }).className).toContain('btn-coral');
    const nook = openBestie();
    expect(within(nook).getByRole('heading', { name: 'Hello, Ember!' })).toBeTruthy();
    expect(within(nook).getByRole('img', { name: 'fox plush' }).getAttribute('data-size')).toBe('112');
    expect(visit.getAttribute('aria-expanded')).toBe('true');
    expect(playCharacterAudio).not.toHaveBeenCalled();
    expect(props.onCareBestie).not.toHaveBeenCalled();
    expect(props.onStartFlagshipStory).not.toHaveBeenCalled();
  });

  it('shows different immediate pet and snack poses and captions, saving once per action', () => {
    const { props, container } = renderCamp();
    const nook = openBestie();
    fireEvent.click(within(nook).getByRole('button', { name: 'Gentle pet' }));
    const petCaption = within(nook).getByRole('status').textContent;
    expect(petCaption).toContain('leans into your gentle pet');
    expect(nook.querySelector('[data-bestie-response]')?.getAttribute('data-bestie-response')).toBe('pet');
    const petPose = within(nook).getByTestId('bestie-pose').style.transform;
    expect(playPet).toHaveBeenCalledTimes(1);
    expect(props.onCareBestie).toHaveBeenCalledTimes(1);
    fireEvent.click(within(nook).getByRole('button', { name: 'Give a snack' }));
    expect(within(nook).getByRole('status').textContent).toContain('nibbles the little berry');
    expect(within(nook).getByRole('status').textContent).not.toBe(petCaption);
    expect(within(nook).getByTestId('bestie-pose').style.transform).not.toBe(petPose);
    expect(nook.querySelector('[data-bestie-response]')?.getAttribute('data-bestie-response')).toBe('snack');
    expect(playNibble).toHaveBeenCalledTimes(1);
    expect(props.onCareBestie).toHaveBeenCalledTimes(2);
    expect(playCharacterAudio).not.toHaveBeenCalled();
    expect(container.textContent).not.toMatch(/987|988|care moments|hungry|missed you|need a snack/i);
  });

  it('keeps wave and hello distinct, with no timers or persistence for opening, listening or closing', () => {
    vi.useFakeTimers();
    try {
      const { props } = renderCamp();
      const nook = openBestie();
      fireEvent.click(within(nook).getByRole('button', { name: 'Wave' }));
      expect(within(nook).getByRole('status').textContent).toContain('waves a little paw back');
      expect(props.onCareBestie).toHaveBeenCalledTimes(1);
      fireEvent.click(within(nook).getByRole('button', { name: 'Say hello' }));
      expect(within(nook).getByRole('status').textContent).toContain('gives you a happy nod');
      expect(props.onCareBestie).toHaveBeenCalledTimes(2);
      fireEvent.click(within(nook).getByRole('button', { name: 'Listen to Ember’s recorded hello' }));
      expect(playCharacterAudio).toHaveBeenCalledTimes(1);
      expect(playCharacterAudio).toHaveBeenCalledWith('Ember', 'intro');
      act(() => vi.advanceTimersByTime(60000));
      expect(screen.getByRole('region', { name: 'Bestie nook' })).toBeTruthy();
      fireEvent.click(within(nook).getByRole('button', { name: 'Back to camp' }));
      expect(screen.queryByRole('region', { name: 'Bestie nook' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Scene companion' }));
      expect(screen.getByRole('region', { name: 'Bestie nook' })).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Close Bestie nook' }));
      expect(props.onCareBestie).toHaveBeenCalledTimes(2);
      expect(playCharacterAudio).toHaveBeenCalledTimes(1);
    } finally { vi.useRealTimers(); }
  });

  it.each(['bunny', 'fox', 'owl', 'squirrel', 'hedgehog', 'bear'])('uses the actual %s starter name', (companionType) => {
    renderCamp({ companionType });
    const bestie = getStarterCompanion(companionType);
    expect(within(openBestie(bestie.name)).getByRole('heading', { name: `Hello, ${bestie.name}!` })).toBeTruthy();
  });

  it('hides optional voice when muted or unavailable and keeps captions through preference changes', () => {
    window.localStorage.setItem('critter-rescue-audio-preferences', JSON.stringify({ spokenDirectionsEnabled: false }));
    renderCamp();
    const nook = openBestie();
    expect(within(nook).queryByRole('button', { name: /Listen/ })).toBeNull();
    act(() => saveAudioPreferences({ ...getAudioPreferences(), spokenDirectionsEnabled: true, voiceVolume: 0 }));
    expect(within(nook).queryByRole('button', { name: /Listen/ })).toBeNull();
    act(() => saveAudioPreferences({ ...getAudioPreferences(), voiceVolume: 0.3 }));
    expect(within(nook).getByRole('button', { name: /Listen/ })).toBeTruthy();
    fireEvent.click(within(nook).getByRole('button', { name: /Listen/ }));
    expect(playCharacterAudio).toHaveBeenCalledTimes(1);
      expect(playCharacterAudio).toHaveBeenCalledWith('Ember', 'intro');
    act(() => saveAudioPreferences({ ...getAudioPreferences(), spokenDirectionsEnabled: false, captionsEnabled: false }));
    fireEvent.click(within(nook).getByRole('button', { name: 'Gentle pet' }));
    expect(within(nook).getByRole('status').textContent).toContain('leans into your gentle pet');
    expect(playCharacterAudio).toHaveBeenCalledTimes(1);
    vi.mocked(hasCharacterAudio).mockReturnValue(false);
    act(() => saveAudioPreferences({ ...getAudioPreferences(), spokenDirectionsEnabled: true }));
    expect(within(nook).queryByRole('button', { name: /Listen/ })).toBeNull();
  });

  it('removes motion, but not the response, when the parent selects reduced motion', () => {
    renderCamp({ reduceMotion: true });
    const nook = openBestie();
    expect(nook.getAttribute('data-reduced-motion')).toBe('true');
    expect(nook.className).not.toContain('animate-pop-in');
    fireEvent.click(within(nook).getByRole('button', { name: 'Give a snack' }));
    expect(within(nook).getByTestId('bestie-pose').style.transform).toBe('none');
    expect(within(nook).getByTestId('bestie-pose').style.transition).toBe('none');
    expect(within(nook).getByRole('img').getAttribute('data-animate')).toBe('false');
    expect(within(nook).getByRole('status').textContent).toContain('Munch, munch, yum!');
  });

  it('honors the OS preference even when the reduceMotion prop is false', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    renderCamp();
    const nook = openBestie();
    fireEvent.click(within(nook).getByRole('button', { name: 'Wave' }));
    expect(nook.getAttribute('data-reduced-motion')).toBe('true');
    expect(within(nook).getByTestId('bestie-pose').style.transform).toBe('none');
    expect(within(nook).getByRole('status').textContent).toContain('waves a little paw back');
  });

  it('honors a reduced-motion ancestor class and live preference updates', async () => {
    const { container } = renderCamp({}, ({ children }) => <div className="reduce-motion-mode">{children}</div>);
    const nook = openBestie();
    expect(nook.getAttribute('data-reduced-motion')).toBe('true');
    await act(async () => { container.firstElementChild!.classList.remove('reduce-motion-mode'); });
    expect(nook.getAttribute('data-reduced-motion')).toBe('false');
    act(() => saveAudioPreferences({ ...getAudioPreferences(), reduceMotion: true }));
    expect(nook.getAttribute('data-reduced-motion')).toBe('true');
    fireEvent.click(within(nook).getByRole('button', { name: 'Say hello' }));
    expect(within(nook).getByTestId('bestie-pose').style.transform).toBe('none');
  });

  it('replaces numeric home-care moments with a nonnumeric cozy note without losing persistence', () => {
    const { props, container } = renderCamp({ homeCare: { 'pip-flower-path': 4321, pip: 4321 } });
    fireEvent.click(screen.getByRole('button', { name: 'Scene home' }));
    expect(screen.getByText('A cozy home for little moments together.')).toBeTruthy();
    expect(container.textContent).not.toMatch(/4321|kind care moments/);
    fireEvent.click(screen.getByRole('button', { name: /Give a snack/ }));
    expect(props.onCareHome).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/had a tiny snack/)).toBeTruthy();
  });

  it('keeps every More play activity in a scrollable pocket, outside the persistent primary controls', () => {
    const { props } = renderCamp({ celebrationPath: CELEBRATION_PATHS.winterSparkle });
    fireEvent.click(screen.getByRole('button', { name: 'More play' }));
    const menu = screen.getByRole('region', { name: 'More gentle play' });
    expect(menu.className).toContain('overflow-y-auto');
    expect(menu.className).toContain('overscroll-contain');
    expect(menu.style.maxHeight).toContain('45dvh');
    expect(menu.style.maxHeight).toContain('100dvh - 270px');
    expect(menu.getAttribute('tabindex')).toBe('0');
    for (const name of [/Start today’s letter sounds focus/, /Little trail/, /Cozy homes/, /Care time/, /Little learning/, /Care pairs/, /Storybook/, /Nature journal/, /Nature play/, /Weather/, /Celebration trail/, /Help together/, /Choose a trail/]) {
      expect(within(menu).getByRole('button', { name })).toBeTruthy();
    }
    expect(menu.contains(screen.getByRole('button', { name: 'Help Finn' }))).toBe(false);
    expect(menu.contains(screen.getByRole('button', { name: 'Close' }))).toBe(false);
    fireEvent.click(within(menu).getByRole('button', { name: /Weather/ }));
    expect(props.onOpenWeatherWonder).toHaveBeenCalledTimes(1);
    fireEvent.click(within(menu).getByRole('button', { name: /Celebration trail/ }));
    expect(props.onOpenCelebrationPath).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('region', { name: 'More gentle play' })).toBeNull();
  });

  it('preserves the parent gate entry and child-paced homecoming callback', () => {
    const { props } = renderCamp({ lastFlagshipHomecoming: 'pip-flower-path' });
    fireEvent.click(screen.getByRole('button', { name: 'Open parent settings' }));
    expect(props.onOpenParentSettings).toHaveBeenCalledTimes(1);
    expect(props.onAcknowledgeFlagshipHomecoming).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'See our sanctuary' }));
    expect(props.onAcknowledgeFlagshipHomecoming).toHaveBeenCalledTimes(1);
    expect(props.onCareBestie).not.toHaveBeenCalled();
  });
});
