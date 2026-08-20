import React from 'react';
import CritterAvatar from '../components/CritterAvatar';
import { DEFAULT_PREFERENCES, useAudioPreferences } from '../game/audioPreferences';
import { playButton } from '../game/sounds';

interface Props { onBack: () => void; }

export default function ParentSettingsScreen({ onBack }: Props) {
  const [preferences, savePreferences] = useAudioPreferences();
  const volume = Math.round(preferences.voiceVolume * 100);
  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8">
    <header className="flex items-center justify-between pt-safe pt-4 pb-3"><div className="flex items-center gap-2"><CritterAvatar type="owl" size={44} expression="happy" /><div><p className="font-body text-[10px] uppercase tracking-[.14em] text-white/65">Grown-up space</p><h1 className="font-display text-xl font-bold text-white">Parent Settings</h1></div></div><button onClick={() => { playButton(); onBack(); }} className="paper-card px-3 py-1.5 text-sm font-body text-[#2D2418] active:scale-95">Back to camp</button></header>
    <main className="mx-auto w-full max-w-md space-y-3">
      <section className="paper-card p-4"><h2 className="font-display text-[#2D2418] font-bold text-lg">Character voices</h2><p className="font-body text-xs text-[#5C4D3C] mt-1">Voices play only after a child taps a clearly labelled button.</p><label className="mt-4 flex items-center gap-2"><span className="font-body text-sm text-[#49392C] whitespace-nowrap">Voice volume</span><input aria-label="Character voice volume" type="range" min="0" max="100" value={volume} onChange={(event) => savePreferences({ ...preferences, voiceVolume: Number(event.target.value) / 100 })} className="flex-1 accent-[#E66B5B]" /><span className="font-body text-xs text-[#5C4D3C] w-8 text-right">{volume}%</span></label></section>
      <section className="paper-card p-4"><h2 className="font-display text-[#2D2418] font-bold text-lg">Words on screen</h2><p className="font-body text-xs text-[#5C4D3C] mt-1">Keep spoken character lines visible during rescues.</p><label className="mt-3 flex items-center justify-between gap-3 cursor-pointer"><span className="font-body text-sm font-bold text-[#49392C]">Show story words</span><input aria-label="Show spoken dialogue as captions" type="checkbox" checked={preferences.captionsEnabled} onChange={(event) => savePreferences({ ...preferences, captionsEnabled: event.target.checked })} className="h-5 w-5 accent-[#E66B5B]" /></label></section>
      <section className="paper-card p-4"><h2 className="font-display text-[#2D2418] font-bold text-lg">Large-icon mode</h2><p className="font-body text-xs text-[#5C4D3C] mt-1">Makes plushie pictures bigger across the game, so they are easier to spot.</p><label className="mt-3 flex items-center justify-between gap-3 cursor-pointer"><span className="font-body text-sm font-bold text-[#49392C]">Use bigger plushies</span><input aria-label="Use large-icon mode" type="checkbox" checked={preferences.largeIconMode} onChange={(event) => savePreferences({ ...preferences, largeIconMode: event.target.checked })} className="h-5 w-5 accent-[#E66B5B]" /></label></section>
      <section className="paper-card p-4"><h2 className="font-display text-[#2D2418] font-bold text-lg">Reduce motion</h2><p className="font-body text-xs text-[#5C4D3C] mt-1">Stops bouncy plushies, floating fireflies, flickering lights, page fades, and other nonessential motion. The game stays fully playable.</p><label className="mt-3 flex items-center justify-between gap-3 cursor-pointer"><span className="font-body text-sm font-bold text-[#49392C]">Use less movement</span><input aria-label="Reduce nonessential game motion" type="checkbox" checked={preferences.reduceMotion} onChange={(event) => savePreferences({ ...preferences, reduceMotion: event.target.checked })} className="h-5 w-5 accent-[#E66B5B]" /></label></section>
      <button onClick={() => savePreferences(DEFAULT_PREFERENCES)} className="w-full rounded-xl py-2 font-body text-sm text-white/85 active:scale-95" style={{ background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.22)' }}>Reset to game defaults</button>
      <p className="font-body text-center text-[10px] text-white/55 px-5">These settings are saved on this device. They change how the game looks and sounds, not the rescue progress.</p>
    </main>
  </div>;
}
