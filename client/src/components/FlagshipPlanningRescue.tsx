import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { FlagshipStory } from '../game/flagshipStories';
import { RIVER_RESCUE_STEPS } from '../game/riverRescue';
import { NEST_RESCUE_STEPS } from '../game/nestRescue';
import { playGentleRetryFeedback, type GentleRetryKey } from '../game/characterAudio';
import { useAudioPreferences } from '../game/audioPreferences';
import BabylonStoryRescueScene from './BabylonStoryRescueScene';

// Direct Listen/Replay control; speech begins only on an explicit child tap.
import PreReaderDirection from './PreReaderDirection';
export type PlanningStoryId = 'finn-riverside-crossing' | 'wren-cozy-nest';
export type PlanningToolId = 'log' | 'rope' | 'guide' | 'branchPath' | 'mossBundle' | 'nestCup';

type Props = {
  story: FlagshipStory;
  reduceMotion?: boolean;
  onComplete: () => void;
  onBack: () => void;
};

/** Local pictures mirror the shapes in the toy world, rather than relying on fonts or image downloads. */
export function ToolPicture({ id, className = '' }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 78" aria-hidden="true" focusable="false" className={className}>
      <ellipse cx="50" cy="66" rx="33" ry="5" fill="#D8CEBA" opacity=".45" />
      {id === 'log' && <g transform="rotate(-12 50 40)"><rect x="17" y="24" width="66" height="33" rx="14" fill="#B18A65" /><path d="M30 30h38M26 42h34M38 51h29" stroke="#D9B592" strokeWidth="4" strokeLinecap="round" /><ellipse cx="80" cy="40" rx="10" ry="16" fill="#F0D4AE" /><ellipse cx="80" cy="40" rx="5" ry="10" fill="none" stroke="#BD926E" strokeWidth="2" /><path d="M34 26l-8-11 9-2 10 13" fill="#B18A65" /></g>}
      {id === 'rope' && <g fill="none" strokeLinecap="round"><ellipse cx="45" cy="40" rx="24" ry="20" stroke="#BA956B" strokeWidth="13" /><ellipse cx="45" cy="40" rx="24" ry="20" stroke="#EDD4A6" strokeWidth="8" /><path d="M63 52q19 5 14-18" stroke="#BA956B" strokeWidth="9" /><path d="M63 52q19 5 14-18" stroke="#EDD4A6" strokeWidth="5" /><path d="M24 31l7 5m4-15 2 9m17-9-3 9m15 4-8 4m-31 10 8-4m8 16v-9m13 7-3-9" stroke="#AF895F" strokeWidth="2" /></g>}
      {id === 'guide' && <g><rect x="43" y="26" width="10" height="39" rx="4" fill="#AC8263" /><path d="M19 16h47l17 14-17 14H19q-5 0-5-6V22q0-6 5-6" fill="#E2B096" /><path d="M29 30h37m-8-8 9 8-9 8" fill="none" stroke="#FFF7E6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><path d="M66 59q4-16 17-13-3 15-17 13" fill="#7F9D78" /></g>}
      {id === 'branchPath' && <g fill="none" strokeLinecap="round"><path d="M18 61L79 23M43 46l-9-23M60 35l20 10" stroke="#AA8262" strokeWidth="13" /><path d="M19 58l60-37" stroke="#D7B18A" strokeWidth="3" /><path d="M32 24q-16 2-17-13 14-4 17 13M75 43q6-16 18-11-2 13-18 11M70 25q-8-17 6-20 9 10-6 20" fill="#8CA584" stroke="none" /></g>}
      {id === 'mossBundle' && <g fill="#8FA980"><ellipse cx="50" cy="46" rx="32" ry="18" /><circle cx="29" cy="39" r="13" /><circle cx="47" cy="31" r="16" /><circle cx="67" cy="38" r="15" /><path d="M24 43q15-22 31-4t22-3" fill="none" stroke="#B9CBA2" strokeWidth="6" strokeLinecap="round" /><path d="M42 53l4-7m11 9 5-10" stroke="#688663" strokeWidth="3" strokeLinecap="round" /></g>}
      {id === 'nestCup' && <g><path d="M16 37q5 29 34 29t34-29" fill="#B58C69" /><ellipse cx="50" cy="37" rx="34" ry="17" fill="#D9B28A" /><ellipse cx="50" cy="37" rx="25" ry="10" fill="#8CA47E" /><path d="M18 43l20 15m-6-17 24 21m3-21 19 9M26 57l42-7M24 30l47 12m-44-5 26-16" stroke="#E9CCA6" strokeWidth="3" strokeLinecap="round" /><ellipse cx="48" cy="33" rx="9" ry="5" fill="#C9D9B4" /></g>}
    </svg>
  );
}

export function useStoryReduceMotion(requested = false): boolean {
  const [preferences] = useAudioPreferences();
  const [systemReduced, setSystemReduced] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const update = () => setSystemReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return requested || Boolean(preferences.reduceMotion) || systemReduced;
}

/** React owns the entire sequence. WebGL is a second input surface, never a requirement. */
export default function FlagshipPlanningRescue({ story, reduceMotion = false, onComplete, onBack }: Props) {
  const river = story.id === 'finn-riverside-crossing';
  const storyId: PlanningStoryId = river ? 'finn-riverside-crossing' : 'wren-cozy-nest';
  const name = story.friend.name;
  const steps = river ? RIVER_RESCUE_STEPS : NEST_RESCUE_STEPS;
  const [started, setStarted] = useState(() => import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('storyActive') === '1');
  const [placed, setPlaced] = useState<PlanningToolId[]>([]);
  const placedRef = useRef<PlanningToolId[]>([]);
  const [feedback, setFeedback] = useState('');
  const [cue, setCue] = useState<PlanningToolId | null>(null);
  const [homecoming, setHomecoming] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const completedRef = useRef(false);
  const finishRef = useRef<HTMLHeadingElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const firstToolRef = useRef<HTMLButtonElement>(null);
  const visitRef = useRef<HTMLButtonElement>(null);
  const motionReduced = useStoryReduceMotion(reduceMotion);
  const ready = placed.length === steps.length;
  const currentStep = steps[placed.length];
  const modalOpen = !started || homecoming || exitOpen;
  const adapt = (line: string) => river ? line.replaceAll('Clover', name).replace('hops home', 'finds the quiet water nook') : line;
  useEffect(() => {
    if (homecoming) finishRef.current?.focus();
    else if (started && !exitOpen) (ready ? visitRef : firstToolRef).current?.focus();
  }, [started, homecoming, exitOpen, ready, placed.length]);
  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      const dialogs = screenRef.current?.querySelectorAll<HTMLElement>('[role="dialog"]');
      const dialog = dialogs?.[dialogs.length - 1];
      if (!dialog) return;
      if (event.key === 'Escape') {
        if (exitOpen) setExitOpen(false);
        else if (homecoming) setHomecoming(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === finishRef.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modalOpen, exitOpen, homecoming]);

  const chooseTool = (id: PlanningToolId) => {
    if (!started || exitOpen || homecoming || placedRef.current.includes(id)) return;
    const expected = steps[placedRef.current.length];
    if (!expected) return;
    if (id !== expected.id) {
      const selected = steps.find((step) => step.id === id);
      if (!selected) return;
      playGentleRetryFeedback(selected.tool.toLowerCase() as GentleRetryKey);
      setFeedback(`${selected.tool} can help soon. Let’s use ${expected.tool.toLowerCase()} first.`);
      setCue(expected.id as PlanningToolId);
      return;
    }
    const next = [...placedRef.current, id];
    placedRef.current = next;
    setPlaced(next);
    setCue(null);
    setFeedback(adapt(expected.success));
  };
  const bringHome = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  return (
    <div ref={screenRef} className="game-screen flagship-planning bg-[#F6F1E7] text-[#3E493C]" data-reduced-motion={motionReduced}>
      <style>{`
        .flagship-planning button { min-height: 56px; }
        .flagship-planning button:focus-visible { outline: 3px solid #5D7C64; outline-offset: 4px; }
        .flagship-planning .story-tool { min-height: 116px; }
        .flagship-planning .story-world { min-height: 220px; }
        .flagship-planning .story-tool:active { background: #E7EBD8; }
        .flagship-planning .story-controls { padding-bottom: max(12px, env(safe-area-inset-bottom)); }
        .flagship-planning[data-reduced-motion="true"] * { animation: none !important; transition: none !important; }
        .flagship-planning[data-reduced-motion="true"] button { transform: none !important; }
        @media (min-width: 760px) { .flagship-planning .story-tool { min-height: 138px; } }
        @media (max-height: 600px) and (min-width: 650px) {
          .flagship-planning .story-main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 34%); }
          .flagship-planning .story-controls { overflow-y: auto; }
          .flagship-planning .story-tool { min-height: 100px; }
        }
      `}</style>
      <header inert={modalOpen} aria-hidden={modalOpen || undefined} className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[#E2DDCB] px-3 pb-2 pt-[max(8px,env(safe-area-inset-top))] sm:px-6">
        <button type="button" onClick={() => setExitOpen(true)} aria-label="Back to camp" className="flex items-center gap-2 rounded-2xl border border-[#DED3BC] bg-[#FFFCF5] px-4 font-body text-sm font-bold"><ArrowLeft size={19} aria-hidden="true" />Camp</button>
        <div className="min-w-0 text-right"><p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-[#8C745B]">{river ? 'The little riverside' : 'Under the willow'}</p><h1 className="font-display text-lg font-bold sm:text-2xl">{river ? 'Finn’s safe crossing' : 'Wren’s cozy nest'}</h1></div>
      </header>
      <main inert={modalOpen} aria-hidden={modalOpen || undefined} className="story-main relative flex min-h-0 flex-1 flex-col overflow-y-auto">
        <figure className="story-world relative m-0 flex-1 overflow-hidden bg-[#E9EEE2]" aria-label={river ? 'Finn’s riverside toy world' : 'Wren’s willow toy world'}>
          <BabylonStoryRescueScene storyId={storyId} placed={placed} active={started && !exitOpen && !homecoming} cueToolId={cue} reduceMotion={motionReduced} onChooseTool={chooseTool} />
          <figcaption className="pointer-events-none absolute left-3 top-3 max-w-[75%] rounded-2xl border border-[#E4DDC9] bg-[#FFFCF5]/95 px-3 py-2 font-body text-xs leading-snug text-[#58654E] shadow-sm sm:left-6 sm:top-4">
            {ready ? (river ? 'The bridge, rope, and trail stay here for Finn.' : 'The branch, moss, and nest stay here for Wren.') : placed.length === 0 ? (river ? 'A little bridge will connect these banks.' : 'A soft home is waiting in the willow.') : adapt(steps[placed.length - 1].success)}
          </figcaption>
        </figure>
        <section aria-label={`${name} rescue helper tools`} className="story-controls relative z-10 shrink-0 border-t border-[#DDD6C2] bg-[#FFFCF5] px-3 pt-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><p className="font-body text-[10px] font-bold uppercase tracking-[.15em] text-[#99745C]">{ready ? 'A cozy way home' : 'Choose a little helper'}</p><p id="story-next-step" className="mt-1 font-display text-base font-bold leading-snug sm:text-lg">{ready ? (river ? 'Finn’s crossing is ready.' : 'Wren has a soft place to rest.') : adapt(currentStep.prompt)}</p></div>
              <PreReaderDirection directionKey={river ? 'riverRescue' : 'nestRescue'} buttonOnly />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-describedby="story-next-step">
              {steps.map((step) => {
                const used = placed.includes(step.id as PlanningToolId);
                const hint = cue === step.id;
                return <button ref={step.id === currentStep?.id ? firstToolRef : undefined} key={step.id} type="button" disabled={!started || used || homecoming || exitOpen} onClick={() => chooseTool(step.id as PlanningToolId)} aria-label={`${step.tool}${used ? ', placed in the world' : ''}${hint ? ', try this helper' : ''}`} aria-pressed={used} className={`story-tool relative flex flex-col items-center justify-center rounded-[22px] border-2 px-2 py-2 ${used ? 'border-[#9EB396] bg-[#E8EFDE]' : hint ? 'border-[#6E8C67] bg-[#EDF1DF] ring-2 ring-[#A7B997]/50' : 'border-[#E6DCC8] bg-[#F8F2E6]'}`}>
                  <ToolPicture id={step.id} className="h-[60px] w-[82px] sm:h-[72px] sm:w-[98px]" />
                  <span className="font-body text-xs font-bold leading-tight text-[#4A5741] sm:text-sm">{step.tool}</span>
                  {used && <span className="mt-1 flex items-center gap-1 font-body text-[10px] font-bold text-[#54724C]"><Check size={12} aria-hidden="true" />Placed</span>}
                  {hint && <span className="mt-1 font-body text-[10px] font-bold text-[#54724C]">Try this helper</span>}
                </button>;
              })}
            </div>
            <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 min-h-9 font-body text-xs leading-snug text-[#68705B] sm:text-sm">{feedback || 'Tap a picture or a helper in the world. We can take our time.'}</p>
            {ready && !homecoming && <button ref={visitRef} type="button" onClick={() => setHomecoming(true)} className="mb-2 w-full rounded-2xl border border-[#BA745E] bg-[#A5654D] px-4 font-body text-base font-bold text-white">{river ? 'Visit Finn’s quiet nook' : 'Let Wren settle in'}</button>}
          </div>
        </section>
      </main>
      {!started && <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#334B3B]/25 px-5">
        <section role="dialog" aria-modal="true" aria-labelledby="story-intro-title" className="w-full max-w-sm rounded-[30px] border border-[#DDCEB4] bg-[#FFFCF5] px-6 py-6 text-center shadow-xl">
          <ToolPicture id={river ? 'log' : 'nestCup'} className="mx-auto h-24 w-32" />
          <p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-[#97765C]">A small kindness</p>
          <h2 id="story-intro-title" className="mt-2 font-display text-2xl font-bold">{river ? 'A safe way for Finn.' : 'A cozy home for Wren.'}</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-[#68705B]">{story.prompt}</p>
          <button autoFocus type="button" onClick={() => { setStarted(true); }} className="mt-5 w-full rounded-2xl bg-[#A5654D] px-4 font-body text-base font-bold text-white">Help {name}</button>
          <button type="button" onClick={onBack} className="mt-2 w-full rounded-2xl font-body text-sm font-bold text-[#62725B]">Back to camp</button>
        </section>
      </div>}
      {homecoming && <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#334B3B]/25 px-5">
        <section role="dialog" aria-modal="true" aria-labelledby="story-homecoming-title" className="w-full max-w-sm rounded-[30px] border border-[#DDCEB4] bg-[#FFFCF5] px-6 py-6 text-center shadow-xl">
          <ToolPicture id={river ? 'guide' : 'nestCup'} className="mx-auto h-24 w-32" />
          <p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-[#97765C]">A gentle homecoming</p>
          <h2 ref={finishRef} tabIndex={-1} id="story-homecoming-title" className="mt-2 font-display text-2xl font-bold">{story.homecomingTitle}</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-[#68705B]">{story.homecomingMessage}</p>
          <button type="button" onClick={bringHome} className="mt-5 w-full rounded-2xl bg-[#A5654D] px-4 font-body text-base font-bold text-white">Bring {name} home</button>
          <button type="button" onClick={() => setHomecoming(false)} className="mt-2 w-full rounded-2xl font-body text-sm font-bold text-[#62725B]">Look at our little world</button>
        </section>
      </div>}
      {exitOpen && <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#334B3B]/30 px-5"><section role="dialog" aria-modal="true" aria-labelledby="story-exit-title" className="w-full max-w-sm rounded-[30px] bg-[#FFFCF5] px-6 py-6 text-center shadow-xl"><h2 id="story-exit-title" className="font-display text-xl font-bold">A little pause?</h2><p className="mt-2 font-body text-sm text-[#68705B]">We can visit {name} again whenever you like.</p><button autoFocus type="button" onClick={onBack} className="mt-4 w-full rounded-2xl bg-[#A5654D] px-4 font-body font-bold text-white">Back to camp</button><button type="button" onClick={() => setExitOpen(false)} className="mt-2 w-full rounded-2xl border border-[#DDD5BE] font-body font-bold">Keep helping {name}</button></section></div>}
    </div>
  );
}
