// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PreReaderDirection from './PreReaderDirection';

const { playPreReaderDirection } = vi.hoisted(() => ({ playPreReaderDirection: vi.fn() }));

vi.mock('../game/characterAudio', () => ({ playPreReaderDirection }));
vi.mock('../game/audioPreferences', () => ({
  useAudioPreferences: () => [{ spokenDirectionsEnabled: true, captionsEnabled: true }],
}));
vi.mock('../game/preReaderDirections', () => ({
  PRE_READER_DIRECTIONS: { onboarding: 'Tap Let’s Help a Friend.' },
}));

describe('PreReaderDirection', () => {
  it('starts the optional Nutty direction only after Listen is tapped and acknowledges the action', async () => {
    playPreReaderDirection.mockResolvedValueOnce(true);
    render(<PreReaderDirection directionKey="onboarding" minimal />);
    fireEvent.click(screen.getByRole('button', { name: /Listen to direction:/ }));
    expect(playPreReaderDirection).toHaveBeenCalledWith('onboarding');
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Nutty is speaking.'));
  });
});
