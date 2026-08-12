// Hearthlight Field Journal — warm 3D nursery built as a toy-room diorama.
// React owns the care controls; this component owns rendering, lighting, and plushie response.
import React, { useEffect, useRef } from 'react';
import {
  ActionManager,
  ArcRotateCamera,
  Color3,
  Color4,
  DynamicTexture,
  Engine,
  ExecuteCodeAction,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { CritterType } from '../game/data';
import { PLUSH_IMAGES } from './CritterAvatar';

type Props = {
  type: CritterType;
  name: string;
  careLevel: number;
  carePulse: number;
  careAction: string | null;
  onPlushClick: () => void;
};

const PLUSH_COLORS: Record<CritterType, string> = {
  bunny: '#F2E9E1', fox: '#D86F37', owl: '#9A6D4C', squirrel: '#AE7042', bird: '#80C8E8',
  ladybug: '#D65642', frog: '#6FAE5B', otter: '#A97043', turtle: '#5E9A62', fish: '#4F9EC0',
  duck: '#F1CA54', hedgehog: '#B27749', snail: '#A981B4', lizard: '#5FA49B', bee: '#E9B93D',
  eagle: '#835B3E', goat: '#E9E4D7', beaver: '#865B3C', bear: '#A8754F',
};

function mat(scene: Scene, id: string, color: string, glow = 0) {
  const material = new StandardMaterial(id, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.specularColor = new Color3(0.04, 0.04, 0.04);
  if (glow) material.emissiveColor = Color3.FromHexString(color).scale(glow);
  return material;
}

function makeTextPlane(scene: Scene, id: string, text: string, width: number, height: number, position: Vector3, color = '#563B2A') {
  const texture = new DynamicTexture(`text-${id}`, { width: 1024, height: 256 }, scene, true);
  texture.hasAlpha = true;
  texture.drawText(text, null, 170, 'bold 74px Fraunces', color, 'transparent', true);
  const material = new StandardMaterial(`text-mat-${id}`, scene);
  material.diffuseTexture = texture;
  material.opacityTexture = texture;
  material.backFaceCulling = false;
  material.disableLighting = true;
  const plane = MeshBuilder.CreatePlane(id, { width, height }, scene);
  plane.position = position;
  plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
  plane.material = material;
  return plane;
}

function makePlush(scene: Scene, type: CritterType, name: string, shadow: ShadowGenerator, onClick: () => void) {
  const root = new TransformNode(`nursery-plush-${name}`, scene);
  root.position = new Vector3(0, 0.04, 1.15);
  const bodyMat = mat(scene, `nursery-body-${name}`, PLUSH_COLORS[type]);
  const body = MeshBuilder.CreateSphere(`nursery-body-${name}`, { diameter: 1.85, segments: 18 }, scene);
  body.parent = root;
  body.position.y = 1.2;
  body.scaling = new Vector3(0.88, 1, 0.55);
  body.material = bodyMat;
  shadow.addShadowCaster(body);
  const earOne = MeshBuilder.CreateSphere(`nursery-ear-a-${name}`, { diameter: 0.65, segments: 12 }, scene);
  earOne.parent = root;
  earOne.position = new Vector3(-0.6, 2.34, 0);
  earOne.scaling = new Vector3(0.58, 1.1, 0.45);
  earOne.material = bodyMat;
  const earTwo = earOne.clone(`nursery-ear-b-${name}`) as Mesh;
  earTwo.parent = root;
  earTwo.position.x = 0.6;
  shadow.addShadowCaster(earOne);
  shadow.addShadowCaster(earTwo);
  const portraitMat = new StandardMaterial(`nursery-face-${name}`, scene);
  const imagePath = PLUSH_IMAGES[type];
  if (imagePath) {
    const texture = new Texture(imagePath, scene, false, false);
    texture.hasAlpha = true;
    texture.vScale = -1;
    texture.vOffset = 1;
    portraitMat.diffuseTexture = texture;
    portraitMat.opacityTexture = texture;
    portraitMat.useAlphaFromDiffuseTexture = true;
  }
  portraitMat.backFaceCulling = false;
  portraitMat.specularColor = new Color3(0, 0, 0);
  const face = MeshBuilder.CreatePlane(`nursery-face-${name}`, { width: 2.8, height: 2.8 }, scene);
  face.parent = root;
  face.position = new Vector3(0, 1.25, -0.58);
  face.billboardMode = Mesh.BILLBOARDMODE_ALL;
  face.material = portraitMat;
  face.actionManager = new ActionManager(scene);
  face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, onClick));
  body.actionManager = new ActionManager(scene);
  body.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, onClick));
  return root;
}

export default function BabylonNurseryScene({ type, name, careLevel, carePulse, careAction, onPlushClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.20, 0.13, 0.17, 1);

    const camera = new ArcRotateCamera('nursery-camera', -Math.PI / 2, 1.08, 13.5, new Vector3(0, 1.65, 1.4), scene);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 16;
    camera.lowerBetaLimit = 0.84;
    camera.upperBetaLimit = 1.24;
    camera.panningSensibility = 0;
    camera.wheelPrecision = 44;
    camera.attachControl(canvas, true);

    const glow = new HemisphericLight('nursery-moonlight', new Vector3(0.1, 1, 0.1), scene);
    glow.diffuse = Color3.FromHexString('#F9D4B0');
    glow.groundColor = Color3.FromHexString('#4E2C3A');
    glow.intensity = 0.76;
    const lamp = new PointLight('nursery-lamp', new Vector3(-2.8, 4.4, -0.4), scene);
    lamp.diffuse = Color3.FromHexString('#FFC985');
    lamp.intensity = 2.3;
    lamp.range = 10;
    const shadow = new ShadowGenerator(1024, lamp);
    shadow.useBlurExponentialShadowMap = true;
    shadow.blurKernel = 18;

    const floorMat = mat(scene, 'nursery-floor', '#A56F58');
    const floor = MeshBuilder.CreateBox('nursery-floor', { width: 14, depth: 10, height: 0.32 }, scene);
    floor.position = new Vector3(0, -0.16, 1.2);
    floor.material = floorMat;
    floor.receiveShadows = true;
    const rug = MeshBuilder.CreateDisc('nursery-rug', { radius: 3.25, tessellation: 48 }, scene);
    rug.rotation.x = Math.PI / 2;
    rug.position = new Vector3(0, 0.02, 1.1);
    rug.material = mat(scene, 'nursery-rug-mat', '#E1B4A9');
    const backWall = MeshBuilder.CreateBox('nursery-back-wall', { width: 14, height: 8, depth: 0.25 }, scene);
    backWall.position = new Vector3(0, 3.8, 5.4);
    backWall.material = mat(scene, 'nursery-wall-mat', '#E8C8B4');
    const leftWall = MeshBuilder.CreateBox('nursery-side-wall', { width: 0.25, height: 8, depth: 10 }, scene);
    leftWall.position = new Vector3(-7, 3.8, 1.2);
    leftWall.material = mat(scene, 'nursery-side-mat', '#DDB59E');

    // Moonlit circular window and stars make the room feel like a safe bedtime toy world.
    const windowFrame = MeshBuilder.CreateTorus('nursery-window-frame', { diameter: 2.5, thickness: 0.16, tessellation: 32 }, scene);
    windowFrame.rotation.x = Math.PI / 2;
    windowFrame.position = new Vector3(3.9, 4.65, 5.17);
    windowFrame.material = mat(scene, 'window-frame-mat', '#865B4B');
    const moon = MeshBuilder.CreateDisc('nursery-moon-window', { radius: 1.1, tessellation: 32 }, scene);
    moon.position = new Vector3(3.9, 4.65, 5.15);
    moon.material = mat(scene, 'moon-window-mat', '#8FC9E8', 0.1);
    for (let i = 0; i < 9; i++) {
      const star = MeshBuilder.CreateSphere(`nursery-star-${i}`, { diameter: 0.1, segments: 6 }, scene);
      star.position = new Vector3(2.9 + Math.random() * 2.1, 3.8 + Math.random() * 1.7, 5.02);
      star.material = mat(scene, `star-mat-${i}`, '#FFF0A3', 0.8);
    }

    const shelfMat = mat(scene, 'nursery-shelf-mat', '#8A543A');
    const shelf = MeshBuilder.CreateBox('nursery-shelf', { width: 2.4, depth: 0.38, height: 0.15 }, scene);
    shelf.position = new Vector3(-4.8, 3.35, 4.95);
    shelf.material = shelfMat;
    ['🧸', '📚', '🌙'].forEach((symbol, index) => {
      makeTextPlane(scene, `shelf-${index}`, symbol, 0.5, 0.5, new Vector3(-5.6 + index * 0.8, 3.74, 4.72), '#7B4735');
    });
    const bedMat = mat(scene, 'nursery-bed-mat', '#F2D7CC');
    const bed = MeshBuilder.CreateCylinder('nursery-plush-bed', { diameter: 4.5, height: 0.52, tessellation: 36 }, scene);
    bed.position = new Vector3(0, 0.26, 1.2);
    bed.material = bedMat;
    shadow.addShadowCaster(bed);
    const pillow = MeshBuilder.CreateSphere('nursery-pillow', { diameter: 1.5, segments: 16 }, scene);
    pillow.position = new Vector3(-1.4, 0.66, 1.75);
    pillow.scaling = new Vector3(1, 0.45, 0.72);
    pillow.material = mat(scene, 'nursery-pillow-mat', '#F8E8DF');
    shadow.addShadowCaster(pillow);
    const plush = makePlush(scene, type, name, shadow, onPlushClick);
    makeTextPlane(scene, 'nursery-title', 'THE COZY NURSERY', 4.4, 0.82, new Vector3(0, 6.6, 4.92), '#734635');
    makeTextPlane(scene, 'nursery-status', careLevel >= 3 ? 'READY FOR CAMP!' : `CARE ${careLevel} / 3`, 2.2, 0.42, new Vector3(0, 3.25, -0.1), careLevel >= 3 ? '#6E914E' : '#E66B5B');

    const careToken = careAction ? makeTextPlane(scene, 'care-token', careAction, 1.55, 0.45, new Vector3(0, 2.9, -0.7), '#E66B5B') : null;
    const hearts = Array.from({ length: careLevel }, (_, index) => {
      const heart = makeTextPlane(scene, `heart-${index}`, '♥', 0.38, 0.38, new Vector3(-0.44 + index * 0.44, 3.58, -0.15), '#E66B5B');
      return heart;
    });
    let elapsed = 0;
    scene.onBeforeRenderObservable.add(() => {
      const dt = engine.getDeltaTime() / 1000;
      elapsed += dt;
      plush.position.y = 0.04 + Math.sin(elapsed * 2.2) * 0.075 + (carePulse ? Math.max(0, 0.16 - elapsed * 0.08) : 0);
      hearts.forEach((heart, index) => { heart.position.y = 3.58 + Math.sin(elapsed * 2.2 + index) * 0.05; });
      if (careToken) {
        careToken.position.y = 2.9 + Math.sin(elapsed * 3) * 0.08;
        careToken.visibility = 0.7 + Math.sin(elapsed * 4) * 0.25;
      }
    });
    engine.runRenderLoop(() => scene.render());
    const resize = () => engine.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      scene.dispose();
      engine.dispose();
    };
  }, [type, name, careLevel, carePulse, careAction, onPlushClick]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none" aria-label="Interactive 3D Critter Nursery" />;
}
