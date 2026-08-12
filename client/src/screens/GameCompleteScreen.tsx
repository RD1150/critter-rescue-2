import React from 'react';
import { CritterType } from '../game/data';
import CritterAvatar from '../components/CritterAvatar';
import { playComplete } from '../game/sounds';

interface Props { rescueCount: number; forestHarmony: number; companionType: string; onDone: () => void; }

export default function GameCompleteScreen({ rescueCount, forestHarmony, companionType, onDone }: Props) {
  React.useEffect(() => { playComplete(); }, []);
  return (
    <div className="game-screen forest-bg flex flex-col items-center justify-center px-6 gap-6">
      <div className="animate-pop-in text-center flex flex-col items-center gap-4">
        <CritterAvatar type={companionType as CritterType} size={120} expression="excited" animate />
        <div className="paper-card px-6 py-5 text-center max-w-sm">
          <p className="text-[#E66B5B] font-body text-sm uppercase tracking-widest font-bold mb-1">All Friends Rescued!</p>
          <h2 className="font-display text-3xl font-bold text-[#2D2418]">The Forest is Healed 🌟</h2>
          <p className="font-display italic text-[#5C4D3C] mt-2 text-base leading-snug">
            "You've changed everything. Every creature in the forest knows your name."
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="font-display font-bold text-[#2D2418] text-2xl">{rescueCount}</p>
              <p className="text-[#5C4D3C] text-xs font-body uppercase tracking-wide">Friends Saved</p>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-[#2D2418] text-2xl">{forestHarmony}</p>
              <p className="text-[#5C4D3C] text-xs font-body uppercase tracking-wide">Harmony</p>
            </div>
          </div>
        </div>
        <button onClick={onDone} className="btn-coral text-base">Return to Camp</button>
      </div>
    </div>
  );
}
