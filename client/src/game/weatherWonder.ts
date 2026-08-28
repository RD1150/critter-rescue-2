import type { CritterType } from './data';
import type { SanctuarySeason } from './store';

export interface WeatherWonder {
  season: SanctuarySeason;
  icon: string;
  title: string;
  prompt: string;
  critter: { name: string; type: CritterType; carePrompt: string };
  steps: Array<{ icon: string; label: string; response: string }>;
  thankYou: string;
}

export const WEATHER_WONDERS: Record<SanctuarySeason, WeatherWonder> = {
  spring: { season: 'spring', icon: '🌦️', title: 'Spring sprinkle', prompt: 'A little spring rain is waking the garden. Let’s help the camp feel cozy.', critter: { name: 'Clover', type: 'bunny', carePrompt: 'Clover is waiting for a dry, petal-soft spot.' }, steps: [{ icon: '🍃', label: 'Open Clover’s leafy umbrella', response: 'Clover has a dry, cozy spot under the leaf.' }, { icon: '🌸', label: 'Tuck in a soft spring petal', response: 'The petal makes Clover’s nook extra soft.' }], thankYou: 'Clover and the spring garden say thank you for your careful help.' },
  summer: { season: 'summer', icon: '☀️', title: 'Sunny shade', prompt: 'The sun is warm today. Let’s make a cool spot for our plushie friends.', critter: { name: 'Splash', type: 'otter', carePrompt: 'Splash is looking for cool shade and a fresh little sip.' }, steps: [{ icon: '🍃', label: 'Lift a shady leaf for Splash', response: 'That leaf makes a soft, cool shadow for Splash.' }, { icon: '💧', label: 'Fill Splash’s water bowl', response: 'A fresh sip helps Splash feel comfortable.' }], thankYou: 'Splash feels cool and cared for in the sunny sanctuary.' },
  autumn: { season: 'autumn', icon: '🍂', title: 'Autumn breeze', prompt: 'A soft breeze is swirling leaves through camp. Let’s make a snug little corner.', critter: { name: 'Shadow', type: 'hedgehog', carePrompt: 'Shadow is ready for a gentle leaf blanket and a soft nest.' }, steps: [{ icon: '🍂', label: 'Lay a golden leaf blanket', response: 'The leaf blanket lands softly over Shadow’s corner.' }, { icon: '🪺', label: 'Fluff Shadow’s cozy nest', response: 'Shadow’s nest feels snug for the breezy day.' }], thankYou: 'Shadow’s autumn corner feels warm and tucked in.' },
  winter: { season: 'winter', icon: '❄️', title: 'Winter glow', prompt: 'Snowy air is twinkling outside. Let’s make the sanctuary feel warm and safe.', critter: { name: 'Pip', type: 'bird', carePrompt: 'Pip needs a soft lantern glow and a warm little nest.' }, steps: [{ icon: '🏮', label: 'Light Pip’s tiny lantern', response: 'The lantern makes a soft, welcoming glow for Pip.' }, { icon: '🪵', label: 'Tuck a warm twig by Pip’s nest', response: 'Pip’s nest is ready for a quiet winter rest.' }], thankYou: 'Pip’s winter nest feels warm, bright, and peaceful.' },
};
