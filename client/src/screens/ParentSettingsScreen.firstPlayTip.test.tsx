// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ParentSettingsScreen from './ParentSettingsScreen';

vi.mock('../components/CritterAvatar', () => ({ default: () => <div data-testid="critter-avatar" /> }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn() }));
vi.mock('../game/seasonalSoundscape', () => ({ startParentSelectedSoundscape: vi.fn(), syncSeasonalSoundscape: vi.fn() }));

describe('ParentSettingsScreen first-play tip', () => {
  it('offers brief grown-up co-play guidance without adding it to the child flow', () => {
    render(<ParentSettingsScreen onBack={vi.fn()} onOpenProgress={vi.fn()} onOpenGallery={vi.fn()} />);
    expect(screen.getByText('Grown-up first-play tip')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Follow their lead, then name one kind thing.' })).toBeTruthy();
    expect(screen.getByText(/There is no right pace and no need to finish everything/i)).toBeTruthy();
  });
});
