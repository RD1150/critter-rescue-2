import type { SanctuarySeason } from './store';

export interface WeatherWonder {
  season: SanctuarySeason;
  icon: string;
  title: string;
  prompt: string;
  steps: Array<{ icon: string; label: string; response: string }>;
  thankYou: string;
}

export const WEATHER_WONDERS: Record<SanctuarySeason, WeatherWonder> = {
  spring: { season: 'spring', icon: '🌦️', title: 'Spring sprinkle', prompt: 'A little spring rain is waking the garden. Let’s help the camp feel cozy.', steps: [{ icon: '🍃', label: 'Tap a leafy umbrella', response: 'A leafy umbrella makes a dry, cozy spot.' }, { icon: '💧', label: 'Tap a happy puddle', response: 'The puddle makes a tiny, gentle ripple.' }], thankYou: 'The garden says thank you for your careful spring help.' },
  summer: { season: 'summer', icon: '☀️', title: 'Sunny shade', prompt: 'The sun is warm today. Let’s make a cool spot for our plushie friends.', steps: [{ icon: '🍃', label: 'Tap a shady leaf', response: 'That leaf makes a soft, cool shadow.' }, { icon: '💧', label: 'Tap a fresh water bowl', response: 'A fresh sip helps everyone feel comfortable.' }], thankYou: 'The sunny sanctuary feels gentle and cool now.' },
  autumn: { season: 'autumn', icon: '🍂', title: 'Autumn breeze', prompt: 'A soft breeze is swirling leaves through camp. Let’s make a snug little corner.', steps: [{ icon: '🍂', label: 'Tap a golden leaf', response: 'The golden leaf lands softly by the home.' }, { icon: '🪺', label: 'Tap a cozy nest', response: 'The nest is extra snug for the breezy day.' }], thankYou: 'The autumn camp feels warm and tucked in.' },
  winter: { season: 'winter', icon: '❄️', title: 'Winter glow', prompt: 'Snowy air is twinkling outside. Let’s make the sanctuary feel warm and safe.', steps: [{ icon: '🏮', label: 'Tap the little lantern', response: 'The lantern makes a soft, welcoming glow.' }, { icon: '🪵', label: 'Tap the warm den', response: 'The den is ready for a quiet winter rest.' }], thankYou: 'The winter sanctuary feels warm, bright, and peaceful.' },
};
