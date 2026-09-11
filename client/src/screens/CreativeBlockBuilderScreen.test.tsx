// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CreativeBlockBuilderScreen from './CreativeBlockBuilderScreen';

vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playSnap: vi.fn() }));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

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

  it('offers optional picture-led inspiration without making a matching build required', () => {
    render(<CreativeBlockBuilderScreen onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Need a build idea?' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Little Bridge/i }));
    expect(screen.getByText('Can you make a little bridge? You can use any blocks you like.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Build my own' }));
    expect(screen.getByText('Your own idea is ready. Pick any block and make it your way.')).toBeTruthy();
  });

  it('shows only a parent-selected local idea and keeps Build my own available', () => {
    window.localStorage.setItem('critter-rescue-parent-build-prompts', JSON.stringify([{ id: 'parent-1', title: 'Soft tunnel', prompt: 'Can you make a soft tunnel for a friend?', enabled: true, createdAt: 1 }, { id: 'parent-2', title: 'Hidden idea', prompt: 'Can you make a hidden idea for later?', enabled: false, createdAt: 2 }]));
    render(<CreativeBlockBuilderScreen onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'A special build idea' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Soft tunnel/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Hidden idea/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Soft tunnel/i }));
    expect(screen.getByText('Can you make a soft tunnel for a friend? You can use any blocks you like.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Build my own' })).toBeTruthy();
  });

  it('saves a local build, opens it again, and lets a family remove it without uploads or profiles', () => {
    window.localStorage.clear();
    render(<CreativeBlockBuilderScreen onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Open build space 1/i }));
    fireEvent.change(screen.getByLabelText('Name this build'), { target: { value: 'My camp house' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save this creation' }));
    expect(screen.getByText('My camp house is saved on this device. You can open it anytime from My creations.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear play mat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open My camp house' }));
    expect(screen.getByText('My camp house is open on the play mat. You can keep building or make it your own.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove My camp house' }));
    expect(screen.getByText('My camp house was removed from this device.')).toBeTruthy();
    expect(screen.getByText('Save a creation to keep it here on this device.')).toBeTruthy();
  });
});
