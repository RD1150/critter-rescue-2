// @vitest-environment jsdom
import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RescueScreen from './RescueScreen';
import { getZoneTask } from '../game/data';

vi.mock('../components/CritterAvatar', () => ({ default: ({ type }: { type: string }) => <span aria-label={`${type} plush`} /> }));
vi.mock('../components/PreReaderDirection', () => ({ default: () => <div data-testid="pre-reader-direction" /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn(), playChime: vi.fn(), playMatch: vi.fn(), playSnap: vi.fn(), playPickup: vi.fn(), playError: vi.fn(), playFlip: vi.fn(), playPatternNote: vi.fn(), playCatch: vi.fn(), playMilestone: vi.fn() }));
vi.mock('../game/audioPreferences', () => ({ useAudioPreferences: () => [{ captionsEnabled: true, spokenDirections: true }] }));
vi.mock('../game/characterAudio', () => ({ hasCharacterAudio: () => false, playCharacterAudio: vi.fn() }));

describe('Lodge Rescue in RescueScreen', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps one clear helper step at a time and completes only after sticks, leaves, then door', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const mission = getZoneTask('deepwoods', 9);
    if (!mission) throw new Error('Expected Deep Woods Lodge Rescue mission');
    render(<RescueScreen mission={mission} companionType="bunny" bgColors={['#5A7A5E', '#3E6B2F', '#162F10']} onComplete={onComplete} onBack={vi.fn()} isFirstMission={false} isEarlyMission={false} />);

    fireEvent.click(screen.getByRole('button', { name: /i’ll help/i }));
    expect(screen.getByText(/Which helper is sturdy first/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /soft leaf lining/i }));
    expect(screen.getByText(/First, Bark needs sturdy sticks/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /sturdy stick bundle/i }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(screen.getByText(/What makes the inside soft/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /soft leaf lining/i }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(screen.getByText(/What helps Bark close the cozy lodge/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /round lodge door/i }));
    act(() => { vi.advanceTimersByTime(1300); });
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByRole('button', { name: /back to camp/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
