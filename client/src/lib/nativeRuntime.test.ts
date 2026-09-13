// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { getNativeAppOrigin, isNativeRuntime, parentFeedbackEnabled, resolveNativeNetworkUrl } from './nativeRuntime';

const nativeWindow = window as Window & { Capacitor?: { isNativePlatform?: () => boolean } };

afterEach(() => {
  delete nativeWindow.Capacitor;
});

describe('native release runtime helpers', () => {
  it('keeps browser paths relative and routes native paths to the reviewed HTTPS origin', () => {
    expect(isNativeRuntime()).toBe(false);
    expect(resolveNativeNetworkUrl('/manus-storage/direction.mp3')).toBe('/manus-storage/direction.mp3');

    nativeWindow.Capacitor = { isNativePlatform: () => true };
    expect(isNativeRuntime()).toBe(true);
    expect(resolveNativeNetworkUrl('/manus-storage/direction.mp3')).toBe(`${getNativeAppOrigin()}/manus-storage/direction.mp3`);
  });

  it('keeps parent beta feedback disabled unless a native release explicitly enables it', () => {
    expect(parentFeedbackEnabled()).toBe(false);
  });
});
