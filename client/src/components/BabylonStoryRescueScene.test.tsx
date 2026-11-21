// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BabylonStoryRescueScene, { storyWorldDescription } from './BabylonStoryRescueScene';

const runtime = vi.hoisted(() => ({ load: vi.fn(), engines: [] as any[], scenes: [] as any[] }));
vi.mock('@/lib/babylonRuntime', () => ({ loadBabylon: runtime.load }));

afterEach(() => { cleanup(); runtime.engines.length = 0; runtime.scenes.length = 0; vi.restoreAllMocks(); });

async function useNullRuntime() {
  // Root imports exist only in tests, never in the browser application bundle.
  const B = await import('@babylonjs/core');
  class TestEngine extends B.NullEngine {
    constructor() { super({ renderWidth: 600, renderHeight: 400, textureSize: 128, deterministicLockstep: false, lockstepMaxSteps: 4 }); runtime.engines.push(this); }
    runRenderLoop(fn: () => void) { fn(); }
    resize() {}
  }
  class TestScene extends B.Scene {
    constructor(engine: BabylonEngine) { super(engine); runtime.scenes.push(this); }
  }
  type BabylonEngine = InstanceType<typeof B.Engine>;
  runtime.load.mockResolvedValue({ ...B, Engine: TestEngine, Scene: TestScene });
}

const props = { storyId: 'finn-riverside-crossing' as const, placed: [], active: true, cueToolId: null, reduceMotion: true, onChooseTool: vi.fn() };

describe('procedural story scene', () => {
  it('offers meaningful semantic world state when the engine cannot load', async () => {
    runtime.load.mockRejectedValue(new Error('WebGL unavailable'));
    const view = render(<BabylonStoryRescueScene {...props} />);
    await waitFor(() => expect(view.container.querySelector('[data-scene-state="fallback"]')).toBeTruthy());
    expect(screen.getByText(/Use the helper pictures below/)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/waits safely/);
    view.rerender(<BabylonStoryRescueScene {...props} placed={['log', 'rope', 'guide']} />);
    expect(screen.getByRole('status').textContent).toMatch(/log bridge, soft rope, and safe trail sign are in place/);
  });

  it('builds a local river world once and keeps placed helpers visible with an instant reduced-motion response', async () => {
    await useNullRuntime();
    const view = render(<BabylonStoryRescueScene {...props} />);
    await waitFor(() => expect(view.container.querySelector('[data-scene-state="ready"]')).toBeTruthy());
    const scene = runtime.scenes[0];
    expect(scene.getMeshByName('river-channel')).toBeTruthy();
    expect(scene.getMeshByName('friend-face')).toBeTruthy();
    expect(scene.getMeshByName('cheek-0')).toBeTruthy();
    expect(scene.getTransformNodeByName('placed-helper-log').isEnabled()).toBe(false);
    view.rerender(<BabylonStoryRescueScene {...props} placed={['log']} />);
    expect(runtime.engines).toHaveLength(1);
    expect(scene.getTransformNodeByName('placed-helper-log').isEnabled()).toBe(true);
    expect(scene.getTransformNodeByName('helper-tray-log').isEnabled()).toBe(false);
    view.rerender(<BabylonStoryRescueScene {...props} placed={['log', 'rope', 'guide']} />);
    expect(scene.getMeshByName('rope-handrail').isEnabled()).toBe(true);
    expect(scene.getTransformNodeByName('finn-plush').position.x).toBe(3.2);
    expect(scene.textures.every((texture: { isRenderTarget: boolean }) => texture.isRenderTarget)).toBe(true);
    expect(scene.getMeshByName('helper-static-cue-guide').isEnabled()).toBe(false);
    const dispose = vi.spyOn(runtime.engines[0], 'dispose');
    view.unmount();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('builds Wren’s branch route, moss, and woven open nest as persistent local meshes', async () => {
    await useNullRuntime();
    const view = render(<BabylonStoryRescueScene {...props} storyId="wren-cozy-nest" />);
    await waitFor(() => expect(view.container.querySelector('[data-scene-state="ready"]')).toBeTruthy());
    const scene = runtime.scenes[0];
    expect(scene.getMeshByName('willow-trunk')).toBeTruthy();
    view.rerender(<BabylonStoryRescueScene {...props} storyId="wren-cozy-nest" placed={['branchPath', 'mossBundle', 'nestCup']} />);
    expect(scene.getMeshByName('sturdy-branch-route').isEnabled()).toBe(true);
    expect(scene.getTransformNodeByName('placed-helper-mossBundle').isEnabled()).toBe(true);
    expect(scene.getTransformNodeByName('placed-helper-nestCup').isEnabled()).toBe(true);
    expect(scene.getTransformNodeByName('placed-helper-nestCup').getChildMeshes().every((mesh: { isEnabled: () => boolean }) => mesh.isEnabled())).toBe(true);
    expect(scene.getTransformNodeByName('wren-plush').position.y).toBe(2.89);
    expect(runtime.engines).toHaveLength(1);
  });

  it('does not create an engine when its lazy load resolves after unmount', async () => {
    let resolve!: (value: unknown) => void;
    runtime.load.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const view = render(<BabylonStoryRescueScene {...props} />);
    view.unmount();
    const Engine = vi.fn();
    await act(async () => { resolve({ Engine }); });
    expect(Engine).not.toHaveBeenCalled();
  });

  it('names every cause-and-effect in semantic descriptions', () => {
    expect(storyWorldDescription('finn-riverside-crossing', ['log'])).toMatch(/bridges the two riverbanks/);
    expect(storyWorldDescription('finn-riverside-crossing', ['log', 'rope'])).toMatch(/halfway/);
    expect(storyWorldDescription('wren-cozy-nest', ['branchPath'])).toMatch(/one step up/);
    expect(storyWorldDescription('wren-cozy-nest', ['branchPath', 'mossBundle'])).toMatch(/Soft moss/);
    expect(storyWorldDescription('wren-cozy-nest', ['branchPath', 'mossBundle', 'nestCup'])).toMatch(/rests in the cozy nest cup/);
  });
});
