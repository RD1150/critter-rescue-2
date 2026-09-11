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

describe('Animal Home and Care Match in RescueScreen', () => {
  afterEach(() => vi.useRealTimers());

  it('shows one animal at a time, gives gentle feedback, and completes the four calm pairs', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const mission = getZoneTask('meadow', 12);
    if (!mission) throw new Error('Expected Meadow Animal Home and Care Match mission');
    render(<RescueScreen mission={mission} companionType="bunny" bgColors={['#87CEEB', '#7EC8A0', '#3E6B2F']} onComplete={onComplete} onBack={vi.fn()} isFirstMission={false} isEarlyMission={false} />);
    fireEvent.click(screen.getByRole('button', { name: /i’ll help/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Birdhouse' }));
    expect(screen.getByText(/Birdhouse is a cozy place for another animal/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Dog house' }));
    act(() => { vi.advanceTimersByTime(700); });
    fireEvent.click(screen.getByRole('button', { name: 'Birdhouse' }));
    act(() => { vi.advanceTimersByTime(700); });
    fireEvent.click(screen.getByRole('button', { name: 'Scratching post' }));
    act(() => { vi.advanceTimersByTime(700); });
    fireEvent.click(screen.getByRole('button', { name: 'Mud bath' }));
    expect(screen.getByText(/Every animal found a special cozy place/i)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1300); });
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByRole('button', { name: /back to camp/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
