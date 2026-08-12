// ─────────────────────────────────────────────
// CampScreen — main hub with companion, zones, rescued critters
// ─────────────────────────────────────────────
import React, { useState, useEffect, useRef, useMemo } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import { ZONES, ZoneInfo, CritterData, CritterType, getRescuedCritters } from '../game/data';
import { playButton, playChime, playWelcome } from '../game/sounds';

interface Props {
  forestHarmony: number;
  campFlowersCount: number;
  rescueCount: number;
  companionType: string;
  unlockedZones: string[];
  zoneTaskProgress: Record<string, number>;
  onStartRescue: (zone: string) => void;
  onOpenJournal: () => void;
  onOpenMatch3: () => void;
}

function Firefly({ delay }: { delay: number }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: 6, height: 6,
    borderRadius: '50%',
    background: '#FFE88A',
    boxShadow: '0 0 8px 3px #FFE88A',
    left: `${10 + Math.random() * 80}%`,
    top: `${30 + Math.random() * 40}%`,
    animation: `firefly-glow ${2 + Math.random() * 2}s ${delay}ms ease-in-out infinite`,
  };
  return <div style={style} />;
}

function LeafParticle({ index }: { index: number }) {
  const left = `${5 + (index * 17) % 90}%`;
  const dur = `${7 + (index * 3) % 8}s`;
  const delay = `${index * 1.1}s`;
  return (
    <div
      style={{
        position: 'absolute', top: -40, left,
        width: 12, height: 12, borderRadius: '50% 0 50% 0',
        background: index % 2 === 0 ? '#5A8C42' : '#7DB55E',
        opacity: 0.6,
        animation: `leaf-fall ${dur} ${delay} linear infinite`,
        pointerEvents: 'none',
      }}
    />
  );
}

export default function CampScreen({
  forestHarmony, campFlowersCount, rescueCount, companionType,
  unlockedZones, zoneTaskProgress, onStartRescue, onOpenJournal, onOpenMatch3,
}: Props) {
  const [showZoneSelect, setShowZoneSelect] = useState(false);
  const [dialogue, setDialogue] = useState<string | null>(null);
  const dialogueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rescuedCritters = useMemo(() => getRescuedCritters(zoneTaskProgress), [zoneTaskProgress]);
  const harmonyPct = Math.min(100, (forestHarmony / 100) * 100);
  const totalTasks = ZONES.reduce((s, z) => s + z.totalTasks, 0);
  const completedTasks = Object.values(zoneTaskProgress).reduce((s, v) => s + v, 0);
  const allComplete = completedTasks >= totalTasks;

  const DIALOGUES = useMemo(() => {
    if (rescueCount === 0) return ["I sense someone needs our help…", "Shall we explore?", "The forest is waiting for us."];
    if (rescueCount < 3) return ["Our first friends are safe!", "The forest is a little brighter.", "Every friend matters."];
    if (rescueCount < 8) return ["Look at all our friends!", "You're making a real difference.", "The harmony is growing."];
    return ["The whole forest thanks you.", "You've changed everything.", "I'm proud to be your companion."];
  }, [rescueCount]);

  useEffect(() => { playWelcome(); }, []);

  const showDialogue = (text: string) => {
    setDialogue(text);
    if (dialogueTimer.current) clearTimeout(dialogueTimer.current);
    dialogueTimer.current = setTimeout(() => setDialogue(null), 3500);
  };

  const handleCompanionTap = () => {
    playButton();
    showDialogue(DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)]);
  };

  const getWelcomeText = () => {
    if (rescueCount === 0) return 'The forest is quiet.\nSomeone needs a friend.';
    if (rescueCount === 1) return 'Your first friend is safe.';
    if (rescueCount < 5) return `${rescueCount} friends rescued.`;
    if (allComplete) return 'Every friend is safe! 🌟';
    return `${rescueCount} friends are counting on you.`;
  };

  return (
    <div className="game-screen overflow-hidden select-none" style={{ background: 'linear-gradient(180deg,#4A7A35 0%,#3E6B2F 30%,#2D5A1E 60%,#1F4216 100%)' }}>
      {/* Camp background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="/manus-storage/plush-camp-bg_f8914b83.png" alt="" className="w-full h-full object-cover opacity-30" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => <LeafParticle key={i} index={i} />)}
        {Array.from({ length: 5 }).map((_, i) => <Firefly key={i} delay={i * 700} />)}
      </div>

      {/* Top stats bar */}
      {/* Top HUD — journal-style ribbon */}
      <div className="relative z-20 px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{ background:'oklch(0.97 0.02 80 / 0.92)', border:'1.5px solid oklch(0.85 0.03 75)',
            boxShadow:'0 2px 8px oklch(0 0 0 / 0.15)', borderTop:'2.5px solid #E66B5B' }}>
          {/* Brand mark */}
          <img src="/manus-storage/game-logo_a4abbdba.png" alt="" className="w-7 h-7 shrink-0" />
          {/* Stats */}
          <div className="flex flex-col items-center min-w-[44px]">
            <span className="font-display font-bold text-[#2D2418] text-base leading-none">{rescueCount}</span>
            <span className="text-[9px] text-[#5C4D3C] font-body uppercase tracking-wide">Friends</span>
          </div>
          <div className="w-px h-6 bg-[#5C4D3C]/20 mx-1" />
          <div className="flex flex-col items-center min-w-[44px]">
            <span className="font-display font-bold text-[#E66B5B] text-base leading-none">{unlockedZones.length}/{ZONES.length}</span>
            <span className="text-[9px] text-[#5C4D3C] font-body uppercase tracking-wide">Zones</span>
          </div>
          <div className="flex-1" />
          <button onClick={onOpenJournal} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg active:scale-95 transition-transform hover:bg-[#E66B5B]/10">
            <span className="text-base">📖</span>
            <span className="text-[9px] text-[#5C4D3C] font-body uppercase tracking-wide">Journal</span>
          </button>
          <button onClick={onOpenMatch3} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg active:scale-95 transition-transform hover:bg-[#E66B5B]/10">
            <span className="text-base">🎮</span>
            <span className="text-[9px] text-[#5C4D3C] font-body uppercase tracking-wide">Match-3</span>
          </button>
        </div>
      </div>

      {/* Companion hero */}
      <div className="relative z-10 flex flex-col items-center mt-2">
        {dialogue && (
          <div className="paper-card px-4 py-2 mb-2 max-w-[220px] text-center animate-pop-in">
            <p className="font-display italic text-[#2D2418] text-sm leading-snug">{dialogue}</p>
            <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[oklch(0.98_0.015_75)]" />
          </div>
        )}
        <button onClick={handleCompanionTap} className="active:scale-95 transition-transform">
          <CritterAvatar type={companionType as CritterType} size={160} expression="happy" animate={true} className="drop-shadow-2xl" />
        </button>
      </div>

      {/* Welcome text + rescue button */}
      <div className="relative z-20 flex flex-col items-center px-6 mt-3 gap-3">
        <p className="font-display italic text-white text-center text-lg leading-snug drop-shadow-md whitespace-pre-line">{getWelcomeText()}</p>
        {!allComplete ? (
          <button
            onClick={() => { playButton(); setShowZoneSelect(true); }}
            className="btn-coral text-lg shadow-xl"
          >
            {rescueCount === 0 ? 'Help Someone' : 'Start Rescue'}
          </button>
        ) : (
          <div className="paper-card px-6 py-3 text-center">
            <span className="font-display font-bold text-[#E66B5B]">All Friends Rescued! 🌟</span>
          </div>
        )}
      </div>

      {/* Rescued critters row */}
      {rescuedCritters.length > 0 && (
        <div className="relative z-20 mt-3 px-4">
          <p className="text-white/50 text-[10px] uppercase tracking-widest text-center mb-1 font-body">Your Friends</p>
          <div className="flex gap-1 justify-center flex-wrap">
            {rescuedCritters.slice(0, 12).map((cr, i) => (
              <div key={`${cr.name}-${i}`} className="flex flex-col items-center gap-0.5 animate-rise-in" style={{ animationDelay: `${i * 40}ms` }}>
                <CritterAvatar type={cr.type} size={40} expression="happy" className="drop-shadow" />
                <span className="text-white/70 text-[8px] font-body">{cr.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forest Harmony bar */}
      {/* Forest Harmony bar — journal footer strip */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-3 pt-2"
        style={{ background:'oklch(0.20 0.06 145 / 0.85)', borderTop:'1px solid oklch(0.35 0.07 145)' }}>
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-[10px] font-body uppercase tracking-widest whitespace-nowrap">🌿 Harmony {forestHarmony}</span>
          <div className="flex-1 h-2 rounded-full bg-black/30 overflow-hidden border border-white/10">
            <div className="harmony-bar-fill" style={{ width: `${harmonyPct}%` }} />
          </div>
          {forestHarmony > 0 && (
            <span className="text-[#F5C842] text-xs">{'⭐'.repeat(Math.min(5,Math.floor(forestHarmony/20)))}</span>
          )}
        </div>
      </div>

      {/* Zone selector overlay */}
      {showZoneSelect && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" onClick={() => setShowZoneSelect(false)}>
          <div className="bg-[#3A2A1A] rounded-t-3xl px-4 pt-3 pb-8 max-h-[65vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold text-white text-center mb-3">Where should we go?</h2>
            <div className="flex flex-col gap-3">
              {ZONES.map(zone => {
                const isUnlocked = unlockedZones.includes(zone.id);
                const done = zoneTaskProgress[zone.id] ?? 0;
                const isComplete = done >= zone.totalTasks;
                return (
                  <button
                    key={zone.id}
                    disabled={!isUnlocked || isComplete}
                    onClick={() => { playButton(); setShowZoneSelect(false); setTimeout(() => onStartRescue(zone.id), 300); }}
                    className={`rounded-2xl overflow-hidden text-left transition-all active:scale-98
                      ${!isUnlocked ? 'opacity-50' : isComplete ? 'opacity-70' : 'hover:scale-101'}`}
                    style={{ background: `linear-gradient(135deg, ${zone.bgColors[0]}, ${zone.bgColors[2]})` }}
                  >
                    <div className="px-4 py-3 flex items-center gap-3">
                      <span className="text-3xl">{zone.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-white text-base">{zone.name}</span>
                          {!isUnlocked && <span className="text-sm">🔒</span>}
                          {isComplete && <span className="text-sm">💚</span>}
                        </div>
                        <p className="text-white/70 text-xs font-body mt-0.5">
                          {!isUnlocked
                            ? `Unlocks at ${zone.unlockHarmony} harmony`
                            : isComplete
                            ? 'All friends are safe here!'
                            : `${zone.totalTasks - done} friends still need help`}
                        </p>
                        {isUnlocked && (
                          <div className="flex gap-1 mt-1.5">
                            {Array.from({ length: zone.totalTasks }).map((_, ti) => (
                              <div key={ti} className={`w-2 h-2 rounded-full ${ti < done ? 'bg-[#F5C842]' : ti === done && !isComplete ? 'bg-white/60 ring-1 ring-[#F5C842]' : 'bg-white/20'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowZoneSelect(false)} className="mt-4 w-full text-white/50 text-sm font-body py-2">Not yet</button>
          </div>
        </div>
      )}
    </div>
  );
}
