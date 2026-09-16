// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Match3Screen from './Match3Screen';

vi.mock('../game/sounds', () => ({
  playButton: vi.fn(),
  playComplete: vi.fn(),
  playError: vi.fn(),
  playMatch: vi.fn(),
}));

describe('Care Pair Picnic', () => {
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
    expect(screen.getByRole('button', { name: /play with the pictures again/i })).toBeTruthy();
    expect(screen.queryByText(/score|moves|game over/i)).toBeNull();
  });
});
