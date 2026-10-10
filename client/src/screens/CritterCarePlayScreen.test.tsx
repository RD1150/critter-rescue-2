// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CritterCarePlayScreen from './CritterCarePlayScreen';
import type { CritterData } from '../game/data';

vi.mock('../components/CritterAvatar', () => ({ default: () => <div data-testid="critter-avatar" /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn() }));
vi.mock('../components/PreReaderDirection', () => ({ default: () => <div data-testid="picture-direction" /> }));

const buttercup: CritterData = {
  id: 'butterfly-buttercup', name: 'Buttercup', type: 'butterfly', emoji: '🦋', personality: 'gentle',
  introLine: 'Hi!', helpLine: 'Help.', thanksLine: 'Thanks!', secondLine: 'Thanks again!', encourageLine: 'You can do it!', stuckLine: 'Try again.',
};

describe('CritterCarePlayScreen', () => {
  it('uses a visible pick-up then use interaction instead of three identical taps', () => {
    const onComplete = vi.fn();
    render(<CritterCarePlayScreen rescuedCritters={[buttercup]} onComplete={onComplete} onCompleteDuo={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Choose garden sprinkle' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Water the cozy spot' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Choose garden sprinkle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Water the cozy spot' }));

    expect(onComplete).toHaveBeenCalledWith(buttercup, 'garden-sprinkle');
    expect(screen.getByText(/garden looks bright and happy/i)).toBeTruthy();
  });
});
