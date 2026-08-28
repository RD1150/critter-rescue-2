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
    expect(screen.getByText(/cozy care for clover/i)).toBeTruthy();
    const umbrella = screen.getByRole('button', { name: /open clover’s leafy umbrella/i });
    const petal = screen.getByRole('button', { name: /tuck in a soft spring petal/i });
    expect(petal.hasAttribute('disabled')).toBe(true);
    fireEvent.click(umbrella);
    expect(screen.getByText(/dry, cozy spot under the leaf/i)).toBeTruthy();
    expect(petal.hasAttribute('disabled')).toBe(false);
    fireEvent.click(petal);
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /keep this weather wonder/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
