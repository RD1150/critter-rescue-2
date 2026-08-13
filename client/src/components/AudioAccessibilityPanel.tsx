import React from 'react';
import { useAudioPreferences } from '../game/audioPreferences';

export default function AudioAccessibilityPanel() {
  const [preferences, savePreferences] = useAudioPreferences();
  const percent = Math.round(preferences.voiceVolume * 100);
  return (
    <section className="paper-card mt-4 px-3 py-3" aria-label="Voice and captions settings">
      <div className="flex items-center justify-between gap-3"><div><h3 className="font-display text-[#2D2418] font-bold text-sm">Voice & words</h3><p className="font-body text-[10px] text-[#5C4D3C]">Make character voices comfortable to hear.</p></div><span className="text-lg">🔊</span></div>
      <label className="mt-2.5 flex items-center gap-2"><span className="font-body text-xs text-[#49392C] whitespace-nowrap">Voice volume</span><input aria-label="Character voice volume" type="range" min="0" max="100" value={percent} onChange={(event) => savePreferences({ ...preferences, voiceVolume: Number(event.target.value) / 100 })} className="flex-1 accent-[#E66B5B]" /><span className="font-body text-[10px] text-[#5C4D3C] w-7 text-right">{percent}%</span></label>
      <label className="mt-3 flex items-center justify-between gap-3 cursor-pointer"><div><p className="font-body text-xs font-bold text-[#49392C]">Show story words</p><p className="font-body text-[10px] text-[#5C4D3C]">Keep the spoken lines on screen.</p></div><input aria-label="Show spoken dialogue as captions" type="checkbox" checked={preferences.captionsEnabled} onChange={(event) => savePreferences({ ...preferences, captionsEnabled: event.target.checked })} className="h-4 w-4 accent-[#E66B5B]" /></label>
    </section>
  );
}
