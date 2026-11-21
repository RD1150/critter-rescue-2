// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RescueScreen from './RescueScreen';
import { createFlagshipMission } from '../game/flagshipStories';

const sceneSpy = vi.hoisted(() => vi.fn());
const retrySpy = vi.hoisted(() => vi.fn());
const prefs = vi.hoisted(() => ({ captionsEnabled: true, spokenDirectionsEnabled: true, reduceMotion: false }));
vi.mock('../components/BabylonStoryRescueScene', () => ({ default: (props: { active: boolean; onChooseTool: (id: string) => void }) => { sceneSpy(props); return <button disabled={!props.active} onClick={() => props.onChooseTool('log')} aria-label="Place log in toy world">Toy world</button>; } }));
vi.mock('../components/CritterAvatar', () => ({ default: () => <span /> }));
vi.mock('../components/PreReaderDirection', () => ({ default: () => <p>Optional recorded directions</p> }));
vi.mock('../game/audioPreferences', () => ({ useAudioPreferences: () => [prefs] }));
vi.mock('../game/characterAudio', () => ({ hasCharacterAudio: () => false, playCharacterAudio: vi.fn(), playGentleRetryFeedback: retrySpy }));
vi.mock('../game/sounds', () => ({ playButton: vi.fn(), playComplete: vi.fn(), playChime: vi.fn(), playMatch: vi.fn(), playSnap: vi.fn(), playPickup: vi.fn(), playFlip: vi.fn(), playPatternNote: vi.fn(), playCatch: vi.fn(), playMilestone: vi.fn() }));

function setup(id: 'finn-riverside-crossing' | 'wren-cozy-nest', reduceMotion = false) {
  const onComplete = vi.fn();
  const onBack = vi.fn();
  const rendered = render(<RescueScreen mission={createFlagshipMission(id)} companionType="bunny" bgColors={['#FFFFFF']} onComplete={onComplete} onBack={onBack} isFirstMission={false} isEarlyMission={false} reduceMotion={reduceMotion} />);
  return { onComplete, onBack, ...rendered };
}

describe('flagship planning worlds in RescueScreen', () => {
  beforeEach(() => { sceneSpy.mockClear(); retrySpy.mockClear(); prefs.reduceMotion = false; window.history.replaceState({}, '', '/'); });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('changes Finn’s actual world in order, gives a named static retry cue, and never finishes on a timer', () => {
    vi.useFakeTimers();
    const { onComplete } = setup('finn-riverside-crossing');
    expect(sceneSpy).toHaveBeenLastCalledWith(expect.objectContaining({ active: false, placed: [] }));
    expect(screen.queryByText(/Clover/)).toBeNull();
    expect(retrySpy).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Help Finn' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rescue rope' }));
    expect(retrySpy).toHaveBeenCalledWith('rescue rope');
    expect(screen.getByText(/Rescue rope can help soon/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Bridge log, try this helper' })).toBeTruthy();
    expect(sceneSpy).toHaveBeenLastCalledWith(expect.objectContaining({ placed: [], cueToolId: 'log' }));
    fireEvent.click(screen.getByRole('button', { name: 'Place log in toy world' }));
    expect((screen.getByRole('button', { name: 'Bridge log, placed in the world' }) as HTMLButtonElement).disabled).toBe(true);
    expect(sceneSpy).toHaveBeenLastCalledWith(expect.objectContaining({ placed: ['log'] }));
    fireEvent.click(screen.getByRole('button', { name: 'Rescue rope' }));
    fireEvent.click(screen.getByRole('button', { name: 'Safe trail sign' }));
    expect(sceneSpy).toHaveBeenLastCalledWith(expect.objectContaining({ placed: ['log', 'rope', 'guide'] }));
    act(() => vi.advanceTimersByTime(600_000));
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Bring Finn home' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Visit Finn’s quiet nook' }));
    expect(screen.getByRole('heading', { name: 'Finn found the way home.' })).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Bring Finn home' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bring Finn home' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('lets Wren’s branch, moss, and open nest stay visibly placed and allows another quiet look', () => {
    const { onComplete } = setup('wren-cozy-nest', true);
    fireEvent.click(screen.getByRole('button', { name: 'Help Wren' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cozy nest cup' }));
    expect(retrySpy).toHaveBeenCalledWith('cozy nest cup');
    expect(screen.getByRole('button', { name: 'Sturdy branch path, try this helper' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Sturdy branch path/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Soft moss bundle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cozy nest cup' }));
    expect(sceneSpy).toHaveBeenLastCalledWith(expect.objectContaining({ placed: ['branchPath', 'mossBundle', 'nestCup'], reduceMotion: true }));
    expect(screen.getAllByText('Placed')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Let Wren settle in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Look at our little world' }));
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getAllByText('Placed')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Let Wren settle in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bring Wren home' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('uses safe Camp back without pressure or awarding completion', () => {
    const { onBack, onComplete } = setup('wren-cozy-nest');
    fireEvent.click(screen.getByRole('button', { name: 'Help Wren' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to camp' }));
    expect(screen.getByRole('dialog', { name: 'A little pause?' })).toBeTruthy();
    expect(screen.getByText(/whenever you like/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Keep helping Wren' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to camp' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'A little pause?' })).getByRole('button', { name: 'Back to camp' }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('honors OS and app Reduce Motion independently', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const first = setup('finn-riverside-crossing');
    expect(sceneSpy).toHaveBeenLastCalledWith(expect.objectContaining({ reduceMotion: true }));
    first.unmount();
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    prefs.reduceMotion = true;
    setup('wren-cozy-nest');
    expect(sceneSpy).toHaveBeenLastCalledWith(expect.objectContaining({ reduceMotion: true }));
  });

  it('supports only an explicit development visual-preview query, without auto-completion', () => {
    window.history.replaceState({}, '', '/?storyActive=1');
    const { onComplete } = setup('finn-riverside-crossing');
    expect(screen.queryByRole('button', { name: 'Help Finn' })).toBeNull();
    expect(sceneSpy).toHaveBeenLastCalledWith(expect.objectContaining({ active: true, placed: [] }));
    expect(onComplete).not.toHaveBeenCalled();
  });
});
