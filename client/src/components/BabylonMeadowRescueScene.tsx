import React, { useEffect, useRef } from 'react';
import type * as Babylon from '@babylonjs/core';
import { loadBabylon } from '../lib/babylonRuntime';
import { PLUSH_IMAGES } from './CritterAvatar';

type Props = {
  active: boolean;
  completed: boolean;
  reduceMotion: boolean;
  onPathComplete: () => void;
  className?: string;
};

/**
 * A small self-contained toy diorama for Pip's first Meadow rescue. The path
 * dots are actual Babylon meshes: children may glide across them or tap the
 * next large glowing dot. React owns the surrounding instructions and state.
 */
export default function BabylonMeadowRescueScene({ active, completed, reduceMotion, onPathComplete, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const completeRef = useRef(onPathComplete);

  useEffect(() => {
    completeRef.current = onPathComplete;
  }, [onPathComplete]);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;

    void loadBabylon().then((B) => {
      if (disposed) return;

      const engine = new B.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
      const scene = new B.Scene(engine);
      scene.clearColor = B.Color4.FromHexString('#6AAFC0');
      scene.ambientColor = new B.Color3(0.55, 0.48, 0.35);

      const camera = new B.ArcRotateCamera('pip-meadow-camera', -Math.PI / 2.3, 1.08, 15.5, new B.Vector3(0, 0.7, 0), scene);
      camera.lowerRadiusLimit = 15.5;
      camera.upperRadiusLimit = 15.5;
      camera.lowerBetaLimit = 1.08;
      camera.upperBetaLimit = 1.08;

      const sky = new B.HemisphericLight('meadow-sky', new B.Vector3(0.25, 1, 0.15), scene);
      sky.diffuse = B.Color3.FromHexString('#FFF0C9');
      sky.groundColor = B.Color3.FromHexString('#356242');
      sky.intensity = 0.9;
      const sunshine = new B.PointLight('meadow-sunshine', new B.Vector3(-2, 6, 2), scene);
      sunshine.diffuse = B.Color3.FromHexString('#FFE0A8');
      sunshine.intensity = 1.7;
      sunshine.range = 16;
      const shadow = new B.ShadowGenerator(1024, sunshine);
      shadow.useBlurExponentialShadowMap = true;
      shadow.blurKernel = 18;

      const makeMaterial = (name: string, color: string, emissive = 0) => {
        const material = new B.StandardMaterial(name, scene);
        material.diffuseColor = B.Color3.FromHexString(color);
        material.specularColor = new B.Color3(0.03, 0.03, 0.03);
        if (emissive) material.emissiveColor = B.Color3.FromHexString(color).scale(emissive);
        return material;
      };

      const grass = makeMaterial('meadow-felt-grass', '#5F9A58');
      const clearing = B.MeshBuilder.CreateDisc('meadow-clearing', { radius: 8.5, tessellation: 72 }, scene);
      clearing.rotation.x = Math.PI / 2;
      clearing.material = grass;
      clearing.receiveShadows = true;

      const soil = makeMaterial('meadow-path-soil', '#D7B77F');
      const trail = B.MeshBuilder.CreateTorus('meadow-trail-ring', { diameter: 10.8, thickness: 0.18, tessellation: 56 }, scene);
      trail.rotation.x = Math.PI / 2;
      trail.position.y = 0.04;
      trail.material = soil;

      const trunk = makeMaterial('meadow-trunk', '#865B3C');
      const leafA = makeMaterial('meadow-leaf-a', '#347548');
      const leafB = makeMaterial('meadow-leaf-b', '#4B9455');
      const makeTree = (x: number, z: number, scale: number, leaves: Babylon.StandardMaterial) => {
        const tree = new B.TransformNode(`meadow-tree-${x}-${z}`, scene);
        tree.position = new B.Vector3(x, 0, z);
        const trunkMesh = B.MeshBuilder.CreateCylinder(`meadow-tree-trunk-${x}-${z}`, { height: scale * 2.15, diameterTop: scale * 0.32, diameterBottom: scale * 0.55, tessellation: 10 }, scene);
        trunkMesh.parent = tree;
        trunkMesh.position.y = scale * 1.06;
        trunkMesh.material = trunk;
        shadow.addShadowCaster(trunkMesh);
        const crown = B.MeshBuilder.CreateSphere(`meadow-tree-crown-${x}-${z}`, { diameter: scale * 2.25, segments: 12 }, scene);
        crown.parent = tree;
        crown.position.y = scale * 2.45;
        crown.scaling = new B.Vector3(1, 1.12, 0.9);
        crown.material = leaves;
        shadow.addShadowCaster(crown);
      };
      [[-6.2, -3.5, 1.6, leafA], [-5.5, 4.5, 1.45, leafB], [5.9, 4.4, 1.55, leafA], [6.4, -3.1, 1.7, leafB]].forEach(([x, z, scale, leaves]) => makeTree(x as number, z as number, scale as number, leaves as Babylon.StandardMaterial));

      const stem = makeMaterial('meadow-flower-stem', '#3F7F45');
      const flowerColors = ['#F5C842', '#F1B4C0', '#E66B5B', '#C6B0E4'];
      const makeFlower = (x: number, z: number, color: string, size = 1) => {
        const stemMesh = B.MeshBuilder.CreateCylinder(`meadow-stem-${x}-${z}`, { height: 0.35 * size, diameter: 0.04 * size, tessellation: 6 }, scene);
        stemMesh.position = new B.Vector3(x, 0.17 * size, z);
        stemMesh.material = stem;
        const bloom = B.MeshBuilder.CreateSphere(`meadow-bloom-${x}-${z}`, { diameter: 0.3 * size, segments: 8 }, scene);
        bloom.position = new B.Vector3(x, 0.39 * size, z);
        bloom.material = makeMaterial(`meadow-bloom-mat-${x}-${z}`, color, 0.1);
        shadow.addShadowCaster(bloom);
        return bloom;
      };
      const bloomMeshes = [
        [-2.9, 0.6], [-2.2, -0.25], [-1.5, -0.9], [-0.55, -1.15], [0.35, -0.76], [1.25, -0.1], [2.1, 0.46],
        [-3.8, -1.25], [-2.7, -1.7], [-1.3, 1.15], [0.1, 1.25], [2.9, 1.14], [3.85, -0.7],
      ].map(([x, z], index) => makeFlower(x, z, flowerColors[index % flowerColors.length], index < 7 ? 1.12 : 0.82));

      const pipRoot = new B.TransformNode('pip-meadow-plush', scene);
      // Pip waits beside the final dot, so the friend stays visible while the
      // child traces instead of reading as a distant background decoration.
      pipRoot.position = new B.Vector3(2.25, 0.06, -1.15);
      pipRoot.scaling = new B.Vector3(0.9, 0.9, 0.9);
      const pipBodyMat = makeMaterial('pip-meadow-body', '#89C8DF');
      const pipBody = B.MeshBuilder.CreateSphere('pip-meadow-body-mesh', { diameter: 1.25, segments: 16 }, scene);
      pipBody.parent = pipRoot;
      pipBody.position.y = 0.88;
      pipBody.scaling = new B.Vector3(0.82, 1, 0.56);
      pipBody.material = pipBodyMat;
      shadow.addShadowCaster(pipBody);
      [-0.58, 0.58].forEach((x, index) => {
        const wing = B.MeshBuilder.CreateSphere(`pip-meadow-wing-${index}`, { diameter: 0.62, segments: 12 }, scene);
        wing.parent = pipRoot;
        wing.position = new B.Vector3(x, 0.84, 0.08);
        wing.scaling = new B.Vector3(0.7, 0.85, 0.38);
        wing.material = pipBodyMat;
        shadow.addShadowCaster(wing);
      });
      const faceMaterial = new B.StandardMaterial('pip-meadow-face', scene);
      const faceTexture = new B.Texture(PLUSH_IMAGES.bird, scene, false, false);
      faceTexture.hasAlpha = true;
      faceTexture.vScale = -1;
      faceTexture.vOffset = 1;
      faceMaterial.diffuseTexture = faceTexture;
      faceMaterial.opacityTexture = faceTexture;
      faceMaterial.useAlphaFromDiffuseTexture = true;
      faceMaterial.backFaceCulling = false;
      faceMaterial.specularColor = new B.Color3(0, 0, 0);
      const face = B.MeshBuilder.CreatePlane('pip-meadow-face-mesh', { width: 1.75, height: 1.75 }, scene);
      face.parent = pipRoot;
      face.position = new B.Vector3(0, 0.9, -0.7);
      face.billboardMode = B.Mesh.BILLBOARDMODE_ALL;
      face.material = faceMaterial;
      face.isPickable = false;

      const pathPoints = Array.from({ length: 7 }, (_, index) => new B.Vector3(-3.15 + index * 0.91, 0.2, -0.7 + Math.sin(index * 0.92) * 0.78));
      const dotWaiting = makeMaterial('pip-path-waiting', '#F5C842', 0.34);
      const dotDone = makeMaterial('pip-path-done', '#FFF3AD', 0.9);
      const touchTargetMaterial = new B.StandardMaterial('pip-path-touch-target', scene);
      touchTargetMaterial.diffuseColor = new B.Color3(1, 1, 1);
      touchTargetMaterial.alpha = 0.001;
      const dotRings: Babylon.Mesh[] = [];
      pathPoints.forEach((point, index) => {
        const dot = B.MeshBuilder.CreateSphere(`pip-path-dot-${index}`, { diameter: 0.44, segments: 14 }, scene);
        dot.position = point;
        dot.material = dotWaiting;
        dot.metadata = { pathIndex: index };
        shadow.addShadowCaster(dot);
        const ring = B.MeshBuilder.CreateTorus(`pip-path-ring-${index}`, { diameter: 0.66, thickness: 0.045, tessellation: 20 }, scene);
        ring.position = point.add(new B.Vector3(0, -0.1, 0));
        ring.rotation.x = Math.PI / 2;
        ring.material = makeMaterial(`pip-path-ring-mat-${index}`, '#FFF5C2', 0.62);
        ring.isPickable = false;
        dotRings.push(ring);
        // This near-invisible felt disc provides a generous tap/drag landing
        // area around each visible dot. It keeps the interaction kind on small
        // screens and avoids a thin-path precision requirement.
        const touchTarget = B.MeshBuilder.CreateDisc(`pip-path-touch-target-${index}`, { radius: 0.68, tessellation: 24 }, scene);
        touchTarget.position = point.add(new B.Vector3(0, -0.04, 0));
        touchTarget.rotation.x = Math.PI / 2;
        touchTarget.material = touchTargetMaterial;
        touchTarget.metadata = { pathIndex: index };
      });

      const startMarker = B.MeshBuilder.CreateTorus('pip-path-start-marker', { diameter: 0.95, thickness: 0.06, tessellation: 24 }, scene);
      startMarker.position = pathPoints[0].add(new B.Vector3(0, -0.12, 0));
      startMarker.rotation.x = Math.PI / 2;
      startMarker.material = makeMaterial('pip-path-start-marker-mat', '#FFE98E', 0.9);
      startMarker.isPickable = false;

      let tracing = false;
      let nextDot = 0;
      let completedPath = completed;
      const paintNextDot = (index: number) => {
        if (!active || completedPath || index !== nextDot) return;
        const dot = scene.getMeshByName(`pip-path-dot-${index}`) as Babylon.Mesh | null;
        if (!dot) return;
        dot.material = dotDone;
        dot.scaling = new B.Vector3(1.22, 1.22, 1.22);
        dotRings[index].visibility = 0.38;
        nextDot += 1;
        if (nextDot >= pathPoints.length) {
          completedPath = true;
          pathPoints.forEach((_, dotIndex) => {
            const finished = scene.getMeshByName(`pip-path-dot-${dotIndex}`) as Babylon.Mesh | null;
            if (finished) finished.material = dotDone;
          });
          completeRef.current();
        }
      };
      const pointerCoordinates = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: (event.clientX - rect.left) * (engine.getRenderWidth() / rect.width),
          y: (event.clientY - rect.top) * (engine.getRenderHeight() / rect.height),
        };
      };
      const traceAtPointer = (event: PointerEvent) => {
        if (!active || completedPath) return;
        const pointer = pointerCoordinates(event);
        const pick = scene.pick(pointer.x, pointer.y);
        const pathIndex = (pick?.pickedMesh?.metadata as { pathIndex?: number } | undefined)?.pathIndex;
        if (typeof pathIndex === 'number') paintNextDot(pathIndex);
      };
      const onPointerDown = (event: PointerEvent) => {
        tracing = true;
        canvas.setPointerCapture?.(event.pointerId);
        traceAtPointer(event);
      };
      const onPointerMove = (event: PointerEvent) => {
        if (tracing) traceAtPointer(event);
      };
      const onPointerUp = (event: PointerEvent) => {
        tracing = false;
        if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (!active || completedPath || !['Enter', ' ', 'Spacebar'].includes(event.key)) return;
        event.preventDefault();
        paintNextDot(nextDot);
      };
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('keydown', onKeyDown);

      let elapsed = 0;
      scene.onBeforeRenderObservable.add(() => {
        const seconds = engine.getDeltaTime() / 1000;
        elapsed += seconds;
        if (reduceMotion) {
          pipRoot.position.y = 0.06;
          pipRoot.rotation.z = 0;
          startMarker.visibility = 0.9;
          return;
        }
        pipRoot.position.y = 0.06 + (completedPath ? Math.sin(elapsed * 3.4) * 0.12 : Math.sin(elapsed * 1.7) * 0.045);
        pipRoot.rotation.z = completedPath ? Math.sin(elapsed * 2.4) * 0.12 : 0;
        startMarker.visibility = 0.62 + Math.sin(elapsed * 3) * 0.28;
        if (active && !completedPath) {
          dotRings.forEach((ring, index) => {
            ring.visibility = index === nextDot ? 0.74 + Math.sin(elapsed * 4.2) * 0.2 : 0.3;
          });
        }
        if (completedPath) {
          bloomMeshes.forEach((bloom, index) => {
            bloom.scaling.y = 1 + Math.sin(elapsed * 2.4 + index) * 0.12;
          });
        }
      });

      engine.runRenderLoop(() => scene.render());
      const resize = () => engine.resize();
      window.addEventListener('resize', resize);
      cleanup = () => {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        canvas.removeEventListener('keydown', onKeyDown);
        scene.dispose();
        engine.dispose();
      };
    }).catch((error) => console.error('Critter Rescue Meadow scene could not load:', error));

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [active, completed, reduceMotion]);

  return <canvas ref={canvasRef} tabIndex={0} role="application" className={`absolute inset-0 h-full w-full touch-none ${className}`} aria-label="Pip's interactive Sunny Meadow flower path. Tap or glide across the glowing dots in order. Press Enter to follow one dot at a time." />;
}
