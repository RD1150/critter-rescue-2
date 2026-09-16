import type * as Babylon from '@babylonjs/core';

/**
 * Web builds preserve the existing remote lazy-load strategy in babylonRuntime.
 * Vite replaces this module with babylonEngineLoader.native.ts for `--mode native`.
 */
export function loadBundledBabylon(): Promise<typeof Babylon> {
  return Promise.reject(new Error('The bundled Babylon runtime is available only in native builds.'));
}
