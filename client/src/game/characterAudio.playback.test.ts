// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { playPreReaderDirection, PRE_READER_AUDIO } from './characterAudio';

vi.mock('./audioPreferences', () => ({
  getAudioPreferences: () => ({ spokenDirectionsEnabled: true, voiceVolume: 0.42 }),
}));

describe('pre-reader direction playback', () => {
  const previousAudio = window.Audio;

  afterEach(() => {
    Object.defineProperty(window, 'Audio', { configurable: true, value: previousAudio });
  });

  it('preloads and starts the Nutty onboarding clip after an explicit Listen request', async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const pause = vi.fn();
    const addEventListener = vi.fn();
    const AudioMock = vi.fn().mockImplementation(function (this: { preload: string; volume: number; currentTime: number; play: typeof play; pause: typeof pause; addEventListener: typeof addEventListener }) {
      this.preload = '';
      this.volume = 1;
      this.currentTime = 2;
      this.play = play;
      this.pause = pause;
      this.addEventListener = addEventListener;
    });
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock });

    await expect(playPreReaderDirection('onboarding')).resolves.toBe(true);
    expect(AudioMock).toHaveBeenCalledWith(PRE_READER_AUDIO.onboarding);
    expect(play).toHaveBeenCalledTimes(1);
  });
});
