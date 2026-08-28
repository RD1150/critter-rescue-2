import React, { useEffect, useMemo, useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import type { NatureDiscoveryKey } from '../game/natureDiscoveries';
import { NATURE_DISCOVERIES, getNatureDiscoveryForSeason } from '../game/natureDiscoveries';
import type { SanctuarySeason } from '../game/store';
import type { LearningTheme } from '../game/learningThemes';
import { LEARNING_THEME_DETAILS } from '../game/learningThemes';
import { playButton, playChime, playMatch } from '../game/sounds';

interface Props {
  season: SanctuarySeason;
  discoveries: Record<NatureDiscoveryKey, number>;
  learningTheme: LearningTheme;
  onDiscover: (key: NatureDiscoveryKey) => void;
  onBack: () => void;
  printPreview?: boolean;
}

export default function NatureDiscoveryJournalScreen({ season, discoveries, learningTheme, onDiscover, onBack, printPreview = false }: Props) {
  const discovery = getNatureDiscoveryForSeason(season);
  const [message, setMessage] = useState(discoveries[discovery.key] ? 'We noticed this gentle clue together.' : 'Look slowly. There is no rush.');
  const discoveredCount = useMemo(() => Object.values(discoveries).filter(Boolean).length, [discoveries]);
  const markDiscovery = () => {
    if (discoveries[discovery.key]) return;
    playMatch();
    onDiscover(discovery.key);
    setMessage('You noticed it! Your little field journal keeps this memory safe.');
  };
  useEffect(() => { document.body.classList.toggle('nature-print-preview', printPreview); return () => document.body.classList.remove('nature-print-preview'); }, [printPreview]);
  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8"><header className="nature-print-hide flex items-center justify-between pt-safe pt-4 pb-3"><div className="flex items-center gap-2"><CritterAvatar type="owl" size={48} expression="happy" /><div><p className="font-body text-[10px] uppercase tracking-[.14em] text-white/65">Sanctuary field notes</p><h1 className="font-display text-xl font-bold text-white">Nature & Weather</h1></div></div><button onClick={() => { playButton(); onBack(); }} className="paper-card px-3 py-1.5 text-sm font-body text-[#2D2418] active:scale-95">Camp</button></header><main className="mx-auto max-w-md space-y-3"><section className="nature-print-hide paper-card p-5 text-center" style={{ borderTop: '4px solid #6EB9CE' }}><p className="font-body text-[10px] uppercase tracking-[.15em] text-[#397C9C] font-bold">{learningTheme === 'nature' ? 'Today’s family learning focus · Nature & weather' : 'A quiet sanctuary clue'}</p><div className="text-6xl mt-3">{discovery.icon}</div><h2 className="font-display text-2xl text-[#2D2418] font-bold mt-2">{discovery.title}</h2><p className="font-display italic text-[#5C4D3C] text-base mt-2 leading-snug">{discovery.observation}</p><div className="mt-4 rounded-2xl bg-[#EAF4EF] px-4 py-3 text-left" style={{ border: '1px solid #B9D9C2' }}><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#3D7A58] font-bold">A gentle question</p><p className="font-display text-sm text-[#2D2418] mt-1">{discovery.gentleQuestion}</p></div><button onClick={markDiscovery} disabled={Boolean(discoveries[discovery.key])} className="btn-coral mt-5 w-full disabled:opacity-70">{discoveries[discovery.key] ? 'We noticed it together' : 'I see it!'}</button><p className="min-h-10 mt-3 font-body text-xs text-[#5C4D3C]">{message}</p></section><section className="nature-print-hide paper-card p-4"><div className="flex items-end justify-between gap-3"><div><h2 className="font-display text-[#2D2418] text-lg font-bold">Our little sky book</h2><p className="font-body text-xs text-[#5C4D3C] mt-1">Field notes stay on this device with the sanctuary.</p></div><p className="font-body text-xs font-bold text-[#397C9C]">{discoveredCount} of 4 noticed</p></div><div className="grid grid-cols-2 gap-2 mt-3">{Object.values(NATURE_DISCOVERIES).map((entry) => <div key={entry.key} className={`rounded-2xl px-3 py-3 ${discoveries[entry.key] ? 'bg-[#EAF4EF]' : 'bg-[#FAF3E5]'}`} style={{ border: `1px solid ${discoveries[entry.key] ? '#B9D9C2' : '#E2D2BA'}` }}><span className="text-2xl">{entry.icon}</span><p className="font-display text-sm text-[#2D2418] font-bold mt-1">{entry.title}</p><p className="font-body text-[10px] text-[#5C4D3C] mt-1">{discoveries[entry.key] ? 'Noticed together' : 'Waiting for its season'}</p></div>)}</div><button onClick={() => window.print()} className="mt-4 w-full rounded-xl bg-[#6EB9CE] px-4 py-2 font-body text-sm font-bold text-white active:scale-95">🖨️ Grown-ups: Print our field notes</button></section><section id="nature-journal-print" className="nature-journal-print"><p className="font-body text-xs uppercase tracking-[.14em] text-[#397C9C]">Critter Rescue · Family keepsake</p><h1 className="font-display text-3xl font-bold text-[#2D2418]">Our Nature & Weather Pages</h1><p className="font-display italic text-[#5C4D3C]">Four quiet sanctuary observations to print or save as PDF.</p><div className="mt-4 grid grid-cols-2 gap-3">{Object.values(NATURE_DISCOVERIES).map((entry) => <article key={entry.key} className="nature-print-card"><div className="text-3xl">{entry.icon}</div><h2 className="font-display text-lg font-bold text-[#2D2418]">{entry.title}</h2><p className="font-body text-sm text-[#5C4D3C]">{entry.observation}</p><p className="mt-2 font-body text-xs font-bold text-[#397C9C]">{discoveries[entry.key] ? 'Noticed together' : 'A clue for another day'}</p></article>)}</div><p className="mt-5 font-body text-xs text-[#5C4D3C]">A local Critter Rescue family keepsake. No photos or child information are included.</p></section><p className="nature-print-hide font-body text-center text-xs text-white/65 px-5">{LEARNING_THEME_DETAILS[learningTheme].childNote}</p></main></div>;
}
