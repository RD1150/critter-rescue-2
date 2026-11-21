import React, { useEffect, useRef, useState } from 'react';
import type * as Babylon from '@babylonjs/core';
import { loadBabylon } from '@/lib/babylonRuntime';
import type { PlanningStoryId, PlanningToolId } from './FlagshipPlanningRescue';

type Props = {
  storyId: PlanningStoryId;
  placed: readonly PlanningToolId[];
  active: boolean;
  cueToolId: PlanningToolId | null;
  reduceMotion: boolean;
  onChooseTool: (id: PlanningToolId) => void;
};

export function storyWorldDescription(storyId: PlanningStoryId, placed: readonly PlanningToolId[]): string {
  if (storyId === 'finn-riverside-crossing') {
    if (placed.includes('guide')) return 'Finn rests in the quiet water nook. The log bridge, soft rope, and safe trail sign are in place.';
    if (placed.includes('rope')) return 'A soft rope runs beside the log bridge. Finn is halfway to the cozy bank.';
    if (placed.includes('log')) return 'The log now bridges the two riverbanks. Finn has a steady crossing.';
    return 'Finn waits safely beside the river. Two felt riverbanks need a log bridge.';
  }
  if (placed.includes('nestCup')) return 'Wren rests in the cozy nest cup. The sturdy branch path and soft moss stay in place.';
  if (placed.includes('mossBundle')) return 'Soft moss lines the willow perch. Wren is ready for the cozy nest cup.';
  if (placed.includes('branchPath')) return 'The sturdy branch path reaches the willow perch. Wren has fluttered one step up.';
  return 'Wren waits safely under the willow. A sturdy branch will make a path up to the perch.';
}

/** A useful picture even before the engine arrives, or when WebGL is unavailable. */
function QuietWorldPicture({ river, placed }: { river: boolean; placed: readonly PlanningToolId[] }) {
  return <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid meet" aria-hidden="true" className="absolute inset-0 h-full w-full">
    <defs><linearGradient id="story-fallback-sky" x2="0" y2="1"><stop stopColor="#E8EEE1" /><stop offset="1" stopColor="#F6EDD8" /></linearGradient></defs>
    <rect width="600" height="360" fill="url(#story-fallback-sky)" />
    <ellipse cx="300" cy="295" rx="234" ry="35" fill="#DADCCB" />
    <ellipse cx="300" cy="252" rx="230" ry="65" fill="#9CAD89" />
    {river ? <><path d="M272 186q64 22 5 138h91q62-99-5-138" fill="#9BC3C0" /><path d="M300 216h30m-36 62h31m-17 22h31" stroke="#D4E7DC" strokeWidth="5" strokeLinecap="round" />{placed.includes('log') && <path d="M215 244l164-3" stroke="#B08A66" strokeWidth="28" strokeLinecap="round" />}{placed.includes('rope') && <path d="M211 223q70-28 169 0" fill="none" stroke="#EBD4AB" strokeWidth="6" />}{placed.includes('guide') && <g><path d="M425 213v49" stroke="#AC8263" strokeWidth="8" /><path d="M402 197h42l15 12-15 12h-42" fill="#DCA68A" /></g>}</> : <><path d="M380 264q-26-89 6-165" stroke="#B2916B" strokeWidth="33" fill="none" /><path d="M380 182l-76-17" stroke="#B2916B" strokeWidth="18" strokeLinecap="round" /><g fill="#91A783"><ellipse cx="373" cy="95" rx="95" ry="51" /><ellipse cx="301" cy="105" rx="62" ry="45" /><ellipse cx="438" cy="128" rx="48" ry="69" /></g>{placed.includes('branchPath') && <path d="M209 262l134-80" stroke="#AC8762" strokeWidth="17" strokeLinecap="round" />}{placed.includes('mossBundle') && <ellipse cx="315" cy="171" rx="35" ry="13" fill="#B2C399" />}{placed.includes('nestCup') && <path d="M282 161q8 43 35 43t35-43" fill="#CAA17B" />}</>}
    <g transform={`translate(${river ? (placed.includes('guide') ? 421 : placed.includes('rope') ? 302 : 200) : (placed.length ? 307 : 205)},${river ? 224 : placed.includes('nestCup') ? 157 : placed.length ? 155 : 238})`}>
      <ellipse rx="29" ry="26" fill={river ? '#DFA58C' : '#B69B7E'} /><ellipse cx="-4" cy="5" rx="20" ry="17" fill="#FFF0D5" /><circle cx="-13" cy="-5" r="4" fill="#514635" /><circle cx="9" cy="-5" r="4" fill="#514635" /><circle cx="-14" cy="-6" r="1.4" fill="white" /><circle cx="8" cy="-6" r="1.4" fill="white" /><ellipse cx="-21" cy="5" rx="5" ry="3" fill="#E8B6A5" /><ellipse cx="17" cy="5" rx="5" ry="3" fill="#E8B6A5" />{river ? <path d="M24-4l23-15v35L24 7" fill="#DFA58C" /> : <path d="M-4 4l8 5-8 5z" fill="#DCAA75" />}
    </g>
    <g fill="#819A75"><ellipse cx="125" cy="202" rx="36" ry="49" /><ellipse cx="481" cy="240" rx="23" ry="20" /><ellipse cx="104" cy="247" rx="28" ry="21" /></g>
    <g fill="#F0C7B3"><circle cx="148" cy="274" r="7" /><circle cx="474" cy="284" r="6" /><circle cx="448" cy="295" r="5" /></g>
  </svg>;
}

/** One stable scene per story; placing helpers updates nodes, never rebuilds the engine. */
export default function BabylonStoryRescueScene(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef(props);
  const syncRef = useRef<(() => void) | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const river = props.storyId === 'finn-riverside-crossing';
  useEffect(() => { live.current = props; syncRef.current?.(); }, [props]);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | null = null;
    let ownedEngine: Babylon.Engine | null = null;
    let ownedScene: Babylon.Scene | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setState('loading');
    void loadBabylon().then((B) => {
      if (disposed) return;
      const engine = new B.Engine(canvas, true, { stencil: true, preserveDrawingBuffer: false, adaptToDeviceRatio: false });
      ownedEngine = engine;
      engine.setHardwareScalingLevel(Math.max(1, window.devicePixelRatio / 1.5));
      const scene = new B.Scene(engine);
      ownedScene = scene;
      scene.clearColor = B.Color4.FromHexString('#E9EEE2FF');
      const camera = new B.ArcRotateCamera('story-camera', -Math.PI / 2 - 0.08, 1.04, 16, new B.Vector3(0, river ? 1.15 : 1.55, 0), scene);
      camera.mode = B.Camera.ORTHOGRAPHIC_CAMERA;
      camera.minZ = 0.1;
      const sky = new B.HemisphericLight('cream-skylight', new B.Vector3(-0.3, 1, -0.5), scene);
      sky.intensity = 0.8;
      sky.diffuse = B.Color3.FromHexString('#FFF4DA');
      sky.groundColor = B.Color3.FromHexString('#9DAA8B');
      const sun = new B.DirectionalLight('soft-sun', new B.Vector3(0.4, -1, 0.6), scene);
      sun.position = new B.Vector3(-5, 9, -5);
      sun.diffuse = B.Color3.FromHexString('#FFF1D2');
      sun.intensity = 0.35;
      const shadow = new B.ShadowGenerator(512, sun);
      shadow.usePercentageCloserFiltering = true;
      shadow.bias = 0.003;
      shadow.darkness = 0.15;
      const mat = (name: string, hex: string) => {
        const m = new B.StandardMaterial(name, scene);
        m.diffuseColor = B.Color3.FromHexString(hex);
        m.specularColor = new B.Color3(0.025, 0.025, 0.025);
        return m;
      };
      const cream = mat('cream-felt', '#FFF0D6');
      const peach = mat('peach-felt', '#DCA286');
      const blush = mat('blush-stitches', '#E5B2A4');
      const sage = mat('sage-felt', '#A7B591');
      const leaf = mat('willow-felt', '#839E79');
      const moss = mat('moss-felt', '#A8BF91');
      const bark = mat('wood-felt', '#AA8261');
      const cutWood = mat('cut-wood-felt', '#E3C19B');
      const ropeMat = mat('soft-rope', '#EDD9AE');
      const waterMat = mat('river-fabric', '#9BC3C1');
      const rippleMat = mat('water-stitches', '#CAE1D6');
      const eyeMat = mat('plush-eyes', '#403B30');
      const white = mat('eye-catchlight', '#FFFFFF');
      const soil = mat('diorama-edge', '#DFCEB0');
      const root = new B.TransformNode('story-world', scene);
      const sphere = (name: string, position: number[], scale: number[], material: Babylon.StandardMaterial, parent: Babylon.TransformNode = root) => {
        const mesh = B.MeshBuilder.CreateSphere(name, { diameter: 1, segments: 16 }, scene);
        mesh.parent = parent;
        mesh.position.set(position[0], position[1], position[2]);
        mesh.scaling.set(scale[0], scale[1], scale[2]);
        mesh.material = material;
        mesh.isPickable = false;
        shadow.addShadowCaster(mesh);
        return mesh;
      };
      const tube = (name: string, points: number[][], radius: number, material: Babylon.StandardMaterial, parent: Babylon.TransformNode = root) => {
        const mesh = B.MeshBuilder.CreateTube(name, { path: points.map((p) => new B.Vector3(p[0], p[1], p[2])), radius, tessellation: 10, cap: B.Mesh.CAP_ALL }, scene);
        mesh.parent = parent;
        mesh.material = material;
        mesh.isPickable = false;
        shadow.addShadowCaster(mesh);
        return mesh;
      };
      const island = sphere('rounded-toy-island', [0, -0.3, 0], [10.3, 0.9, 7.5], soil);
      island.receiveShadows = true;
      const meadow = sphere('felt-land', [0, -0.03, 0], [10, 0.55, 7.2], sage);
      meadow.receiveShadows = true;
      if (river) {
        sphere('river-channel', [0, 0.265, 0], [2.9, 0.13, 6.8], waterMat).receiveShadows = true;
        [-2.3, -1.25, 1.45, 2.5].forEach((z, i) => tube(`river-stitch-${i}`, [[-0.5, 0.34, z], [0, 0.34, z + 0.07], [0.5, 0.34, z]], 0.018, rippleMat));
        sphere('quiet-water-nook', [3.2, 0.28, 0.3], [2.2, 0.14, 2], waterMat);
        [-1, 1].forEach((side) => sphere(`river-rock-${side}`, [side * 1.85, 0.3, 0], [1.1, 0.45, 1.1], cream));
        [-3, -1.7, 1.7, 3].forEach((z, i) => {
          const x = i % 2 ? 1.7 : -1.7;
          for (let n = 0; n < 3; n++) {
            tube(`reed-${i}-${n}`, [[x + n * 0.16, 0.25, z], [x + n * 0.14, 0.85 + n * 0.07, z]], 0.025, leaf);
            sphere(`reed-tip-${i}-${n}`, [x + n * 0.14, 0.95 + n * 0.07, z], [0.11, 0.3, 0.11], bark);
          }
        });
      }
      const tree = (x: number, z: number, size: number) => {
        tube(`trunk-${x}`, [[x, 0.2, z], [x - 0.1, 1.8 * size, z], [x + 0.15, 3 * size, z]], 0.18 * size, bark);
        sphere(`tree-crown-${x}`, [x, 2.8 * size, z], [2.2 * size, 2 * size, 1.6 * size], leaf);
        sphere(`tree-crown-light-${x}`, [x - 0.5 * size, 3.5 * size, z - 0.1], [1.5 * size, 1.4 * size, 1.5 * size], sage);
      };
      tree(-3.9, 2.1, 0.75);
      tree(4, 2.4, 0.7);
      if (!river) {
        tube('willow-trunk', [[1.65, 0.2, 1], [1.9, 1.6, 1.2], [1.65, 3.8, 1.3]], 0.3, bark);
        tube('willow-perch', [[1.8, 2.5, 1.1], [1.25, 2.6, 0], [0.65, 2.5, -0.2]], 0.16, bark);
        sphere('willow-crown', [1.6, 4.15, 1.5], [3.1, 1.55, 2.1], sage);
        [-0.95, -0.55, 0, 0.65, 1].forEach((dx, i) => {
          tube(`willow-fall-${i}`, [[1.6 + dx, 4, 1.5], [1.6 + dx * 1.4, 3.6, 1.45], [1.6 + dx * 1.5, 2.9, 1.4]], 0.05, leaf);
          sphere(`willow-leaf-${i}`, [1.6 + dx * 1.5, 2.9, 1.4], [0.28, 0.65, 0.14], leaf);
        });
      }
      [[-4, -1.4], [4, -1.6], [-3.2, 1], [3.4, 1.9]].forEach(([x, z], i) => {
        sphere(`shrub-${i}`, [x, 0.34, z], [0.8, 0.7, 0.8], leaf);
        sphere(`shrub-tip-${i}`, [x + 0.3, 0.48, z], [0.6, 0.6, 0.6], sage);
      });
      [[-3.3, -1.3], [3.5, -1.3], [-2.8, 2.5], [2.6, 2.4], [-4, -0.7], [4, -0.7]].forEach(([x, z], i) => {
        tube(`flower-stem-${i}`, [[x, 0.2, z], [x, 0.55, z]], 0.025, leaf);
        const center = sphere(`flower-heart-${i}`, [x, 0.62, z], [0.13, 0.13, 0.13], cutWood);
        for (let petal = 0; petal < 5; petal++) {
          const a = petal * Math.PI * 2 / 5;
          sphere(`flower-${i}-${petal}`, [center.position.x + Math.cos(a) * 0.12, 0.62 + Math.sin(a) * 0.12, z], [0.18, 0.18, 0.08], i % 2 ? peach : cream);
        }
      });

      const friend = new B.TransformNode(river ? 'finn-plush' : 'wren-plush', scene);
      const bodyMat = river ? peach : mat('wren-plush-feathers', '#B59B7B');
      sphere('friend-body', [0, 0.55, 0], river ? [1.38, 0.93, 0.75] : [0.92, 1.1, 0.78], bodyMat, friend);
      sphere('friend-face', [0, 0.61, -0.32], [0.83, 0.72, 0.26], cream, friend);
      if (river) {
        sphere('finn-tail-top', [0.82, 0.68, 0.06], [0.7, 0.38, 0.16], peach, friend).rotation.z = -0.65;
        sphere('finn-tail-bottom', [0.82, 0.35, 0.06], [0.7, 0.38, 0.16], peach, friend).rotation.z = 0.65;
        sphere('finn-fin', [-0.27, 0.54, -0.4], [0.34, 0.36, 0.13], peach, friend).rotation.z = -0.5;
        sphere('finn-top-fin', [0.08, 1.03, 0.06], [0.4, 0.34, 0.16], peach, friend);
      } else {
        [-0.49, 0.49].forEach((x, i) => sphere(`wren-wing-${i}`, [x, 0.55, 0], [0.3, 0.65, 0.24], bodyMat, friend).rotation.z = x < 0 ? -0.3 : 0.3);
        sphere('wren-tuft', [0.02, 1.15, 0.01], [0.28, 0.4, 0.22], bodyMat, friend).rotation.z = -0.3;
        [-0.22, 0.22].forEach((x, i) => sphere(`wren-feet-${i}`, [x, 0.08, -0.14], [0.22, 0.14, 0.3], cutWood, friend));
      }
      [-0.2, 0.2].forEach((x, i) => {
        sphere(`eye-${i}`, [x, 0.73, -0.46], [0.115, 0.15, 0.08], eyeMat, friend);
        sphere(`eye-spark-${i}`, [x - 0.022, 0.765, -0.497], [0.035, 0.035, 0.025], white, friend);
        sphere(`cheek-${i}`, [x * 1.55, 0.56, -0.43], [0.15, 0.09, 0.045], blush, friend);
      });
      sphere(river ? 'finn-smile' : 'wren-beak', [0, 0.52, -0.49], river ? [0.09, 0.07, 0.04] : [0.15, 0.13, 0.18], river ? peach : cutWood, friend);
      // Stitched belly seam adds a handmade toy detail without an image texture.
      [-0.14, 0, 0.14].forEach((x, i) => tube(`belly-stitch-${i}`, [[x, 0.25, -0.36], [x + 0.05, 0.29, -0.38]], 0.009, cutWood, friend));

      const ids: PlanningToolId[] = river ? ['log', 'rope', 'guide'] : ['branchPath', 'mossBundle', 'nestCup'];
      const makeTool = (id: PlanningToolId, parent: Babylon.TransformNode) => {
        if (id === 'log') {
          tube('bridge-log', [[-0.88, 0.23, 0], [0.88, 0.23, 0]], 0.22, bark, parent);
          [-0.89, 0.89].forEach((x, i) => sphere(`log-end-${i}`, [x, 0.23, 0], [0.025, 0.4, 0.4], cutWood, parent));
          tube('log-stitched-grain', [[-0.7, 0.41, -0.1], [0.7, 0.41, -0.1]], 0.016, cutWood, parent);
        } else if (id === 'rope') {
          const points = Array.from({ length: 42 }, (_, i) => { const a = i / 41 * Math.PI * 2; return [Math.cos(a) * 0.48, 0.23, Math.sin(a) * 0.48]; });
          tube('rope-coil', points, 0.072, ropeMat, parent);
          tube('rope-tail', [[0.45, 0.23, 0], [0.65, 0.23, -0.15], [0.62, 0.23, -0.5]], 0.065, ropeMat, parent);
        } else if (id === 'guide') {
          tube('trail-sign-post', [[0, 0.06, 0], [0, 0.85, 0]], 0.07, bark, parent);
          const sign = B.MeshBuilder.CreateBox('safe-trail-sign', { width: 1, height: 0.42, depth: 0.13 }, scene);
          sign.parent = parent; sign.position.y = 0.83; sign.material = peach; sign.isPickable = false; shadow.addShadowCaster(sign);
          tube('sign-arrow-stem', [[-0.3, 0.83, -0.08], [0.28, 0.83, -0.08]], 0.025, cream, parent);
          tube('sign-arrow-head', [[0.1, 0.96, -0.08], [0.28, 0.83, -0.08], [0.1, 0.7, -0.08]], 0.025, cream, parent);
        } else if (id === 'branchPath') {
          tube('branch-helper', [[-0.8, 0.14, 0], [0.8, 0.42, 0]], 0.1, bark, parent);
          tube('branch-fork', [[0.12, 0.3, 0], [0.25, 0.64, 0.04]], 0.055, bark, parent);
          sphere('branch-leaf', [0.3, 0.63, 0.03], [0.4, 0.18, 0.11], leaf, parent).rotation.z = 0.7;
        } else if (id === 'mossBundle') {
          [-0.3, 0, 0.32].forEach((x, i) => sphere(`moss-puff-${i}`, [x, 0.24, i % 2 ? -0.1 : 0.05], [0.66, 0.48, 0.5], moss, parent));
          sphere('moss-highlight', [-0.08, 0.42, -0.08], [0.5, 0.14, 0.4], sage, parent);
        } else {
          // Open bowl of woven twigs: no opaque sphere hiding the moss or Wren.
          for (let row = 0; row < 4; row++) {
            const radius = 0.34 + row * 0.055;
            const points = Array.from({ length: 37 }, (_, i) => { const a = i / 36 * Math.PI * 2; return [Math.cos(a) * radius, 0.12 + row * 0.085, Math.sin(a) * radius]; });
            tube(`nest-woven-ring-${row}`, points, 0.047, row % 2 ? cutWood : bark, parent);
          }
          sphere('nest-floor', [0, 0.1, 0], [0.73, 0.1, 0.7], moss, parent);
          for (let twig = 0; twig < 8; twig++) {
            const a = twig * Math.PI / 4;
            tube(`nest-twig-${twig}`, [[Math.cos(a) * 0.4, 0.18, Math.sin(a) * 0.4], [Math.cos(a + 0.3) * 0.51, 0.38, Math.sin(a + 0.3) * 0.51]], 0.025, cutWood, parent);
          }
        }
      };
      const trays: Babylon.TransformNode[] = [];
      const placedNodes: Babylon.TransformNode[] = [];
      const rings: Babylon.Mesh[] = [];
      const hitMat = mat('helper-touch-area', '#FFFFFF');
      hitMat.alpha = 0.001;
      ids.forEach((id, i) => {
        const tray = new B.TransformNode(`helper-tray-${id}`, scene);
        tray.position.set(-2.65 + i * 2.65, 0.2, -2.55);
        const pad = sphere(`felt-tool-pad-${id}`, [0, -0.05, 0], [2, 0.15, 1.45], cream, tray);
        pad.receiveShadows = true;
        makeTool(id, tray);
        const hit = B.MeshBuilder.CreateBox(`helper-touch-${id}`, { width: 2, height: 1.25, depth: 1.5 }, scene);
        hit.parent = tray; hit.position.y = 0.4; hit.material = hitMat; hit.metadata = { toolId: id };
        const ring = B.MeshBuilder.CreateTorus(`helper-static-cue-${id}`, { diameter: 1.65, thickness: 0.065, tessellation: 32 }, scene);
        ring.parent = tray; ring.position.y = 0.06; ring.scaling.z = 0.76; ring.material = leaf; ring.isPickable = false;
        rings.push(ring); trays.push(tray);
        const inWorld = new B.TransformNode(`placed-helper-${id}`, scene);
        makeTool(id, inWorld);
        placedNodes.push(inWorld);
      });
      if (river) {
        placedNodes[0].position.set(0, 0.28, 0);
        placedNodes[0].scaling.set(2.45, 1.1, 1.4);
        // The placed rope is a proper handrail, not just its supply coil.
        placedNodes[1].getChildMeshes().forEach((mesh) => mesh.dispose());
        tube('rope-left-anchor', [[-2.1, 0.25, 0.45], [-2.1, 1.03, 0.45]], 0.055, bark, placedNodes[1]);
        tube('rope-right-anchor', [[2.1, 0.25, 0.45], [2.1, 1.03, 0.45]], 0.055, bark, placedNodes[1]);
        tube('rope-handrail', [[-2.1, 1.03, 0.45], [-1, 0.88, 0.45], [0, 0.8, 0.45], [1, 0.88, 0.45], [2.1, 1.03, 0.45]], 0.055, ropeMat, placedNodes[1]);
        placedNodes[2].position.set(2.8, 0.26, -0.8);
        [[-0.7, 0.015, 0.8], [-0.1, 0.015, 0.55], [0.4, 0.015, 0.3]].forEach((p, i) => sphere(`safe-trail-stone-${i}`, p, [0.35, 0.08, 0.24], cream, placedNodes[2]));
      } else {
        placedNodes[0].getChildMeshes().forEach((mesh) => mesh.dispose());
        tube('sturdy-branch-route', [[-2.25, 0.36, 0], [-1.5, 0.68, -0.1], [-0.7, 1.3, 0], [0.2, 1.8, -0.04], [1.3, 2.6, 0]], 0.12, bark, placedNodes[0]);
        [[-1.5, 0.68], [-0.7, 1.3], [0.2, 1.8]].forEach(([x, y], i) => sphere(`branch-rest-leaf-${i}`, [x, y + 0.05, -0.1], [0.5, 0.12, 0.28], leaf, placedNodes[0]));
        placedNodes[1].position.set(1.25, 2.63, -0.1);
        placedNodes[1].scaling.set(1, 0.35, 1);
        placedNodes[2].position.set(1.25, 2.65, -0.1);
        placedNodes[2].scaling.set(1.55, 1.25, 1.55);
      }
      let target = new B.Vector3();
      let lastCount = -1;
      const apply = () => {
        const latest = live.current;
        ids.forEach((id, i) => {
          const used = latest.placed.includes(id);
          trays[i].setEnabled(!used);
          placedNodes[i].setEnabled(used);
          rings[i].setEnabled(!used && (latest.cueToolId === id || (!latest.cueToolId && ids[latest.placed.length] === id)));
        });
        const count = latest.placed.length;
        if (river) target.set(count >= 3 ? 3.2 : count >= 2 ? 0.35 : -2.1, count >= 3 ? 0.33 : count >= 2 ? 0.52 : 0.33, count >= 3 ? 0.3 : -0.06);
        else target.set(count >= 2 ? 1.25 : count === 1 ? -0.7 : -2.2, count >= 3 ? 2.89 : count === 2 ? 2.82 : count === 1 ? 1.45 : 0.3, -0.3);
        if (latest.reduceMotion || lastCount < 0 || !latest.active) friend.position.copyFrom(target);
        lastCount = count;
      };
      syncRef.current = apply;
      apply();
      const resize = () => {
        engine.resize();
        const aspect = Math.max(0.25, canvas.clientWidth / Math.max(1, canvas.clientHeight));
        const width = Math.max(10.9, (river ? 7.8 : 8.8) * aspect);
        const height = width / aspect;
        camera.orthoLeft = -width / 2; camera.orthoRight = width / 2;
        camera.orthoTop = height / 2; camera.orthoBottom = -height / 2;
      };
      const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
      observer?.observe(canvas);
      window.addEventListener('resize', resize);
      resize();
      const pointer = (event: PointerEvent) => {
        if (!live.current.active) return;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * engine.getRenderWidth() / rect.width;
        const y = (event.clientY - rect.top) * engine.getRenderHeight() / rect.height;
        const pick = scene.pick(x, y, (mesh) => Boolean(mesh.metadata?.toolId));
        const id = pick?.pickedMesh?.metadata?.toolId as PlanningToolId | undefined;
        if (id) live.current.onChooseTool(id);
      };
      canvas.addEventListener('pointerdown', pointer);
      const contextLost = () => { if (!disposed) setState('fallback'); };
      const contextRestored = () => { if (!disposed) setState('ready'); };
      canvas.addEventListener('webglcontextlost', contextLost);
      canvas.addEventListener('webglcontextrestored', contextRestored);
      let elapsed = 0;
      scene.onBeforeRenderObservable.add(() => {
        const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
        elapsed += dt;
        if (live.current.reduceMotion || !live.current.active) {
          friend.position.copyFrom(target);
          friend.rotation.z = 0;
          return;
        }
        friend.position = B.Vector3.Lerp(friend.position, target, Math.min(1, dt * 7));
        friend.rotation.z = Math.sin(elapsed * 1.5) * 0.025;
      });
      engine.runRenderLoop(() => scene.render());
      setState('ready');
      cleanup = () => {
        observer?.disconnect();
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('pointerdown', pointer);
        canvas.removeEventListener('webglcontextlost', contextLost);
        canvas.removeEventListener('webglcontextrestored', contextRestored);
        engine.stopRenderLoop();
        scene.dispose();
        engine.dispose();
      };
    }).catch(() => {
      ownedScene?.dispose();
      ownedEngine?.dispose();
      if (!disposed) setState('fallback');
    });
    return () => { disposed = true; syncRef.current = null; cleanup?.(); };
  }, [props.storyId, river]);

  return <div className="absolute inset-0" data-scene-state={state}>
    <QuietWorldPicture river={river} placed={props.placed} />
    <canvas ref={canvasRef} aria-hidden="true" className={`absolute inset-0 h-full w-full touch-manipulation ${state === 'ready' ? '' : 'invisible'}`} />
    <p role="status" className="sr-only">{storyWorldDescription(props.storyId, props.placed)}</p>
    {state === 'fallback' && <p className="absolute bottom-2 left-3 rounded-xl bg-[#FFFCF5]/95 px-3 py-2 font-body text-xs text-[#62725B]">Our quiet picture world is ready. Use the helper pictures below.</p>}
  </div>;
}
