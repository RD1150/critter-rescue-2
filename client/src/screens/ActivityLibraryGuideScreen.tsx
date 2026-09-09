import React from 'react';
import { ACTIVITY_LIBRARY } from '../game/activityLibrary';
import { playButton } from '../game/sounds';

interface Props {
  onBack: () => void;
  onOpenCreativeBuilder: () => void;
}

export default function ActivityLibraryGuideScreen({ onBack, onOpenCreativeBuilder }: Props) {
  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8">
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
      <div><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-white/70">Grown-up guide</p><h1 className="font-display text-xl font-bold text-white">Activity Library</h1></div>
      <button type="button" onClick={() => { playButton(); onBack(); }} className="paper-card min-h-11 px-3 py-1.5 font-body text-sm text-[#2D2418] active:scale-95">Back to settings</button>
    </header>
    <main className="mx-auto w-full max-w-2xl space-y-3">
      <section className="rounded-2xl border border-[#E2C9AB] bg-[#FFF8E8] p-4 shadow-sm" aria-labelledby="activity-guide-intro">
        <p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#A85C41]">Choose together</p>
        <h2 id="activity-guide-intro" className="font-display mt-1 text-lg font-bold text-[#2D2418]">Every activity appears through a gentle rescue trail.</h2>
        <p className="mt-1 font-body text-xs leading-relaxed text-[#49392C]">From camp, choose <strong>Find a Friend</strong> and follow the card marked <strong>Ready now</strong>. There are no timers, scores, or need to complete everything in one visit.</p>
      </section>
      <section aria-labelledby="activity-list-title" className="space-y-2.5"><h2 id="activity-list-title" className="px-1 font-display text-base font-bold text-white">Featured activities</h2>{ACTIVITY_LIBRARY.map((activity) => <article key={activity.title} className="paper-card flex gap-3 p-3"><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8E8D8] text-2xl">{activity.icon}</span><div className="min-w-0"><h3 className="font-display text-base font-bold text-[#2D2418]">{activity.title}</h3><p className="font-body text-xs font-bold text-[#3D7A58]">{activity.learningFocus}</p><p className="mt-1 font-body text-[11px] text-[#5C4D3C]"><strong>Where it appears:</strong> {activity.findIt}</p><p className="mt-1 font-body text-[11px] italic text-[#5C4D3C]">{activity.coPlayPrompt}</p></div></article>)}</section>
      <section className="rounded-2xl border border-[#B7D5B0] bg-[#EAF4EF] p-4 shadow-sm" aria-labelledby="creative-builder-title"><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#3D7A58]">Optional shared play</p><h2 id="creative-builder-title" className="font-display mt-1 text-lg font-bold text-[#2D2418]">Open the Cozy Block Studio</h2><p className="mt-1 font-body text-xs leading-relaxed text-[#49392C]">This open-ended play mat uses original rounded blocks. A child can make a cottage, tower, bridge, or their own idea—there is no wrong build and it does not change rescue progress.</p><button type="button" onClick={() => { playButton(); onOpenCreativeBuilder(); }} className="mt-3 min-h-12 w-full rounded-xl bg-[#3D7A58] px-4 py-3 font-display text-sm font-bold text-white active:scale-[.98]">Open Cozy Block Studio</button></section>
    </main>
  </div>;
}
