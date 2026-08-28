// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WeatherWonderScreen from './WeatherWonderScreen';

vi.mock('../components/PreReaderDirection', () => ({ default: () => <div data-testid="pre-reader-direction" /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn(), playMatch: vi.fn() }));

describe('WeatherWonderScreen', () => {
  it('keeps weather help to one large action at a time, then completes and returns', () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();
    render(<WeatherWonderScreen season="spring" onComplete={onComplete} onBack={onBack} />);
    const umbrella = screen.getByRole('button', { name: /tap a leafy umbrella/i });
    const puddle = screen.getByRole('button', { name: /tap a happy puddle/i });
    expect(puddle.hasAttribute('disabled')).toBe(true);
    fireEvent.click(umbrella);
    expect(screen.getByText(/dry, cozy spot/i)).toBeTruthy();
    expect(puddle.hasAttribute('disabled')).toBe(false);
    fireEvent.click(puddle);
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /keep this weather wonder/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
