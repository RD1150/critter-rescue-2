import type { CritterType } from './data';

export type CareCelebration = { name: string; type: CritterType; icon: string; line: string };

const CELEBRATIONS: Partial<Record<CritterType, Omit<CareCelebration, 'name' | 'type'>>> = {
  squirrel: { icon: '🌰', line: 'A bright little tail wiggle says thank you!' },
  fox: { icon: '🦊', line: 'A happy tail swish says thank you!' },
  owl: { icon: '🪶', line: 'A soft wing wiggle says thank you!' },
  bird: { icon: '🎵', line: 'A tiny chirp and flutter says thank you!' },
  hedgehog: { icon: '🌼', line: 'A cozy little wiggle says thank you!' },
  bear: { icon: '🍯', line: 'A warm bear hug says thank you!' },
  frog: { icon: '💧', line: 'A gentle pond hop says thank you!' },
  otter: { icon: '🫧', line: 'A bubbly little splash says thank you!' },
  turtle: { icon: '🌿', line: 'A slow happy nod says thank you!' },
  fish: { icon: '🫧', line: 'A shiny bubble swirl says thank you!' },
  duck: { icon: '💧', line: 'A quiet little quack says thank you!' },
  bee: { icon: '🌻', line: 'A gentle flower dance says thank you!' },
  ladybug: { icon: '❤️', line: 'A tiny dotted dance says thank you!' },
  snail: { icon: '🍃', line: 'A slow happy glide says thank you!' },
  lizard: { icon: '☀️', line: 'A sunny tail flick says thank you!' },
  goat: { icon: '🌾', line: 'A playful little skip says thank you!' },
  bunny: { icon: '🥕', line: 'A soft bunny hop says thank you!' },
  beaver: { icon: '🪵', line: 'A proud little paddle says thank you!' },
  eagle: { icon: '⭐', line: 'A calm feather flutter says thank you!' },
};

export function getCareCelebration(name: string, type: CritterType): CareCelebration {
  const detail = CELEBRATIONS[type] ?? { icon: '♥', line: 'A small happy wiggle says thank you!' };
  return { name, type, ...detail };
}

export function getCelebrationMotion(type: CritterType): { hop: number; sway: number; speed: number } {
  if (['bunny', 'frog', 'goat'].includes(type)) return { hop: 0.34, sway: 0.06, speed: 9.2 };
  if (['bird', 'owl', 'eagle', 'bee', 'ladybug'].includes(type)) return { hop: 0.2, sway: 0.16, speed: 11 };
  if (['squirrel', 'fox', 'otter', 'lizard'].includes(type)) return { hop: 0.16, sway: 0.2, speed: 8.1 };
  return { hop: 0.1, sway: 0.09, speed: 6.5 };
}
