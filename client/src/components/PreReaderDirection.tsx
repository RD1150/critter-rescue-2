import React, { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { playPreReaderDirection } from '../game/characterAudio';
import { useAudioPreferences } from '../game/audioPreferences';
import { PRE_READER_DIRECTIONS, type PreReaderDirectionKey } from '../game/preReaderDirections';

interface Props { directionKey: PreReaderDirectionKey; compact?: boolean; minimal?: boolean; className?: string; }

export default function PreReaderDirection({ directionKey, compact = false, minimal = false, className = '' }: Props) {
  const [preferences] = useAudioPreferences();
  const [listenState, setListenState] = useState<'idle' | 'playing' | 'unavailable'>('idle');
  const acknowledgementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const line = PRE_READER_DIRECTIONS[directionKey];
  useEffect(() => () => { if (acknowledgementTimer.current) clearTimeout(acknowledgementTimer.current); }, []);
  const handleListen = async () => {
    if (acknowledgementTimer.current) clearTimeout(acknowledgementTimer.current);
    setListenState('playing');
    const started = await playPreReaderDirection(directionKey);
    if (!started) {
      setListenState('unavailable');
      acknowledgementTimer.current = setTimeout(() => setListenState('idle'), 3200);
      return;
    }
    acknowledgementTimer.current = setTimeout(() => setListenState('idle'), 5200);
  };
  if (!preferences.spokenDirectionsEnabled) {
    if (minimal) return null;
    if (!preferences.captionsEnabled) return null;
    return <div className={`rounded-2xl px-3 py-2 text-left ${className}`} style={{ background: 'rgba(248,232,216,.98)', border: '1px solid #D4B58E' }}><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#8C4130] font-bold">Try this</p><p className="font-display text-[#2D2418] text-sm leading-snug">“{line}”</p></div>;
  }
  if (minimal) return <div className={`inline-flex flex-col items-center gap-1 ${className}`}><button type="button" onClick={handleListen} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 py-2 font-body text-xs font-bold text-white active:scale-95 transition-transform" style={{ background: '#B94F45' }} aria-label={`Listen to direction: ${line}`}><Volume2 size={15} aria-hidden="true" />Listen</button>{listenState !== 'idle' && <p role="status" className="font-body text-[10px] font-bold text-[#5D3D2A]">{listenState === 'playing' ? 'Nutty is speaking.' : 'The words are here to read together.'}</p>}</div>;
  if (compact) return <div className={`inline-flex flex-col items-center gap-0.5 ${className}`}><button type="button" onClick={handleListen} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-body font-bold text-[#49392C] active:scale-95 transition-transform" style={{ background: '#F7EBD8', border: '1px solid #C8A981' }} aria-label={`Listen to direction: ${line}`}><Volume2 size={12} aria-hidden="true" />Listen</button>{listenState !== 'idle' && <span role="status" className="font-body text-[9px] font-bold text-[#5D3D2A]">{listenState === 'playing' ? 'Speaking' : 'Read together'}</span>}</div>;
  return <div className={`rounded-2xl px-3 py-2.5 text-left ${className}`} style={{ background: 'rgba(248,232,216,.98)', border: '1px solid #D4B58E' }}><div className="flex items-center gap-2"><button type="button" onClick={handleListen} className="inline-flex shrink-0 min-h-11 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-body font-bold text-white active:scale-95 transition-transform" style={{ background: '#B94F45' }} aria-label={`Listen to direction: ${line}`}><Volume2 size={15} aria-hidden="true" />Listen</button><div><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#8C4130] font-bold">Listen, then try</p>{preferences.captionsEnabled && <p className="font-display text-[#2D2418] text-sm leading-snug">“{line}”</p>}{listenState !== 'idle' && <p role="status" className="mt-1 font-body text-[10px] font-bold text-[#5D3D2A]">{listenState === 'playing' ? 'Nutty is speaking.' : 'The words are here to read together.'}</p>}</div></div></div>;
}
