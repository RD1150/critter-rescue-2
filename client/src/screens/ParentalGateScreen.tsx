import React, { useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import { createParentMathChallenge, isCorrectParentMathAnswer } from '../game/parentalGate';
import { playButton } from '../game/sounds';

type Props = { onContinue: (expiresAt: number) => void; onBack: () => void; onGrant: () => number };

export default function ParentalGateScreen({ onContinue, onBack, onGrant }: Props) {
  const [challenge] = useState(() => createParentMathChallenge());
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCorrectParentMathAnswer(answer, challenge)) {
      setError('That answer does not match. Please try again, or return to camp.');
      return;
    }
    playButton();
    onContinue(onGrant());
  };

  return <div className="game-screen forest-bg flex items-center justify-center px-4 py-8">
    <main className="paper-card w-full max-w-md p-5" aria-labelledby="grown-up-check-title">
      <div className="flex items-center gap-3"><CritterAvatar type="owl" size={48} expression="happy" /><div><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#A85C41]">Grown-up check</p><h1 id="grown-up-check-title" className="font-display text-xl font-bold text-[#2D2418]">A quick question for a parent or caregiver</h1></div></div>
      <p className="mt-4 font-body text-sm leading-relaxed text-[#49392C]">Parent Settings and contact tools are for grown-ups. Please solve this short math question to continue.</p>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <label className="block"><span className="font-display text-lg font-bold text-[#2D2418]">{challenge.first} + {challenge.second} = ?</span><input aria-label="Math answer" inputMode="numeric" pattern="[0-9]*" value={answer} onChange={(event) => { setAnswer(event.target.value.replace(/\D/g, '').slice(0, 3)); setError(''); }} className="mt-2 min-h-12 w-full rounded-xl border border-[#CBB99B] bg-white px-3 font-body text-lg text-[#2D2418] focus:border-[#3D7A58] focus:outline-none focus:ring-2 focus:ring-[#7EAA82]/30" autoComplete="off" /></label>
        {error && <p role="alert" className="rounded-xl bg-[#FCE6DF] px-3 py-2 font-body text-sm font-bold text-[#8C4130]">{error}</p>}
        <button type="submit" className="min-h-12 w-full rounded-xl bg-[#3D7A58] px-4 font-body text-sm font-bold text-white active:scale-[.98]">Continue to grown-up space</button>
      </form>
      <button type="button" onClick={() => { playButton(); onBack(); }} className="mt-3 min-h-11 w-full rounded-xl border border-[#D5C3A8] bg-[#FFF9EF] px-4 font-body text-sm font-bold text-[#49392C] active:scale-[.98]">Back to camp</button>
      <p className="mt-3 text-center font-body text-[11px] leading-relaxed text-[#5C4D3C]">This check lasts only for this browser or app session and locks again after 15 minutes.</p>
    </main>
  </div>;
}
