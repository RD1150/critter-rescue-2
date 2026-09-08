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

describe('Telling Time in RescueScreen', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps the full-hour choice calm and completes only after Brook’s seven o’clock clock', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const mission = getZoneTask('riverside', 10);
    if (!mission) throw new Error('Expected Riverside Telling Time mission');
    render(<RescueScreen mission={mission} companionType="bunny" bgColors={['#6BAACC', '#5A9E7A', '#2D5A1E']} onComplete={onComplete} onBack={vi.fn()} isFirstMission={false} isEarlyMission={false} />);

    fireEvent.click(screen.getByRole('button', { name: /i’ll help/i }));
    fireEvent.click(screen.getByRole('button', { name: /clock showing 9 o’clock/i }));
    expect(screen.getByText(/That clock shows a different time/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /clock showing 7 o’clock/i }));
    expect(screen.getByText(/You found seven o’clock/i)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1300); });
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByRole('button', { name: /back to camp/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
