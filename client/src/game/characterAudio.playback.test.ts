// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GENTLE_RETRY_AUDIO, playGentleRetryFeedback, playPreReaderDirection, PRE_READER_AUDIO } from './characterAudio';

const { getAudioPreferences } = vi.hoisted(() => ({ getAudioPreferences: vi.fn() }));

vi.mock('./audioPreferences', () => ({
  getAudioPreferences,
}));

describe('pre-reader direction playback', () => {
  const previousAudio = window.Audio;

  beforeEach(() => {
    getAudioPreferences.mockReturnValue({ spokenDirectionsEnabled: true, voiceVolume: 0.42 });
  });

  afterEach(() => {
    Object.defineProperty(window, 'Audio', { configurable: true, value: previousAudio });
  });

  it('plays one named gentle retry after a child makes a picture choice', () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const pause = vi.fn();
    const addEventListener = vi.fn();
    const AudioMock = vi.fn().mockImplementation(function (this: { preload: string; volume: number; paused: boolean; ended: boolean; play: typeof play; pause: typeof pause; addEventListener: typeof addEventListener }) {
      this.preload = '';
      this.volume = 1;
      this.paused = true;
      this.ended = false;
      this.play = play;
      this.pause = pause;
      this.addEventListener = addEventListener;
    });
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock });

    expect(playGentleRetryFeedback('fish')).toBe(true);
    expect(AudioMock).toHaveBeenCalledWith(GENTLE_RETRY_AUDIO.fish);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('preloads and starts the Nutty onboarding clip after an explicit Listen request', async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const pause = vi.fn();
    const addEventListener = vi.fn();
    const load = vi.fn();
    const AudioMock = vi.fn().mockImplementation(function (this: { preload: string; volume: number; currentTime: number; play: typeof play; pause: typeof pause; load: typeof load; addEventListener: typeof addEventListener }) {
      this.preload = '';
      this.volume = 1;
      this.currentTime = 2;
      this.play = play;
      this.pause = pause;
      this.load = load;
      this.addEventListener = addEventListener;
    });
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock });

    await expect(playPreReaderDirection('onboarding')).resolves.toBe(true);
    expect(AudioMock).toHaveBeenCalledWith(PRE_READER_AUDIO.onboarding);
    expect(load).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('does not pretend to play when a saved parent volume is muted', async () => {
    getAudioPreferences.mockReturnValue({ spokenDirectionsEnabled: true, voiceVolume: 0 });
    const onMuted = vi.fn();
    const AudioMock = vi.fn();
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock });

    await expect(playPreReaderDirection('tracing', { onMuted })).resolves.toBe(false);
    expect(onMuted).toHaveBeenCalledTimes(1);
    expect(AudioMock).not.toHaveBeenCalled();
  });
});
