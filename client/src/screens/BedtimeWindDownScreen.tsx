import React, { useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import type { CritterType } from '../game/data';
import { playButton, playComplete } from '../game/sounds';

interface Props { companionName: string; companionType: CritterType; reduceMotion: boolean; onComplete: () => void; onBack: () => void; }

const STEPS = [
  { icon: '🏮', title: 'Dim the little lantern', prompt: 'Tap the lantern and make the camp soft and quiet.' },
  { icon: '🧺', title: 'Tuck in your plushie friend', prompt: 'Tap the cozy blanket so your friend can rest.' },
  { icon: '🌙', title: 'Share a goodnight wish', prompt: 'Tap the moon when you are ready to say goodnight.' },
];

export default function BedtimeWindDownScreen({ companionName, companionType, reduceMotion, onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const finished = step >= STEPS.length;
  const current = STEPS[Math.min(step, STEPS.length - 1)];
  const advance = () => {
    playButton();
    if (finished) return;
    if (step + 1 >= STEPS.length) { playComplete(); setStep(STEPS.length); return; }
    setStep((value) => value + 1);
  };
  return <div className="game-screen relative overflow-hidden px-5 py-5" style={{ background: 'radial-gradient(circle at 50% 10%, #586CA8 0%, #25385D 44%, #102641 100%)' }}>
    <div className="absolute left-[12%] top-[9%] text-3xl text-[#FFF5C2]">✦</div><div className="absolute right-[16%] top-[18%] text-xl text-[#FFF5C2]/70">✧</div><div className="absolute right-[7%] top-[42%] text-2xl text-[#FFF5C2]/60">✦</div>
    <div className="relative mx-auto flex h-full max-w-md flex-col justify-between py-2 text-center">
      <header className="flex items-center justify-between"><div className="text-left"><p className="font-body text-[10px] font-bold uppercase tracking-[.15em] text-[#FFF5C2]">Quiet ending</p><h1 className="font-display text-2xl font-bold text-white">Bedtime at camp</h1></div><button onClick={onBack} className="rounded-xl bg-white/15 px-3 py-2 font-body text-xs text-white">Back to camp</button></header>
      {!finished ? <main className="rounded-[30px] border border-white/20 bg-[#FFF9EF]/95 px-6 py-7 shadow-2xl"><p className={`text-6xl ${reduceMotion ? '' : 'animate-float'}`}>{current.icon}</p><CritterAvatar type={companionType} size={112} expression="happy" animate={!reduceMotion} className="mx-auto my-3" /><p className="font-body text-[10px] font-bold uppercase tracking-[.15em] text-[#6377A8]">A tiny goodnight step</p><h2 className="mt-1 font-display text-xl font-bold text-[#2D2418]">{current.title}</h2><p className="mt-3 font-body text-sm leading-relaxed text-[#5C4D3C]">{current.prompt}</p><button onClick={advance} className="mt-6 w-full rounded-2xl bg-[#6377A8] px-4 py-4 font-body text-base font-bold text-white active:scale-[.98]">{current.icon} {step === 2 ? 'Say goodnight' : 'Do this little step'}</button><p className="mt-3 font-body text-[10px] text-[#5C4D3C]/70">There is no timer. Take all the time you need.</p></main> : <main className="rounded-[30px] border border-white/20 bg-[#FFF9EF]/95 px-6 py-8 shadow-2xl"><p className="text-6xl">🌙</p><CritterAvatar type={companionType} size={112} expression="happy" animate={!reduceMotion} className="mx-auto my-3" /><h2 className="font-display text-2xl font-bold text-[#2D2418]">Goodnight, {companionName}.</h2><p className="mt-3 font-display text-sm italic leading-relaxed text-[#5C4D3C]">“The sanctuary is safe, and tomorrow can bring another tiny adventure.”</p><button onClick={onComplete} className="mt-6 w-full rounded-2xl bg-[#E66B5B] px-4 py-4 font-body text-base font-bold text-white active:scale-[.98]">Keep this quiet moment</button></main>}
      <p className="font-body text-[11px] text-white/70">Optional bedtime wind-down · no timer · no score</p>
    </div>
  </div>;
}
