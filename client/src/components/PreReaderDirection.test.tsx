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
    expect(within(container).getByRole('img', { name: /Picture clue: branch, feather, then nest/i })).toBeTruthy();
    expect(within(container).queryByRole('button', { name: /Listen/i })).toBeNull();
    expect(playPreReaderDirection).not.toHaveBeenCalled();
  });

  it('keeps a picture cue present even when captions and spoken directions are both off', () => {
    useAudioPreferences.mockReturnValue([{ spokenDirectionsEnabled: false, captionsEnabled: false, directionVolumeCheckComplete: true, reduceMotion: false }, vi.fn()]);
    render(<PreReaderDirection directionKey="onboarding" minimal />);
    expect(screen.getAllByRole('img', { name: /Picture clue: tap the big rescue button/i }).length).toBeGreaterThan(0);
  });

  it('stacks the picture cue, wide replay control, and written direction on a narrow phone layout', () => {
    const { container } = render(<PreReaderDirection directionKey="onboarding" />);
    expect(within(container).getByTestId('direction-actions').className).toContain('flex-col');
    expect(within(container).getByTestId('direction-copy').className).toContain('min-w-0');
    expect(within(container).getByRole('button', { name: /Listen to direction:/ }).className).toContain('w-full');
    expect(within(container).getByText(/Tap Let’s Help a Friend/i)).toBeTruthy();
  });

  it('starts the optional direction with one Listen tap and offers replay after the clip ends', async () => {
    useAudioPreferences.mockReturnValue([{ spokenDirectionsEnabled: true, captionsEnabled: true, directionVolumeCheckComplete: false, reduceMotion: false }, vi.fn()]);
    playPreReaderDirection.mockImplementationOnce(async (_key: unknown, callbacks: { onEnded?: () => void }) => { callbacks.onEnded?.(); return true; });
    const { container } = render(<PreReaderDirection directionKey="onboarding" minimal />);
    fireEvent.click(within(container).getByRole('button', { name: /Listen to direction:/ }));
    expect(playPreReaderDirection).toHaveBeenCalledTimes(1);
    expect(within(container).queryByRole('dialog', { name: 'Comfort volume check' })).toBeNull();
    await waitFor(() => expect(within(container).getByRole('button', { name: /Replay directions to direction:/ })).toBeTruthy());
  });

  it('explains when a saved parent preference has muted voices', async () => {
    playPreReaderDirection.mockImplementationOnce(async (_key: unknown, callbacks: { onMuted?: () => void }) => { callbacks.onMuted?.(); return false; });
    const { container } = render(<PreReaderDirection directionKey="onboarding" minimal />);
    fireEvent.click(within(container).getByRole('button', { name: /Listen to direction:/ }));
    await waitFor(() => expect(within(container).getByRole('status').textContent).toMatch(/Voice volume is off/i));
  });
});
