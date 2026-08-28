// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CelebrationPathScreen from './CelebrationPathScreen';
import { CELEBRATION_PATHS } from '../game/celebrationPaths';

vi.mock('../components/CritterAvatar', () => ({ default: () => <div data-testid="critter-avatar" /> }));

describe('CelebrationPathScreen', () => {
  it('offers one gentle action at a time and returns cleanly after the second path action', async () => {
    const onBack = vi.fn();
    render(<CelebrationPathScreen path={CELEBRATION_PATHS.lightsKindness} reduceMotion onBack={onBack} />);
    expect(screen.getByText(/lights & kindness trail/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /light a little candle/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /set a tiny dreidel nearby/i })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: /set a tiny dreidel nearby/i }));
    expect(screen.getByText(/thank you, helper/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /back to camp/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
