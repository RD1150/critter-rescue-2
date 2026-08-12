import React, { useEffect } from 'react';
import { ZONES } from '../game/data';
import { playComplete } from '../game/sounds';

interface Props { zoneName: string; zoneId: string; onDone: () => void; }

export default function ZoneUnlockedScreen({ zoneName, zoneId, onDone }: Props) {
  const zone = ZONES.find(z => z.id === zoneId);
  useEffect(() => { playComplete(); const t = setTimeout(onDone, 6000); return () => clearTimeout(t); }, []);
  return (
    <div className="game-screen flex flex-col items-center justify-center px-6 gap-6"
      style={{ background: `linear-gradient(180deg, ${zone?.bgColors[0] ?? '#4A7A35'} 0%, ${zone?.bgColors[2] ?? '#2D5A1E'} 100%)` }}>
      <div className="animate-pop-in text-center flex flex-col items-center gap-4">
        <span className="text-7xl">{zone?.emoji ?? '🌟'}</span>
        <div className="paper-card px-6 py-4 text-center">
          <p className="text-[#E66B5B] font-body text-sm uppercase tracking-widest font-bold mb-1">New Zone Unlocked!</p>
          <h2 className="font-display text-3xl font-bold text-[#2D2418]">{zoneName}</h2>
          <p className="text-[#5C4D3C] font-body text-sm mt-1">{zone?.description}</p>
        </div>
        <p className="font-display italic text-white text-lg drop-shadow">A new part of the forest is calling…</p>
        <button onClick={onDone} className="btn-coral text-base">Explore!</button>
      </div>
    </div>
  );
}
