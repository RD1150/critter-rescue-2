import React from 'react';
import { playPreReaderDirection } from '../game/characterAudio';
import { useAudioPreferences } from '../game/audioPreferences';
import { PRE_READER_DIRECTIONS, type PreReaderDirectionKey } from '../game/preReaderDirections';

interface Props { directionKey: PreReaderDirectionKey; compact?: boolean; className?: string; }

export default function PreReaderDirection({ directionKey, compact = false, className = '' }: Props) {
  const [preferences] = useAudioPreferences();
  const line = PRE_READER_DIRECTIONS[directionKey];
  if (compact) return <button type="button" onClick={() => playPreReaderDirection(directionKey)} className={`rounded-full px-2 py-1 text-[10px] font-body text-[#5C4D3C] active:scale-95 transition-transform ${className}`} style={{ background: '#F7EBD8', border: '1px solid #D5C3A8' }} aria-label={`Hear direction: ${line}`}>🔊 Hear it</button>;
  return <div className={`rounded-2xl px-3 py-2.5 text-left ${className}`} style={{ background: 'rgba(248,232,216,.96)', border: '1px solid #E2C9AB' }}><div className="flex items-center gap-2"><button type="button" onClick={() => playPreReaderDirection(directionKey)} className="shrink-0 min-h-11 rounded-xl px-3 py-2 text-xs font-body font-bold text-white active:scale-95 transition-transform" style={{ background: '#E66B5B' }} aria-label={`Hear direction: ${line}`}>🔊 Hear directions</button><div><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#A85C41] font-bold">Listen, then try</p>{preferences.captionsEnabled && <p className="font-display text-[#2D2418] text-sm leading-snug">“{line}”</p>}</div></div></div>;
}
