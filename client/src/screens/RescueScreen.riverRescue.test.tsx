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

describe('River Rescue in RescueScreen', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps one clear helper step at a time and completes only after log, rope, then trail sign', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const mission = getZoneTask('riverside', 9);
    if (!mission) throw new Error('Expected Riverside River Rescue mission');
    render(<RescueScreen mission={mission} companionType="bunny" bgColors={['#6BAACC', '#5A9E7A', '#2D5A1E']} onComplete={onComplete} onBack={vi.fn()} isFirstMission={false} isEarlyMission={false} />);

    fireEvent.click(screen.getByRole('button', { name: /i’ll help/i }));
    expect(screen.getByText(/what makes a steady bridge first/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /rescue rope/i }));
    expect(screen.getByText(/first, Clover needs a steady bridge/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /bridge log/i }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(screen.getByText(/what can Clover hold while crossing/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /rescue rope/i }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(screen.getByText(/what shows the way to the cozy bank/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /safe trail sign/i }));
    act(() => { vi.advanceTimersByTime(1300); });
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByRole('button', { name: /back to camp/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
