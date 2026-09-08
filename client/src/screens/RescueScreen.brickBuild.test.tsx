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

describe('Cozy Block Builder in RescueScreen', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps a calm one-block-at-a-time sequence and completes after base, walls, then roof', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const mission = getZoneTask('mountain', 8);
    if (!mission) throw new Error('Expected Mountain Brick Build mission');
    render(<RescueScreen mission={mission} companionType="bunny" bgColors={['#8B9AAA', '#6A7A6A', '#3A5A3A']} onComplete={onComplete} onBack={vi.fn()} isFirstMission={false} isEarlyMission={false} />);

    fireEvent.click(screen.getByRole('button', { name: /i’ll help/i }));
    fireEvent.click(screen.getByRole('button', { name: /two coral wall blocks/i }));
    expect(screen.getByText(/First, the cottage needs a wide bottom block/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /wide blue base block/i }));
    act(() => { vi.advanceTimersByTime(850); });
    fireEvent.click(screen.getByRole('button', { name: /two coral wall blocks/i }));
    act(() => { vi.advanceTimersByTime(850); });
    fireEvent.click(screen.getByRole('button', { name: /moss-green roof block/i }));
    expect(screen.getByText(/You built a cozy cottage with Summit/i)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1300); });
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByRole('button', { name: /back to camp/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
