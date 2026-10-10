import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Volume2 } from 'lucide-react';
import { playPreReaderDirection } from '../game/characterAudio';
import { useAudioPreferences } from '../game/audioPreferences';
import { PRE_READER_DIRECTIONS, type PreReaderDirectionKey } from '../game/preReaderDirections';
import CritterAvatar from './CritterAvatar';

interface Props { directionKey: PreReaderDirectionKey; compact?: boolean; minimal?: boolean; className?: string; }
type ListenState = 'idle' | 'volumeCheck' | 'playing' | 'replay' | 'unavailable';

const PICTURE_CUES: Partial<Record<PreReaderDirectionKey, { before: string; after: string; label: string }>> = {
  onboarding: { before: '👆', after: '🧩', label: 'tap the big rescue button' },
  riverRescue: { before: '🪵', after: '🪢➡️🏡', label: 'log, rope, then home' },
  nestRescue: { before: '🌿', after: '🪶➡️🪺', label: 'branch, feather, then nest' },
  lodgeRescue: { before: '🪵', after: '🧺➡️🏠', label: 'log, blanket, then cozy lodge' },
  bridge: { before: '🪨', after: '🌊', label: 'put stepping stones in the water' },
  tracing: { before: '👆', after: '⋯➡️✨', label: 'follow the dotted line' },
  counting: { before: '⭐', after: '🧺', label: 'tap each picture and tuck it in' },
  sorting: { before: '🧸', after: '🧺', label: 'put each picture in its matching basket' },
  shapeFit: { before: '🔺', after: '⬜', label: 'put each shape in its matching space' },
  pattern: { before: '🔴🔵', after: '🔴🔵', label: 'watch and copy the picture pattern' },
  memory: { before: '🃏', after: '🃏✨', label: 'find two pictures that match' },
  animalHomeMatch: { before: '🐶', after: '🏠', label: 'match each animal with its cozy home' },
};

export default function PreReaderDirection({ directionKey, compact = false, minimal = false, className = '' }: Props) {
  const [preferences, savePreferences] = useAudioPreferences();
  const [listenState, setListenState] = useState<ListenState>('idle');
  const acknowledgementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const line = PRE_READER_DIRECTIONS[directionKey];
  const pictureCue = PICTURE_CUES[directionKey] ?? { before: '👆', after: '✨', label: 'tap the next helpful picture' };
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
  const visualCue = <span role="img" aria-label={`Picture clue: ${pictureCue.label}`} className={`inline-flex items-center gap-1 rounded-lg bg-[#FFF9EF] px-2 py-1 text-base ${compactMode ? 'text-sm' : ''}`}><span>{pictureCue.before}</span><span className="text-[#8C4130]">→</span><span>{pictureCue.after}</span></span>;

  if (!preferences.spokenDirectionsEnabled) {
    if (minimal || !preferences.captionsEnabled) return <div className={`inline-flex flex-col items-center gap-1 ${className}`}>{visualCue}</div>;
    return <div className={`rounded-2xl px-3 py-2 text-left ${className}`} style={{ background: 'rgba(248,232,216,.98)', border: '1px solid #D4B58E' }}><div className="flex items-center gap-2">{visualCue}<div><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#8C4130] font-bold">Try this</p><p className="font-display text-[#2D2418] text-sm leading-snug">“{line}”</p></div></div></div>;
  }

  const listeningButton = <button type="button" onClick={handleListen} className={buttonClass} style={buttonStyle} aria-label={`${buttonLabel} to direction: ${line}`}>{buttonIcon}{buttonLabel}</button>;
  const speakingBadge = isSpeaking ? <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FFF5DC] px-2 py-1 font-body text-[10px] font-bold text-[#5D3D2A] shadow-sm ${preferences.reduceMotion ? '' : 'motion-safe:animate-speaking-pulse'}`}><CritterAvatar type="squirrel" size={18} expression="happy" />Nutty is speaking</span> : null;
  const comfortCheck = listenState === 'volumeCheck' ? <div role="dialog" aria-label="Comfort volume check" className="mt-2 rounded-xl border border-[#D4B58E] bg-[#FFF9EF] px-3 py-2 text-left shadow-sm"><p className="font-body text-[10px] font-bold uppercase tracking-[.1em] text-[#8C4130]">Ask a grown-up</p><p className="font-display mt-0.5 text-sm text-[#2D2418]">Is this a comfy volume?</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={confirmComfortVolume} className="min-h-9 rounded-lg bg-[#B94F45] px-3 font-body text-[11px] font-bold text-white active:scale-95 transition-transform">Play sound</button><button type="button" onClick={() => setListenState('idle')} className="min-h-9 rounded-lg border border-[#B78E72] bg-white px-3 font-body text-[11px] font-bold text-[#5D3D2A] active:scale-95 transition-transform">Read together</button></div></div> : null;
  const feedback = listenState === 'playing' || listenState === 'replay' || listenState === 'unavailable' ? <div role="status" className={`mt-1 flex items-center gap-2 font-body ${compactMode ? 'text-[9px]' : 'text-[10px]'} font-bold text-[#5D3D2A]`}>{speakingBadge}{!isSpeaking && <span>{statusText}</span>}</div> : null;

  if (minimal) return <div className={`inline-flex flex-col items-center gap-1 ${className}`}>{visualCue}{listeningButton}{comfortCheck}{feedback}</div>;
  if (compact) return <div className={`inline-flex flex-col items-center gap-0.5 ${className}`}>{visualCue}{listeningButton}{comfortCheck}{feedback}</div>;
  return <div className={`rounded-2xl px-3 py-2.5 text-left ${className}`} style={{ background: 'rgba(248,232,216,.98)', border: '1px solid #D4B58E' }}><div className="flex items-center gap-2">{visualCue}{listeningButton}<div><p className="font-body text-[10px] uppercase tracking-[.12em] text-[#8C4130] font-bold">Listen, then try</p>{preferences.captionsEnabled && <p className="font-display text-[#2D2418] text-sm leading-snug">“{line}”</p>}{feedback}</div></div>{comfortCheck}</div>;
}
