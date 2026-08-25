// Hearthlight Field Journal — Babylon.js plushie toy-diorama camp.
// This file owns only the 3D scene graph; React owns game state and HUD overlays.
import React, { useEffect, useRef } from 'react';
import type * as Babylon from '@babylonjs/core';
import { loadBabylon } from '../lib/babylonRuntime';
import { CritterData, CritterType } from '../game/data';
import { getHomeDecorationMeshIds, getHomeDecorationRenderPlan } from '../game/homeDecorations';
import type { HomeDecoration, SanctuarySeason } from '../game/store';
import { getSanctuaryGrowth } from '../game/sanctuaryGrowth';
import { PLUSH_IMAGES } from './CritterAvatar';

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
let Engine!: typeof Babylon.Engine;
let ExecuteCodeAction!: typeof Babylon.ExecuteCodeAction;
let HemisphericLight!: typeof Babylon.HemisphericLight;
let Mesh!: typeof Babylon.Mesh;
let MeshBuilder!: typeof Babylon.MeshBuilder;
let PointLight!: typeof Babylon.PointLight;
let Scene!: typeof Babylon.Scene;
let ShadowGenerator!: typeof Babylon.ShadowGenerator;
let StandardMaterial!: typeof Babylon.StandardMaterial;
let Texture!: typeof Babylon.Texture;
let TransformNode!: typeof Babylon.TransformNode;
let Vector3!: typeof Babylon.Vector3;

function initializeBabylon(B: typeof Babylon) {
  ({ ActionManager, ArcRotateCamera, Color3, Color4, DynamicTexture, Engine, ExecuteCodeAction, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, ShadowGenerator, StandardMaterial, Texture, TransformNode, Vector3 } = B);
}

type Props = {
  companionType: CritterType;
  rescuedCritters: CritterData[];
  onCompanionClick: () => void;
  onCritterClick: (critter: CritterData) => void;
  onHomeClick: (critter: CritterData) => void;
  onDecorationRendered?: (critterName: string, decoration: HomeDecoration, meshIds: string[]) => void;
  homeDecor?: Record<string, HomeDecoration>;
  kindnessMoments?: number;
  season?: SanctuarySeason;
  reduceMotion?: boolean;
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
};

function makeMaterial(scene: Scene, name: string, hex: string, emissive = 0): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(hex);
  material.specularColor = new Color3(0.08, 0.08, 0.08);
  if (emissive > 0) material.emissiveColor = Color3.FromHexString(hex).scale(emissive);
  return material;
}

function label(scene: Scene, parent: TransformNode, text: string, y: number, accent = '#F6EAD2') {
  const texture = new DynamicTexture(`label-${text}`, { width: 512, height: 128 }, scene, true);
  texture.hasAlpha = true;
  texture.drawText(text, null, 84, 'bold 54px Nunito Sans', accent, 'transparent', true);
  const material = new StandardMaterial(`label-mat-${text}`, scene);
  material.diffuseTexture = texture;
  material.opacityTexture = texture;
  material.emissiveColor = new Color3(0.22, 0.18, 0.12);
  material.disableLighting = true;
  const plate = MeshBuilder.CreatePlane(`label-${text}`, { width: 1.45, height: 0.36 }, scene);
  plate.parent = parent;
  plate.position.y = y;
  plate.billboardMode = Mesh.BILLBOARDMODE_ALL;
  plate.material = material;
  plate.isPickable = false;
}

function createTree(scene: Scene, position: Vector3, scale: number, leafMaterial: StandardMaterial, trunkMaterial: StandardMaterial, shadow: ShadowGenerator) {
  const root = new TransformNode(`tree-${position.x}-${position.z}`, scene);
  root.position = position;
  const trunk = MeshBuilder.CreateCylinder(`trunk-${position.x}-${position.z}`, { height: scale * 2.2, diameterTop: scale * 0.38, diameterBottom: scale * 0.58, tessellation: 10 }, scene);
  trunk.parent = root;
  trunk.position.y = scale * 1.1;
  trunk.material = trunkMaterial;
  shadow.addShadowCaster(trunk);
  const canopy = MeshBuilder.CreateSphere(`canopy-${position.x}-${position.z}`, { diameter: scale * 2.3, segments: 12 }, scene);
  canopy.parent = root;
  canopy.position.y = scale * 2.55;
  canopy.scaling = new Vector3(1, 1.12, 1);
  canopy.material = leafMaterial;
  shadow.addShadowCaster(canopy);
  const puff = MeshBuilder.CreateSphere(`canopy-puff-${position.x}-${position.z}`, { diameter: scale * 1.55, segments: 10 }, scene);
  puff.parent = root;
  puff.position = new Vector3(scale * 0.75, scale * 2.3, scale * 0.12);
  puff.material = leafMaterial;
  shadow.addShadowCaster(puff);
  return root;
}

function createFlower(scene: Scene, x: number, z: number, color: string) {
  const stem = MeshBuilder.CreateCylinder(`stem-${x}-${z}`, { height: 0.34, diameter: 0.04, tessellation: 6 }, scene);
  stem.position = new Vector3(x, 0.17, z);
  stem.material = makeMaterial(scene, `stem-mat-${x}-${z}`, '#3F7F45');
  const bloom = MeshBuilder.CreateSphere(`bloom-${x}-${z}`, { diameter: 0.24, segments: 8 }, scene);
  bloom.position = new Vector3(x, 0.39, z);
  bloom.material = makeMaterial(scene, `bloom-mat-${x}-${z}`, color, 0.04);
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
  bee: { style: 'honey-hut', title: 'Honey Hut' },
  ladybug: { style: 'garden-hideout', title: 'Petal Home' },
  snail: { style: 'garden-hideout', title: 'Mossy Corner' },
  lizard: { style: 'garden-hideout', title: 'Warm Rock' },
  goat: { style: 'garden-hideout', title: 'Meadow Patch' },
  bunny: { style: 'garden-hideout', title: 'Clover Burrow' },
};

function createCritterHome(scene: Scene, critter: CritterData, position: Vector3, shadow: ShadowGenerator, onCare: () => void, decoration: HomeDecoration = 'petal-garland') {
  const detail = HOME_DETAILS[critter.type] ?? { style: 'garden-hideout' as HomeStyle, title: 'Cozy Corner' };
  const root = new TransformNode(`home-${critter.name}`, scene);
  root.position = position;
  const soil = makeMaterial(scene, `home-soil-${critter.name}`, '#6A4931');
  const wood = makeMaterial(scene, `home-wood-${critter.name}`, '#8A5737');
  const cream = makeMaterial(scene, `home-cream-${critter.name}`, '#F1DFC3');
  const water = makeMaterial(scene, `home-water-${critter.name}`, '#6EB9CE', 0.08);
  const leaf = makeMaterial(scene, `home-leaf-${critter.name}`, '#548B50');
  const petal = makeMaterial(scene, `home-petal-${critter.name}`, '#E89A9E', 0.05);
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
    nest.parent = root; nest.rotation.x = Math.PI / 2; nest.position.y = 1.1; nest.material = soil; addShadow(nest);
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
      const flower = MeshBuilder.CreateSphere(`home-flower-${critter.name}-${i}`, { diameter: 0.19, segments: 8 }, scene);
      flower.parent = root; flower.position = new Vector3(-0.4 + i * 0.8, 0.31, -0.16); flower.material = petal; addShadow(flower);
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
  careRing.rotation.x = Math.PI / 2;
  careRing.position.y = 0.06;
  careRing.material = petal;
  careRing.actionManager = new ActionManager(scene);
  careRing.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, onCare));
  label(scene, root, `${critter.name}'s ${detail.title}`, detail.style === 'nest-perch' ? 1.62 : 1.24, '#FBE8CA');
  return root;
}

function createSanctuaryGrowth(scene: Scene, kindnessMoments: number, shadow: ShadowGenerator) {
  const growth = getSanctuaryGrowth(kindnessMoments);
  if (!growth.propKey) return;
  const wood = makeMaterial(scene, 'kindness-growth-wood', '#8A5737');
  const leaf = makeMaterial(scene, 'kindness-growth-leaf', '#6EAA62');
  const water = makeMaterial(scene, 'kindness-growth-water', '#6EB9CE', 0.12);
  const bloom = makeMaterial(scene, 'kindness-growth-bloom', '#F1B4C0', 0.1);
  const addShadow = (mesh: Mesh) => shadow.addShadowCaster(mesh);
  if (kindnessMoments >= 3) {
    [-0.62, 0.62].forEach((x, index) => { const post = MeshBuilder.CreateCylinder(`kindness-arbor-post-${index}`, { height: 1.25, diameter: 0.13, tessellation: 8 }, scene); post.position = new Vector3(0.2 + x, 0.63, -4.15); post.material = wood; addShadow(post); });
    const arch = MeshBuilder.CreateTorus('kindness-arbor-arch', { diameter: 1.22, thickness: 0.11, tessellation: 20 }, scene);
    arch.position = new Vector3(0.2, 1.28, -4.15); arch.rotation.x = Math.PI / 2; arch.scaling.y = 1.18; arch.material = leaf; addShadow(arch);
  }
  if (kindnessMoments >= 8) {
    const bowl = MeshBuilder.CreateCylinder('kindness-ripple-bowl', { height: 0.22, diameterTop: 0.95, diameterBottom: 0.72, tessellation: 18 }, scene);
    bowl.position = new Vector3(2.15, 0.12, -3.65); bowl.material = water; addShadow(bowl);
    const ripple = MeshBuilder.CreateTorus('kindness-ripple-ring', { diameter: 0.56, thickness: 0.035, tessellation: 18 }, scene);
    ripple.position = new Vector3(2.15, 0.245, -3.65); ripple.rotation.x = Math.PI / 2; ripple.material = makeMaterial(scene, 'kindness-ripple-ring-mat', '#EAF8FF', 0.4);
  }
  if (kindnessMoments >= 15) {
    [-0.45, -0.15, 0.15, 0.45].forEach((offset, index) => { const flower = MeshBuilder.CreateSphere(`kindness-bloom-flower-${index}`, { diameter: 0.27, segments: 8 }, scene); flower.position = new Vector3(-2.25 + offset, 0.32 + (index % 2) * 0.08, -3.75 + (index % 2) * 0.18); flower.material = bloom; addShadow(flower); });
    const stem = MeshBuilder.CreateCylinder('kindness-bloom-stem', { height: 0.52, diameter: 0.07, tessellation: 6 }, scene);
    stem.position = new Vector3(-2.25, 0.26, -3.7); stem.material = leaf; addShadow(stem);
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
  isCompanion = false,
) {
  const root = new TransformNode(`plush-${displayName}`, scene);
  root.position = position;
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

  // Textured image-plane gives each supplied plush image its exact personality.
  const faceMaterial = new StandardMaterial(`plush-face-${displayName}`, scene);
  const texturePath = PLUSH_IMAGES[type];
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
  const face = MeshBuilder.CreatePlane(`plush-face-${displayName}`, { width: scale * 1.45, height: scale * 1.45 }, scene);
  face.parent = root;
  face.position = new Vector3(0, scale * 0.78, -scale * 0.53);
  face.billboardMode = Mesh.BILLBOARDMODE_ALL;
  face.material = faceMaterial;
  face.actionManager = new ActionManager(scene);
  face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, interactive));
  body.actionManager = new ActionManager(scene);
  body.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, interactive));
  label(scene, root, displayName, scale * 1.88, isCompanion ? '#FBE8CA' : '#F8F2E7');

  return { root, body, face };
}

export default function BabylonCampScene({ companionType, rescuedCritters, onCompanionClick, onCritterClick, onHomeClick, onDecorationRendered, homeDecor = {}, kindnessMoments = 0, season = 'summer', reduceMotion = false, className = '' }: Props) {
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
    const seasonalPalette: Record<SanctuarySeason, { sky: string; accent: string }> = { spring: { sky: '#103B2A', accent: '#F1B4C0' }, summer: { sky: '#103B2A', accent: '#F5C842' }, autumn: { sky: '#183C2D', accent: '#E8874E' }, winter: { sky: '#153C47', accent: '#B8E0EC' } };
    const seasonal = seasonalPalette[season];
    scene.clearColor = Color4.FromHexString(seasonal.sky);
    scene.ambientColor = new Color3(0.38, 0.32, 0.22);

    const camera = new ArcRotateCamera('camp-camera', -Math.PI / 2.15, 1.05, 20.5, new Vector3(0, 1.45, 0), scene);
    camera.lowerRadiusLimit = 14;
    camera.upperRadiusLimit = 26;
    camera.lowerBetaLimit = 0.72;
    camera.upperBetaLimit = 1.26;
    camera.wheelPrecision = 42;
    camera.panningSensibility = 0;
    camera.attachControl(canvas, true);

    const sky = new HemisphericLight('soft-sky', new Vector3(0.1, 1, 0.3), scene);
    sky.diffuse = Color3.FromHexString('#F8D8A8');
    sky.groundColor = Color3.FromHexString('#274F34');
    sky.intensity = 0.76;
    const firelight = new PointLight('hearth-glow', new Vector3(0, 3.2, 0), scene);
    firelight.diffuse = Color3.FromHexString('#FFB86C');
    firelight.intensity = 2.4;
    firelight.range = 10;
    const shadow = new ShadowGenerator(1024, firelight);
    shadow.useBlurExponentialShadowMap = true;
    shadow.blurKernel = 18;

    const grassMaterial = makeMaterial(scene, 'felt-grass', '#497C45');
    const ground = MeshBuilder.CreateDisc('felt-clearing', { radius: 9.5, tessellation: 72 }, scene);
    ground.rotation.x = Math.PI / 2;
    ground.material = grassMaterial;
    ground.receiveShadows = true;

    const ringMaterial = makeMaterial(scene, 'trail-ring', '#B79861');
    const path = MeshBuilder.CreateTorus('stitched-trail', { diameter: 12.5, thickness: 0.12, tessellation: 64 }, scene);
    path.rotation.x = Math.PI / 2;
    path.position.y = 0.04;
    path.material = ringMaterial;

    const trunkMaterial = makeMaterial(scene, 'plush-trunk', '#8C5A3B');
    const leafMaterialA = makeMaterial(scene, 'plush-leaf-a', '#2E6B45');
    const leafMaterialB = makeMaterial(scene, 'plush-leaf-b', '#3C844E');
    [
      [-7.1, -4.4, 1.7, leafMaterialA], [-6.2, 4.3, 1.35, leafMaterialB], [-3.8, 6.7, 1.25, leafMaterialA],
      [6.6, -4.9, 1.65, leafMaterialB], [7.4, 3.6, 1.4, leafMaterialA], [3.6, 6.8, 1.1, leafMaterialB],
    ].forEach(([x, z, scale, material]) => createTree(scene, new Vector3(x as number, 0, z as number), scale as number, material as StandardMaterial, trunkMaterial, shadow));

    [['#E66B5B', -3.4, -1.8], ['#F4C949', -2.1, -3.4], ['#F1B4C0', 3.6, -2.7], ['#E66B5B', 4.6, 1.6], ['#B69DE8', -4.8, 2.6], ['#F4C949', 1.8, 4.9], ['#E66B5B', 4.2, 4.2]].forEach(([color, x, z]) => createFlower(scene, x as number, z as number, color as string));
    [[-5.7, -0.5], [5.7, -0.4], [-1.7, 5.9], [1.8, -5.1]].forEach(([x, z], index) => {
      const seasonalDot = MeshBuilder.CreateSphere(`seasonal-keepsake-${season}-${index}`, { diameter: 0.22, segments: 8 }, scene);
      seasonalDot.position = new Vector3(x, 0.16, z); seasonalDot.material = makeMaterial(scene, `seasonal-keepsake-mat-${season}-${index}`, seasonal.accent, 0.2); shadow.addShadowCaster(seasonalDot);
    });
    createSanctuaryGrowth(scene, kindnessMoments, shadow);

    // Campfire with stone ring and animated warm flame.
    const stoneMat = makeMaterial(scene, 'fire-stones', '#9A836A');
    const logMat = makeMaterial(scene, 'fire-logs', '#72472E');
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const stone = MeshBuilder.CreateSphere(`stone-${i}`, { diameter: 0.56, segments: 10 }, scene);
      stone.position = new Vector3(Math.cos(a) * 0.94, 0.22, Math.sin(a) * 0.94);
      stone.scaling.y = 0.65;
      stone.material = stoneMat;
      shadow.addShadowCaster(stone);
    }
    [0.65, -0.65].forEach((rotation, i) => {
      const log = MeshBuilder.CreateCylinder(`log-${i}`, { height: 1.55, diameter: 0.22, tessellation: 10 }, scene);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = rotation;
      log.position.y = 0.35;
      log.material = logMat;
      shadow.addShadowCaster(log);
    });
    const flameMat = makeMaterial(scene, 'flame-mat', '#FF8B4D', 0.9);
    const flame = MeshBuilder.CreateSphere('gentle-flame', { diameter: 0.78, segments: 12 }, scene);
    flame.position = new Vector3(0, 0.88, 0);
    flame.scaling = new Vector3(0.72, 1.45, 0.72);
    flame.material = flameMat;

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

    const companion = makePlushie(scene, companionType, 'Your Companion', new Vector3(0, 0.02, 2.6), 2.25, onCompanionClick, shadow, true);

    const friendSlots = [
      new Vector3(-3.3, 0.02, 2.2), new Vector3(3.3, 0.02, 2.2), new Vector3(-4.8, 0.02, 0.2),
      new Vector3(4.7, 0.02, 0.1), new Vector3(-2.8, 0.02, -2.2), new Vector3(2.8, 0.02, -2.2),
    ];
    rescuedCritters.slice(0, friendSlots.length).forEach((critter, index) => {
      const slot = friendSlots[index];
      const homeOffset = new Vector3(slot.x < 0 ? -0.75 : 0.75, 0, slot.z > 0 ? 0.75 : -0.8);
      const activeDecoration = homeDecor[critter.name] ?? 'petal-garland';
      createCritterHome(scene, critter, slot.add(homeOffset), shadow, () => onHomeClick(critter), activeDecoration);
      onDecorationRendered?.(critter.name, activeDecoration, getHomeDecorationMeshIds(activeDecoration, critter.name));
      makePlushie(scene, critter.type, critter.name, friendSlots[index], 1.32, () => onHomeClick(critter), shadow);
    });

    const fireflies: Mesh[] = [];
    const fireflyMat = makeMaterial(scene, 'firefly-mat', '#FFE79A', 1);
    for (let i = 0; i < 13; i++) {
      const firefly = MeshBuilder.CreateSphere(`firefly-${i}`, { diameter: 0.09, segments: 6 }, scene);
      firefly.position = new Vector3(-6 + Math.random() * 12, 0.8 + Math.random() * 3.7, -4 + Math.random() * 7.4);
      firefly.material = fireflyMat;
      fireflies.push(firefly);
    }
    let elapsed = 0;
    let autoTurn = 0;
    scene.onBeforeRenderObservable.add(() => {
      const dt = engine.getDeltaTime() / 1000;
      elapsed += dt;
      if (reduceMotion) {
        flame.scaling = new Vector3(0.7, 1.36, 0.72);
        firelight.intensity = 2.2;
        companion.root.position.y = 0.02;
        fireflies.forEach((fly) => { fly.visibility = 0.75; });
        return;
      }
      flame.scaling.y = 1.36 + Math.sin(elapsed * 7) * 0.2;
      flame.scaling.x = 0.7 + Math.sin(elapsed * 5.5) * 0.07;
      firelight.intensity = 2.2 + Math.sin(elapsed * 8) * 0.35;
      companion.root.position.y = 0.02 + Math.sin(elapsed * 2.6) * 0.07;
      fireflies.forEach((fly, index) => {
        fly.position.y += Math.sin(elapsed * 1.9 + index) * 0.004;
        fly.visibility = 0.55 + Math.sin(elapsed * 3 + index * 1.7) * 0.4;
      });
      autoTurn += dt;
      if (autoTurn > 0.02 && !scene.activeCamera?.inputs.attached.pointers) camera.alpha += dt * 0.012;
    });

    engine.runRenderLoop(() => scene.render());
    const resize = () => engine.resize();
    window.addEventListener('resize', resize);
    cleanup = () => {
      window.removeEventListener('resize', resize);
      scene.dispose();
      engine.dispose();
    };
    }).catch((error) => console.error('Critter Rescue 3D camp could not load:', error));
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [companionType, rescuedCritters, onCompanionClick, onCritterClick, onHomeClick, onDecorationRendered, homeDecor, kindnessMoments, season, reduceMotion]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full touch-none ${className}`} aria-label="Interactive 3D Critter Rescue camp" />;
}
