import React, { useEffect } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import type { Keepsake } from '../game/store';
import { playButton } from '../game/sounds';

interface Props { keepsakes: Keepsake[]; onBack: () => void; }

function GalleryCards({ keepsakes }: { keepsakes: Keepsake[] }) {
  if (!keepsakes.length) return <div className="rounded-2xl bg-[#FFF9EF] p-5 text-center"><p className="font-display text-lg font-bold text-[#2D2418]">A quiet page is waiting.</p><p className="mt-2 font-body text-sm text-[#5C4D3C]">When a child finishes a cozy care activity, an illustrated in-game moment can appear here.</p></div>;
  return <div className="grid gap-3 sm:grid-cols-2">{keepsakes.map((keepsake) => <article key={keepsake.id} className="rounded-2xl p-4" style={{ background: '#FFF9EF', border: '1px solid #E2C9AB' }}><div className="flex items-center gap-3"><div className="rounded-xl bg-[#EAF4EF] p-2"><CritterAvatar type={keepsake.critterType} size={42} expression="happy" /></div><div><p className="font-body text-[9px] uppercase tracking-[.12em] font-bold text-[#A85C41]">Illustrated in-game memory</p><h2 className="font-display text-base font-bold text-[#2D2418]">{keepsake.title}</h2></div></div><p className="mt-3 font-body text-sm leading-snug text-[#5C4D3C]">{keepsake.message}</p><p className="mt-3 font-body text-[10px] text-[#7A6958]">{new Date(keepsake.createdAt).toLocaleDateString()}</p></article>)}</div>;
}

export default function MemoryGalleryScreen({ keepsakes, onBack }: Props) {
  useEffect(() => {
    const printPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'galleryprint';
    if (printPreview) document.body.classList.add('gallery-print-preview');
    return () => document.body.classList.remove('gallery-print-preview');
  }, []);
  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8"><header className="flex items-center justify-between pt-safe pt-4 pb-3"><div><p className="font-body text-[10px] uppercase tracking-[.14em] text-white/65">Grown-up space</p><h1 className="font-display text-xl font-bold text-white">Family Keepsake Gallery</h1></div><button onClick={() => { playButton(); onBack(); }} className="paper-card px-3 py-1.5 font-body text-sm text-[#2D2418] active:scale-95">Back to settings</button></header><main className="mx-auto max-w-lg space-y-3"><section className="paper-card p-4"><p className="font-display text-[#2D2418] font-bold text-lg">Saved in-game moments</p><p className="mt-1 font-body text-xs leading-snug text-[#5C4D3C]">This gallery uses only Critter Rescue artwork and progress from this device. It never uses a child photo, microphone, social feed, or external upload.</p><button onClick={() => window.print()} className="mt-4 rounded-xl bg-[#E66B5B] px-4 py-2.5 font-body text-sm font-bold text-white active:scale-95">🖨 Print or Save these memories</button></section><GalleryCards keepsakes={keepsakes} /></main><section id="keepsake-gallery-print" className="print-only"><div className="keepsake-print-frame"><header><p>Critter Rescue · family keepsakes</p><h1>Our Cozy Memory Gallery</h1><span>Illustrated game moments from this device</span></header><GalleryCards keepsakes={keepsakes} /><footer>Made from in-game Critter Rescue memories only. No child photo, voice, or personal information is included.</footer></div></section></div>;
}
