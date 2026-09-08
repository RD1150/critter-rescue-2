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

describe('Garden Sorting in RescueScreen', () => {
  afterEach(() => vi.useRealTimers());

  it('shows one picture at a time, gives a gentle retry, and completes four matching basket choices', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const mission = getZoneTask('meadow', 11);
    if (!mission) throw new Error('Expected Meadow Garden Sorting mission');
    render(<RescueScreen mission={mission} companionType="bunny" bgColors={['#87CEEB', '#7EC8A0', '#3E6B2F']} onComplete={onComplete} onBack={vi.fn()} isFirstMission={false} isEarlyMission={false} />);

    fireEvent.click(screen.getByRole('button', { name: /i’ll help/i }));
    fireEvent.click(screen.getByRole('button', { name: /leaf basket/i }));
    expect(screen.getByText(/That basket is for leaves/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /berry basket/i }));
    act(() => { vi.advanceTimersByTime(700); });
    fireEvent.click(screen.getByRole('button', { name: /leaf basket/i }));
    act(() => { vi.advanceTimersByTime(700); });
    fireEvent.click(screen.getByRole('button', { name: /berry basket/i }));
    act(() => { vi.advanceTimersByTime(700); });
    fireEvent.click(screen.getByRole('button', { name: /leaf basket/i }));
    expect(screen.getByText(/Every garden treasure has a cozy matching basket/i)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1300); });
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByRole('button', { name: /back to camp/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
