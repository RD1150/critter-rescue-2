import type * as Babylon from '@babylonjs/core';

declare global {
  interface Window {
    BABYLON?: typeof Babylon;
  }
}

let runtimePromise: Promise<typeof Babylon> | null = null;

/**
 * Loads the official Babylon.js browser build once. Keeping the large 3D engine
 * outside Vite's application bundle prevents deployment-time build pressure.
 */
export function loadBabylon(): Promise<typeof Babylon> {
  if (window.BABYLON) return Promise.resolve(window.BABYLON);
  if (runtimePromise) return runtimePromise;

  runtimePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/babylonjs@7.54.0/babylon.js';
    script.async = true;
    script.onload = () => window.BABYLON ? resolve(window.BABYLON) : reject(new Error('Babylon.js loaded without a runtime.'));
    script.onerror = () => reject(new Error('Unable to load the 3D engine.'));
    document.head.appendChild(script);
  });

  return runtimePromise;
}
