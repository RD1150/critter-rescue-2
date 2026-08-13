// Recorded character dialogue is deliberately sparse and player-initiated.
// Text always remains visible; a missing recording simply means the line stays quiet.
export type CharacterMoment = 'intro' | 'help' | 'thanks';

const RECORDED_LINES: Partial<Record<string, Partial<Record<CharacterMoment, string>>>> = {
  Nutty: {
    intro: '/manus-storage/nutty_intro_elevenlabs_c7894963.mp3',
    help: '/manus-storage/nutty_help_elevenlabs_d8fa8e6c.mp3',
    thanks: '/manus-storage/nutty_thanks_elevenlabs_67b891b2.mp3',
  },
};

export function hasCharacterAudio(name: string, moment: CharacterMoment): boolean {
  return Boolean(RECORDED_LINES[name]?.[moment]);
}

export function playCharacterAudio(name: string, moment: CharacterMoment): void {
  const source = RECORDED_LINES[name]?.[moment];
  if (!source || typeof Audio === 'undefined') return;
  const audio = new Audio(source);
  audio.volume = 0.92;
  void audio.play().catch(() => {});
}
