// Recorded character dialogue is deliberately sparse and player-initiated.
// Text always remains visible; a missing recording simply means the line stays quiet.
export type CharacterMoment = 'intro' | 'help' | 'thanks';

const RECORDED_LINES: Partial<Record<string, Partial<Record<CharacterMoment, string>>>> = {
  Nutty: {
    intro: '/manus-storage/nutty_cartoon_squirrel_preview_2094670b.wav',
    help: '/manus-storage/nutty_help_counting_3cfe2201.wav',
    thanks: '/manus-storage/nutty_thanks_5cd73d51.wav',
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
