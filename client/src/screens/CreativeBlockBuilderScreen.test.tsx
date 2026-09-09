// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CreativeBlockBuilderScreen from './CreativeBlockBuilderScreen';

vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playSnap: vi.fn() }));

describe('CreativeBlockBuilderScreen', () => {
  it('lets a child choose original blocks, place them freely, and clear the play mat without a failure state', () => {
    render(<CreativeBlockBuilderScreen onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Coral wall' }));
    fireEvent.click(screen.getByRole('button', { name: /Open build space 1/i }));
    expect(screen.getByText('Coral wall is on the play mat. What would you like to add next?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear play mat' }));
    expect(screen.getByText('The play mat is clear. Pick any block and begin again.')).toBeTruthy();
    expect(screen.getByText(/There are no scores or wrong builds/i)).toBeTruthy();
  });
});
