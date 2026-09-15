// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ParentalGateScreen from './ParentalGateScreen';

vi.mock('../components/CritterAvatar', () => ({ default: () => <div data-testid="critter-avatar" /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn() }));

describe('ParentalGateScreen', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps adult navigation closed until the math answer is correct', () => {
    const onContinue = vi.fn();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<ParentalGateScreen onContinue={onContinue} onBack={vi.fn()} onGrant={() => 123} />);
    fireEvent.click(screen.getByRole('button', { name: /continue to grown-up space/i }));
    expect(screen.getByRole('alert').textContent).toMatch(/does not match/i);
    fireEvent.change(screen.getByLabelText('Math answer'), { target: { value: '17' } });
    fireEvent.click(screen.getByRole('button', { name: /continue to grown-up space/i }));
    expect(onContinue).toHaveBeenCalledWith(123);
  });
});
