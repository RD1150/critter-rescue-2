// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CampLearningScreen from './CampLearningScreen';

const { playGentleRetryFeedback } = vi.hoisted(() => ({ playGentleRetryFeedback: vi.fn() }));

vi.mock('../components/CritterAvatar', () => ({ default: () => <span aria-label="critter plush" /> }));
vi.mock('../components/PreReaderDirection', () => ({ default: () => <div data-testid="pre-reader-direction" /> }));
vi.mock('../game/sounds', () => ({ playComplete: vi.fn(), playMatch: vi.fn() }));
vi.mock('../game/characterAudio', () => ({ playGentleRetryFeedback }));

describe('Camp Learning gentle retries', () => {
  it('names a tapped wrong picture, repeats the question, and calmly highlights the answer', () => {
    render(<CampLearningScreen onBack={vi.fn()} onRoundComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Choose blue circle' }));

    expect(playGentleRetryFeedback).toHaveBeenCalledWith('blue circle');
    expect(screen.getAllByText('Can you find the red circle?').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: 'Choose red circle' }).className).toContain('ring-4');
  });
});
