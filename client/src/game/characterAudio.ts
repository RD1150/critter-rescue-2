// Recorded character dialogue is deliberately sparse and player-initiated.
// Text always remains visible; a missing recording simply means the line stays quiet.
import { getAudioPreferences } from './audioPreferences';
export type CharacterMoment = 'intro' | 'help' | 'thanks';

const RECORDED_LINES: Record<string, Partial<Record<CharacterMoment, string>>> = {
  "Nutty": {
    "intro": "/manus-storage/nutty_intro_elevenlabs_c7894963.mp3",
    "help": "/manus-storage/nutty_help_elevenlabs_d8fa8e6c.mp3",
    "thanks": "/manus-storage/nutty_thanks_elevenlabs_67b891b2.mp3"
  },
  "Pip": {
    "intro": "/manus-storage/pip_intro_db4d3ad8.mp3",
    "help": "/manus-storage/pip_help_a10e1634.mp3",
    "thanks": "/manus-storage/pip_thanks_3ac67915.mp3"
  },
  "Daisy": {
    "intro": "/manus-storage/daisy_intro_dd0c82c6.mp3",
    "help": "/manus-storage/daisy_help_2bd9707f.mp3",
    "thanks": "/manus-storage/daisy_thanks_b4a26117.mp3"
  },
  "Clover": {
    "intro": "/manus-storage/clover_intro_e277a95b.mp3",
    "help": "/manus-storage/clover_help_0f1225c5.mp3",
    "thanks": "/manus-storage/clover_thanks_b927ae15.mp3"
  },
  "Buttercup": {
    "intro": "/manus-storage/buttercup_intro_b20eb500.mp3",
    "help": "/manus-storage/buttercup_help_252b9740.mp3",
    "thanks": "/manus-storage/buttercup_thanks_95f39648.mp3"
  },
  "Cricket": {
    "intro": "/manus-storage/cricket_intro_9eef6c72.mp3",
    "help": "/manus-storage/cricket_help_f2f1f3da.mp3",
    "thanks": "/manus-storage/cricket_thanks_d6785cd6.mp3"
  },
  "Splash": {
    "intro": "/manus-storage/splash_intro_006f3d24.mp3",
    "help": "/manus-storage/splash_help_4ee7dfd7.mp3",
    "thanks": "/manus-storage/splash_thanks_431b4d04.mp3"
  },
  "Brook": {
    "intro": "/manus-storage/brook_intro_d92b456a.mp3",
    "help": "/manus-storage/brook_help_d9270ad2.mp3",
    "thanks": "/manus-storage/brook_thanks_11bd4590.mp3"
  },
  "Finn": {
    "intro": "/manus-storage/finn_intro_0fdb88ad.mp3",
    "help": "/manus-storage/finn_help_14aac6aa.mp3",
    "thanks": "/manus-storage/finn_thanks_355e1817.mp3"
  },
  "Reed": {
    "intro": "/manus-storage/reed_intro_e7a42873.mp3",
    "help": "/manus-storage/reed_help_c2000a71.mp3",
    "thanks": "/manus-storage/reed_thanks_582bff83.mp3"
  },
  "Bubbles": {
    "intro": "/manus-storage/bubbles_intro_d716d47b.mp3",
    "help": "/manus-storage/bubbles_help_5e3b0d4d.mp3",
    "thanks": "/manus-storage/bubbles_thanks_0b26a4fb.mp3"
  },
  "Piper": {
    "intro": "/manus-storage/piper_intro_3e6f1001.mp3",
    "help": "/manus-storage/piper_help_ac033b53.mp3",
    "thanks": "/manus-storage/piper_thanks_f7613182.mp3"
  },
  "Shadow": {
    "intro": "/manus-storage/shadow_intro_71ff0c58.mp3",
    "help": "/manus-storage/shadow_help_1e4954d2.mp3",
    "thanks": "/manus-storage/shadow_thanks_84b2e24a.mp3"
  },
  "Mossy": {
    "intro": "/manus-storage/mossy_intro_76e8d5b2.mp3",
    "help": "/manus-storage/mossy_help_0d0b7e90.mp3",
    "thanks": "/manus-storage/mossy_thanks_b0a4fec3.mp3"
  },
  "Ember": {
    "intro": "/manus-storage/ember_intro_bc3f2dd4.mp3",
    "help": "/manus-storage/ember_help_fb126761.mp3",
    "thanks": "/manus-storage/ember_thanks_9b154ff5.mp3"
  },
  "Thistle": {
    "intro": "/manus-storage/thistle_intro_9ab5a908.mp3",
    "help": "/manus-storage/thistle_help_2d0eb70a.mp3",
    "thanks": "/manus-storage/thistle_thanks_64f30f0a.mp3"
  },
  "Bark": {
    "intro": "/manus-storage/bark_intro_53be40bf.mp3",
    "help": "/manus-storage/bark_help_fabc9274.mp3",
    "thanks": "/manus-storage/bark_thanks_f9e992bc.mp3"
  },
  "Ferns": {
    "intro": "/manus-storage/ferns_intro_6175a6e2.mp3",
    "help": "/manus-storage/ferns_help_71529bd3.mp3",
    "thanks": "/manus-storage/ferns_thanks_4c1630e0.mp3"
  },
  "Rocky": {
    "intro": "/manus-storage/rocky_intro_f8b226ac.mp3",
    "help": "/manus-storage/rocky_help_9894e063.mp3",
    "thanks": "/manus-storage/rocky_thanks_92eba2cd.mp3"
  },
  "Pebble": {
    "intro": "/manus-storage/pebble_intro_a60b5fb4.mp3",
    "help": "/manus-storage/pebble_help_7656a1ca.mp3",
    "thanks": "/manus-storage/pebble_thanks_21f42f54.mp3"
  },
  "Flint": {
    "intro": "/manus-storage/flint_intro_359424da.mp3",
    "help": "/manus-storage/flint_help_0a0322a9.mp3",
    "thanks": "/manus-storage/flint_thanks_3ddeb2c4.mp3"
  },
  "Summit": {
    "intro": "/manus-storage/summit_intro_fae18500.mp3",
    "help": "/manus-storage/summit_help_d9e6febb.mp3",
    "thanks": "/manus-storage/summit_thanks_387e5837.mp3"
  },
  "Zephyr": {
    "intro": "/manus-storage/zephyr_intro_3217d92f.mp3",
    "help": "/manus-storage/zephyr_help_84be76b2.mp3",
    "thanks": "/manus-storage/zephyr_thanks_da720efe.mp3"
  },
  "Alpaca": {
    "intro": "/manus-storage/alpaca_intro_f1625653.mp3",
    "help": "/manus-storage/alpaca_help_73657d1d.mp3",
    "thanks": "/manus-storage/alpaca_thanks_65326579.mp3"
  },
  "River Friends": {
    "intro": "/manus-storage/river-friends_intro_1ae6b4f2.mp3",
    "help": "/manus-storage/river-friends_help_498758c0.mp3",
    "thanks": "/manus-storage/river-friends_thanks_5e4dc19b.mp3"
  },
  "Mountain Friends": {
    "intro": "/manus-storage/mountain-friends_intro_6097e512.mp3",
    "help": "/manus-storage/mountain-friends_help_5b1f6111.mp3",
    "thanks": "/manus-storage/mountain-friends_thanks_ab063269.mp3"
  }
};

let activeAudio: HTMLAudioElement | null = null;

export function getCharacterAudioKey(name: string, zone?: string): string {
  if (name === 'Everyone') return zone === 'riverside' ? 'River Friends' : 'Mountain Friends';
  return name;
}

export function hasCharacterAudio(name: string, moment: CharacterMoment, zone?: string): boolean {
  return Boolean(RECORDED_LINES[getCharacterAudioKey(name, zone)]?.[moment]);
}

export function playCharacterAudio(name: string, moment: CharacterMoment, zone?: string): void {
  const source = RECORDED_LINES[getCharacterAudioKey(name, zone)]?.[moment];
  if (!source || typeof Audio === 'undefined') return;
  if (activeAudio) activeAudio.pause();
  activeAudio = new Audio(source);
  activeAudio.volume = getAudioPreferences().voiceVolume;
  void activeAudio.play().catch(() => {});
}

function playSource(source: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof Audio === 'undefined') { resolve(); return; }
    const audio = new Audio(source);
    activeAudio = audio;
    audio.volume = getAudioPreferences().voiceVolume;
    audio.addEventListener('ended', () => resolve(), { once: true });
    audio.addEventListener('error', () => resolve(), { once: true });
    void audio.play().catch(() => resolve());
  });
}

export async function playCharacterStory(name: string, zone?: string): Promise<void> {
  const clips = RECORDED_LINES[getCharacterAudioKey(name, zone)];
  if (!clips || activeAudio === null && typeof Audio === 'undefined') return;
  if (activeAudio) activeAudio.pause();
  for (const moment of ['intro', 'help', 'thanks'] as CharacterMoment[]) {
    const source = clips[moment];
    if (source) await playSource(source);
  }
}
