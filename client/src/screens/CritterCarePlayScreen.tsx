import React, { useMemo, useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import type { CritterData } from '../game/data';
import type { CarePlayKind } from '../game/store';
import { CARE_PLAY_DETAILS, getCarePlayKind } from '../game/carePlay';
import { playButton, playComplete } from '../game/sounds';

interface Props {
  rescuedCritters: CritterData[];
  onComplete: (critterName: string, critterType: CritterData['type'], kind: CarePlayKind) => void;
  onBack: () => void;
}

export default function CritterCarePlayScreen({ rescuedCritters, onComplete, onBack }: Props) {
  const careFriends = useMemo(() => Array.from(new Map(rescuedCritters.map((critter) => [critter.name, critter])).values()), [rescuedCritters]);
  const [selectedName, setSelectedName] = useState(careFriends[0]?.name ?? 'Nutty');
  const selected = careFriends.find((critter) => critter.name === selectedName) ?? careFriends[0];
  const kind = selected ? getCarePlayKind(selected.type) : 'brush-bloom';
  const details = CARE_PLAY_DETAILS[kind];
  const [tucked, setTucked] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const reset = (nextName: string) => { setSelectedName(nextName); setTucked([]); setComplete(false); };
  const remaining = useMemo(() => [0, 1, 2].filter((slot) => !tucked.includes(slot)), [tucked]);
  const tapItem = (slot: number) => {
    if (complete || tucked.includes(slot)) return;
    playButton();
    const next = [...tucked, slot];
    setTucked(next);
    if (next.length === 3) { playComplete(); setComplete(true); if (selected) onComplete(selected.name, selected.type, kind); }
  };

  if (!selected) return <div className="game-screen forest-bg flex flex-col items-center justify-center gap-4 p-6 text-center"><p className="font-display text-xl text-white">Rescue a friend first, then come back for cozy care play.</p><button onClick={onBack} className="paper-card px-4 py-2 font-body">Back to camp</button></div>;

  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8"><header className="flex items-center justify-between pt-safe pt-4 pb-3"><div><p className="font-body text-[10px] uppercase tracking-[.14em] text-white/65">Gentle home time</p><h1 className="font-display text-xl font-bold text-white">Critter Care Play</h1></div><button onClick={onBack} className="paper-card px-3 py-1.5 font-body text-sm text-[#2D2418] active:scale-95">Back to camp</button></header><main className="mx-auto max-w-md space-y-4"><img src="/manus-storage/critter-care-gallery-reference_9bfe7558.png" alt="Cozy plushie care play" className="h-20 w-full rounded-2xl object-cover opacity-90" /><section className="paper-card p-3"><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#A85C41] font-bold">Choose a friend</p><div className="mt-2 flex gap-2 overflow-x-auto pb-1">{careFriends.map((critter) => <button key={critter.name} onClick={() => reset(critter.name)} className={`flex min-w-[74px] flex-col items-center rounded-xl px-2 py-2 active:scale-95 ${selected.name === critter.name ? 'bg-[#F8E8D8] ring-2 ring-[#E66B5B]' : 'bg-[#FFF9EF]'}`}><CritterAvatar type={critter.type} size={38} expression="happy" /><span className="font-body text-[10px] font-bold text-[#49392C]">{critter.name}</span></button>)}</div></section><section className="paper-card p-5 text-center" style={{ borderTop: `4px solid ${details.accent}` }}><CritterAvatar type={selected.type} size={70} expression="happy" animate /><p className="font-body mt-2 text-[10px] uppercase tracking-[.14em] font-bold text-[#A85C41]">{selected.name}'s cozy activity</p><h2 className="font-display text-2xl font-bold text-[#2D2418]">{details.title}</h2><p className="mx-auto mt-2 max-w-xs font-body text-sm leading-snug text-[#5C4D3C]">{details.prompt}</p><div className="mt-6 flex justify-center gap-3">{[0, 1, 2].map((slot) => <button key={slot} onClick={() => tapItem(slot)} disabled={tucked.includes(slot)} aria-label={`Tap ${details.itemLabel} ${slot + 1}`} className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-sm transition-transform active:scale-95 disabled:scale-90 ${tucked.includes(slot) ? 'bg-[#EAF4EF] opacity-55' : 'bg-[#FFF8E6]'}`} style={{ border: `2px solid ${details.accent}` }}>{tucked.includes(slot) ? '✓' : details.itemEmoji}</button>)}</div><p className="mt-3 font-body text-xs text-[#5C4D3C]">{remaining.length === 0 ? 'All three are cozy!' : `${remaining.length} little ${remaining.length === 1 ? 'thing' : 'things'} left`}</p>{complete && <div className="mt-5 rounded-2xl bg-[#EAF4EF] px-4 py-4"><p className="font-display text-lg font-bold text-[#2D2418]">{details.celebration}</p><p className="mt-1 font-body text-xs text-[#5C4D3C]">An illustrated memory was saved in the grown-up keepsake gallery.</p><button onClick={() => reset(selected.name)} className="mt-3 rounded-xl bg-[#6EB9CE] px-4 py-2 font-body text-sm font-bold text-white active:scale-95">Play gently again</button></div>}</section></main></div>;
}
