import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectFile = (name: string) => path.resolve(process.cwd(), name);

describe('native beta packaging configuration', () => {
  it('uses a local Capacitor bundle with the reviewed application identifier', () => {
    const capacitorConfig = fs.readFileSync(projectFile('capacitor.config.ts'), 'utf8');
    expect(capacitorConfig).toContain("appId: 'com.critterrescue.game'");
    expect(capacitorConfig).toContain("webDir: 'dist/public'");
    expect(capacitorConfig).not.toMatch(/server:\s*\{[\s\S]*url:/);
    expect(capacitorConfig).toContain("allowNavigation: ['crittergame-jtesdgpd.manus.space']");
  });

  it('provides reproducible native build commands and keeps signing material ignored', () => {
    const packageJson = JSON.parse(fs.readFileSync(projectFile('package.json'), 'utf8')) as { scripts: Record<string, string> };
    const ignoreRules = fs.readFileSync(projectFile('.gitignore'), 'utf8');
    const releaseGuide = fs.readFileSync(projectFile('NATIVE_BETA_RELEASE_GUIDE.md'), 'utf8');

    expect(packageJson.scripts['native:sync']).toBe('pnpm run build:native && cap sync');
    expect(packageJson.scripts['cap:add:ios']).toBe('cap add ios');
    expect(packageJson.scripts['cap:add:android']).toBe('cap add android');
    expect(ignoreRules).toContain('.env.native');
    expect(ignoreRules).toContain('*.keystore');
    expect(releaseGuide).toContain('TestFlight');
    expect(releaseGuide).toContain('Closed testing');
  });

  it('uses proxy-aware contact throttling and documents the no-account beta architecture', () => {
    const serverSource = fs.readFileSync(projectFile('server/index.ts'), 'utf8');
    const releaseGuide = fs.readFileSync(projectFile('NATIVE_BETA_RELEASE_GUIDE.md'), 'utf8');
    const indexHtml = fs.readFileSync(projectFile('client/index.html'), 'utf8');

    expect(serverSource).toContain('app.set("trust proxy", 1)');
    expect(releaseGuide).toContain('local Capacitor native application');
    expect(releaseGuide).toContain('does not ship as a remote website wrapper');
    expect(indexHtml).not.toContain('VITE_ANALYTICS');
    expect(indexHtml).not.toContain('fonts.googleapis.com');
    expect(indexHtml).not.toContain('fonts.gstatic.com');
  });

  it('bundles Babylon only for native mode and keeps the calm pair activity free of a remote Phaser iframe', () => {
    const babylonRuntime = fs.readFileSync(projectFile('client/src/lib/babylonRuntime.ts'), 'utf8');
    const bundledNativeLoader = fs.readFileSync(projectFile('client/src/lib/babylonEngineLoader.native.ts'), 'utf8');
    const carePairs = fs.readFileSync(projectFile('client/src/screens/Match3Screen.tsx'), 'utf8');

    expect(babylonRuntime).toContain("import.meta.env.MODE === 'native'");
    expect(babylonRuntime).toContain('loadBundledBabylon');
    expect(babylonRuntime).toContain('https://cdn.jsdelivr.net/npm/babylonjs@7.54.0/babylon.js');
    expect(bundledNativeLoader).toContain("import * as Babylon from '@babylonjs/core'");
    expect(carePairs).not.toContain('phaser.min.js');
    expect(carePairs).not.toContain('<iframe');
    expect(carePairs).not.toMatch(/Score:|moves|Game Over/);
  });
});
