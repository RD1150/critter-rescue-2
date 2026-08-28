import React, { useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import PreReaderDirection from '../components/PreReaderDirection';
import { TEAM_RESCUE, type TeamRescue } from '../game/teamRescue';
import { playButton, playComplete } from '../game/sounds';

interface Props { onComplete: (team: TeamRescue) => void; onBack: () => void; reduceMotion: boolean; }

export default function TeamRescueScreen({ onComplete, onBack, reduceMotion }: Props) {
  const [steps, setSteps] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const tapStep = (slot: number) => {
    if (complete || steps.includes(slot)) return;
    playButton();
    const next = [...steps, slot];
    setSteps(next);
    if (next.length === TEAM_RESCUE.steps.length) { playComplete(); setComplete(true); onComplete(TEAM_RESCUE); }
  };
  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8"><header className="flex items-center justify-between pt-safe pt-4 pb-3"><div><p className="font-body text-[10px] uppercase tracking-[.14em] text-white/65">A child-led rescue team</p><h1 className="font-display text-xl font-bold text-white">Friends Help Friends</h1></div><button onClick={onBack} className="paper-card px-3 py-1.5 font-body text-sm text-[#2D2418] active:scale-95">Back to camp</button></header><main className="mx-auto max-w-md space-y-4"><section className="paper-card p-5 text-center" style={{ borderTop: '4px solid #E66B5B' }}><div className="flex items-center justify-center gap-1"><CritterAvatar type={TEAM_RESCUE.helpers[0].type} size={62} expression="happy" animate={!reduceMotion} /><CritterAvatar type={TEAM_RESCUE.helpers[1].type} size={62} expression="happy" animate={!reduceMotion} /><span className="mx-1 text-xl">+</span><CritterAvatar type={TEAM_RESCUE.friend.type} size={70} expression={complete ? 'grateful' : 'worried'} animate={!reduceMotion && !complete} /></div><p className="mt-2 font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#A85C41]">You are the helper</p><h2 className="font-display text-2xl font-bold text-[#2D2418]">{TEAM_RESCUE.title}</h2><p className="mx-auto mt-2 max-w-xs font-body text-sm leading-snug text-[#5C4D3C]">{TEAM_RESCUE.prompt}</p><PreReaderDirection directionKey="teamRescue" className="mt-4" /><div className="mt-5 grid grid-cols-2 gap-3">{TEAM_RESCUE.steps.map((step, index) => <button key={step.label} onClick={() => tapStep(index)} disabled={steps.includes(index)} aria-label={`Tap ${step.label}`} className={`min-h-[132px] rounded-3xl border-2 border-[#E66B5B] p-3 shadow-sm active:scale-95 ${steps.includes(index) ? 'bg-[#EAF4EF] opacity-60' : 'bg-[#FFF8E6]'}`}><span className="text-5xl">{steps.includes(index) ? '✓' : step.emoji}</span><span className="mt-2 block font-body text-xs font-bold text-[#5C4D3C]">{step.label}</span></button>)}</div><p className="mt-3 font-body text-xs text-[#5C4D3C]">{complete ? 'Wren can hear her nest now!' : 'You choose each little helping step.'}</p>{complete && <div className="mt-5 rounded-2xl bg-[#EAF4EF] px-4 py-4"><p className="font-display text-lg font-bold text-[#2D2418]">{TEAM_RESCUE.celebration}</p><p className="mt-1 font-body text-xs text-[#5C4D3C]">A team-rescue memory was saved in the grown-up gallery.</p><button onClick={onBack} className="mt-3 rounded-xl bg-[#6EB9CE] px-4 py-2 font-body text-sm font-bold text-white active:scale-95">Return to camp</button></div>}</section></main></div>;
}
