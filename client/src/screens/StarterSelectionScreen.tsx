// ─────────────────────────────────────────────
// StarterSelectionScreen — choose your companion
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import { STARTER_COMPANIONS } from '../game/data';
import { playButton } from '../game/sounds';

interface Props { onSelect: (companion: string) => void; }

export default function StarterSelectionScreen({ onSelect }: Props) {
  const [chosen, setChosen] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!chosen) return;
    playButton();
    onSelect(chosen);
  };

  return (
    <div className="game-screen overflow-hidden" style={{ background: 'linear-gradient(160deg,#3a6b4a 0%,#2d5a3a 40%,#1f4226 100%)' }}>
      {/* Scattered leaf silhouettes */}
      {['🍃','🍂','🌿','🍃','🌾'].map((l,i) => (
        <div key={i} className="absolute pointer-events-none select-none opacity-20 text-2xl"
          style={{ left:`${8+i*18}%`, top:`${5+i*12}%`, transform:`rotate(${-30+i*18}deg)`, fontSize: 18+i*4 }}>
          {l}
        </div>
      ))}
      {/* Pawprint trail marks */}
      {[0,1,2,3].map(i => (
        <div key={i} className="absolute pointer-events-none select-none opacity-15 text-lg"
          style={{ right:`${6+i*8}%`, bottom:`${12+i*14}%`, transform:`rotate(${i*25}deg)` }}>
          🐾
        </div>
      ))}

      {/* Main journal card */}
      <div className="absolute inset-4 rounded-2xl overflow-hidden"
        style={{ background: 'oklch(0.97 0.02 80)', border: '2px solid oklch(0.85 0.03 75)',
          boxShadow: '0 8px 32px oklch(0 0 0 / 0.25), inset 0 1px 0 oklch(1 0 0 / 0.8)' }}>
        {/* Stitched top border */}
        <div className="w-full h-3 flex items-center justify-center gap-2 bg-[#E66B5B]/10 border-b border-dashed border-[#E66B5B]/30">
          {Array.from({length:18}).map((_,i)=><div key={i} className="w-1 h-1 rounded-full bg-[#E66B5B]/40"/>)}
        </div>
        {/* Compass-paw brand mark + title */}
        <div className="flex flex-col items-center pt-5 pb-2 px-4 gap-1 animate-rise-in">
          <img src="/manus-storage/game-logo_a4abbdba.png" alt="Critter Rescue" className="w-14 h-14 drop-shadow-md" />
          <h1 className="font-display text-3xl font-bold text-[#2D2418] tracking-tight">Critter Rescue</h1>
          <p className="text-[#5C4D3C] text-sm font-body italic">Field Rescue Journal — Choose your companion</p>
          {/* Map-line divider */}
          <div className="flex items-center gap-2 mt-1 w-full max-w-xs">
            <div className="flex-1 h-px bg-[#5C4D3C]/20"/>
            <span className="text-[#5C4D3C]/40 text-xs">✦</span>
            <div className="flex-1 h-px bg-[#5C4D3C]/20"/>
          </div>
        </div>

        {/* Companion cards — torn-note style */}
        <div className="grid grid-cols-3 gap-2 px-4 animate-rise-in" style={{ animationDelay: '100ms' }}>
          {STARTER_COMPANIONS.map(({ type, name, personality }) => {
            const isChosen = chosen === type;
            return (
              <button key={type} onClick={() => { playButton(); setChosen(type); }}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200 relative
                  ${isChosen
                    ? 'bg-[#E66B5B]/10 scale-105 shadow-md'
                    : 'bg-[#F5EDE0] hover:bg-[#EDE0CC]'}`}
                style={{ border: isChosen ? '2px solid #E66B5B' : '1.5px solid oklch(0.85 0.03 75)',
                  boxShadow: isChosen ? '0 4px 12px #E66B5B33' : '0 2px 6px oklch(0 0 0 / 0.08)' }}>
                {isChosen && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#E66B5B] flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                )}
                <CritterAvatar type={type} size={56} expression={isChosen ? 'excited' : 'happy'} animate={isChosen} />
                <span className="font-display font-bold text-[#2D2418] text-sm">{name}</span>
                <span className="text-[#5C4D3C] text-[10px] font-body text-center leading-tight">{personality}</span>
              </button>
            );
          })}
        </div>

        {/* Intro note — torn paper card */}
        <div className="mx-4 mt-2 animate-rise-in" style={{ animationDelay: '200ms' }}>
          <div className="rounded-xl px-4 py-3 relative"
            style={{ background: 'oklch(0.99 0.01 80)', border: '1px solid oklch(0.88 0.03 75)',
              boxShadow: '0 2px 8px oklch(0 0 0 / 0.06)', borderTop: '3px solid #E66B5B' }}>
            <p className="font-display italic text-[#2D2418] text-sm leading-relaxed text-center">
              "The forest is quiet. Somewhere out there,<br/>a small creature needs a friend."
            </p>
            {/* Wax-stamp accent */}
            <div className="absolute -bottom-3 right-4 w-6 h-6 rounded-full bg-[#E66B5B] flex items-center justify-center shadow-sm">
              <span className="text-white text-[10px]">🐾</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-3 pb-4 animate-rise-in" style={{ animationDelay: '300ms' }}>
          <button onClick={handleConfirm} disabled={!chosen}
            className="btn-coral text-base px-10 disabled:opacity-40 disabled:cursor-not-allowed">
            Begin the Rescue
          </button>
        </div>

        {/* Bottom stitched border */}
        <div className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center gap-2 bg-[#E66B5B]/10 border-t border-dashed border-[#E66B5B]/30">
          {Array.from({length:18}).map((_,i)=><div key={i} className="w-1 h-1 rounded-full bg-[#E66B5B]/40"/>)}
        </div>
      </div>
    </div>
  );
}
