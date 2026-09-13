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
});
