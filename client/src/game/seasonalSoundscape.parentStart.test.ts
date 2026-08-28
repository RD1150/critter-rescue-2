// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { startParentSelectedSoundscape, syncSeasonalSoundscape } from './seasonalSoundscape';

describe('parent-started soundscape playback', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('prepares an enabled preference without playing until the grown-up explicitly starts it', () => {
    const instances: Array<{ src: string; loop: boolean; volume: number; play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn> }> = [];
    class AudioStub {
      src: string;
      loop = false;
      volume = 0;
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
      constructor(src: string) { this.src = new URL(src, window.location.href).href; instances.push(this); }
    }
    vi.stubGlobal('Audio', AudioStub);
    const preference = { soundscapeEnabled: true, soundscapeVolume: 0.2, soundscapeStyle: 'ritual' as const };
    syncSeasonalSoundscape(preference, 'spring');
    expect(instances).toHaveLength(1);
    expect(instances[0]?.play).not.toHaveBeenCalled();
    startParentSelectedSoundscape(preference, 'spring');
    expect(instances[0]?.play).toHaveBeenCalledTimes(1);
  });
});
