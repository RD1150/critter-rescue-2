// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as Babylon from '@babylonjs/core';
import BabylonCampScene from './BabylonCampScene';
import { FLAGSHIP_STORIES } from '../game/flagshipStories';
import { getHomeDecorationMeshIds } from '../game/homeDecorations';
import { getCareCelebration } from '../game/critterCelebrations';

const runtime = vi.hoisted(() => ({
  scenes: [] as Babylon.Scene[],
  engines: [] as Babylon.NullEngine[],
  textures: [] as string[],
  load: vi.fn(),
}));

// Exercise the real Babylon scene graph without WebGL, image requests, or a browser.
vi.mock('../lib/babylonRuntime', () => ({
  loadBabylon: () => runtime.load(),
}));

async function headlessBabylon() {
  const B = await import('@babylonjs/core');
  class TestEngine extends B.NullEngine {
    constructor() {
      super({ renderWidth: 800, renderHeight: 600, textureSize: 512, deterministicLockstep: false, lockstepMaxSteps: 4 });
      runtime.engines.push(this);
    }
    runRenderLoop = vi.fn();
    stopRenderLoop = vi.fn();
    getDeltaTime = () => 16;
  }
  class TestScene extends B.Scene {
    constructor(engine: Babylon.AbstractEngine) {
      super(engine);
      runtime.scenes.push(this);
    }
  }
  class LocalTexture extends B.Texture {
    constructor(url: string, scene: Babylon.Scene) {
      super(null, scene);
      runtime.textures.push(url);
    }
  }
  class LocalDynamicTexture extends B.Texture {
    constructor(_name: string, _size: unknown, scene: Babylon.Scene) {
      super(null, scene);
    }
    drawText = vi.fn();
  }
  return { ...B, Engine: TestEngine, Scene: TestScene, Texture: LocalTexture, DynamicTexture: LocalDynamicTexture };
}

const callbacks = () => ({
  onCompanionClick: vi.fn(),
  onCritterClick: vi.fn(),
  onHomeClick: vi.fn(),
  onRescueTrailClick: vi.fn(),
  onDecorationRendered: vi.fn(),
});

async function renderCamp(extra: Partial<React.ComponentProps<typeof BabylonCampScene>> = {}) {
  runtime.load.mockImplementation(headlessBabylon);
  const handlers = callbacks();
  const view = render(<BabylonCampScene companionType="fox" rescuedCritters={[FLAGSHIP_STORIES[0].friend]} {...handlers} {...extra} />);
  await waitFor(() => expect(runtime.scenes.at(-1)?.getMeshByName('plush-face-Your Companion')).toBeTruthy(), { timeout: 15000 });
  return { ...view, ...handlers, scene: runtime.scenes.at(-1)!, engine: runtime.engines.at(-1)! };
}

function step(scene: Babylon.Scene, count = 1) {
  for (let i = 0; i < count; i++) scene.onBeforeRenderObservable.notifyObservers(scene);
}

function pick(scene: Babylon.Scene, name: string) {
  const manager = scene.getMeshByName(name)?.actionManager;
  expect(manager).toBeTruthy();
  manager!.processTrigger(1); // ActionManager.OnPickTrigger
}

afterEach(() => {
  cleanup();
  runtime.scenes.length = 0;
  runtime.engines.length = 0;
  runtime.textures.length = 0;
  vi.restoreAllMocks();
});

describe('gentle procedural sanctuary', () => {
  it('has a flat trail, continuous sage terrain, petaled flowers, and no flames or duplicate plush ears', async () => {
    const { scene } = await renderCamp({ season: 'spring', kindnessMoments: 15, completedFlagshipStories: ['pip-flower-path', 'finn-riverside-crossing', 'wren-cozy-nest'] });
    expect(scene.clearColor.r).toBeGreaterThan(0.8);
    expect(scene.clearColor.g).toBeGreaterThan(0.8);
    expect(scene.getMeshByName('sage-meadow')).toBeTruthy();
    expect(scene.getMeshByName('stitched-trail')?.rotation.x).toBe(0);
    expect(scene.getMeshByName('home-care-ring-Pip')?.rotation.x).toBe(0);
    expect(scene.getMeshByName('flagship-pip-twig-nest')?.rotation.x).toBe(0);
    expect(scene.getMeshByName('picnic-lantern')).toBeTruthy();
    expect(scene.getMeshByName('flower-3.6--2.7')?.getTotalVertices()).toBeGreaterThan(100);
    expect(scene.meshes.filter((mesh) => /flame|^ear-|^label-/.test(mesh.name))).toHaveLength(0);
    expect(scene.getLightByName('warm-daylight')).toBeTruthy();
    expect(scene.getLightByName('hearth-glow')).toBeNull();
    expect(scene.getMeshByName('flagship-finn-bridge-plank-0')).toBeTruthy();
    expect(scene.getMeshByName('flagship-wren-nest')).toBeTruthy();
    expect(runtime.textures.every((url) => url.startsWith('/manus-storage/plush-'))).toBe(true);
    expect(scene.activeCamera?.fovMode).toBe(1); // Horizontal FOV fixed for phone framing.
    const face = scene.getMeshByName('plush-face-Your Companion')!;
    const material = face.material as Babylon.StandardMaterial;
    expect(material.disableLighting).toBe(true);
    expect(material.emissiveColor.asArray()).toEqual([1, 1, 1]);
    expect((material.diffuseTexture as Babylon.Texture).vScale).toBe(-1);
    expect((material.diffuseTexture as Babylon.Texture).vOffset).toBe(1);
    expect(face.billboardMode).toBe(7);
  });

  it('preserves companion, home, rescue, and decoration interactions without decorative blockers', async () => {
    const pip = FLAGSHIP_STORIES[0].friend;
    const finn = FLAGSHIP_STORIES[1].friend;
    const result = await renderCamp({ rescueFriend: finn, homeDecor: { [pip.id]: 'tea-time-picnic' } });
    pick(result.scene, 'plush-face-Your Companion');
    pick(result.scene, 'plush-body-Your Companion');
    expect(result.onCompanionClick).toHaveBeenCalledTimes(2);
    pick(result.scene, 'plush-face-Pip');
    pick(result.scene, 'home-stump-Pip');
    pick(result.scene, 'home-care-ring-Pip');
    expect(result.onHomeClick).toHaveBeenCalledTimes(3);
    expect(result.onHomeClick).toHaveBeenLastCalledWith(pip);
    pick(result.scene, 'plush-face-Finn needs help');
    pick(result.scene, 'rescue-sign');
    expect(result.onRescueTrailClick).toHaveBeenCalledTimes(2);
    const ids = getHomeDecorationMeshIds('tea-time-picnic', pip.name);
    expect(result.onDecorationRendered).toHaveBeenCalledWith(pip.name, 'tea-time-picnic', ids);
    ids.forEach((id) => expect(result.scene.getMeshByName(id)?.actionManager).toBeTruthy());
    expect(result.scene.getMeshByName('picnic-blanket')?.isPickable).toBe(false);
    expect(result.scene.getMeshByName('sage-meadow')?.isPickable).toBe(false);
  });

  it('keeps reduced-motion plushes, motes, and camera fully static and disposes its engine', async () => {
    const { scene, engine, unmount } = await renderCamp({ reduceMotion: true, season: 'winter', celebration: getCareCelebration('Your Companion', 'fox', 2) });
    const bestie = scene.getTransformNodeByName('plush-Your Companion')!;
    const motes = scene.meshes.filter((mesh) => mesh.name.startsWith('seed-mote-'));
    const initialHeights = motes.map((mote) => mote.position.y);
    const alpha = (scene.activeCamera as Babylon.ArcRotateCamera).alpha;
    step(scene, 120);
    expect(bestie.position.y).toBe(0.02);
    expect(bestie.rotation.asArray()).toEqual([0, 0, 0]);
    expect(motes.map((mote) => mote.position.y)).toEqual(initialHeights);
    expect((scene.activeCamera as Babylon.ArcRotateCamera).alpha).toBe(alpha);
    expect((scene.activeCamera as Babylon.ArcRotateCamera).inertia).toBe(0);
    expect(scene.clearColor.b).toBeGreaterThan(0.85);
    const dispose = vi.spyOn(engine, 'dispose');
    const removeListener = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(scene.isDisposed).toBe(true);
    expect(dispose).toHaveBeenCalledOnce();
    expect(engine.stopRenderLoop).toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('does not construct a late-loaded scene after unmount', async () => {
    let resolve!: (value: unknown) => void;
    runtime.load.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const view = render(<BabylonCampScene companionType="fox" rescuedCritters={[]} {...callbacks()} />);
    view.unmount();
    await act(async () => resolve(await headlessBabylon()));
    expect(runtime.scenes).toHaveLength(0);
    expect(runtime.engines).toHaveLength(0);
  });
});
