import * as Babylon from '@babylonjs/core';

/** Native Capacitor bundles use this local engine module so camp play works without a CDN engine request. */
export function loadBundledBabylon(): Promise<typeof Babylon> {
  return Promise.resolve(Babylon);
}
