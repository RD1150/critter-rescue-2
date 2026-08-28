import { useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import type { CelebrationPath } from '../game/celebrationPaths';

interface Props { path: CelebrationPath; reduceMotion: boolean; onBack: () => void; }

export default function CelebrationPathScreen({ path, reduceMotion, onBack }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [complete, setComplete] = useState(false);
  const step = path.steps[stepIndex];

  const takeStep = () => {
    setResponse(step.response);
    if (stepIndex === path.steps.length - 1) setComplete(true);
    else window.setTimeout(() => { setStepIndex((index) => index + 1); setResponse(''); }, reduceMotion ? 0 : 360);
  };

  return <div className="game-screen overflow-y-auto px-4 py-4" style={{ background: `linear-gradient(180deg, ${path.accent} 0%, #173D2C 100%)` }}>
    <header className="mx-auto flex w-full max-w-md items-center justify-between"><button onClick={onBack} className="btn-parchment px-4 py-2 text-sm">← Camp</button><p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-white/75">Seasonal trail</p></header>
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-5 text-center">
      <section className={`rounded-[28px] border-2 p-5 shadow-xl ${reduceMotion ? '' : 'animate-rise-in'}`} style={{ background: path.surface, borderColor: path.accent }}>
        <div className="text-5xl" aria-hidden>{path.icon}</div>
        <h1 className="mt-2 font-display text-2xl font-bold text-[#2D2418]">{path.childTitle}</h1>
        <p className="mt-2 font-body text-sm leading-snug text-[#5C4D3C]">{path.childLine}</p>
      </section>
      <section className="mt-4 rounded-2xl border p-3 text-left shadow-md" style={{ background: 'rgba(255,249,239,.96)', borderColor: 'rgba(255,255,255,.6)' }}>
        <div className="flex items-center gap-3"><CritterAvatar type={path.guideType} size={48} expression="happy" animate={!reduceMotion} /><div><p className="font-body text-[9px] font-bold uppercase tracking-[.12em]" style={{ color: path.accent }}>With {path.guideName}</p><p className="font-display text-base font-bold text-[#2D2418]">One kind touch at a time</p></div></div>
      </section>
      {!complete ? <section className="mt-4 rounded-[26px] bg-[#FFF9EF] p-4 shadow-lg"><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#A85C41]">Step {stepIndex + 1} of {path.steps.length}</p><button onClick={takeStep} className="mt-3 flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left active:scale-[.98]" style={{ background: path.surface, borderColor: path.accent }}><span className="text-4xl" aria-hidden>{step.icon}</span><span className="font-display text-lg font-bold text-[#2D2418]">{step.label}</span></button>{response && <p role="status" className="mt-3 rounded-xl bg-[#EAF4EF] px-3 py-2 font-body text-sm font-bold text-[#3D7A58]">{response}</p>}</section> : <section className={`mt-4 rounded-[26px] bg-[#FFF9EF] p-5 shadow-lg ${reduceMotion ? '' : 'animate-pop-in'}`}><div className="text-4xl">💛</div><h2 className="mt-2 font-display text-xl font-bold text-[#2D2418]">Thank you, helper!</h2><p className="mt-2 font-body text-sm leading-snug text-[#5C4D3C]">{path.thankYou}</p><button onClick={onBack} className="btn-coral mt-5 w-full">Back to camp</button></section>}
    </main>
  </div>;
}
