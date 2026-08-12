import React from 'react';
import { getRescuedCritters, ZONES } from '../game/data';
import CritterAvatar from '../components/CritterAvatar';
import { playButton } from '../game/sounds';

interface Props { zoneTaskProgress: Record<string, number>; onClose: () => void; }

export default function CritterJournalScreen({ zoneTaskProgress, onClose }: Props) {
  const rescued = getRescuedCritters(zoneTaskProgress);
  return (
    <div className="game-screen forest-bg flex flex-col">
      <div className="relative z-20 flex items-center justify-between px-4 pt-safe pt-4 pb-2">
        <h2 className="font-display text-2xl font-bold text-white drop-shadow">Critter Journal</h2>
        <button onClick={() => { playButton(); onClose(); }} className="paper-card px-3 py-1.5 text-sm font-body text-[#2D2418] active:scale-95">Close</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {rescued.length === 0 ? (
          <div className="paper-card p-6 text-center mt-4">
            <p className="font-display italic text-[#5C4D3C]">No rescues yet. Head out and find a friend!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {rescued.map((cr, i) => (
              <div key={`${cr.name}-${i}`} className="paper-card p-3 flex flex-col items-center gap-2 animate-rise-in" style={{ animationDelay: `${i*40}ms` }}>
                <CritterAvatar type={cr.type} size={64} expression="happy" animate />
                <p className="font-display font-bold text-[#2D2418] text-base">{cr.name}</p>
                <p className="text-[#5C4D3C] text-xs font-body italic text-center">{cr.personality}</p>
                <p className="text-[#5C4D3C] text-xs font-body text-center leading-snug">{cr.thanksLine}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <h3 className="font-display font-bold text-white text-lg mb-2 drop-shadow">Zone Progress</h3>
          <div className="flex flex-col gap-2">
            {ZONES.map(zone => {
              const done = zoneTaskProgress[zone.id] ?? 0;
              return (
                <div key={zone.id} className="paper-card px-4 py-3 flex items-center gap-3">
                  <span className="text-2xl">{zone.emoji}</span>
                  <div className="flex-1">
                    <p className="font-display font-bold text-[#2D2418] text-sm">{zone.name}</p>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: zone.totalTasks }).map((_,ti) => (
                        <div key={ti} className={`w-2 h-2 rounded-full ${ti<done?'bg-[#E66B5B]':'bg-[#E8E4DC]'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="font-display font-bold text-[#E66B5B] text-sm">{done}/{zone.totalTasks}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
