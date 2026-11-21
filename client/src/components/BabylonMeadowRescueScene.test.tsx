// @vitest-environment jsdom
import React from 'react';
import type * as Babylon from '@babylonjs/core';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BabylonMeadowRescueScene from './BabylonMeadowRescueScene';

const runtime = vi.hoisted(() => ({
  load: vi.fn(),
  engines: [] as Babylon.NullEngine[],
  scenes: [] as Babylon.Scene[],
}));
vi.mock('../lib/babylonRuntime', () => ({ loadBabylon: () => runtime.load() }));

beforeEach(() => { runtime.load.mockReset(); });
afterEach(() => {
  cleanup();
  runtime.engines.length = 0;
  runtime.scenes.length = 0;
  vi.restoreAllMocks();
});

async function useNullRuntime() {
  // The root runtime import is tests-only; exercise real meshes without WebGL.
  const B = await import('@babylonjs/core');
  class TestEngine extends B.NullEngine {
    constructor() {
      super({ renderWidth: 800, renderHeight: 600, textureSize: 128, deterministicLockstep: false, lockstepMaxSteps: 4 });
      runtime.engines.push(this);
    }
    runRenderLoop = vi.fn((renderFrame: () => void) => renderFrame());
    stopRenderLoop = vi.fn();
    resize = vi.fn();
    getDeltaTime = () => 16;
  }
  class TestScene extends B.Scene {
    constructor(engine: Babylon.AbstractEngine) {
      super(engine);
      runtime.scenes.push(this);
    }
  }
  const module = { ...B, Engine: TestEngine, Scene: TestScene };
  runtime.load.mockResolvedValue(module);
  return module;
}

const baseProps = { active: true, completed: false, reduceMotion: true };

function pathDots() {
  return screen.getAllByRole('button', { name: /^(Start here\. Trace to Pip\.|Next dot on Pip’s path|Dot \d+ on Pip’s path)$/ });
}

async function renderReady(extra: Partial<React.ComponentProps<typeof BabylonMeadowRescueScene>> = {}) {
  await useNullRuntime();
  const onPathComplete = vi.fn();
  const view = render(<BabylonMeadowRescueScene {...baseProps} onPathComplete={onPathComplete} {...extra} />);
  await waitFor(() => expect(view.container.querySelector('[data-scene-state="ready"]')).toBeTruthy(), { timeout: 15000 });
  expect(runtime.scenes[0]?.getMeshByName('pip-path-dot-6')).toBeTruthy();
  return { ...view, onPathComplete, scene: runtime.scenes[0], engine: runtime.engines[0] };
}

function step(scene: Babylon.Scene, count = 1) {
  for (let index = 0; index < count; index++) scene.onBeforeRenderObservable.notifyObservers(scene);
}

describe('Pip’s visible meadow tracing path', () => {
  it('keeps the screen path playable when the lazy Babylon runtime rejects', async () => {
    runtime.load.mockRejectedValue(new Error('WebGL unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onPathComplete = vi.fn();
    const view = render(<BabylonMeadowRescueScene {...baseProps} onPathComplete={onPathComplete} />);
    await waitFor(() => expect(view.container.querySelector('[data-scene-state="fallback"]')).toBeTruthy());
    expect(runtime.engines).toHaveLength(0);
    expect(screen.getByText(/^Start here\s*↓?$/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start here. Trace to Pip.' })).toBeTruthy();
    const dots = pathDots();
    expect(dots).toHaveLength(7);
    expect(view.container.querySelector('svg [stroke-dasharray]')).toBeTruthy();
    dots.forEach((dot) => fireEvent.click(dot));
    expect(onPathComplete).toHaveBeenCalledTimes(1);
  });

  it('requires sequential dot taps and completes exactly once, without advancing on skipped dots', async () => {
    const { onPathComplete } = await renderReady();
    const dots = pathDots();
    fireEvent.click(dots[3]);
    expect(screen.getByRole('button', { name: 'Start here. Trace to Pip.' })).toBe(dots[0]);
    fireEvent.click(dots[0]);
    expect(screen.getByRole('button', { name: 'Next dot on Pip’s path' })).toBe(dots[1]);
    fireEvent.click(dots[0]);
    fireEvent.click(dots[2]);
    expect(screen.getByRole('button', { name: 'Next dot on Pip’s path' })).toBe(dots[1]);
    dots.slice(1, -1).forEach((dot) => fireEvent.click(dot));
    expect(onPathComplete).not.toHaveBeenCalled();
    fireEvent.click(dots.at(-1)!);
    dots.forEach((dot) => fireEvent.click(dot));
    expect(onPathComplete).toHaveBeenCalledTimes(1);
  });

  it('supports a native pointer drag across the visible screen dots', async () => {
    const { onPathComplete } = await renderReady();
    const dots = pathDots();
    const svg = screen.getByRole('application');
    const coordinates = dots.map((dot) => {
      const circle = dot.querySelector('circle')!;
      return { clientX: Number(circle.getAttribute('cx')), clientY: Number(circle.getAttribute('cy')) + 20 };
    });
    // Pointer capture delivers moves to the SVG; a 20px offset is still a kind hit.
    fireEvent.pointerMove(svg, { pointerId: 1, pointerType: 'touch', ...coordinates[0] });
    expect(screen.getByRole('button', { name: 'Start here. Trace to Pip.' })).toBe(dots[0]);
    fireEvent.pointerDown(dots[0], { pointerId: 1, pointerType: 'touch', buttons: 1, ...coordinates[0] });
    coordinates.slice(1).forEach((point) => fireEvent.pointerMove(svg, { pointerId: 1, pointerType: 'touch', buttons: 1, ...point }));
    fireEvent.pointerUp(svg, { pointerId: 1, pointerType: 'touch', buttons: 0, ...coordinates.at(-1)! });
    expect(onPathComplete).toHaveBeenCalledTimes(1);
  });

  it('builds a dotted connector and flat horizontal torus rings, not a huge upright arch', async () => {
    const { scene } = await renderReady();
    const stitches = scene.meshes.filter((mesh) => mesh.name.startsWith('pip-path-stitch-'));
    expect(stitches.length).toBeGreaterThanOrEqual(18);
    stitches.forEach((mesh) => {
      expect(mesh.isVisible).toBe(true);
      expect(mesh.position.y).toBeLessThan(0.5);
    });
    const rings = scene.meshes.filter((mesh) => /^pip-path-ring-|^pip-path-start-marker$|^meadow-trail-ring$/.test(mesh.name));
    expect(rings.length).toBeGreaterThanOrEqual(8);
    rings.forEach((ring) => {
      expect(ring.rotation.asArray()).toEqual([0, 0, 0]);
      ring.computeWorldMatrix(true);
      const bounds = ring.getBoundingInfo().boundingBox;
      expect(bounds.maximumWorld.y - bounds.minimumWorld.y).toBeLessThan(0.3);
    });
    expect(scene.textures.every((texture) => texture.isRenderTarget)).toBe(true);
  });

  it('updates motion and callbacks live while preserving tracing progress and a single engine', async () => {
    const { rerender, scene, onPathComplete } = await renderReady({ reduceMotion: false });
    const dots = pathDots();
    dots.slice(0, 3).forEach((dot) => fireEvent.click(dot));
    step(scene, 20);
    const pip = scene.getTransformNodeByName('pip-meadow-plush')!;
    expect(pip.position.y).not.toBe(0.06);
    const latestComplete = vi.fn();
    rerender(<BabylonMeadowRescueScene {...baseProps} onPathComplete={latestComplete} />);
    expect(screen.getByRole('button', { name: 'Next dot on Pip’s path' })).toBe(dots[3]);
    step(scene, 20);
    expect(runtime.engines).toHaveLength(1);
    expect(runtime.load).toHaveBeenCalledTimes(1);
    expect(pip.position.y).toBe(0.06);
    expect(pip.rotation.z).toBe(0);
    rerender(<BabylonMeadowRescueScene {...baseProps} active={false} onPathComplete={latestComplete} />);
    fireEvent.click(dots[3]);
    expect(screen.getByRole('button', { name: 'Next dot on Pip’s path' })).toBe(dots[3]);
    rerender(<BabylonMeadowRescueScene {...baseProps} onPathComplete={latestComplete} />);
    dots.slice(3).forEach((dot) => fireEvent.click(dot));
    expect(latestComplete).toHaveBeenCalledTimes(1);
    expect(onPathComplete).not.toHaveBeenCalled();
    rerender(<BabylonMeadowRescueScene {...baseProps} completed onPathComplete={latestComplete} />);
    dots.forEach((dot) => fireEvent.click(dot));
    expect(latestComplete).toHaveBeenCalledTimes(1);
    expect(runtime.engines).toHaveLength(1);
  });

  it('honors device reduced motion without replacing the scene or losing dots', async () => {
    let reduced = false;
    let onChange = () => {};
    const media = {
      get matches() { return reduced; },
      addEventListener: vi.fn((_event: string, callback: () => void) => { onChange = callback; }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', vi.fn(() => media));
    try {
      const { scene, unmount } = await renderReady({ reduceMotion: false });
      const dots = pathDots();
      fireEvent.click(dots[0]);
      step(scene, 10);
      const pip = scene.getTransformNodeByName('pip-meadow-plush')!;
      expect(pip.position.y).not.toBe(0.06);
      reduced = true;
      onChange();
      step(scene, 10);
      expect(pip.position.y).toBe(0.06);
      expect(screen.getByRole('button', { name: 'Next dot on Pip’s path' })).toBe(dots[1]);
      expect(runtime.engines).toHaveLength(1);
      unmount();
      expect(media.removeEventListener).toHaveBeenCalledWith('change', onChange);
    } finally { vi.unstubAllGlobals(); }
  });

  it('follows the next dot with Enter or Space, completing only once', async () => {
    const { onPathComplete } = await renderReady();
    const svg = screen.getByRole('application');
    for (let index = 0; index < 9; index++) fireEvent.keyDown(svg, { key: index % 2 ? ' ' : 'Enter' });
    expect(onPathComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toBe('Pip’s whole path is ready.');
  });

  it('disposes the scene and engine and removes its resize listener on unmount', async () => {
    const { unmount, scene, engine } = await renderReady();
    const dispose = vi.spyOn(engine, 'dispose');
    const removeListener = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(scene.isDisposed).toBe(true);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(engine.stopRenderLoop).toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('never constructs an engine when a pending lazy load resolves after unmount', async () => {
    let resolve!: (value: unknown) => void;
    runtime.load.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const view = render(<BabylonMeadowRescueScene {...baseProps} onPathComplete={vi.fn()} />);
    view.unmount();
    const Engine = vi.fn();
    await act(async () => { resolve({ Engine }); });
    expect(Engine).not.toHaveBeenCalled();
    expect(runtime.engines).toHaveLength(0);
    expect(runtime.scenes).toHaveLength(0);
  });
});
