// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ActivityLibraryGuideScreen from './ActivityLibraryGuideScreen';

vi.mock('../game/sounds', () => ({ playButton: vi.fn() }));

describe('ActivityLibraryGuideScreen', () => {
  it('explains trail access and opens the optional original creative block studio', () => {
    const onOpenCreativeBuilder = vi.fn();
    render(<ActivityLibraryGuideScreen onBack={vi.fn()} onOpenCreativeBuilder={onOpenCreativeBuilder} />);
    expect(screen.getByRole('heading', { name: 'Activity Library' })).toBeTruthy();
    expect(screen.getByText('River Rescue')).toBeTruthy();
    expect(screen.getByText(/Find a Friend/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open Cozy Block Studio' }));
    expect(onOpenCreativeBuilder).toHaveBeenCalledTimes(1);
  });
});
