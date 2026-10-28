// Recorded character dialogue is deliberately sparse and player-initiated.
// Text always remains visible; a missing recording simply means the line stays quiet.
import { getAudioPreferences } from './audioPreferences';
import { resolveNativeNetworkUrl } from '../lib/nativeRuntime';
import type { PreReaderDirectionKey } from './preReaderDirections';
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


export const GENTLE_RETRY_AUDIO = {
  'try again': '/manus-storage/critter-retry-try-again_41485398.mp3',
  'two berry basket': '/manus-storage/critter-retry-two-berry-basket_821f0692.mp3',
  'four berry basket': '/manus-storage/critter-retry-four-berry-basket_d64e0f42.mp3',
  fish: '/manus-storage/critter-retry-fish_271c1fc6.mp3',
  flower: '/manus-storage/critter-retry-flower_e09f897b.mp3',
  sun: '/manus-storage/critter-retry-sun_911c922e.mp3',
  moon: '/manus-storage/critter-retry-moon_c0addcf5.mp3',
  berry: '/manus-storage/critter-retry-berry_94c96b79.mp3',
  'nest home': '/manus-storage/critter-retry-birdhouse_563e2a6b.mp3',
  'den home': '/manus-storage/critter-retry-burrow_e48d7ed7.mp3',
  butterfly: '/manus-storage/critter-retry-butterfly_036b1e2a.mp3',
  bee: '/manus-storage/critter-retry-bee_f69d704a.mp3',
  fox: '/manus-storage/critter-retry-fox_176ecb1a.mp3',
  ladybug: '/manus-storage/critter-retry-ladybug_78987152.mp3',
  turtle: '/manus-storage/critter-retry-turtle_0393e004.mp3',
  owl: '/manus-storage/critter-retry-owl_08f1d5bd.mp3',
  'bridge log': '/manus-storage/critter-retry-bridge-log_f5762a15.mp3',
  'rescue rope': '/manus-storage/critter-retry-rescue-rope_0701913c.mp3',
  'safe trail sign': '/manus-storage/critter-retry-safe-trail-sign_c3fac62b.mp3',
  'sturdy branch path': '/manus-storage/critter-retry-sturdy-branch-path_c398c49c.mp3',
  'soft moss bundle': '/manus-storage/critter-retry-soft-moss-bundle_ec7be52b.mp3',
  'cozy nest cup': '/manus-storage/critter-retry-cozy-nest-cup_b45f6574.mp3',
  'sturdy stick bundle': '/manus-storage/critter-retry-sturdy-stick-bundle_34935e15.mp3',
  'soft leaf lining': '/manus-storage/critter-retry-soft-leaf-lining_285fe9f2.mp3',
  'round lodge door': '/manus-storage/critter-retry-round-lodge-door_1bbd220e.mp3',
  'wide blue base block': '/manus-storage/critter-retry-wide-blue-base-block_dc696774.mp3',
  'coral wall blocks': '/manus-storage/critter-retry-coral-wall-blocks_8f9da28c.mp3',
  'moss green roof block': '/manus-storage/critter-retry-moss-roof-block_7de9c82a.mp3',
  'berry basket': '/manus-storage/critter-retry-berry-basket_728af92c.mp3',
  'leaf basket': '/manus-storage/critter-retry-leaf-basket_26ad6461.mp3',
  'dog house': '/manus-storage/critter-retry-dog-house_6e620efd.mp3',
  birdhouse: '/manus-storage/critter-retry-birdhouse_563e2a6b.mp3',
  'scratching post': '/manus-storage/critter-retry-scratching-post_0308df45.mp3',
  'mud bath': '/manus-storage/critter-retry-mud-bath_35f8a8bf.mp3',
  pond: '/manus-storage/critter-retry-pond_2bf13594.mp3',
  burrow: '/manus-storage/critter-retry-burrow_e48d7ed7.mp3',
  apple: '/manus-storage/critter-retry-apple_6959f44d.mp3',
  'water drop': '/manus-storage/critter-retry-water-drop_b5b93de0.mp3',
  leaf: '/manus-storage/critter-retry-leaf_8e4afae4.mp3',
  heart: '/manus-storage/critter-retry-heart_2a649886.mp3',
  'blue circle': '/manus-storage/critter-retry-blue-circle_e1875a00.mp3',
  'red circle': '/manus-storage/critter-retry-red-circle_a63eeae3.mp3',
  'red square': '/manus-storage/critter-retry-red-square_05b7c419.mp3',
  'yellow triangle': '/manus-storage/critter-retry-yellow-triangle_b6cca34c.mp3',
  'yellow square': '/manus-storage/critter-retry-yellow-square_9b8dc94b.mp3',
  'blue square': '/manus-storage/critter-retry-blue-square_9db853d0.mp3',
  'yellow circle': '/manus-storage/critter-retry-yellow-circle_f775c977.mp3',
  'green triangle': '/manus-storage/critter-retry-green-triangle_947c6887.mp3',
  'green circle': '/manus-storage/critter-retry-green-circle_db783da5.mp3',
  "one o'clock": '/manus-storage/critter-retry-one-oclock_6e7c942a.mp3',
  "five o'clock": '/manus-storage/critter-retry-five-oclock_faeeb440.mp3',
  "eight o'clock": '/manus-storage/critter-retry-eight-oclock_af7d7a49.mp3',
  "nine o'clock": '/manus-storage/critter-retry-nine-oclock_4fc7a5c6.mp3',
  "twelve o'clock": '/manus-storage/critter-retry-twelve-oclock_70603134.mp3',
} as const;

export type GentleRetryKey = keyof typeof GENTLE_RETRY_AUDIO;

let lastGentleRetryAt = 0;

/**
 * Child-triggered, no-failure feedback. It respects the parent voice preference,
 * avoids interrupting a currently speaking direction, and ignores rapid repeat taps.
 */
export function playGentleRetryFeedback(key: GentleRetryKey): boolean {
  if (typeof Audio === 'undefined') return false;
  const preferences = getAudioPreferences();
  if (!preferences.spokenDirectionsEnabled || preferences.voiceVolume <= 0.02) return false;
  if (activeAudio && !activeAudio.paused && !activeAudio.ended) return false;
  const source = GENTLE_RETRY_AUDIO[key];
  if (!source) return false;
  const now = Date.now();
  if (now - lastGentleRetryAt < 1200) return false;
  lastGentleRetryAt = now;

  const audio = new Audio(resolveNativeNetworkUrl(source));
  audio.preload = 'auto';
  audio.volume = preferences.voiceVolume;
  audio.addEventListener('ended', () => { if (activeAudio === audio) activeAudio = null; }, { once: true });
  audio.addEventListener('error', () => { if (activeAudio === audio) activeAudio = null; }, { once: true });
  activeAudio = audio;
  const playback = audio.play();
  if (playback && typeof playback.catch === 'function') {
    void playback.catch(() => { if (activeAudio === audio) activeAudio = null; });
  }
  return true;
}

let activeAudio: HTMLAudioElement | null = null;

const DAILY_TRAIL_AUDIO = {
  welcome: '/manus-storage/daily_trail_welcome_2246f298.wav',
  reward: '/manus-storage/daily_trail_reward_36124b2b.wav',
} as const;

export const PRE_READER_AUDIO: Record<PreReaderDirectionKey, string> = {
  friendshipDuoNuttyPip: '/manus-storage/direction-friendshipDuoNuttyPip_7e767633.mp3',
  friendshipDuoSplashThistle: '/manus-storage/direction-friendshipDuoSplashThistle_b96bfec6.mp3',
  friendshipDuoCloverShadow: '/manus-storage/direction-friendshipDuoCloverShadow_49e516c2.mp3',
  teamRescue: '/manus-storage/direction-teamRescue_c2b49c45.mp3',
  weatherWonder: '/manus-storage/direction-weatherWonder_7745a8ad.mp3',
  syllableClap: '/manus-storage/direction-syllableClap_97cc5584.mp3',
  riverRescue: '/manus-storage/direction-riverRescue_e6a71518.mp3',
  nestRescue: '/manus-storage/direction-nestRescue_a4a6c566.mp3',
  lodgeRescue: '/manus-storage/direction-lodgeRescue_97316825.mp3',
  tellingTime: '/manus-storage/direction-tellingTime_fafdddfc.mp3',
  gardenSort: '/manus-storage/direction-gardenSort_46623443.mp3',
  brickBuild: '/manus-storage/direction-brickBuild_a54f4e2d.mp3',
  animalHomeMatch: '/manus-storage/direction-animalHomeMatch_622da09b.mp3',
  onboarding: '/manus-storage/direction-onboarding_7452c86b.mp3', dailyTrail: '/manus-storage/direction-dailyTrail_e7b346b4.mp3', bridge: '/manus-storage/direction-bridge_8752d1f4.mp3', clearPath: '/manus-storage/direction-clearPath_bc9b19a4.mp3', shelter: '/manus-storage/direction-shelter_e978ae52.mp3', guidePath: '/manus-storage/direction-guidePath_5327e078.mp3', memory: '/manus-storage/direction-memory_f0a02ce4.mp3', pattern: '/manus-storage/direction-pattern_2087adfb.mp3', maze: '/manus-storage/direction-maze_aa9ea42d.mp3', gather: '/manus-storage/direction-gather_b26605d7.mp3', tracing: '/manus-storage/direction-tracing_31cca4f7.mp3', sorting: '/manus-storage/direction-sorting_a3c6dc2c.mp3', counting: '/manus-storage/direction-counting_9f4489f3.mp3', shapeFit: '/manus-storage/direction-shapeFit_6e14cfed.mp3', spotDifference: '/manus-storage/direction-spotDifference_86455872.mp3', sequence: '/manus-storage/direction-sequence_e2286292.mp3', findTools: '/manus-storage/direction-findTools_5d82b066.mp3', colorMatch: '/manus-storage/direction-colorMatch_8648e8ec.mp3', sizeOrdering: '/manus-storage/direction-sizeOrdering_ededd62b.mp3', critterPath: '/manus-storage/direction-critterPath_6b680f14.mp3', quietCount: '/manus-storage/direction-quietCount_20e46f81.mp3', pictureRhyme: '/manus-storage/direction-pictureRhyme_615f1c24.mp3', letterSound: '/manus-storage/direction-letterSound_6fba7cca.mp3', alliteration: '/manus-storage/direction-alliteration_c021ed23.mp3', habitatMatch: '/manus-storage/direction-habitatMatch_0f7187b7.mp3', friendshipDuo: '/manus-storage/direction-friendshipDuo_8dd0c33e.mp3', learningColor: '/manus-storage/direction-learningColor_805c4e3c.mp3', learningShape: '/manus-storage/direction-learningShape_8480ea8c.mp3', learningPattern: '/manus-storage/direction-learningPattern_073cd974.mp3',
};

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
  activeAudio = new Audio(resolveNativeNetworkUrl(source));
  activeAudio.volume = getAudioPreferences().voiceVolume;
  void activeAudio.play().catch(() => {});
}

export function playDailyTrailVoice(moment: keyof typeof DAILY_TRAIL_AUDIO): void {
  if (typeof Audio === 'undefined') return;
  if (activeAudio) activeAudio.pause();
  activeAudio = new Audio(resolveNativeNetworkUrl(DAILY_TRAIL_AUDIO[moment]));
  activeAudio.volume = getAudioPreferences().voiceVolume;
  void activeAudio.play().catch(() => {});
}

export type PreReaderPlaybackCallbacks = { onEnded?: () => void; onMuted?: () => void; onUnavailable?: () => void };

export async function playPreReaderDirection(key: PreReaderDirectionKey, callbacks: PreReaderPlaybackCallbacks = {}): Promise<boolean> {
  if (typeof Audio === 'undefined') return false;
  const preferences = getAudioPreferences();
  if (!preferences.spokenDirectionsEnabled) return false;
  if (preferences.voiceVolume <= 0.02) {
    callbacks.onMuted?.();
    return false;
  }
  const source = PRE_READER_AUDIO[key];
  if (!source) return false;
  if (activeAudio) activeAudio.pause();
  const audio = new Audio(resolveNativeNetworkUrl(source));
  let playbackUnavailable = false;
  const reportUnavailable = () => {
    if (playbackUnavailable) return;
    playbackUnavailable = true;
    if (activeAudio === audio) activeAudio = null;
    callbacks.onUnavailable?.();
  };
  audio.addEventListener('ended', () => {
    if (activeAudio === audio) activeAudio = null;
    callbacks.onEnded?.();
  }, { once: true });
  audio.addEventListener('error', reportUnavailable, { once: true });
  audio.preload = 'auto';
  audio.volume = preferences.voiceVolume;
  audio.currentTime = 0;
  audio.load();
  activeAudio = audio;
  try {
    await audio.play();
    return true;
  } catch {
    reportUnavailable();
    return false;
  }
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
