// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PreReaderDirection from './PreReaderDirection';

const { playPreReaderDirection, useAudioPreferences } = vi.hoisted(() => ({ playPreReaderDirection: vi.fn(), useAudioPreferences: vi.fn() }));

vi.mock('../game/characterAudio', () => ({ playPreReaderDirection }));
vi.mock('../game/audioPreferences', () => ({ useAudioPreferences }));
vi.mock('../game/preReaderDirections', () => ({
  PRE_READER_DIRECTIONS: { onboarding: 'Tap Let’s Help a Friend.', nestRescue: 'Tap the branch, then moss, then nest.' },
}));

describe('PreReaderDirection', () => {
  beforeEach(() => {
    playPreReaderDirection.mockReset();
    useAudioPreferences.mockReturnValue([{ spokenDirectionsEnabled: true, captionsEnabled: true, directionVolumeCheckComplete: true, reduceMotion: false }, vi.fn()]);
  });

  it('starts the optional Nutty direction only after Listen is tapped and acknowledges the action', async () => {
    playPreReaderDirection.mockResolvedValueOnce(true);
    render(<PreReaderDirection directionKey="onboarding" minimal />);
    fireEvent.click(screen.getByRole('button', { name: /Listen to direction:/ }));
    expect(playPreReaderDirection).toHaveBeenCalledWith('onboarding', expect.objectContaining({ onEnded: expect.any(Function), onUnavailable: expect.any(Function) }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Nutty is speaking'));
    expect(screen.getByRole('img', { name: 'squirrel' }).parentElement?.className).toContain('motion-safe:animate-speaking-pulse');
  });

  it('keeps the speaking acknowledgement still when Reduce Motion is selected', async () => {
    useAudioPreferences.mockReturnValue([{ spokenDirectionsEnabled: true, captionsEnabled: true, directionVolumeCheckComplete: true, reduceMotion: true }, vi.fn()]);
    playPreReaderDirection.mockResolvedValueOnce(true);
    const { container } = render(<PreReaderDirection directionKey="onboarding" minimal />);
    fireEvent.click(within(container).getByRole('button', { name: /Listen to direction:/ }));
    await waitFor(() => expect(within(container).getByRole('status')).toBeTruthy());
    expect(within(container).getByRole('img', { name: 'squirrel' }).parentElement?.className).not.toContain('animate-speaking-pulse');
  });

  it('keeps Nest Rescue’s visual instruction available without any audio control when spoken directions are disabled', () => {
    useAudioPreferences.mockReturnValue([{ spokenDirectionsEnabled: false, captionsEnabled: true, directionVolumeCheckComplete: true, reduceMotion: false }, vi.fn()]);
    const { container } = render(<PreReaderDirection directionKey="nestRescue" />);
    expect(within(container).getByText(/Tap the branch, then moss, then nest/i)).toBeTruthy();
    expect(within(container).queryByRole('button', { name: /Listen/i })).toBeNull();
    expect(playPreReaderDirection).not.toHaveBeenCalled();
  });

  it('asks for a grown-up comfort-volume check before first optional audio and offers replay after the clip ends', async () => {
    const savePreferences = vi.fn();
    useAudioPreferences.mockReturnValue([{ spokenDirectionsEnabled: true, captionsEnabled: true, directionVolumeCheckComplete: false, reduceMotion: false }, savePreferences]);
    playPreReaderDirection.mockImplementationOnce(async (_key: unknown, callbacks: { onEnded?: () => void }) => { callbacks.onEnded?.(); return true; });
    const { container } = render(<PreReaderDirection directionKey="onboarding" minimal />);
    fireEvent.click(within(container).getByRole('button', { name: /Listen to direction:/ }));
    expect(within(container).getByRole('dialog', { name: 'Comfort volume check' })).toBeTruthy();
    fireEvent.click(within(container).getByRole('button', { name: 'Play sound' }));
    await waitFor(() => expect(savePreferences).toHaveBeenCalledWith(expect.objectContaining({ directionVolumeCheckComplete: true })));
    await waitFor(() => expect(within(container).getByRole('button', { name: /Replay directions to direction:/ })).toBeTruthy());
  });
});
