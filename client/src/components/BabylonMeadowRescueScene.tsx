import React, { useEffect, useRef, useState } from 'react';
import type * as Babylon from '@babylonjs/core';
import { loadBabylon } from '../lib/babylonRuntime';
import CritterAvatar from './CritterAvatar';

type Props = {
  active: boolean;
  completed: boolean;
  reduceMotion: boolean;
  onPathComplete: () => void;
  className?: string;
};

type ScreenPoint = { x: number; y: number };
const DOT_COUNT = 7;

export function distanceToTraceSegment(point: ScreenPoint, from: ScreenPoint, to: ScreenPoint): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared));
  return Math.hypot(point.x - from.x - t * dx, point.y - from.y - t * dy);
}

/**
 * The dotted route is drawn above the toy world as well as in it, so lighting,
 * small screens, or a failed engine can never hide the actual tracing activity.
 */
export default function BabylonMeadowRescueScene({ active, completed, reduceMotion, onPathComplete, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const live = useRef({ active, completed, reduceMotion, onPathComplete });
  const syncRef = useRef<(() => void) | null>(null);
  const tracedRef = useRef(0);
  const systemReduced = useRef(false);
  const notifiedRef = useRef(false);
  const dragging = useRef(false);
  const lastPointer = useRef<ScreenPoint | null>(null);
  const [traced, setTraced] = useState(0);
  const [sceneState, setSceneState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [layout, setLayout] = useState<{ width: number; height: number; points: ScreenPoint[] }>({ width: 375, height: 812, points: [] });

  const fallbackPoints = Array.from({ length: DOT_COUNT }, (_, index) => ({
    x: layout.width / 2 + (index / (DOT_COUNT - 1) - 0.5) * Math.min(layout.width - 76, 620),
    y: layout.height * 0.46 + Math.sin(index * 0.92) * 26,
  }));
  const screenPoints = layout.points.length === DOT_COUNT && sceneState === 'ready' ? layout.points : fallbackPoints;
  const pointRef = useRef(screenPoints);
  pointRef.current = screenPoints;

  const followDot = (index: number) => {
    if (!live.current.active || live.current.completed || notifiedRef.current || index !== tracedRef.current) return;
    tracedRef.current += 1;
    setTraced(tracedRef.current);
    syncRef.current?.();
    if (tracedRef.current === DOT_COUNT) {
      notifiedRef.current = true;
      live.current.onPathComplete();
    }
  };

  const tracePointer = (event: React.PointerEvent<SVGSVGElement>, moving: boolean) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const previous = moving && lastPointer.current ? lastPointer.current : point;
    // A quick swipe can cross several dots between browser pointer events.
    // Process the swept segment in order, with a finger-sized forgiving margin.
    for (let count = 0; count < DOT_COUNT; count++) {
      const next = pointRef.current[tracedRef.current];
      if (!next || distanceToTraceSegment(next, previous, point) > 28) break;
      const before = tracedRef.current;
      followDot(before);
      if (tracedRef.current === before) break;
    }
    lastPointer.current = point;
  };

  useEffect(() => {
    live.current = { active, completed, reduceMotion, onPathComplete };
    if (!active) { dragging.current = false; lastPointer.current = null; }
    syncRef.current?.();
  }, [active, completed, reduceMotion, onPathComplete]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const update = () => { systemReduced.current = media.matches; syncRef.current?.(); };
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const resize = () => setLayout((previous) => ({ ...previous, width: element.clientWidth || window.innerWidth || 375, height: element.clientHeight || window.innerHeight || 812 }));
    resize();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(element);
    window.addEventListener('resize', resize);
    return () => { observer?.disconnect(); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | null = null;
    let ownedEngine: Babylon.Engine | null = null;
    let ownedScene: Babylon.Scene | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;

    void loadBabylon().then((B) => {
      if (disposed) return;

      const engine = new B.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
      ownedEngine = engine;
      const scene = new B.Scene(engine);
      ownedScene = scene;
      scene.clearColor = B.Color4.FromHexString('#E9EEE2');
      scene.ambientColor = new B.Color3(0.55, 0.48, 0.35);

      const camera = new B.ArcRotateCamera('pip-meadow-camera', -Math.PI / 2, 0.82, 15.5, new B.Vector3(0, 0.7, 0), scene);
      camera.mode = B.Camera.ORTHOGRAPHIC_CAMERA;
      camera.lowerRadiusLimit = 15.5;
      camera.upperRadiusLimit = 15.5;
      camera.lowerBetaLimit = 0.82;
      camera.upperBetaLimit = 0.82;

      const sky = new B.HemisphericLight('meadow-sky', new B.Vector3(0.25, 1, 0.15), scene);
      sky.diffuse = B.Color3.FromHexString('#FFF0C9');
      sky.groundColor = B.Color3.FromHexString('#356242');
      sky.intensity = 0.8;
      const sunshine = new B.PointLight('meadow-sunshine', new B.Vector3(-2, 6, 2), scene);
      sunshine.diffuse = B.Color3.FromHexString('#FFE0A8');
      sunshine.intensity = 0.65;
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
      const pipFaceMat = makeMaterial('pip-meadow-face-cream', '#F8E6BE');
      const pipEyeMat = makeMaterial('pip-meadow-eye', '#2D2418');
      const pipEyeSparkMat = makeMaterial('pip-meadow-eye-spark', '#FFFFFF', 0.6);
      const pipBeakMat = makeMaterial('pip-meadow-beak', '#F1A743');
      const pipFootMat = makeMaterial('pip-meadow-feet', '#E98548');
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
      // Pip is fully modelled here instead of using an external image texture.
      // A WebGL texture that fails after a storage redirect renders Babylon's
      // red-and-black checkerboard, which is not acceptable in a child scene.
      const pipHead = B.MeshBuilder.CreateSphere('pip-meadow-head', { diameter: 0.92, segments: 16 }, scene);
      pipHead.parent = pipRoot;
      pipHead.position = new B.Vector3(0, 1.31, -0.16);
      pipHead.scaling = new B.Vector3(0.98, 1.05, 0.78);
      pipHead.material = pipBodyMat;
      shadow.addShadowCaster(pipHead);
      const facePatch = B.MeshBuilder.CreateSphere('pip-meadow-face-patch', { diameter: 0.62, segments: 14 }, scene);
      facePatch.parent = pipRoot;
      facePatch.position = new B.Vector3(0, 1.25, -0.61);
      facePatch.scaling = new B.Vector3(1.05, 1.12, 0.2);
      facePatch.material = pipFaceMat;
      [-0.18, 0.18].forEach((x, index) => {
        const eye = B.MeshBuilder.CreateSphere(`pip-meadow-eye-${index}`, { diameter: 0.125, segments: 10 }, scene);
        eye.parent = pipRoot;
        eye.position = new B.Vector3(x, 1.36, -0.75);
        eye.scaling = new B.Vector3(0.88, 1.08, 0.62);
        eye.material = pipEyeMat;
        const sparkle = B.MeshBuilder.CreateSphere(`pip-meadow-eye-spark-${index}`, { diameter: 0.035, segments: 8 }, scene);
        sparkle.parent = pipRoot;
        sparkle.position = new B.Vector3(x - 0.018, 1.385, -0.8);
        sparkle.material = pipEyeSparkMat;
      });
      const beak = B.MeshBuilder.CreateSphere('pip-meadow-beak', { diameter: 0.16, segments: 10 }, scene);
      beak.parent = pipRoot;
      beak.position = new B.Vector3(0, 1.17, -0.79);
      beak.scaling = new B.Vector3(1.1, 0.72, 0.55);
      beak.material = pipBeakMat;
      [-0.24, 0.24].forEach((x, index) => {
        const foot = B.MeshBuilder.CreateSphere(`pip-meadow-foot-${index}`, { diameter: 0.18, segments: 10 }, scene);
        foot.parent = pipRoot;
        foot.position = new B.Vector3(x, 0.32, -0.28);
        foot.scaling = new B.Vector3(1.15, 0.44, 0.78);
        foot.material = pipFootMat;
      });

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
        ring.material = makeMaterial(`pip-path-ring-mat-${index}`, '#FFF5C2', 0.62);
        ring.isPickable = false;
        dotRings.push(ring);
        // This near-invisible felt disc provides a generous tap/drag landing
        // area around each visible dot. It keeps the interaction kind on small
        // screens and avoids a thin-path precision requirement.
        const touchTarget = B.MeshBuilder.CreateDisc(`pip-path-touch-target-${index}`, { radius: 0.68, tessellation: 24, sideOrientation: B.Mesh.DOUBLESIDE }, scene);
        touchTarget.position = point.add(new B.Vector3(0, -0.04, 0));
        touchTarget.rotation.x = Math.PI / 2;
        touchTarget.material = touchTargetMaterial;
        touchTarget.metadata = { pathIndex: index };
      });

      const stitchMaterial = makeMaterial('pip-path-stitch-material', '#FFF9EF', 0.7);
      for (let segment = 0; segment < pathPoints.length - 1; segment++) {
        for (let stitch = 1; stitch <= 5; stitch++) {
          const bead = B.MeshBuilder.CreateSphere(`pip-path-stitch-${segment}-${stitch}`, { diameter: 0.12, segments: 8 }, scene);
          bead.position = B.Vector3.Lerp(pathPoints[segment], pathPoints[segment + 1], stitch / 6);
          bead.material = stitchMaterial;
          bead.isPickable = false;
        }
      }

      const startMarker = B.MeshBuilder.CreateTorus('pip-path-start-marker', { diameter: 0.95, thickness: 0.06, tessellation: 24 }, scene);
      startMarker.position = pathPoints[0].add(new B.Vector3(0, -0.12, 0));
      startMarker.material = makeMaterial('pip-path-start-marker-mat', '#FFE98E', 0.9);
      startMarker.isPickable = false;

      const sync = () => {
        pathPoints.forEach((_, index) => {
          const dot = scene.getMeshByName(`pip-path-dot-${index}`) as Babylon.Mesh;
          dot.material = index < tracedRef.current ? dotDone : dotWaiting;
          dotRings[index].visibility = index === tracedRef.current ? 1 : index < tracedRef.current ? 0.4 : 0.3;
        });
        startMarker.setEnabled(tracedRef.current === 0);
      };
      syncRef.current = sync;
      sync();

      let elapsed = 0;
      scene.onBeforeRenderObservable.add(() => {
        const seconds = engine.getDeltaTime() / 1000;
        elapsed += seconds;
        const completedPath = live.current.completed || tracedRef.current === DOT_COUNT;
        if (live.current.reduceMotion || systemReduced.current) {
          pipRoot.position.y = 0.06;
          pipRoot.rotation.z = 0;
          startMarker.visibility = 0.9;
          bloomMeshes.forEach((bloom) => { bloom.scaling.y = 1; });
          return;
        }
        pipRoot.position.y = 0.06 + (completedPath ? Math.sin(elapsed * 3.4) * 0.12 : Math.sin(elapsed * 1.7) * 0.045);
        pipRoot.rotation.z = completedPath ? Math.sin(elapsed * 2.4) * 0.12 : 0;
        startMarker.visibility = 0.62 + Math.sin(elapsed * 3) * 0.28;
        if (live.current.active && !completedPath) {
          dotRings.forEach((ring, index) => {
            ring.visibility = index === tracedRef.current ? 0.74 + Math.sin(elapsed * 4.2) * 0.2 : 0.3;
          });
        }
        if (completedPath) {
          bloomMeshes.forEach((bloom, index) => {
            bloom.scaling.y = 1 + Math.sin(elapsed * 2.4 + index) * 0.12;
          });
        }
      });

      engine.runRenderLoop(() => scene.render());
      const resize = () => {
        engine.resize();
        const width = canvas.clientWidth || window.innerWidth || 375;
        const height = canvas.clientHeight || window.innerHeight || 812;
        const worldWidth = Math.max(8, 7.5 * width / height);
        camera.orthoLeft = -worldWidth / 2;
        camera.orthoRight = worldWidth / 2;
        camera.orthoTop = worldWidth * height / width / 2;
        camera.orthoBottom = -camera.orthoTop;
        scene.render();
        const viewport = camera.viewport.toGlobal(width, height);
        const points = pathPoints.map((point) => {
          const projected = B.Vector3.Project(point, B.Matrix.Identity(), scene.getTransformMatrix(), viewport);
          return { x: projected.x, y: projected.y };
        });
        if (!disposed) setLayout({ width, height, points });
      };
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
      observer?.observe(canvas);
      window.addEventListener('resize', resize);
      cleanup = () => {
        observer?.disconnect();
        window.removeEventListener('resize', resize);
        engine.stopRenderLoop();
        scene.dispose();
        engine.dispose();
      };
      resize();
      setSceneState('ready');
    }).catch(() => {
      syncRef.current = null;
      if (cleanup) { cleanup(); cleanup = null; }
      else { ownedEngine?.stopRenderLoop(); ownedScene?.dispose(); ownedEngine?.dispose(); }
      if (!disposed) setSceneState('fallback');
    });

    return () => {
      disposed = true;
      syncRef.current = null;
      cleanup?.();
    };
  }, []);

  const path = screenPoints.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
  const finishedPath = screenPoints.slice(0, traced).map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
  const start = screenPoints[0];
  const end = screenPoints[screenPoints.length - 1];
  return <div ref={containerRef} className={`absolute inset-0 bg-[#E9EEE2] ${className}`} data-scene-state={sceneState} data-traced-dots={traced}>
    {sceneState !== 'ready' && <div className="absolute inset-0 bg-gradient-to-b from-[#E9EEE2] to-[#B9CC9D]" aria-hidden="true"><div className="absolute left-[10%] top-[25%] h-24 w-20 rounded-full bg-[#8DA77C]" /><div className="absolute right-[10%] top-[27%] h-20 w-16 rounded-full bg-[#91AB80]" /><div className="absolute inset-x-[7%] top-[40%] h-[18%] rounded-[50%] bg-[#DCE5C7]" /><div className="absolute" style={{ left: end.x - 36, top: end.y - 95 }}><CritterAvatar type="bird" size={72} /></div></div>}
    <canvas ref={canvasRef} aria-hidden="true" className={`absolute inset-0 h-full w-full ${sceneState === 'ready' ? '' : 'invisible'}`} />
    <svg ref={svgRef} width="100%" height="100%" tabIndex={0} role="application"
      aria-label="Pip's dotted flower path. Start at Start here and slide along the dots to Pip, or tap the next dot. Press Enter to follow the next dot."
      className="absolute inset-0 touch-none focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-[#FFF9EF]"
      onPointerDown={(event) => { dragging.current = true; lastPointer.current = null; event.currentTarget.setPointerCapture?.(event.pointerId); tracePointer(event, false); }}
      onPointerMove={(event) => { if (dragging.current) tracePointer(event, true); }}
      onPointerUp={(event) => { dragging.current = false; lastPointer.current = null; if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={() => { dragging.current = false; lastPointer.current = null; }}
      onKeyDown={(event) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); followDot(tracedRef.current); } }}>
      <path d={path} fill="none" stroke="#FFF9EF" strokeWidth={13} strokeLinecap="round" />
      <path data-testid="pip-dotted-route" d={path} fill="none" stroke="#96642D" strokeWidth={5} strokeDasharray="1 13" strokeLinecap="round" />
      <path d={finishedPath} fill="none" stroke="#DB9B2F" strokeWidth={9} strokeLinecap="round" />
      {screenPoints.map((point, index) => <g key={index} role="button" tabIndex={active && !completed && index === traced ? 0 : -1} aria-label={index === 0 && traced === 0 ? 'Start here. Trace to Pip.' : index === traced ? 'Next dot on Pip’s path' : `Dot ${index + 1} on Pip’s path`} aria-disabled={!active || completed || index !== traced} onClick={() => followDot(index)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5D3D2A]" data-path-index={index}>
        {index === traced && !completed && <circle cx={point.x} cy={point.y} r={25} fill="#FFF9EF" stroke="#A56C20" strokeWidth={3} />}
        <circle cx={point.x} cy={point.y} r={17} fill={index < traced ? '#F2BC4D' : '#FFF8DA'} stroke="#96642D" strokeWidth={3} />
        <circle cx={point.x} cy={point.y} r={8} fill={index < traced ? '#A56C20' : '#E6AC35'} />
        <circle cx={point.x} cy={point.y} r={28} fill="transparent" />
      </g>)}
    </svg>
    {active && !completed && traced === 0 && <div className="pointer-events-none absolute rounded-xl border-2 border-[#A56C20] bg-[#FFF9EF] px-2 py-1 font-body text-sm font-bold text-[#5D3D2A] shadow-md" style={{ left: Math.max(6, start.x - 38), top: start.y - 67 }}>Start here ↓</div>}
    <p className="sr-only" role="status">{traced === DOT_COUNT ? 'Pip’s whole path is ready.' : traced === 0 ? 'Start here, then follow the dotted line to Pip.' : 'Keep following the dotted line. Your flowers stay lit.'}</p>
  </div>;
}
