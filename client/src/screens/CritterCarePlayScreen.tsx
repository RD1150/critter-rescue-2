import React, { useMemo, useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import type { CritterData } from '../game/data';
import type { CarePlayKind } from '../game/store';
import { CARE_PLAY_DETAILS, getCarePlayKind } from '../game/carePlay';
import { getAvailableFriendshipDuos, type FriendshipDuo } from '../game/friendshipDuos';
import { playButton, playComplete } from '../game/sounds';
import PreReaderDirection from '../components/PreReaderDirection';

interface Props {
  rescuedCritters: CritterData[];
  onComplete: (critterName: string, critterType: CritterData['type'], kind: CarePlayKind) => void;
  onCompleteDuo: (duo: FriendshipDuo) => void;
  onBack: () => void;
}

export default function CritterCarePlayScreen({ rescuedCritters, onComplete, onCompleteDuo, onBack }: Props) {
  const careFriends = useMemo(() => Array.from(new Map(rescuedCritters.map((critter) => [critter.name, critter])).values()), [rescuedCritters]);
  const availableDuos = useMemo(() => getAvailableFriendshipDuos(careFriends), [careFriends]);
  const [mode, setMode] = useState<'solo' | 'duo'>('solo');
  const [selectedName, setSelectedName] = useState(careFriends[0]?.name ?? 'Nutty');
  const [selectedDuoId, setSelectedDuoId] = useState<FriendshipDuo['id']>(availableDuos[0]?.id ?? 'nutty-pip');
  const [soloSteps, setSoloSteps] = useState<number[]>([]);
  const [duoSteps, setDuoSteps] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);

  const selected = careFriends.find((critter) => critter.name === selectedName) ?? careFriends[0];
  const selectedDuo = availableDuos.find((duo) => duo.id === selectedDuoId) ?? availableDuos[0];
  const kind = selected ? getCarePlayKind(selected.type) : 'brush-bloom';
  const details = CARE_PLAY_DETAILS[kind];

  const resetSolo = (nextName: string) => { setSelectedName(nextName); setSoloSteps([]); setComplete(false); };
  const resetDuo = (nextId: FriendshipDuo['id']) => { setSelectedDuoId(nextId); setDuoSteps([]); setComplete(false); };
  const tapSoloStep = (slot: number) => {
    if (complete || soloSteps.includes(slot) || !selected) return;
    playButton();
    const next = [...soloSteps, slot];
    setSoloSteps(next);
    if (next.length === 3) { playComplete(); setComplete(true); onComplete(selected.name, selected.type, kind); }
  };
  const tapDuoStep = (slot: number) => {
    if (complete || duoSteps.includes(slot) || !selectedDuo) return;
    playButton();
    const next = [...duoSteps, slot];
    setDuoSteps(next);
    if (next.length === selectedDuo.steps.length) { playComplete(); setComplete(true); onCompleteDuo(selectedDuo); }
  };

  if (!selected) return <div className="game-screen forest-bg flex flex-col items-center justify-center gap-4 p-6 text-center"><p className="font-display text-xl text-white">Rescue a friend first, then come back for cozy care play.</p><button onClick={onBack} className="paper-card px-4 py-2 font-body">Back to camp</button></div>;

  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8"><header className="flex items-center justify-between pt-safe pt-4 pb-3"><div><p className="font-body text-[10px] uppercase tracking-[.14em] text-white/65">Gentle home time</p><h1 className="font-display text-xl font-bold text-white">Critter Care Play</h1></div><button onClick={onBack} className="paper-card px-3 py-1.5 font-body text-sm text-[#2D2418] active:scale-95">Back to camp</button></header><main className="mx-auto max-w-md space-y-4"><img src="/manus-storage/critter-care-gallery-reference_9bfe7558.png" alt="Cozy plushie care play" className="h-20 w-full rounded-2xl object-cover opacity-90" /><div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1"><button onClick={() => { setMode('solo'); setComplete(false); }} className={`rounded-xl px-3 py-2 font-body text-sm font-bold ${mode === 'solo' ? 'bg-[#FFF8E6] text-[#49392C]' : 'text-white/85'}`}>One friend</button><button onClick={() => { setMode('duo'); setComplete(false); }} className={`rounded-xl px-3 py-2 font-body text-sm font-bold ${mode === 'duo' ? 'bg-[#FFF8E6] text-[#49392C]' : 'text-white/85'}`}>🤝 Together</button></div>{mode === 'solo' ? <><section className="paper-card p-3"><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#A85C41] font-bold">Choose a friend</p><div className="mt-2 flex gap-2 overflow-x-auto pb-1">{careFriends.map((critter) => <button key={critter.name} onClick={() => resetSolo(critter.name)} className={`flex min-w-[74px] flex-col items-center rounded-xl px-2 py-2 active:scale-95 ${selected.name === critter.name ? 'bg-[#F8E8D8] ring-2 ring-[#E66B5B]' : 'bg-[#FFF9EF]'}`}><CritterAvatar type={critter.type} size={38} expression="happy" /><span className="font-body text-[10px] font-bold text-[#49392C]">{critter.name}</span></button>)}</div></section><section className="paper-card p-5 text-center" style={{ borderTop: `4px solid ${details.accent}` }}><CritterAvatar type={selected.type} size={70} expression="happy" animate /><p className="font-body mt-2 text-[10px] uppercase tracking-[.14em] font-bold text-[#A85C41]">{selected.name}'s cozy activity</p><h2 className="font-display text-2xl font-bold text-[#2D2418]">{details.title}</h2><p className="mx-auto mt-2 max-w-xs font-body text-sm leading-snug text-[#5C4D3C]">{details.prompt}</p><div className="mt-6 flex justify-center gap-3">{[0, 1, 2].map((slot) => <button key={slot} onClick={() => tapSoloStep(slot)} disabled={soloSteps.includes(slot)} aria-label={`Tap ${details.itemLabel} ${slot + 1}`} className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-sm transition-transform active:scale-95 disabled:scale-90 ${soloSteps.includes(slot) ? 'bg-[#EAF4EF] opacity-55' : 'bg-[#FFF8E6]'}`} style={{ border: `2px solid ${details.accent}` }}>{soloSteps.includes(slot) ? '✓' : details.itemEmoji}</button>)}</div><p className="mt-3 font-body text-xs text-[#5C4D3C]">{soloSteps.length === 3 ? 'All three are cozy!' : `${3 - soloSteps.length} little ${3 - soloSteps.length === 1 ? 'thing' : 'things'} left`}</p>{complete && <div className="mt-5 rounded-2xl bg-[#EAF4EF] px-4 py-4"><p className="font-display text-lg font-bold text-[#2D2418]">{details.celebration}</p><p className="mt-1 font-body text-xs text-[#5C4D3C]">An illustrated memory was saved in the grown-up keepsake gallery.</p><button onClick={() => resetSolo(selected.name)} className="mt-3 rounded-xl bg-[#6EB9CE] px-4 py-2 font-body text-sm font-bold text-white active:scale-95">Play gently again</button></div>}</section></> : <>{availableDuos.length === 0 ? <section className="paper-card p-5 text-center"><p className="font-display text-lg font-bold text-[#2D2418]">More friends will make a care team.</p><p className="mt-2 font-body text-sm text-[#5C4D3C]">After two friends arrive, they can share a small kind moment together.</p></section> : <><section className="paper-card p-3"><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#A85C41] font-bold">Choose two friends</p><div className="mt-2 flex gap-2 overflow-x-auto pb-1">{availableDuos.map((duo) => <button key={duo.id} onClick={() => resetDuo(duo.id)} className={`min-w-[132px] rounded-xl px-3 py-2 text-left active:scale-95 ${selectedDuo?.id === duo.id ? 'bg-[#F8E8D8] ring-2 ring-[#E66B5B]' : 'bg-[#FFF9EF]'}`}><div className="flex gap-1"><CritterAvatar type={duo.types[0]} size={32} expression="happy" /><CritterAvatar type={duo.types[1]} size={32} expression="happy" /></div><span className="mt-1 block font-body text-[10px] font-bold text-[#49392C]">{duo.names[0]} + {duo.names[1]}</span></button>)}</div></section>{selectedDuo && <section className="paper-card p-5 text-center" style={{ borderTop: `4px solid ${selectedDuo.accent}` }}><div className="flex justify-center gap-3"><CritterAvatar type={selectedDuo.types[0]} size={62} expression="happy" animate /><CritterAvatar type={selectedDuo.types[1]} size={62} expression="happy" animate /></div><p className="font-body mt-2 text-[10px] uppercase tracking-[.14em] font-bold text-[#A85C41]">A gentle care team</p><h2 className="font-display text-2xl font-bold text-[#2D2418]">{selectedDuo.title}</h2><p className="mx-auto mt-2 max-w-xs font-body text-sm leading-snug text-[#5C4D3C]">{selectedDuo.prompt}</p><PreReaderDirection directionKey={selectedDuo.directionKey} className="mt-4" /><div className="mt-5 grid grid-cols-2 gap-3">{selectedDuo.steps.map((step, slot) => <button key={step.label} onClick={() => tapDuoStep(slot)} disabled={duoSteps.includes(slot)} aria-label={`Tap ${step.label}`} className={`min-h-[120px] rounded-3xl border-2 p-3 shadow-sm transition-transform active:scale-95 disabled:scale-90 ${duoSteps.includes(slot) ? 'bg-[#EAF4EF] opacity-60' : 'bg-[#FFF8E6]'}`} style={{ borderColor: selectedDuo.accent }}><span className="text-5xl">{duoSteps.includes(slot) ? '✓' : step.emoji}</span><span className="mt-2 block font-body text-xs font-bold text-[#5C4D3C]">{step.label}</span></button>)}</div><p className="mt-3 font-body text-xs text-[#5C4D3C]">{duoSteps.length === selectedDuo.steps.length ? 'Your care team is all set!' : 'Take one small kind step together.'}</p>{complete && <div className="mt-5 rounded-2xl bg-[#EAF4EF] px-4 py-4"><p className="font-display text-lg font-bold text-[#2D2418]">{selectedDuo.celebration}</p><p className="mt-1 font-body text-xs text-[#5C4D3C]">A shared illustrated memory was saved in the grown-up keepsake gallery.</p><button onClick={() => resetDuo(selectedDuo.id)} className="mt-3 rounded-xl bg-[#6EB9CE] px-4 py-2 font-body text-sm font-bold text-white active:scale-95">Share another kind moment</button></div>}</section>}</>}</>}</main></div>;
}
