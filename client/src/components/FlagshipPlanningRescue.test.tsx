// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FlagshipPlanningRescue from './FlagshipPlanningRescue';
import { getFlagshipStory } from '../game/flagshipStories';

vi.mock('@/lib/babylonRuntime', () => ({ loadBabylon: () => Promise.reject(new Error('No WebGL')) }));
const retry = vi.hoisted(() => vi.fn());
vi.mock('../game/characterAudio', () => ({ playGentleRetryFeedback: retry }));
vi.mock('./PreReaderDirection', () => ({ default: () => <p>Optional directions ready</p> }));

beforeEach(() => { window.history.replaceState({}, '', '/'); window.localStorage.clear(); retry.mockClear(); });
afterEach(cleanup);

function setup() {
  const story = getFlagshipStory('wren-cozy-nest');
  if (!story) throw new Error('Missing Wren story');
  const onComplete = vi.fn();
  return { onComplete, ...render(<FlagshipPlanningRescue story={story} onComplete={onComplete} onBack={vi.fn()} />) };
}

describe('accessible flagship planning', () => {
  it('keeps all helper choices and cause-and-effect available when WebGL fails', async () => {
    const { onComplete } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Help Wren' }));
    await waitFor(() => expect(screen.getByText(/Use the helper pictures below/)).toBeTruthy());
    const branch = screen.getByRole('button', { name: 'Sturdy branch path' });
    expect(branch.tagName).toBe('BUTTON');
    expect(document.activeElement).toBe(branch);
    fireEvent.click(branch);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Soft moss bundle' }));
    expect(screen.getByText(/has fluttered one step up/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Soft moss bundle' }));
    expect(screen.getByText(/Soft moss lines the willow perch/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cozy nest cup' }));
    expect(screen.getByText(/Wren rests in the cozy nest cup/)).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Let Wren settle in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Let Wren settle in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bring Wren home' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('contains modal focus, removes the world controls from the accessibility tree, and restores focus', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Cozy nest cup' })).toBeNull();
    const help = screen.getByRole('button', { name: 'Help Wren' });
    const back = screen.getByRole('button', { name: 'Back to camp' });
    back.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(help);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(back);
    fireEvent.click(help);
    fireEvent.click(screen.getByRole('button', { name: 'Back to camp' }));
    expect(screen.queryByRole('button', { name: 'Cozy nest cup' })).toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sturdy branch path' }));
  });

  it('keeps a direct optional direction control available without autoplay', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Help Wren' }));
    expect(screen.getByText('Optional directions ready')).toBeTruthy();
    expect(retry).not.toHaveBeenCalled();
  });
});
