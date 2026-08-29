import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Volume2 } from 'lucide-react';
import { playPreReaderDirection } from '../game/characterAudio';
import { useAudioPreferences } from '../game/audioPreferences';
import { PRE_READER_DIRECTIONS, type PreReaderDirectionKey } from '../game/preReaderDirections';
import CritterAvatar from './CritterAvatar';

interface Props { directionKey: PreReaderDirectionKey; compact?: boolean; minimal?: boolean; className?: string; }
type ListenState = 'idle' | 'volumeCheck' | 'playing' | 'replay' | 'unavailable';

export default function PreReaderDirection({ directionKey, compact = false, minimal = false, className = '' }: Props) {
  const [preferences, savePreferences] = useAudioPreferences();
  const [listenState, setListenState] = useState<ListenState>('idle');
  const acknowledgementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const line = PRE_READER_DIRECTIONS[directionKey];
  const isSpeaking = listenState === 'playing';
  useEffect(() => () => { if (acknowledgementTimer.current) clearTimeout(acknowledgementTimer.current); }, []);

  const startDirection = async () => {
    if (acknowledgementTimer.current) clearTimeout(acknowledgementTimer.current);
    setListenState('playing');
    const started = await playPreReaderDirection(directionKey, {
      onEnded: () => setListenState('replay'),
      onUnavailable: () => {
        setListenState('unavailable');
        acknowledgementTimer.current = setTimeout(() => setListenState('idle'), 3200);
      },
    });
    if (!started) return;
  };

  const handleListen = () => {
    if (preferences.directionVolumeCheckComplete) { void startDirection(); return; }
    setListenState('volumeCheck');
  };

  const confirmComfortVolume = () => {
    savePreferences({ ...preferences, directionVolumeCheckComplete: true });
    void startDirection();
  };

  const statusText = listenState === 'playing' ? 'Nutty is speaking.' : listenState === 'replay' ? 'Would you like to hear it again?' : 'The words are here to read together.';
  const compactMode = compact || minimal;
  const buttonLabel = listenState === 'replay' ? 'Replay directions' : 'Listen';
  const buttonIcon = listenState === 'replay' ? <RotateCcw size={compact ? 12 : 15} aria-hidden="true" /> : <Volume2 size={compact ? 12 : 15} aria-hidden="true" />;
  const buttonClass = minimal
    ? 'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 py-2 font-body text-xs font-bold text-white active:scale-95 transition-transform'
    : compact
      ? 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-body font-bold text-[#49392C] active:scale-95 transition-transform'
      : 'inline-flex shrink-0 min-h-11 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-body font-bold text-white active:scale-95 transition-transform';
  const buttonStyle = compact ? { background: '#F7EBD8', border: '1px solid #C8A981' } : { background: '#B94F45' };

  if (!preferences.spokenDirectionsEnabled) {
    if (minimal || !preferences.captionsEnabled) return null;
    return <div className={`rounded-2xl px-3 py-2 text-left ${className}`} style={{ background: 'rgba(248,232,216,.98)', border: '1px solid #D4B58E' }}><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#8C4130] font-bold">Try this</p><p className="font-display text-[#2D2418] text-sm leading-snug">“{line}”</p></div>;
  }

  const listeningButton = <button type="button" onClick={handleListen} className={buttonClass} style={buttonStyle} aria-label={`${buttonLabel} to direction: ${line}`}>{buttonIcon}{buttonLabel}</button>;
  const speakingBadge = isSpeaking ? <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FFF5DC] px-2 py-1 font-body text-[10px] font-bold text-[#5D3D2A] shadow-sm ${preferences.reduceMotion ? '' : 'motion-safe:animate-speaking-pulse'}`}><CritterAvatar type="squirrel" size={18} expression="happy" />Nutty is speaking</span> : null;
  const comfortCheck = listenState === 'volumeCheck' ? <div role="dialog" aria-label="Comfort volume check" className="mt-2 rounded-xl border border-[#D4B58E] bg-[#FFF9EF] px-3 py-2 text-left shadow-sm"><p className="font-body text-[10px] font-bold uppercase tracking-[.1em] text-[#8C4130]">Ask a grown-up</p><p className="font-display mt-0.5 text-sm text-[#2D2418]">Is this a comfy volume?</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={confirmComfortVolume} className="min-h-9 rounded-lg bg-[#B94F45] px-3 font-body text-[11px] font-bold text-white active:scale-95 transition-transform">Play sound</button><button type="button" onClick={() => setListenState('idle')} className="min-h-9 rounded-lg border border-[#B78E72] bg-white px-3 font-body text-[11px] font-bold text-[#5D3D2A] active:scale-95 transition-transform">Read together</button></div></div> : null;
  const feedback = listenState === 'playing' || listenState === 'replay' || listenState === 'unavailable' ? <div role="status" className={`mt-1 flex items-center gap-2 font-body ${compactMode ? 'text-[9px]' : 'text-[10px]'} font-bold text-[#5D3D2A]`}>{speakingBadge}{!isSpeaking && <span>{statusText}</span>}</div> : null;

  if (minimal) return <div className={`inline-flex flex-col items-center gap-1 ${className}`}>{listeningButton}{comfortCheck}{feedback}</div>;
  if (compact) return <div className={`inline-flex flex-col items-center gap-0.5 ${className}`}>{listeningButton}{comfortCheck}{feedback}</div>;
  return <div className={`rounded-2xl px-3 py-2.5 text-left ${className}`} style={{ background: 'rgba(248,232,216,.98)', border: '1px solid #D4B58E' }}><div className="flex items-center gap-2">{listeningButton}<div><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#8C4130] font-bold">Listen, then try</p>{preferences.captionsEnabled && <p className="font-display text-[#2D2418] text-sm leading-snug">“{line}”</p>}{feedback}</div></div>{comfortCheck}</div>;
}
