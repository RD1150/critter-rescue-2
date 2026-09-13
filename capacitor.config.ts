import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Critter Rescue is packaged as a local native shell. The app does not load its
 * user interface from a remote URL; `cap sync` copies the Vite bundle from
 * `webDir` into the generated iOS and Android projects.
 */
const config: CapacitorConfig = {
  appId: 'com.critterrescue.game',
  appName: 'Critter Rescue',
  webDir: 'dist/public',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    allowNavigation: ['crittergame-jtesdgpd.manus.space'],
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
