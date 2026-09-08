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

describe('Nest Rescue in RescueScreen', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps one clear helper step at a time and completes only after branch, moss, then nest', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const mission = getZoneTask('deepwoods', 8);
    if (!mission) throw new Error('Expected Deep Woods Nest Rescue mission');
    render(<RescueScreen mission={mission} companionType="owl" bgColors={['#5A7A5E', '#3E6B2F', '#162F10']} onComplete={onComplete} onBack={vi.fn()} isFirstMission={false} isEarlyMission={false} />);

    fireEvent.click(screen.getByRole('button', { name: /i’ll help/i }));
    expect(screen.getByText(/sturdy path first/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /soft moss bundle/i }));
    expect(screen.getByText(/first, Wren needs a sturdy way up/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /sturdy branch path/i }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(screen.getByText(/what can Wren carry/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /soft moss bundle/i }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(screen.getByText(/what gives Wren a cozy place to rest/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /cozy nest cup/i }));
    act(() => { vi.advanceTimersByTime(1300); });
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByRole('button', { name: /back to camp/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
