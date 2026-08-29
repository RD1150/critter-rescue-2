// ─────────────────────────────────────────────
// CritterAvatar — renders a plush critter character
// All 19 critter types with generated plush images
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import { CritterType } from '../game/data';

export type Expression = 'happy' | 'worried' | 'grateful' | 'scared' | 'excited' | 'neutral';

// All 19 plush critter images
export const PLUSH_IMAGES: Record<CritterType, string> = {
  bunny:    '/manus-storage/plush-bunny_f8d3b5e8.png',
  fox:      '/manus-storage/plush-fox_a58c237d.png',
  owl:      '/manus-storage/plush-owl_2c50e902.png',
  squirrel: '/manus-storage/plush-squirrel_257a2d01.png',
  frog:     '/manus-storage/plush-frog_bca4cdce.png',
  hedgehog: '/manus-storage/plush-hedgehog_c818580b.png',
  bear:     '/manus-storage/plush-bear_3bb730a3.png',
  duck:     '/manus-storage/plush-duck_093868b6.png',
  turtle:   '/manus-storage/plush-turtle_0c0ee063.png',
  bee:      '/manus-storage/plush-bee_10b0dc79.png',
  otter:    '/manus-storage/plush-otter_91c587ed.png',
  eagle:    '/manus-storage/plush-eagle_e476ac8f.png',
  bird:     '/manus-storage/plush-bird_f1f08383.png',
  goat:     '/manus-storage/plush-goat_7327836e.png',
  beaver:   '/manus-storage/plush-beaver_200ccf5b.png',
  fish:     '/manus-storage/plush-fish_abf50122.png',
  lizard:   '/manus-storage/plush-lizard_2eb476c2.png',
  snail:    '/manus-storage/plush-snail_bc5b84d6.png',
  ladybug:  '/manus-storage/plush-ladybug_508df29a.png',
};

// Expression modifiers via CSS filter
const EXPRESSION_FILTER: Record<Expression, string> = {
  happy:    'none',
  worried:  'sepia(0.25) saturate(0.85) brightness(0.95)',
  grateful: 'brightness(1.08) saturate(1.15)',
  scared:   'sepia(0.4) saturate(0.7) brightness(0.9)',
  excited:  'brightness(1.12) saturate(1.25)',
  neutral:  'none',
};

interface Props {
  type: CritterType;
  size?: number;
  expression?: Expression;
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function CritterAvatar({
  type, size = 80, expression = 'happy', animate = false, className = '', style,
}: Props) {
  const imgSrc = PLUSH_IMAGES[type];
  const [imageFailed, setImageFailed] = useState(false);
  const filter = EXPRESSION_FILTER[expression];
  const animClass = animate ? 'animate-critter-hop' : '';

  if (imgSrc && !imageFailed) {
    return (
      <img
        src={imgSrc}
        alt={type}
        width={size}
        height={size}
        className={`critter-avatar object-contain select-none drop-shadow-md ${animClass} ${className}`}
        style={{ '--critter-avatar-size': `${size}px`, filter, width: size, height: size, ...style } as React.CSSProperties}
        draggable={false}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
        className={`critter-avatar inline-flex items-center justify-center rounded-full border-2 border-[#D8B867] bg-[#F7EBD8] font-display font-bold text-[#5D3D2A] shadow-sm select-none ${animClass} ${className}`}
        style={{ '--critter-avatar-size': `${size}px`, fontSize: Math.max(12, size * 0.34), width: size, height: size, filter, ...style } as React.CSSProperties}
      role="img"
      aria-label={`${type} plush friend`}
    >
      {type.slice(0, 1).toUpperCase()}
    </span>
  );
}
