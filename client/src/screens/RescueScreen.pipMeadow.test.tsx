// @vitest-environment jsdom
import React, { act } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RescueScreen from './RescueScreen';
import { getZoneTask } from '../game/data';

const meadowScene = vi.fn();

vi.mock('../components/CritterAvatar', () => ({ default: ({ type }: { type: string }) => <span aria-label={`${type} plush`} /> }));
vi.mock('../components/BabylonMeadowRescueScene', () => ({ default: (props: { active: boolean; completed: boolean; reduceMotion: boolean; onPathComplete: () => void }) => { meadowScene(props); return <button type="button" aria-label="Complete Pip's flower path" onClick={props.onPathComplete}>3D meadow</button>; } }));
vi.mock('../components/PreReaderDirection', () => ({ default: () => <div data-testid="pre-reader-direction" /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn(), playChime: vi.fn(), playMatch: vi.fn(), playSnap: vi.fn(), playPickup: vi.fn(), playError: vi.fn(), playFlip: vi.fn(), playPatternNote: vi.fn(), playCatch: vi.fn(), playMilestone: vi.fn() }));
vi.mock('../game/audioPreferences', () => ({ useAudioPreferences: () => [{ captionsEnabled: true, spokenDirectionsEnabled: true }] }));
vi.mock('../game/characterAudio', () => ({ hasCharacterAudio: () => false, playCharacterAudio: vi.fn(), playGentleRetryFeedback: vi.fn() }));

describe('Pip Meadow 3D-first rescue', () => {
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('keeps Pip’s entry to one picture-led action before the interactive Meadow appears', () => {
    meadowScene.mockClear();
    const mission = getZoneTask('meadow', 0);
    if (!mission) throw new Error('Expected Pip Meadow tracing mission');
    render(<RescueScreen mission={mission} companionType="bunny" bgColors={['#87CEEB', '#7EC8A0', '#3E6B2F']} onComplete={vi.fn()} onBack={vi.fn()} isFirstMission reduceMotion={false} isEarlyMission />);

    expect(screen.getByRole('heading', { name: 'Pip needs a little path.' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Help Pip' })).toBeTruthy();
    expect(screen.queryByText(/Three easy steps/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Hear Pip/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Help Pip' }));
    expect(screen.getByText('Follow Pip’s glowing dots')).toBeTruthy();
    expect(meadowScene).toHaveBeenLastCalledWith(expect.objectContaining({ active: true, completed: false, reduceMotion: false }));
  });

  it('shows a warm world-response completion and preserves the Reduce Motion preference', () => {
    vi.useFakeTimers();
    meadowScene.mockClear();
    const onComplete = vi.fn();
    const mission = getZoneTask('meadow', 0);
    if (!mission) throw new Error('Expected Pip Meadow tracing mission');
    render(<RescueScreen mission={mission} companionType="bunny" bgColors={['#87CEEB', '#7EC8A0', '#3E6B2F']} onComplete={onComplete} onBack={vi.fn()} isFirstMission reduceMotion isEarlyMission />);

    fireEvent.click(screen.getByRole('button', { name: 'Help Pip' }));
    expect(meadowScene).toHaveBeenLastCalledWith(expect.objectContaining({ active: true, reduceMotion: true }));
    fireEvent.click(screen.getByRole('button', { name: "Complete Pip's flower path" }));
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByRole('heading', { name: 'You made a path for Pip.' })).toBeTruthy();
    act(() => { vi.advanceTimersByTime(450); });
    fireEvent.click(screen.getByRole('button', { name: 'Bring Pip home' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
