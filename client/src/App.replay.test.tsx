// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { acknowledgeFlagshipHomecoming, completeFlagshipStory, createFreshState, loadState, saveState } from './game/store';

vi.mock('@/components/ui/sonner', () => ({ Toaster: () => null }));
vi.mock('./game/seasonalSoundscape', () => ({ useSeasonalSoundscape: vi.fn() }));
vi.mock('./game/playtimePreference', () => ({ useGentlePlaytimeSuggestion: () => ({ showSuggestion: false, dismissSuggestion: vi.fn() }) }));
vi.mock('./game/sounds', () => ({ playButton: vi.fn() }));
vi.mock('./screens/CampScreen', () => ({ default: ({ onOpenStorybook }: { onOpenStorybook: () => void }) => <button onClick={onOpenStorybook}>Open Book</button> }));
vi.mock('./screens/CritterStorybookScreen', () => ({ default: ({ onReplayStory, onStartNextStory }: { onReplayStory: (id: string) => void; onStartNextStory: () => void }) => <div><h1>Memory Book</h1><button onClick={() => onReplayStory('pip-flower-path')}>Replay Pip</button><button onClick={() => onReplayStory('wren-cozy-nest')}>Request unvisited Wren</button><button onClick={onStartNextStory}>Next story</button></div> }));
vi.mock('./screens/RescueScreen', () => ({ default: ({ mission, onComplete, onBack }: { mission: { flagshipStoryId: string }; onComplete: () => void; onBack: () => void }) => <div><h1>{mission.flagshipStoryId}</h1><button onClick={onComplete}>Finish rescue</button><button onClick={onBack}>Leave rescue</button></div> }));

const settle = () => act(() => { vi.advanceTimersByTime(1200); });
const openBook = () => { fireEvent.click(screen.getByRole('button', { name: 'Open Book' })); settle(); };

describe('favorite story replay routing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    localStorage.setItem('critter-rescue-audio-preferences', JSON.stringify({ reduceMotion: true }));
    const fresh = { ...createFreshState(), selectedCompanion: 'fox' };
    saveState(acknowledgeFlagshipHomecoming(completeFlagshipStory(fresh, 'pip-flower-path').newState));
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); });

  it('returns to the Book after a replay without duplicate keepsakes or activity', () => {
    const before = loadState();
    render(<App />); settle(); openBook();
    fireEvent.click(screen.getByRole('button', { name: 'Replay Pip' })); settle();
    expect(screen.getByRole('heading', { name: 'pip-flower-path' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Finish rescue' })); settle();
    expect(screen.getByRole('heading', { name: 'Memory Book' })).toBeTruthy();
    expect(loadState()).toEqual(before);
  });

  it('lets a child leave replay safely and rejects an unvisited story', () => {
    render(<App />); settle(); openBook();
    fireEvent.click(screen.getByRole('button', { name: 'Request unvisited Wren' })); settle();
    expect(screen.getByRole('heading', { name: 'Memory Book' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Replay Pip' })); settle();
    fireEvent.click(screen.getByRole('button', { name: 'Leave rescue' })); settle();
    expect(screen.getByRole('heading', { name: 'Memory Book' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next story' })); settle();
    expect(screen.getByRole('heading', { name: 'finn-riverside-crossing' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Finish rescue' })); settle();
    expect(loadState().completedFlagshipStories).toEqual(['pip-flower-path', 'finn-riverside-crossing']);
  });
});
