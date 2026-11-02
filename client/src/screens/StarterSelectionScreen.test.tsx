// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StarterSelectionScreen from './StarterSelectionScreen';

vi.mock('../components/CritterAvatar', () => ({ default: ({ type }: { type: string }) => <span aria-label={`${type} plush`} /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn() }));

describe('Bestie selection', () => {
  it('offers all six existing plush Besties and persists the chosen type through confirmation', () => {
    const onSelect = vi.fn();
    render(<StarterSelectionScreen onSelect={onSelect} />);

    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Choose a Bestie' }).getAttribute('disabled')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Ember/i }));
    expect(screen.getByRole('button', { name: /Make Ember my Bestie/i }).getAttribute('disabled')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Make Ember my Bestie/i }));
    expect(onSelect).toHaveBeenCalledWith('fox');
  });
});
