// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CritterStorybookScreen from './CritterStorybookScreen';
import { FLAGSHIP_STORIES } from '../game/flagshipStories';

vi.mock('../components/CritterAvatar', () => ({ default: ({ type }: { type: string }) => <span aria-label={`${type} plush`} /> }));
vi.mock('../components/PrintableAdoptionCard', () => ({ default: () => null }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn() }));

const renderBook = (completedFlagshipStories: ('pip-flower-path' | 'finn-riverside-crossing' | 'wren-cozy-nest')[], onReplayStory = vi.fn(), onStartNextStory = vi.fn()) => render(
  <CritterStorybookScreen
    rescuedCritters={FLAGSHIP_STORIES.filter((story) => completedFlagshipStories.includes(story.id)).map((story) => story.friend)}
    homeDecor={{}}
    season="spring"
    seasonalKeepsakes={[]}
    selectedBestieType="fox"
    completedFlagshipStories={completedFlagshipStories}
    onReplayStory={onReplayStory}
    onStartNextStory={onStartNextStory}
    onChooseDecor={vi.fn()}
    onCelebrateSeason={vi.fn()}
    onBack={vi.fn()}
  />,
);

describe('Bestie Book', () => {
  afterEach(cleanup);

  it('shows a calm first-page invitation before a flagship rescue', () => {
    renderBook([]);
    expect(screen.getByRole('heading', { name: 'Your first page is waiting' })).toBeTruthy();
    expect(screen.queryByText(/score|streak|countdown|purchase/i)).toBeNull();
  });

  it('keeps the completed story, Bestie, and sanctuary change together in one memory page', () => {
    renderBook(['pip-flower-path', 'finn-riverside-crossing']);
    expect(screen.getByRole('heading', { name: 'Pip’s Flower Path' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Finn’s Riverside Crossing' })).toBeTruthy();
    expect(screen.getByText(/flower path and twig nest/i)).toBeTruthy();
    expect(screen.getByText(/riverside bridge/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Cozy homes/i }));
    expect(screen.getByText(/Pip’s home/i)).toBeTruthy();
  });

  it('offers a large replay button only for each completed memory', () => {
    const replay = vi.fn();
    renderBook(['pip-flower-path'], replay);
    fireEvent.click(screen.getByRole('button', { name: 'Play with Pip again' }));
    expect(replay).toHaveBeenCalledWith('pip-flower-path');
    expect(screen.queryByRole('button', { name: 'Play with Finn again' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Play with Pip again' }).className).toContain('min-h-14');
  });

  it('starts the first story from an empty Book without a navigation dead end', () => {
    const start = vi.fn();
    renderBook([], vi.fn(), start);
    fireEvent.click(screen.getByRole('button', { name: 'Help Pip' }));
    expect(start).toHaveBeenCalledOnce();
  });
});
