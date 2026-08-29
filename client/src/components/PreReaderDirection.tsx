import React from 'react';
import { Volume2 } from 'lucide-react';
import { playPreReaderDirection } from '../game/characterAudio';
import { useAudioPreferences } from '../game/audioPreferences';
import { PRE_READER_DIRECTIONS, type PreReaderDirectionKey } from '../game/preReaderDirections';

interface Props { directionKey: PreReaderDirectionKey; compact?: boolean; minimal?: boolean; className?: string; }

export default function PreReaderDirection({ directionKey, compact = false, minimal = false, className = '' }: Props) {
  const [preferences] = useAudioPreferences();
  const line = PRE_READER_DIRECTIONS[directionKey];
  if (!preferences.spokenDirectionsEnabled) {
    if (minimal) return null;
    if (!preferences.captionsEnabled) return null;
    return <div className={`rounded-2xl px-3 py-2 text-left ${className}`} style={{ background: 'rgba(248,232,216,.98)', border: '1px solid #D4B58E' }}><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#8C4130] font-bold">Try this</p><p className="font-display text-[#2D2418] text-sm leading-snug">“{line}”</p></div>;
  }
  if (minimal) return <button type="button" onClick={() => playPreReaderDirection(directionKey)} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 py-2 font-body text-xs font-bold text-white active:scale-95 transition-transform ${className}`} style={{ background: '#B94F45' }} aria-label={`Listen to direction: ${line}`}><Volume2 size={15} aria-hidden="true" />Listen</button>;
  if (compact) return <button type="button" onClick={() => playPreReaderDirection(directionKey)} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-body font-bold text-[#49392C] active:scale-95 transition-transform ${className}`} style={{ background: '#F7EBD8', border: '1px solid #C8A981' }} aria-label={`Listen to direction: ${line}`}><Volume2 size={12} aria-hidden="true" />Listen</button>;
  return <div className={`rounded-2xl px-3 py-2.5 text-left ${className}`} style={{ background: 'rgba(248,232,216,.98)', border: '1px solid #D4B58E' }}><div className="flex items-center gap-2"><button type="button" onClick={() => playPreReaderDirection(directionKey)} className="inline-flex shrink-0 min-h-11 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-body font-bold text-white active:scale-95 transition-transform" style={{ background: '#B94F45' }} aria-label={`Listen to direction: ${line}`}><Volume2 size={15} aria-hidden="true" />Listen</button><div><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#8C4130] font-bold">Listen, then try</p>{preferences.captionsEnabled && <p className="font-display text-[#2D2418] text-sm leading-snug">“{line}”</p>}</div></div></div>;
}
