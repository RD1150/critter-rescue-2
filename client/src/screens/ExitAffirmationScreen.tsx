import React from 'react';
import { playButton } from '../game/sounds';

interface Props { onDone: () => void; }

export default function ExitAffirmationScreen({ onDone }: Props) {
  return (
    <div className="game-screen forest-bg flex items-center justify-center px-6">
      <div className="paper-card p-6 w-full max-w-sm text-center flex flex-col gap-4 animate-pop-in">
        <span className="text-5xl">🌙</span>
        <h2 className="font-display text-2xl font-bold text-[#2D2418]">Taking a break?</h2>
        <p className="font-display italic text-[#5C4D3C] text-base leading-snug">
          "The forest will be here when you return. Your friends are waiting."
        </p>
        <button onClick={() => { playButton(); onDone(); }} className="btn-coral">Back to Camp</button>
      </div>
    </div>
  );
}

