// Hearthlight Field Journal — Babylon.js plushie toy-diorama camp.
// This file owns only the 3D scene graph; React owns game state and HUD overlays.
import React, { useEffect, useRef } from 'react';
import type * as Babylon from '@babylonjs/core';
import { loadBabylon } from '../lib/babylonRuntime';
import { CritterData, CritterType } from '../game/data';
import { getHomeDecorationMeshIds, getHomeDecorationRenderPlan } from '../game/homeDecorations';
import type { HomeDecoration, SanctuarySeason } from '../game/store';
import { getSanctuaryGrowth } from '../game/sanctuaryGrowth';
import { getCelebrationMotion, type CareCelebration } from '../game/critterCelebrations';
import { PLUSH_IMAGES } from './CritterAvatar';
import type { FlagshipStoryId } from '../game/flagshipStories';

type Color3 = Babylon.Color3;
type Mesh = Babylon.Mesh;
type Scene = Babylon.Scene;
type ShadowGenerator = Babylon.ShadowGenerator;
type StandardMaterial = Babylon.StandardMaterial;
type TransformNode = Babylon.TransformNode;
type Vector3 = Babylon.Vector3;

let ActionManager!: typeof Babylon.ActionManager;
let ArcRotateCamera!: typeof Babylon.ArcRotateCamera;
let Color3!: typeof Babylon.Color3;
let Color4!: typeof Babylon.Color4;
let DynamicTexture!: typeof Babylon.DynamicTexture;
let DirectionalLight!: typeof Babylon.DirectionalLight;
let Engine!: typeof Babylon.Engine;
let ExecuteCodeAction!: typeof Babylon.ExecuteCodeAction;
let HemisphericLight!: typeof Babylon.HemisphericLight;
let Mesh!: typeof Babylon.Mesh;
let MeshBuilder!: typeof Babylon.MeshBuilder;
let Scene!: typeof Babylon.Scene;
let ShadowGenerator!: typeof Babylon.ShadowGenerator;
let StandardMaterial!: typeof Babylon.StandardMaterial;
let Texture!: typeof Babylon.Texture;
let TransformNode!: typeof Babylon.TransformNode;
let Vector3!: typeof Babylon.Vector3;

function initializeBabylon(B: typeof Babylon) {
  ({ ActionManager, ArcRotateCamera, Color3, Color4, DynamicTexture, DirectionalLight, Engine, ExecuteCodeAction, HemisphericLight, Mesh, MeshBuilder, Scene, ShadowGenerator, StandardMaterial, Texture, TransformNode, Vector3 } = B);
}

type Props = {
  companionType: CritterType;
  rescuedCritters: CritterData[];
  onCompanionClick: () => void;
  onCritterClick: (critter: CritterData) => void;
  onHomeClick: (critter: CritterData) => void;
  rescueFriend?: CritterData | null;
  onRescueTrailClick?: () => void;
  onDecorationRendered?: (critterName: string, decoration: HomeDecoration, meshIds: string[]) => void;
  homeDecor?: Record<string, HomeDecoration>;
  kindnessMoments?: number;
  season?: SanctuarySeason;
  celebration?: CareCelebration | null;
  reduceMotion?: boolean;
  completedFlagshipStories?: FlagshipStoryId[];
  className?: string;
};

const FALLBACK_COLORS: Record<CritterType, string> = {
  bunny: '#F2E9E1', fox: '#D86F37', owl: '#9A6D4C',
  squirrel: '#AE7042', bird: '#80C8E8', ladybug: '#D65642',
  frog: '#6FAE5B', otter: '#A97043', turtle: '#5E9A62',
  fish: '#4F9EC0', duck: '#F1CA54', hedgehog: '#B27749',
  snail: '#A981B4', lizard: '#5FA49B', bee: '#E9B93D',
  eagle: '#835B3E', goat: '#E9E4D7', beaver: '#865B3C',
  bear: '#A8754F',
  butterfly: '#B99BD9', cricket: '#7E9D59', octopus: '#7EC3D3',
};

function makeMaterial(scene: Scene, name: string, hex: string, emissive = 0): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(hex);
  material.specularColor = new Color3(0.08, 0.08, 0.08);
  if (emissive > 0) material.emissiveColor = Color3.FromHexString(hex).scale(emissive);
  return material;
}

function createTree(scene: Scene, position: Vector3, scale: number, leafMaterial: StandardMaterial, trunkMaterial: StandardMaterial, shadow: ShadowGenerator, highlightMaterial = leafMaterial) {
  const root = new TransformNode(`tree-${position.x}-${position.z}`, scene);
  root.position = position;
  const trunk = MeshBuilder.CreateCylinder(`trunk-${position.x}-${position.z}`, { height: scale * 1.8, diameterTop: scale * 0.28, diameterBottom: scale * 0.42, tessellation: 12 }, scene);
  trunk.parent = root;
  trunk.position.y = scale * 0.9;
  trunk.material = trunkMaterial;
  trunk.isPickable = false;
  shadow.addShadowCaster(trunk);
  // Overlapping, softly flattened lobes read as a sewn felt crown, not a cone.
  [[0, 2.25, 0, 2.15], [-0.68, 1.98, 0.16, 1.48], [0.65, 2.08, 0.1, 1.6], [0.12, 2.7, -0.08, 1.35]].forEach(([x, y, z, diameter], index) => {
    const canopy = MeshBuilder.CreateSphere(`canopy-${position.x}-${position.z}-${index}`, { diameter: scale * diameter, segments: 12 }, scene);
    canopy.parent = root;
    canopy.position = new Vector3(scale * x, scale * y, scale * z);
    canopy.scaling = new Vector3(1, 0.82, 0.9);
    canopy.material = index === 3 ? highlightMaterial : leafMaterial;
    canopy.isPickable = false;
    shadow.addShadowCaster(canopy);
  });
  return root;
}

function createFlower(scene: Scene, x: number, z: number, color: string, parent?: TransformNode, name = `flower-${x}-${z}`, scale = 1) {
  const sharedMaterial = (key: string, hex: string) => (scene.getMaterialByName(key) as StandardMaterial | null) ?? makeMaterial(scene, key, hex);
  const leaf = sharedMaterial('flower-leaf', '#86A57E');
  const petal = sharedMaterial(`flower-petal-${color}`, color);
  const center = sharedMaterial('flower-center', '#E8C98F');
  const parts: Mesh[] = [];
  const add = (part: Mesh, material: StandardMaterial) => { part.material = material; part.isPickable = false; parts.push(part); };
  const stem = MeshBuilder.CreateCylinder(`${name}-stem`, { height: 0.3 * scale, diameter: 0.035 * scale, tessellation: 6 }, scene);
  stem.position = new Vector3(x, 0.15 * scale, z);
  add(stem, leaf);
  const smallLeaf = MeshBuilder.CreateSphere(`${name}-leaf`, { diameter: 0.14 * scale, segments: 8 }, scene);
  smallLeaf.position = new Vector3(x + 0.065 * scale, 0.14 * scale, z);
  smallLeaf.scaling = new Vector3(1, 0.25, 0.5);
  smallLeaf.rotation.z = 0.5;
  add(smallLeaf, leaf);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    const bloom = MeshBuilder.CreateSphere(`${name}-petal-${i}`, { diameter: 0.19 * scale, segments: 8 }, scene);
    bloom.position = new Vector3(x + Math.cos(angle) * 0.1 * scale, 0.32 * scale, z + Math.sin(angle) * 0.1 * scale);
    bloom.scaling = new Vector3(1, 0.32, 0.68);
    bloom.rotation.y = -angle;
    add(bloom, petal);
  }
  const pollen = MeshBuilder.CreateSphere(`${name}-center`, { diameter: 0.12 * scale, segments: 8 }, scene);
  pollen.position = new Vector3(x, 0.345 * scale, z);
  pollen.scaling.y = 0.45;
  add(pollen, center);
  // Merge each flower to keep the small diorama economical on phones.
  const flower = Mesh.MergeMeshes(parts, true, false, undefined, false, true)!;
  flower.name = name;
  flower.parent = parent ?? null;
  flower.isPickable = false;
  return flower;
}

type HomeStyle = 'acorn-nook' | 'pond-patch' | 'nest-perch' | 'garden-hideout' | 'honey-hut';

const HOME_DETAILS: Partial<Record<CritterType, { style: HomeStyle; title: string }>> = {
  squirrel: { style: 'acorn-nook', title: 'Acorn Nook' },
  fox: { style: 'acorn-nook', title: 'Cozy Den' },
  hedgehog: { style: 'acorn-nook', title: 'Leafy Den' },
  bear: { style: 'acorn-nook', title: 'Honey Hollow' },
  beaver: { style: 'acorn-nook', title: 'Log Lodge' },
  frog: { style: 'pond-patch', title: 'Lily Pad Pond' },
  otter: { style: 'pond-patch', title: 'Pebble Pool' },
  turtle: { style: 'pond-patch', title: 'Sunny Shore' },
  fish: { style: 'pond-patch', title: 'Bubble Brook' },
  duck: { style: 'pond-patch', title: 'Reed Nest' },
  owl: { style: 'nest-perch', title: 'Moon Nest' },
  bird: { style: 'nest-perch', title: 'Twig Nest' },
  eagle: { style: 'nest-perch', title: 'Sky Perch' },
  butterfly: { style: 'garden-hideout', title: 'Petal Rest' },
  cricket: { style: 'garden-hideout', title: 'Leafy Stage' },
  bee: { style: 'honey-hut', title: 'Honey Hut' },
  ladybug: { style: 'garden-hideout', title: 'Petal Home' },
  snail: { style: 'garden-hideout', title: 'Mossy Corner' },
  lizard: { style: 'garden-hideout', title: 'Warm Rock' },
  goat: { style: 'garden-hideout', title: 'Meadow Patch' },
  bunny: { style: 'garden-hideout', title: 'Clover Burrow' },
  octopus: { style: 'pond-patch', title: 'Bubble Cove' },
};

function createCritterHome(scene: Scene, critter: CritterData, position: Vector3, shadow: ShadowGenerator, onCare: () => void, decoration: HomeDecoration = 'petal-garland') {
  const detail = HOME_DETAILS[critter.type] ?? { style: 'garden-hideout' as HomeStyle, title: 'Cozy Corner' };
  const root = new TransformNode(`home-${critter.name}`, scene);
  root.position = position;
  const soil = makeMaterial(scene, `home-soil-${critter.name}`, '#947662');
  const wood = makeMaterial(scene, `home-wood-${critter.name}`, '#BA9474');
  const cream = makeMaterial(scene, `home-cream-${critter.name}`, '#F1DFC3');
  const water = makeMaterial(scene, `home-water-${critter.name}`, '#AED3D2', 0.03);
  const leaf = makeMaterial(scene, `home-leaf-${critter.name}`, '#91AF83');
  const petal = makeMaterial(scene, `home-petal-${critter.name}`, '#E7B7BF');
  const homeParts: Mesh[] = [];
  const addShadow = (part: Mesh) => { homeParts.push(part); shadow.addShadowCaster(part); };

  if (detail.style === 'acorn-nook') {
    const mound = MeshBuilder.CreateSphere(`home-mound-${critter.name}`, { diameter: 1.55, segments: 12 }, scene);
    mound.parent = root; mound.position = new Vector3(0, 0.38, 0.12); mound.scaling = new Vector3(1.1, 0.75, 0.75); mound.material = wood; addShadow(mound);
    const door = MeshBuilder.CreateDisc(`home-door-${critter.name}`, { radius: 0.34, tessellation: 18 }, scene);
    door.parent = root; door.position = new Vector3(0, 0.32, -0.54); door.material = soil;
    const roofLeaf = MeshBuilder.CreateSphere(`home-leafroof-${critter.name}`, { diameter: 1.05, segments: 10 }, scene);
    roofLeaf.parent = root; roofLeaf.position = new Vector3(0.18, 0.92, 0.12); roofLeaf.scaling = new Vector3(1.05, 0.28, 0.72); roofLeaf.material = leaf; addShadow(roofLeaf);
  } else if (detail.style === 'pond-patch') {
    const pond = MeshBuilder.CreateDisc(`home-pond-${critter.name}`, { radius: 0.85, tessellation: 28 }, scene);
    pond.parent = root; pond.rotation.x = Math.PI / 2; pond.position.y = 0.025; pond.material = water;
    for (let i = 0; i < 3; i++) {
      const pad = MeshBuilder.CreateDisc(`home-pad-${critter.name}-${i}`, { radius: 0.2, tessellation: 14 }, scene);
      pad.parent = root; pad.rotation.x = Math.PI / 2; pad.position = new Vector3(-0.33 + i * 0.32, 0.05, 0.15 + (i % 2) * 0.2); pad.material = leaf;
    }
    const reed = MeshBuilder.CreateCylinder(`home-reed-${critter.name}`, { height: 0.75, diameter: 0.06, tessellation: 6 }, scene);
    reed.parent = root; reed.position = new Vector3(0.62, 0.36, 0.12); reed.material = leaf; addShadow(reed);
  } else if (detail.style === 'nest-perch') {
    const stump = MeshBuilder.CreateCylinder(`home-stump-${critter.name}`, { height: 1.05, diameterTop: 0.38, diameterBottom: 0.58, tessellation: 10 }, scene);
    stump.parent = root; stump.position.y = 0.52; stump.material = wood; addShadow(stump);
    const nest = MeshBuilder.CreateTorus(`home-nest-${critter.name}`, { diameter: 0.88, thickness: 0.16, tessellation: 18 }, scene);
    nest.parent = root; nest.position.y = 1.1; nest.material = soil; addShadow(nest);
    const egg = MeshBuilder.CreateSphere(`home-egg-${critter.name}`, { diameter: 0.22, segments: 8 }, scene);
    egg.parent = root; egg.position = new Vector3(-0.1, 1.18, 0); egg.material = cream; addShadow(egg);
  } else if (detail.style === 'honey-hut') {
    const hut = MeshBuilder.CreateCylinder(`home-hut-${critter.name}`, { height: 0.95, diameter: 0.82, tessellation: 10 }, scene);
    hut.parent = root; hut.position.y = 0.48; hut.material = makeMaterial(scene, `home-honey-${critter.name}`, '#D9A943', 0.04); addShadow(hut);
    const roof = MeshBuilder.CreateCylinder(`home-hutroof-${critter.name}`, { height: 0.32, diameterTop: 0.05, diameterBottom: 1.05, tessellation: 10 }, scene);
    roof.parent = root; roof.position.y = 1.12; roof.material = wood; addShadow(roof);
    const entrance = MeshBuilder.CreateSphere(`home-hutdoor-${critter.name}`, { diameter: 0.18, segments: 8 }, scene);
    entrance.parent = root; entrance.position = new Vector3(0, 0.5, -0.43); entrance.material = soil;
  } else {
    const patch = MeshBuilder.CreateDisc(`home-patch-${critter.name}`, { radius: 0.75, tessellation: 22 }, scene);
    patch.parent = root; patch.rotation.x = Math.PI / 2; patch.position.y = 0.025; patch.material = leaf;
    const rock = MeshBuilder.CreateSphere(`home-rock-${critter.name}`, { diameter: 0.78, segments: 10 }, scene);
    rock.parent = root; rock.position = new Vector3(0.04, 0.27, 0.1); rock.scaling = new Vector3(1.15, 0.72, 0.72); rock.material = cream; addShadow(rock);
    for (let i = 0; i < 2; i++) {
      const flower = createFlower(scene, -0.4 + i * 0.8, -0.16, '#E7B7BF', root, `home-flower-${critter.name}-${i}`, 0.75);
      addShadow(flower);
    }
  }
  const decorationPlan = getHomeDecorationRenderPlan(decoration);
  const decorationMeshIds = getHomeDecorationMeshIds(decoration, critter.name);
  if (decorationPlan.key === 'cloud-pillow') {
    const pillow = MeshBuilder.CreateSphere(decorationMeshIds[0], { diameter: 0.46, segments: 10 }, scene);
    pillow.parent = root; pillow.position = new Vector3(0.45, 0.24, -0.24); pillow.scaling = new Vector3(1.28, 0.55, 0.88); pillow.material = makeMaterial(scene, `home-pillow-mat-${critter.name}`, '#F1DFC3'); addShadow(pillow);
  } else if (decorationPlan.key === 'acorn-lantern') {
    const lantern = MeshBuilder.CreateSphere(decorationMeshIds[0], { diameter: 0.24, segments: 8 }, scene);
    lantern.parent = root; lantern.position = new Vector3(-0.55, 0.52, -0.15); lantern.material = makeMaterial(scene, `home-lantern-mat-${critter.name}`, '#F5C842', 0.72); addShadow(lantern);
  } else if (decorationPlan.key === 'starglow-mobile') {
    const string = MeshBuilder.CreateCylinder(decorationMeshIds[0], { height: 0.68, diameter: 0.025, tessellation: 6 }, scene);
    string.parent = root; string.position = new Vector3(0, 0.82, -0.16); string.material = makeMaterial(scene, `home-starglow-string-mat-${critter.name}`, '#C9B8E8'); addShadow(string);
    [-0.25, 0, 0.25].forEach((x, index) => { const star = MeshBuilder.CreateSphere(decorationMeshIds[index + 1], { diameter: 0.16, segments: 8 }, scene); star.parent = root; star.position = new Vector3(x, 0.52 + (index % 2) * 0.14, -0.18); star.material = makeMaterial(scene, `home-starglow-mat-${critter.name}-${index}`, index === 1 ? '#F5C842' : '#B69DE8', 0.62); addShadow(star); });
  } else if (decorationPlan.key === 'mossy-reading-nook') {
    const mat = MeshBuilder.CreateDisc(decorationMeshIds[0], { radius: 0.5, tessellation: 16 }, scene);
    mat.parent = root; mat.rotation.x = Math.PI / 2; mat.position = new Vector3(0.42, 0.065, -0.24); mat.material = makeMaterial(scene, `home-reading-nook-mat-mat-${critter.name}`, '#7FA66B'); addShadow(mat);
    const book = MeshBuilder.CreateBox(decorationMeshIds[1], { width: 0.3, height: 0.07, depth: 0.23 }, scene);
    book.parent = root; book.position = new Vector3(0.42, 0.13, -0.24); book.rotation.y = 0.32; book.material = makeMaterial(scene, `home-reading-nook-book-mat-${critter.name}`, '#E66B5B'); addShadow(book);
  } else if (decorationPlan.key === 'tea-time-picnic') {
    const blanket = MeshBuilder.CreateDisc(decorationMeshIds[0], { radius: 0.46, tessellation: 16 }, scene);
    blanket.parent = root; blanket.rotation.x = Math.PI / 2; blanket.position = new Vector3(-0.38, 0.065, -0.24); blanket.material = makeMaterial(scene, `home-tea-picnic-blanket-mat-${critter.name}`, '#F1B4C0'); addShadow(blanket);
    const cup = MeshBuilder.CreateCylinder(decorationMeshIds[1], { height: 0.16, diameter: 0.16, tessellation: 10 }, scene);
    cup.parent = root; cup.position = new Vector3(-0.38, 0.15, -0.24); cup.material = makeMaterial(scene, `home-tea-picnic-cup-mat-${critter.name}`, '#F1DFC3'); addShadow(cup);
  } else {
    [-0.48, 0, 0.48].forEach((x, index) => {
      const petalDot = MeshBuilder.CreateSphere(decorationMeshIds[index], { diameter: 0.13, segments: 8 }, scene);
      petalDot.parent = root; petalDot.position = new Vector3(x, 0.62 + (index % 2) * 0.12, -0.55); petalDot.material = petal; addShadow(petalDot);
    });
  }
  const careRing = MeshBuilder.CreateTorus(`home-care-ring-${critter.name}`, { diameter: 1.45, thickness: 0.055, tessellation: 28 }, scene);
  careRing.parent = root;
  careRing.position.y = 0.06;
  careRing.material = petal;
  // The whole home is a care target, not only a narrow ring. Readable names live in the React HUD.
  root.getChildMeshes().forEach((part) => {
    part.isPickable = true;
    part.actionManager = new ActionManager(scene);
    part.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, onCare));
  });
  return root;
}

function createSanctuaryGrowth(scene: Scene, kindnessMoments: number, shadow: ShadowGenerator) {
  const growth = getSanctuaryGrowth(kindnessMoments);
  if (!growth.propKey) return;
  const wood = makeMaterial(scene, 'kindness-growth-wood', '#B99A79');
  const leaf = makeMaterial(scene, 'kindness-growth-leaf', '#91AF83');
  const water = makeMaterial(scene, 'kindness-growth-water', '#AED3D2', 0.03);
  const addShadow = (mesh: Mesh) => shadow.addShadowCaster(mesh);
  if (kindnessMoments >= 3) {
    [-0.62, 0.62].forEach((x, index) => { const post = MeshBuilder.CreateCylinder(`kindness-arbor-post-${index}`, { height: 1.25, diameter: 0.13, tessellation: 8 }, scene); post.position = new Vector3(0.2 + x, 0.63, -4.15); post.material = wood; addShadow(post); });
    const archPath = Array.from({ length: 17 }, (_, index) => {
      const angle = Math.PI * index / 16;
      return new Vector3(0.2 + Math.cos(angle) * 0.62, 1.25 + Math.sin(angle) * 0.48, -4.15);
    });
    const arch = MeshBuilder.CreateTube('kindness-arbor-arch', { path: archPath, radius: 0.065, tessellation: 8 }, scene);
    arch.material = leaf; arch.isPickable = false; addShadow(arch);
  }
  if (kindnessMoments >= 8) {
    const bowl = MeshBuilder.CreateCylinder('kindness-ripple-bowl', { height: 0.22, diameterTop: 0.95, diameterBottom: 0.72, tessellation: 18 }, scene);
    bowl.position = new Vector3(2.15, 0.12, -3.65); bowl.material = water; addShadow(bowl);
    const ripple = MeshBuilder.CreateTorus('kindness-ripple-ring', { diameter: 0.56, thickness: 0.035, tessellation: 18 }, scene);
    ripple.position = new Vector3(2.15, 0.245, -3.65); ripple.material = makeMaterial(scene, 'kindness-ripple-ring-mat', '#EAF8FF', 0.08);
  }
  if (kindnessMoments >= 15) {
    [-0.45, -0.15, 0.15, 0.45].forEach((offset, index) => {
      addShadow(createFlower(scene, -2.25 + offset, -3.75 + (index % 2) * 0.18, '#E7B7BF', undefined, `kindness-bloom-flower-${index}`, 1 + (index % 2) * 0.2));
    });
  }
}

/** Three fixed, story-led landmarks. They are intentionally calm scenery, not unlock currency. */
function createFlagshipLandmarks(scene: Scene, completedStories: readonly FlagshipStoryId[], shadow: ShadowGenerator) {
  const complete = new Set(completedStories);
  const wood = makeMaterial(scene, 'flagship-wood', '#B99A79');
  const leaf = makeMaterial(scene, 'flagship-leaf', '#91AF83');
  const water = makeMaterial(scene, 'flagship-water', '#AED3D2', 0.03);
  const nest = makeMaterial(scene, 'flagship-nest', '#A38973');
  const lantern = makeMaterial(scene, 'flagship-lantern', '#EED4A0', 0.18);
  const addShadow = (mesh: Mesh) => shadow.addShadowCaster(mesh);

  if (complete.has('pip-flower-path')) {
    [[-3.5, -3.55], [-3.14, -3.2], [-2.78, -2.83], [-2.42, -2.5], [-2.05, -2.18]].forEach(([x, z], index) => {
      createFlower(scene, x, z, ['#F1B4C0', '#F5C842', '#B69DE8'][index % 3]);
    });
    const perch = MeshBuilder.CreateCylinder('flagship-pip-nest-perch', { height: 0.7, diameterTop: 0.16, diameterBottom: 0.28, tessellation: 8 }, scene);
    perch.position = new Vector3(-1.75, 0.35, -2.0); perch.material = wood; addShadow(perch);
    const tinyNest = MeshBuilder.CreateTorus('flagship-pip-twig-nest', { diameter: 0.55, thickness: 0.12, tessellation: 14 }, scene);
    tinyNest.position = new Vector3(-1.75, 0.74, -2.0); tinyNest.material = nest; addShadow(tinyNest);
  }

  if (complete.has('finn-riverside-crossing')) {
    const river = MeshBuilder.CreateDisc('flagship-finn-river', { radius: 1.18, tessellation: 32 }, scene);
    river.position = new Vector3(3.8, 0.03, -3.4); river.rotation.x = Math.PI / 2; river.scaling.x = 1.55; river.material = water;
    [-0.56, 0, 0.56].forEach((offset, index) => {
      const plank = MeshBuilder.CreateBox(`flagship-finn-bridge-plank-${index}`, { width: 0.34, height: 0.12, depth: 1.58 }, scene);
      plank.position = new Vector3(3.8 + offset, 0.25, -3.4); plank.material = wood; addShadow(plank);
    });
    [-0.9, 0.9].forEach((offset, index) => {
      const reed = MeshBuilder.CreateCylinder(`flagship-finn-reed-${index}`, { height: 0.72, diameter: 0.06, tessellation: 6 }, scene);
      reed.position = new Vector3(3.8 + offset, 0.36, -3.0); reed.material = leaf; addShadow(reed);
    });
  }

  if (complete.has('wren-cozy-nest')) {
    const willow = MeshBuilder.CreateCylinder('flagship-wren-willow', { height: 1.5, diameterTop: 0.22, diameterBottom: 0.38, tessellation: 9 }, scene);
    willow.position = new Vector3(-3.8, 0.75, 3.8); willow.material = wood; addShadow(willow);
    const willowCrown = MeshBuilder.CreateSphere('flagship-wren-willow-crown', { diameter: 1.25, segments: 10 }, scene);
    willowCrown.position = new Vector3(-3.8, 1.85, 3.8); willowCrown.scaling = new Vector3(1.05, 0.72, 0.92); willowCrown.material = leaf; addShadow(willowCrown);
    const cozyNest = MeshBuilder.CreateTorus('flagship-wren-nest', { diameter: 0.7, thickness: 0.15, tessellation: 16 }, scene);
    cozyNest.position = new Vector3(-3.42, 1.42, 3.56); cozyNest.material = nest; addShadow(cozyNest);
    const glow = MeshBuilder.CreateSphere('flagship-wren-lantern', { diameter: 0.2, segments: 8 }, scene);
    glow.position = new Vector3(-3.1, 0.55, 3.35); glow.material = lantern; addShadow(glow);
  }
}

function makePlushie(
  scene: Scene,
  type: CritterType,
  displayName: string,
  position: Vector3,
  scale: number,
  interactive: () => void,
  shadow: ShadowGenerator,
) {
  const root = new TransformNode(`plush-${displayName}`, scene);
  root.position = position;
  const texturePath = PLUSH_IMAGES[type];
  const plushColor = Color3.FromHexString(FALLBACK_COLORS[type] || '#F2E9E1');
  const bodyMaterial = new StandardMaterial(`plush-body-${displayName}`, scene);
  bodyMaterial.diffuseColor = plushColor;
  bodyMaterial.specularColor = new Color3(0.02, 0.02, 0.02);
  bodyMaterial.roughness = 0.92;

  // Soft rounded body provides physical plushie depth behind the illustrated face.
  const body = MeshBuilder.CreateSphere(`plush-body-${displayName}`, { diameter: 1, segments: 16 }, scene);
  body.parent = root;
  body.scaling = new Vector3(scale * 0.82, scale, scale * 0.52);
  body.position.y = scale * 0.72;
  body.material = bodyMaterial;
  shadow.addShadowCaster(body);

  // Supplied art already includes ears. Extra ovals above it resemble floating flames.
  if (!texturePath) {
    const earA = MeshBuilder.CreateSphere(`ear-a-${displayName}`, { diameter: 1, segments: 12 }, scene);
    earA.parent = root;
    earA.scaling = new Vector3(scale * 0.22, scale * 0.36, scale * 0.16);
    earA.position = new Vector3(-scale * 0.36, scale * 1.46, 0);
    earA.material = bodyMaterial;
    const earB = earA.clone(`ear-b-${displayName}`) as Mesh;
    earB.parent = root;
    earB.position.x = scale * 0.36;
    shadow.addShadowCaster(earA);
    shadow.addShadowCaster(earB);
  }

  // Textured image-plane gives each supplied plush image its exact personality.
  const faceMaterial = new StandardMaterial(`plush-face-${displayName}`, scene);
  if (texturePath) {
    const texture = new Texture(texturePath, scene, false, false);
    texture.hasAlpha = true;
    // Babylon's plane texture coordinates run opposite the supplied PNG's visual orientation.
    texture.vScale = -1;
    texture.vOffset = 1;
    faceMaterial.diffuseTexture = texture;
    faceMaterial.opacityTexture = texture;
    faceMaterial.useAlphaFromDiffuseTexture = true;
  }
  faceMaterial.backFaceCulling = false;
  faceMaterial.specularColor = new Color3(0, 0, 0);
  // Retain the original warm illustration rather than tinting it forest green.
  faceMaterial.disableLighting = Boolean(texturePath);
  if (texturePath) faceMaterial.emissiveColor = new Color3(1, 1, 1);
  const face = MeshBuilder.CreatePlane(`plush-face-${displayName}`, { width: scale * 1.45, height: scale * 1.45 }, scene);
  face.parent = root;
  face.position = new Vector3(0, scale * 0.78, -scale * 0.53);
  face.billboardMode = Mesh.BILLBOARDMODE_ALL;
  face.material = faceMaterial;
  face.actionManager = new ActionManager(scene);
  face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, interactive));
  body.actionManager = new ActionManager(scene);
  body.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, interactive));

  return { root, body, face };
}

export default function BabylonCampScene({ companionType, rescuedCritters, onCompanionClick, onCritterClick, onHomeClick, rescueFriend = null, onRescueTrailClick, onDecorationRendered, homeDecor = {}, kindnessMoments = 0, season = 'summer', celebration = null, reduceMotion = false, completedFlagshipStories = [], className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    void loadBabylon().then((B) => {
      if (disposed) return;
      initializeBabylon(B);
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    const scene = new Scene(engine);
    const seasonalPalette: Record<SanctuarySeason, { sky: string; grass: string; leaf: string; accent: string }> = {
      spring: { sky: '#DCE7D6', grass: '#ADC49A', leaf: '#A8BF91', accent: '#E7B7BF' },
      summer: { sky: '#D9E5D5', grass: '#ABC196', leaf: '#9DB78C', accent: '#E9D299' },
      autumn: { sky: '#E9E3D4', grass: '#B8BD96', leaf: '#C5AC86', accent: '#D8A18A' },
      winter: { sky: '#E1EBE8', grass: '#C0CFBE', leaf: '#B0C5B6', accent: '#BED9DB' },
    };
    const seasonal = seasonalPalette[season];
    scene.clearColor = Color4.FromHexString(seasonal.sky);
    scene.ambientColor = new Color3(0.18, 0.2, 0.16);
    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogColor = Color3.FromHexString(seasonal.sky);
    scene.fogStart = 28;
    scene.fogEnd = 58;

    const camera = new ArcRotateCamera('camp-camera', -Math.PI / 2, 0.96, 17.8, new Vector3(0, 1.05, 0.3), scene);
    // A stable horizontal field of view keeps Bestie and the nearest friend in frame on phones.
    camera.fovMode = ArcRotateCamera.FOVMODE_HORIZONTAL_FIXED;
    camera.fov = 0.82;
    camera.lowerRadiusLimit = 13.5;
    camera.upperRadiusLimit = 24;
    camera.lowerBetaLimit = 0.74;
    camera.upperBetaLimit = 1.2;
    camera.wheelPrecision = 42;
    camera.panningSensibility = 0;
    camera.inertia = reduceMotion ? 0 : 0.75;
    camera.attachControl(canvas, true);

    const sky = new HemisphericLight('soft-sky', new Vector3(0.1, 1, 0.3), scene);
    sky.diffuse = Color3.FromHexString('#FFF5E6');
    sky.groundColor = Color3.FromHexString('#B6C8A8');
    sky.intensity = 0.82;
    const daylight = new DirectionalLight('warm-daylight', new Vector3(-0.45, -1, 0.4), scene);
    daylight.position = new Vector3(8, 14, -7);
    daylight.diffuse = Color3.FromHexString('#FFF1D9');
    daylight.intensity = 0.5;
    const shadow = new ShadowGenerator(1024, daylight);
    shadow.useBlurExponentialShadowMap = true;
    shadow.blurKernel = 24;
    shadow.setDarkness(0.28);

    // A quiet continuous meadow replaces the empty dark void outside the diorama.
    const meadow = MeshBuilder.CreateGround('sage-meadow', { width: 160, height: 160 }, scene);
    meadow.position.y = -0.12;
    meadow.material = makeMaterial(scene, 'sage-meadow-mat', seasonal.sky);
    meadow.isPickable = false;
    const grassMaterial = makeMaterial(scene, 'felt-grass', seasonal.grass);
    const island = MeshBuilder.CreateCylinder('felt-clearing-edge', { height: 0.14, diameter: 19, tessellation: 72 }, scene);
    island.position.y = -0.07;
    island.material = makeMaterial(scene, 'felt-clearing-edge-mat', '#C3C7A5');
    island.isPickable = false;
    const ground = MeshBuilder.CreateDisc('felt-clearing', { radius: 9.5, tessellation: 72 }, scene);
    ground.rotation.x = Math.PI / 2;
    ground.material = grassMaterial;
    ground.receiveShadows = true;
    ground.isPickable = false;

    const ringMaterial = makeMaterial(scene, 'trail-ring', '#D8C6A3');
    const path = MeshBuilder.CreateTorus('stitched-trail', { diameter: 12.5, thickness: 0.12, tessellation: 64 }, scene);
    // Babylon toruses are already horizontal. Rotating this made a giant upright hoop.
    path.position.y = 0.04;
    path.material = ringMaterial;
    path.isPickable = false;
    const pebbleMat = makeMaterial(scene, 'path-pebble-mat', '#E2D7BB');
    [[-4.1, -2.1], [-3.45, -1.85], [-2.75, -1.45], [2.65, -1.55], [3.35, -2], [4.1, -2.35]].forEach(([x, z], index) => {
      const pebble = MeshBuilder.CreateSphere(`path-pebble-${index}`, { diameter: 0.42, segments: 10 }, scene);
      pebble.position = new Vector3(x, 0.04, z);
      pebble.scaling = new Vector3(1.35, 0.18, 0.84);
      pebble.material = pebbleMat;
      pebble.isPickable = false;
      pebble.receiveShadows = true;
    });

    const trunkMaterial = makeMaterial(scene, 'plush-trunk', '#B79B7C');
    const leafMaterialA = makeMaterial(scene, 'plush-leaf-a', seasonal.leaf);
    const leafMaterialB = makeMaterial(scene, 'plush-leaf-b', '#B7C8A1');
    [
      [-7.7, -1.6, 1.1, leafMaterialA], [-6.9, 4.3, 1.3, leafMaterialB], [-3.8, 7.1, 1.15, leafMaterialA],
      [7.7, -1.2, 1.1, leafMaterialB], [7.1, 4.1, 1.3, leafMaterialA], [3.6, 7.1, 1.2, leafMaterialB], [0.2, 8.2, 1.35, leafMaterialA],
    ].forEach(([x, z, scale, material]) => createTree(scene, new Vector3(x as number, 0, z as number), scale as number, material as StandardMaterial, trunkMaterial, shadow, leafMaterialB));

    [['#E7B7BF', -3.4, -3.8], ['#E9D299', -2.1, -3.4], ['#E7B7BF', 3.6, -2.7], ['#D6ADAA', 4.6, 1.6], ['#C7BDCF', -4.8, 2.6], ['#E9D299', 1.8, 4.9], ['#E7B7BF', 4.2, 4.2], ['#E7B7BF', 3.85, -2.45], ['#C7BDCF', -4.5, 2.8]].forEach(([color, x, z]) => createFlower(scene, x as number, z as number, color as string));
    [[-5.7, -0.5], [5.7, -0.4], [-1.7, 5.9], [1.8, -5.1]].forEach(([x, z], index) => {
      const seasonalFlower = createFlower(scene, x, z, seasonal.accent, undefined, `seasonal-keepsake-${season}-${index}`, 0.85);
      shadow.addShadowCaster(seasonalFlower);
    });
    createSanctuaryGrowth(scene, kindnessMoments, shadow);
    createFlagshipLandmarks(scene, completedFlagshipStories, shadow);

    // A tucked-in tea picnic is welcoming in daylight: no flame or flickering threat.
    const picnic = new TransformNode('gentle-picnic', scene);
    picnic.position = new Vector3(1.55, 0, 0.8);
    const blanket = MeshBuilder.CreateDisc('picnic-blanket', { radius: 1.05, tessellation: 40 }, scene);
    blanket.parent = picnic;
    blanket.rotation.x = Math.PI / 2;
    blanket.position.y = 0.025;
    blanket.scaling.x = 1.2;
    blanket.material = makeMaterial(scene, 'picnic-blanket-mat', '#E1BCB4');
    blanket.receiveShadows = true;
    const blanketEdge = MeshBuilder.CreateTorus('picnic-stitched-edge', { diameter: 2.0, thickness: 0.035, tessellation: 40 }, scene);
    blanketEdge.parent = picnic;
    blanketEdge.position.y = 0.035;
    blanketEdge.scaling.x = 1.2;
    blanketEdge.material = makeMaterial(scene, 'picnic-edge-mat', '#F1DDCC');
    const lanternWood = makeMaterial(scene, 'picnic-lantern-frame-mat', '#AD9275');
    const lanternGlow = makeMaterial(scene, 'picnic-lantern-glow-mat', '#F4DCAA', 0.16);
    const lantern = MeshBuilder.CreateCylinder('picnic-lantern', { height: 0.42, diameter: 0.32, tessellation: 12 }, scene);
    lantern.parent = picnic;
    lantern.position = new Vector3(0.08, 0.3, 0.08);
    lantern.material = lanternGlow;
    [0.08, 0.53].forEach((y, index) => {
      const cap = MeshBuilder.CreateCylinder(`picnic-lantern-cap-${index}`, { height: 0.07, diameter: 0.4, tessellation: 12 }, scene);
      cap.parent = picnic; cap.position = new Vector3(0.08, y, 0.08); cap.material = lanternWood;
      shadow.addShadowCaster(cap);
    });
    const handle = MeshBuilder.CreateTorus('picnic-lantern-handle', { diameter: 0.25, thickness: 0.035, tessellation: 16 }, scene);
    handle.parent = picnic; handle.rotation.x = Math.PI / 2; handle.position = new Vector3(0.08, 0.62, 0.08); handle.material = lanternWood;
    const cupMat = makeMaterial(scene, 'picnic-cup-mat', '#F2E4CC');
    [-0.46, 0.5].forEach((x, index) => {
      const cup = MeshBuilder.CreateCylinder(`picnic-cup-${index}`, { height: 0.18, diameterTop: 0.22, diameterBottom: 0.18, tessellation: 12 }, scene);
      cup.parent = picnic; cup.position = new Vector3(x, 0.13, -0.24); cup.material = cupMat;
      const tea = MeshBuilder.CreateDisc(`picnic-tea-${index}`, { radius: 0.08, tessellation: 12 }, scene);
      tea.parent = picnic; tea.rotation.x = Math.PI / 2; tea.position = new Vector3(x, 0.225, -0.24); tea.material = lanternWood;
      shadow.addShadowCaster(cup);
    });
    picnic.getChildMeshes().forEach((part) => { part.isPickable = false; });

    // Rescue signpost.
    const signPole = MeshBuilder.CreateCylinder('rescue-sign-pole', { height: 2.2, diameter: 0.16, tessellation: 8 }, scene);
    signPole.position = new Vector3(-5.5, 1.1, -1.3);
    signPole.material = trunkMaterial;
    const signTex = new DynamicTexture('rescue-sign-texture', { width: 512, height: 256 }, scene, true);
    signTex.drawText('RESCUE\nTRAIL', null, 104, 'bold 74px Fraunces', '#4A3022', '#F5E6C5', true);
    const signMat = new StandardMaterial('rescue-sign-material', scene);
    signMat.diffuseTexture = signTex;
    const sign = MeshBuilder.CreatePlane('rescue-sign', { width: 2.15, height: 1.02 }, scene);
    sign.position = new Vector3(-5.5, 2.25, -1.3);
    sign.billboardMode = Mesh.BILLBOARDMODE_ALL;
    sign.material = signMat;
    if (onRescueTrailClick) {
      sign.actionManager = new ActionManager(scene);
      sign.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, onRescueTrailClick));
    }

    // The next friend waits visibly at the trail edge, turning the camp into a
    // place to enter a rescue rather than a background behind a button.
    if (rescueFriend) {
      makePlushie(scene, rescueFriend.type, `${rescueFriend.name} needs help`, new Vector3(rescuedCritters.length ? -4.8 : -2.8, 0.02, -1.3), 1.56, () => onRescueTrailClick?.(), shadow);
    }

    const companion = makePlushie(scene, companionType, 'Your Companion', new Vector3(0.25, 0.02, -2.25), 1.95, onCompanionClick, shadow);

    const friendSlots = [
      new Vector3(-2.65, 0.02, -1.1), new Vector3(3.65, 0.02, -0.85), new Vector3(-4.8, 0.02, 1.8),
      new Vector3(4.7, 0.02, 2.1), new Vector3(-2.6, 0.02, 3.7), new Vector3(2.8, 0.02, 3.8),
    ];
    const friendPlushies = rescuedCritters.slice(0, friendSlots.length).map((critter, index) => {
      const slot = friendSlots[index];
      const homeOffset = new Vector3(slot.x < 0 ? -0.75 : 0.75, 0, slot.z > 0 ? 0.75 : -0.8);
      const activeDecoration = homeDecor[critter.id] ?? 'petal-garland';
      createCritterHome(scene, critter, slot.add(homeOffset), shadow, () => onHomeClick(critter), activeDecoration);
      onDecorationRendered?.(critter.name, activeDecoration, getHomeDecorationMeshIds(activeDecoration, critter.name));
      return { critter, plush: makePlushie(scene, critter.type, critter.name, friendSlots[index], 1.32, () => onHomeClick(critter), shadow) };
    });
    const celebrationPlush = celebration?.name === 'Your Companion'
      ? { type: companionType, root: companion.root }
      : friendPlushies.find((entry) => entry.critter.name === celebration?.name && entry.critter.type === celebration?.type)
        ? { type: celebration!.type, root: friendPlushies.find((entry) => entry.critter.name === celebration!.name)!.plush.root }
        : null;
    const celebrationMotion = celebration ? getCelebrationMotion(celebration.type, celebration.variation) : null;

    // A few faint seed motes stay at the perimeter, clear of plush faces and tap targets.
    const motes: Mesh[] = [];
    const moteMat = makeMaterial(scene, 'seed-mote-mat', '#F4EDD7', 0.08);
    for (let i = 0; i < 6; i++) {
      const mote = MeshBuilder.CreateSphere(`seed-mote-${i}`, { diameter: 0.055, segments: 6 }, scene);
      mote.position = new Vector3((i % 2 ? 1 : -1) * (5.3 + (i % 3) * 0.4), 0.9 + (i % 3) * 0.35, 1 + i * 0.7);
      mote.material = moteMat;
      mote.isPickable = false;
      motes.push(mote);
    }
    const moteHeights = motes.map((mote) => mote.position.y);
    let elapsed = 0;
    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
      elapsed += dt;
      if (reduceMotion) {
        companion.root.position.y = 0.02;
        motes.forEach((mote, index) => { mote.visibility = 0.3; mote.position.y = moteHeights[index]; });
        if (celebrationPlush) {
          celebrationPlush.root.position.y = 0.02;
          celebrationPlush.root.rotation.set(0, 0, 0);
        }
        return;
      }
      companion.root.position.y = 0.02 + Math.sin(elapsed * 1.8) * 0.035;
      if (celebrationPlush && celebrationMotion) {
        const bounce = Math.abs(Math.sin(elapsed * celebrationMotion.speed)) * celebrationMotion.hop;
        if (celebration?.motion === 'side-sway') {
          celebrationPlush.root.position.y = 0.02 + bounce * 0.45;
          celebrationPlush.root.rotation.z = Math.sin(elapsed * celebrationMotion.speed * 0.65) * celebrationMotion.sway;
          celebrationPlush.root.rotation.y = 0;
        } else if (celebration?.motion === 'cozy-twirl') {
          celebrationPlush.root.position.y = 0.02 + bounce * 0.5;
          celebrationPlush.root.rotation.z = Math.sin(elapsed * celebrationMotion.speed * 0.5) * celebrationMotion.sway * 0.5;
          celebrationPlush.root.rotation.y = Math.sin(elapsed * celebrationMotion.speed * 0.36) * celebrationMotion.twist;
        } else {
          celebrationPlush.root.position.y = 0.02 + bounce;
          celebrationPlush.root.rotation.z = Math.sin(elapsed * celebrationMotion.speed * 0.65) * celebrationMotion.sway * 0.55;
          celebrationPlush.root.rotation.y = 0;
        }
      }
      motes.forEach((mote, index) => {
        mote.position.y = moteHeights[index] + Math.sin(elapsed * 0.7 + index) * 0.09;
        mote.visibility = 0.28 + Math.sin(elapsed * 0.8 + index * 1.7) * 0.1;
      });
    });

    engine.runRenderLoop(() => scene.render());
    const resize = () => engine.resize();
    window.addEventListener('resize', resize);
    cleanup = () => {
      window.removeEventListener('resize', resize);
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
    }).catch((error) => console.error('Critter Rescue 3D camp could not load:', error));
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [companionType, rescuedCritters, onCompanionClick, onCritterClick, onHomeClick, rescueFriend, onRescueTrailClick, onDecorationRendered, homeDecor, kindnessMoments, season, celebration, reduceMotion, completedFlagshipStories]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full touch-none ${className}`} aria-label="Interactive 3D Critter Rescue camp" />;
}
