// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Match3Screen from './Match3Screen';
import { playCarePairCelebrationSound } from '../game/sounds';

vi.mock('../game/sounds', () => ({
  playButton: vi.fn(),
  playComplete: vi.fn(),
  playCarePairCelebrationSound: vi.fn(),
  playError: vi.fn(),
  playMatch: vi.fn(),
}));

describe('Care Pair Picnic', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('gives gentle feedback for different pictures and completes local pairs without scores or move limits', () => {
    render(<Match3Screen onClose={vi.fn()} critterName="Clover" critterEmoji="🐰" />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Apple picture, ready' })[0]!);
    fireEvent.click(screen.getAllByRole('button', { name: 'Water drop picture, ready' })[0]!);
    expect(screen.getByText(/those pictures are different/i)).toBeTruthy();

    for (const label of ['Apple', 'Water drop', 'Leaf', 'Heart']) {
      const cards = screen.getAllByRole('button', { name: `${label} picture, ready` });
      fireEvent.click(cards[0]!);
      fireEvent.click(cards[1]!);
    }

    expect(screen.getByText(/all the care pairs are together/i)).toBeTruthy();
    expect(screen.getByTestId('care-pair-celebration').className).toContain('care-pair-celebration--animated');
    expect(screen.getByText(/little picture garden is blooming/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /play with the pictures again/i })).toBeTruthy();
    expect(screen.queryByText(/score|moves|game over/i)).toBeNull();
  });

  it('keeps the same clear completion acknowledgement without decorative animation when Reduce Motion is selected', () => {
    render(<Match3Screen onClose={vi.fn()} critterName="Clover" critterEmoji="🐰" reduceMotion />);

    for (const label of ['Apple', 'Water drop', 'Leaf', 'Heart']) {
      const cards = screen.getAllByRole('button', { name: `${label} picture, ready` });
      fireEvent.click(cards[0]!);
      fireEvent.click(cards[1]!);
    }

    expect(screen.getByTestId('care-pair-celebration').className).toContain('care-pair-celebration--still');
    expect(screen.getByText(/little picture garden is blooming/i)).toBeTruthy();
  });

  it('plays the quiet bloom cue once by default, honours its mute setting, and changes the visual theme', () => {
    const completePairs = () => {
      for (const label of ['Apple', 'Water drop', 'Leaf', 'Heart']) {
        const cards = screen.getAllByRole('button', { name: `${label} picture, ready` });
        fireEvent.click(cards[0]!);
        fireEvent.click(cards[1]!);
      }
    };

    render(<Match3Screen onClose={vi.fn()} critterName="Clover" critterEmoji="🐰" celebrationTheme="stars" />);
    completePairs();
    expect(playCarePairCelebrationSound).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('care-pair-celebration').className).toContain('care-pair-celebration--stars');
    expect(screen.getByText(/starry sky is twinkling/i)).toBeTruthy();
  });

  it('does not play the optional bloom cue when a grown-up has muted it', () => {
    render(<Match3Screen onClose={vi.fn()} critterName="Clover" critterEmoji="🐰" completionSoundEnabled={false} />);

    for (const label of ['Apple', 'Water drop', 'Leaf', 'Heart']) {
      const cards = screen.getAllByRole('button', { name: `${label} picture, ready` });
      fireEvent.click(cards[0]!);
      fireEvent.click(cards[1]!);
    }

    expect(playCarePairCelebrationSound).not.toHaveBeenCalled();
    expect(screen.getByText(/little picture garden is blooming/i)).toBeTruthy();
  });
});
