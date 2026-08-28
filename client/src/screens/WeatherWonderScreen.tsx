import React, { useState } from 'react';
import type { SanctuarySeason } from '../game/store';
import { WEATHER_WONDERS } from '../game/weatherWonder';
import PreReaderDirection from '../components/PreReaderDirection';
import CritterAvatar from '../components/CritterAvatar';
import { playButton, playComplete, playMatch } from '../game/sounds';

interface Props { season: SanctuarySeason; onComplete: () => void; onBack: () => void; }

export default function WeatherWonderScreen({ season, onComplete, onBack }: Props) {
  const wonder = WEATHER_WONDERS[season];
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const tapStep = () => {
    if (finished) return;
    playButton();
    const next = step + 1;
    setStep(next);
    if (next === wonder.steps.length) { setFinished(true); playComplete(); } else playMatch();
  };
  return <div className="game-screen forest-bg flex flex-col overflow-y-auto px-4 py-5 text-center">
    <header className="mx-auto flex w-full max-w-lg items-center justify-between"><button onClick={onBack} className="btn-parchment text-sm">← Camp</button><p className="font-body text-[10px] font-bold uppercase tracking-[.13em] text-white/75">Weather wonder</p><span className="w-16" /></header>
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 py-5"><div className="rounded-[2rem] border-2 border-[#F5C842] bg-[#FFF8E6] px-7 py-5 shadow-xl"><span className="text-6xl">{wonder.icon}</span><h1 className="mt-2 font-display text-2xl font-bold text-[#2D2418]">{wonder.title}</h1><p className="mt-2 font-body text-sm leading-snug text-[#5C4D3C]">{wonder.prompt}</p></div><div className="flex w-full items-center gap-3 rounded-3xl border-2 border-[#D9C8A8] bg-[#FFF8E6] px-4 py-3 text-left shadow-lg"><CritterAvatar type={wonder.critter.type} size={54} expression="happy" /><div><p className="font-body text-[10px] font-bold uppercase tracking-[.12em] text-[#A85C41]">Cozy care for {wonder.critter.name}</p><p className="mt-1 font-body text-xs leading-snug text-[#5C4D3C]">{wonder.critter.carePrompt}</p></div></div><PreReaderDirection directionKey="weatherWonder" className="w-full" />{!finished ? <div className="w-full space-y-3">{wonder.steps.map((item, index) => <button key={item.label} type="button" onClick={tapStep} disabled={index !== step} className={`flex min-h-[92px] w-full items-center gap-4 rounded-3xl border-2 px-5 text-left shadow-lg transition-transform active:scale-95 disabled:opacity-55 ${index === step ? 'border-[#F5C842] bg-[#FFF8E6]' : index < step ? 'border-[#89B97F] bg-[#EAF4EF]' : 'border-[#E7CFA2] bg-[#FFF8E6]'}`}><span className="text-5xl">{index < step ? '✓' : item.icon}</span><span><span className="block font-display text-lg font-bold text-[#2D2418]">{item.label}</span><span className="block font-body text-xs text-[#5C4D3C]">{index < step ? item.response : index === step ? `Help ${wonder.critter.name} together` : 'One gentle step at a time'}</span></span></button>)}</div> : <div className="w-full rounded-3xl border-2 border-[#F5C842] bg-[#FFF8E6] px-6 py-5 shadow-xl"><span className="text-4xl">✨</span><h2 className="mt-2 font-display text-xl font-bold text-[#2D2418]">{wonder.critter.name} feels cared for!</h2><p className="mt-2 font-body text-sm leading-snug text-[#5C4D3C]">{wonder.thankYou}</p><button onClick={() => { onComplete(); onBack(); }} className="btn-coral mt-4 w-full">Keep this weather wonder</button></div>}</main>
  </div>;
}
