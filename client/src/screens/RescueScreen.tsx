// ─────────────────────────────────────────────
// RescueScreen — puzzle gameplay screen
// Supports all 15+ mission types
// ─────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CritterAvatar, { Expression } from '../components/CritterAvatar';
import { getStarterCompanion, MissionData, MissionType, CritterType } from '../game/data';
import { hasCharacterAudio, playCharacterAudio, CharacterMoment } from '../game/characterAudio';
import { useAudioPreferences } from '../game/audioPreferences';
import { getRescueDialogue } from '../game/characterDialogue';
import { playSnap, playPickup, playError, playComplete, playButton, playChime, playFlip, playMatch, playPatternNote, playCatch, playMilestone } from '../game/sounds';
import PreReaderDirection from '../components/PreReaderDirection';

interface Props {
  mission: MissionData;
  companionType: string;
  bgColors: string[];
  onComplete: () => void;
  onBack: () => void;
  isFirstMission: boolean;
  isEarlyMission: boolean;
}

const EARLY_RESCUE_COACH: Partial<Record<MissionType, { title: string; steps: string[] }>> = {
  counting: { title: 'Find all 3 acorns', steps: ['Look for a golden acorn star.', 'Tap one star.', 'Keep going until it says 3 out of 3.'] },
  tracing: { title: 'Draw Pip a path', steps: ['Put your finger on the starting dot.', 'Move slowly along the dotted line.', 'Try again if your finger slips off.'] },
  bridge: { title: 'Build Nutty a bridge', steps: ['Pick up one round stone.', 'Drag it onto an empty water circle.', 'Do the same with the other stones.'] },
};

function CharacterVoiceButton({ name, zone, moment, label }: { name: string; zone: string; moment: CharacterMoment; label: string }) {
  if (!hasCharacterAudio(name, moment, zone)) return null;
  return (
    <button type="button" onClick={() => playCharacterAudio(name, moment, zone)} className="mt-1.5 rounded-full px-2 py-1 text-[10px] font-body text-[#5C4D3C] active:scale-95 transition-transform" style={{ background: '#F7EBD8', border: '1px solid #D5C3A8' }} aria-label={`Hear ${name}'s ${label}`}>
      🔊 Hear {name}
    </button>
  );
}

// ── Intro overlay ──────────────────────────────
function IntroOverlay({ mission, companionType, isFirstMission, isEarlyMission, onStart }: { mission: MissionData; companionType: string; isFirstMission: boolean; isEarlyMission: boolean; onStart: () => void }) {
  const dialogue = getRescueDialogue(mission);
  const [preferences] = useAudioPreferences();
  const coach = isEarlyMission ? EARLY_RESCUE_COACH[mission.type] : undefined;
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center pb-8 px-4 bg-black/40 animate-rise-in">
      <div className="paper-card w-full max-w-sm p-5 flex flex-col items-center gap-4">
        <div className="flex gap-4 items-end">
          <CritterAvatar type={companionType as CritterType} size={64} expression="happy" />
          <CritterAvatar type={mission.critter.type} size={80} expression="worried" animate />
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-[#2D2418] text-lg">{mission.critter.name}</p>
          <p className="text-[#5C4D3C] text-xs font-body italic mb-2">{mission.critter.personality}</p>
          <p className="font-display italic text-[#2D2418] text-base leading-snug">{mission.introText}</p>
          <div className="mt-2 rounded-xl bg-[#EAF1E5] px-3 py-2 text-left" style={{ border: '1px solid #B6CDA8' }}>
            <p className="font-body text-[10px] uppercase tracking-[.12em] font-bold text-[#60794D]">{mission.critter.name} says</p>
            {preferences.captionsEnabled && <p className="font-display text-[#2D2418] text-sm mt-0.5">“{dialogue.introduction}”</p>}
            <CharacterVoiceButton name={mission.critter.name} zone={mission.zone} moment="intro" label="introduction" />
            {preferences.captionsEnabled && <p className="font-body text-xs font-bold text-[#3F4A35] mt-1">“{dialogue.helpCall}”</p>}
            <CharacterVoiceButton name={mission.critter.name} zone={mission.zone} moment="help" label="help call" />
          </div>
          <PreReaderDirection directionKey={mission.type} className="mt-3" />
          {isFirstMission && <div className="mt-3 rounded-xl bg-[#EAF1E5] px-3 py-2 text-left" style={{ border: '1px solid #B6CDA8' }}><p className="font-body text-[10px] uppercase tracking-[.12em] font-bold text-[#60794D]">How the rescue works</p><p className="font-body text-xs text-[#3F4A35] mt-1">Look at the game. Try one little move. If you need help, tap your buddy’s picture in the top corner.</p></div>}
          {coach && <div className="mt-3 rounded-xl bg-[#F8E8D8] px-3 py-2.5 text-left" style={{ border: '1px solid #E2C9AB' }}><p className="font-body text-[10px] uppercase tracking-[.12em] font-bold text-[#A85C41]">Three easy steps · {coach.title}</p><ol className="mt-1.5 space-y-1">{coach.steps.map((step, index) => <li key={step} className="flex gap-1.5 font-body text-xs text-[#49392C]"><span className="font-display text-[#E66B5B]">{index + 1}.</span><span>{step}</span></li>)}</ol></div>}
        </div>
        <button onClick={onStart} className="btn-coral w-full text-base">{isFirstMission ? 'Show Me the Rescue Game!' : 'I’ll help!'}</button>
      </div>
    </div>
  );
}

// ── Completion overlay ─────────────────────────
function CompletionOverlay({ mission, onDone }: { mission: MissionData; onDone: () => void }) {
  const [preferences] = useAudioPreferences();
  const [showSecond, setShowSecond] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowSecond(true), 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-black/30 animate-rise-in">
      <div className="paper-card w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center">
        <CritterAvatar type={mission.critter.type} size={100} expression="grateful" animate />
        <div>
          <p className="font-display font-bold text-[#E66B5B] text-xl">You saved them! 🌟</p>
          {preferences.captionsEnabled && <p className="font-display italic text-[#2D2418] text-base mt-1 leading-snug">{mission.critter.thanksLine}</p>}
          <CharacterVoiceButton name={mission.critter.name} zone={mission.zone} moment="thanks" label="thank-you" />
          {showSecond && (
            <p className="font-body text-[#5C4D3C] text-sm mt-1 animate-rise-in">{mission.critter.secondLine}</p>
          )}
        </div>
        {showSecond && (
          <button onClick={onDone} className="btn-coral w-full text-base animate-pop-in">Back to Camp</button>
        )}
      </div>
    </div>
  );
}

// ── Memory Puzzle ──────────────────────────────
const MEMORY_SYMBOLS = ['🌸','🌿','🍄','🌻','🍀','🦋','🌙','⭐','🐾','🍂'];
function MemoryPuzzle({ pairCount, onComplete }: { pairCount: number; onComplete: () => void }) {
  const symbols = useMemo(() => {
    const picked = MEMORY_SYMBOLS.slice(0, pairCount);
    const deck = [...picked, ...picked];
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    return deck;
  }, [pairCount]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [checking, setChecking] = useState(false);
  const handleFlip = (i: number) => {
    if (checking || flipped.includes(i) || matched.has(i)) return;
    playFlip();
    const nf = [...flipped, i];
    setFlipped(nf);
    if (nf.length === 2) {
      setChecking(true);
      const [a, b] = nf;
      if (symbols[a] === symbols[b]) {
        setTimeout(() => {
          playMatch();
          const nm = new Set(matched); nm.add(a); nm.add(b);
          setMatched(nm); setFlipped([]); setChecking(false);
          if (nm.size === symbols.length) setTimeout(onComplete, 500);
        }, 400);
      } else {
        setTimeout(() => { playError(); setFlipped([]); setChecking(false); }, 900);
      }
    }
  };
  const cols = pairCount <= 3 ? 3 : 4;
  const cardSize = Math.min(72, Math.floor((Math.min(window.innerWidth, 400) - 48) / cols - 8));
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-white/80 text-sm font-body">Match the pairs</p>
      <div className="flex flex-wrap justify-center gap-2">
        {symbols.map((sym, i) => {
          const isFlipped = flipped.includes(i) || matched.has(i);
          const isMatched = matched.has(i);
          return (
            <button key={i} onClick={() => handleFlip(i)} disabled={isMatched}
              className={`flex items-center justify-center rounded-xl border-2 transition-all duration-200 active:scale-95
                ${isMatched ? 'border-[#F5C842] bg-[#F5C842]/20' : isFlipped ? 'border-[#E66B5B] bg-white/90' : 'border-white/30 bg-white/10 hover:bg-white/20'}`}
              style={{ width: cardSize, height: cardSize }}>
              {isFlipped ? <span style={{ fontSize: cardSize * 0.45 }}>{sym}</span>
                : <span style={{ fontSize: cardSize * 0.3 }} className="text-white/40">?</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Pattern Puzzle ─────────────────────────────
const PAT_COLORS = ['#E85A5A','#5AAAD4','#6ABB6A','#F0C840'];
const PAT_LABELS = ['🌺','🌊','🌿','⭐'];
function PatternPuzzle({ length, onComplete }: { length: number; onComplete: () => void }) {
  const [pattern] = useState(() => Array.from({ length }, () => Math.floor(Math.random()*4)));
  const [input, setInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<'showing'|'input'|'wrong'>('showing');
  const [active, setActive] = useState<number|null>(null);
  const showPat = useCallback(async (p: number[]) => {
    setPhase('showing'); setInput([]);
    await new Promise(r => setTimeout(r, 700));
    for (let i = 0; i < p.length; i++) {
      await new Promise(r => setTimeout(r, 650));
      setActive(p[i]); playPatternNote(p[i]);
      await new Promise(r => setTimeout(r, 400)); setActive(null);
    }
    setPhase('input');
  }, []);
  useEffect(() => { showPat(pattern); }, []);
  const press = (idx: number) => {
    if (phase !== 'input') return;
    playPatternNote(idx); setActive(idx); setTimeout(() => setActive(null), 300);
    const ni = [...input, idx];
    if (pattern[ni.length-1] !== idx) { setPhase('wrong'); setTimeout(() => showPat(pattern), 1000); return; }
    setInput(ni);
    if (ni.length === pattern.length) { setPhase('showing'); setTimeout(onComplete, 500); }
  };
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-white/80 text-sm font-body">
        {phase === 'showing' ? 'Watch carefully…' : phase === 'input' ? 'Your turn! Repeat the pattern' : 'Oops! Watch again…'}
      </p>
      <div className="flex gap-1 justify-center">
        {pattern.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < input.length ? 'bg-[#F5C842]' : 'bg-white/20'}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0,1,2,3].map(idx => (
          <button key={idx} onClick={() => press(idx)} disabled={phase !== 'input'}
            className={`w-24 h-24 rounded-2xl text-3xl flex items-center justify-center transition-all active:scale-90
              ${active === idx ? 'scale-110 brightness-125' : 'opacity-90'} disabled:opacity-50`}
            style={{ background: PAT_COLORS[idx] }}>
            {PAT_LABELS[idx]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Maze Puzzle ────────────────────────────────
function MazePuzzle({ difficulty, onComplete }: { difficulty: number; onComplete: () => void }) {
  const gridSize = difficulty <= 2 ? 7 : difficulty <= 3 ? 9 : 11;
  const cellSize = Math.floor(Math.min((Math.min(window.innerWidth, 400) - 48) / gridSize, 44));
  const [maze] = useState(() => {
    const walls = {
      top: Array.from({ length: gridSize }, () => Array(gridSize).fill(true)),
      left: Array.from({ length: gridSize }, () => Array(gridSize).fill(true)),
    };
    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    const stack: [number,number][] = [[0,0]]; visited[0][0] = true;
    while (stack.length) {
      const [r,c] = stack[stack.length-1];
      const nbrs: [number,number,string][] = [];
      if (r>0&&!visited[r-1][c]) nbrs.push([r-1,c,'up']);
      if (r<gridSize-1&&!visited[r+1][c]) nbrs.push([r+1,c,'down']);
      if (c>0&&!visited[r][c-1]) nbrs.push([r,c-1,'left']);
      if (c<gridSize-1&&!visited[r][c+1]) nbrs.push([r,c+1,'right']);
      if (!nbrs.length) { stack.pop(); continue; }
      const [nr,nc,dir] = nbrs[Math.floor(Math.random()*nbrs.length)];
      if (dir==='up') walls.top[r][c]=false;
      if (dir==='down') walls.top[nr][nc]=false;
      if (dir==='left') walls.left[r][c]=false;
      if (dir==='right') walls.left[nr][nc]=false;
      visited[nr][nc]=true; stack.push([nr,nc]);
    }
    return walls;
  });
  const endR = gridSize-1, endC = gridSize-1;
  const [path, setPath] = useState<[number,number][]>([[0,0]]);
  const canMove = (fr:number,fc:number,tr:number,tc:number) => {
    if (tr<0||tr>=gridSize||tc<0||tc>=gridSize) return false;
    if (tr===fr-1) return !maze.top[fr][fc];
    if (tr===fr+1) return !maze.top[tr][tc];
    if (tc===fc-1) return !maze.left[fr][fc];
    if (tc===fc+1) return !maze.left[tr][tc];
    return false;
  };
  const press = (r:number,c:number) => {
    const [cr,cc] = path[path.length-1];
    if (path.length>=2) { const [pr,pc]=path[path.length-2]; if (r===pr&&c===pc) { setPath(path.slice(0,-1)); return; } }
    if (Math.abs(r-cr)+Math.abs(c-cc)!==1) return;
    if (!canMove(cr,cc,r,c)) { playError(); return; }
    playSnap();
    const np = [...path,[r,c] as [number,number]]; setPath(np);
    if (r===endR&&c===endC) setTimeout(onComplete, 500);
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-white/80 text-xs font-body">Tap cells to trace a path to ⭐</p>
      <div className="relative" style={{ width: gridSize*cellSize+4, height: gridSize*cellSize+4 }}>
        {Array.from({ length: gridSize }).map((_,r) => Array.from({ length: gridSize }).map((_,c) => {
          const onPath = path.some(([pr,pc])=>pr===r&&pc===c);
          const isCur = path[path.length-1][0]===r&&path[path.length-1][1]===c;
          return (
            <button key={`${r}-${c}`} onClick={()=>press(r,c)}
              className={`absolute flex items-center justify-center text-sm transition-colors
                ${onPath ? 'bg-[#F5C842]/30' : 'bg-white/5 hover:bg-white/10'}`}
              style={{ width:cellSize, height:cellSize, left:c*cellSize+2, top:r*cellSize+2,
                borderTop: maze.top[r][c] ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                borderLeft: maze.left[r][c] ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                borderRight: c===gridSize-1 ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                borderBottom: r===gridSize-1 ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
              }}>
              {r===0&&c===0&&!onPath && '🏠'}
              {r===endR&&c===endC && '⭐'}
              {isCur&&!(r===endR&&c===endC) && <div className="w-3 h-3 rounded-full bg-[#E66B5B]" />}
            </button>
          );
        }))}
      </div>
    </div>
  );
}

// ── Gather Puzzle ──────────────────────────────
const GOOD = ['🍓','🫐','🍄','🌿','🍒','🍇','🌰','🍏'];
const BAD  = ['🪨','🌵','❌','🔥'];
interface Item { id:number; type:'good'|'bad'; emoji:string; x:number; y:number; caught:boolean }
function GatherPuzzle({ targetCount, difficulty, onComplete }: { targetCount:number; difficulty:number; onComplete:()=>void }) {
  const goal = targetCount + difficulty;
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(0);
  const scoreRef = useRef(0);
  const won = useRef(false);
  useEffect(() => {
    const interval = setInterval(() => {
      if (won.current) return;
      const isGood = Math.random() > 0.3;
      const id = nextId.current++;
      setItems(prev => [...prev.slice(-14), {
        id, type: isGood?'good':'bad',
        emoji: isGood ? GOOD[Math.floor(Math.random()*GOOD.length)] : BAD[Math.floor(Math.random()*BAD.length)],
        x: 10+Math.random()*75, y: 0, caught: false,
      }]);
    }, Math.max(700, 1300-difficulty*150));
    return () => clearInterval(interval);
  }, []);
  const tap = (id: number, type: 'good'|'bad') => {
    if (won.current) return;
    setItems(prev => prev.map(i => i.id===id ? {...i,caught:true} : i));
    if (type==='good') {
      playCatch();
      const ns = scoreRef.current+1; scoreRef.current=ns; setScore(ns);
      if (ns>=goal) { won.current=true; setTimeout(onComplete,600); }
    } else { playError(); }
  };
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex items-center gap-3">
        <span className="text-white font-body text-sm">Collected: <strong>{score}/{goal}</strong></span>
        <div className="w-32 h-2 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full bg-[#F5C842] rounded-full transition-all" style={{ width: `${Math.min(100,(score/goal)*100)}%` }} />
        </div>
      </div>
      <div className="relative w-full" style={{ height: 260 }}>
        {items.filter(i=>!i.caught).map(item => (
          <button key={item.id} onClick={()=>tap(item.id,item.type)}
            className="absolute text-3xl active:scale-75 transition-transform"
            style={{ left:`${item.x}%`, top: 0, animation: `leaf-fall ${Math.max(2.5,4-difficulty*0.3)}s linear forwards` }}>
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Counting Puzzle ────────────────────────────
function CountingPuzzle({ count, onComplete }: { count: number; onComplete: () => void }) {
  const positions = useMemo(() => Array.from({length:count},()=>({ x:10+Math.random()*80, y:10+Math.random()*70 })), [count]);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const tap = (i:number) => {
    if (tapped.has(i)) return;
    playSnap();
    const nt = new Set(tapped); nt.add(i); setTapped(nt);
    if (nt.size===count) setTimeout(onComplete,600);
  };
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-white/80 text-sm font-body">Tap all the ⭐ ({tapped.size}/{count})</p>
      <div className="relative w-full rounded-2xl bg-white/5 border border-white/10" style={{ height: 240 }}>
        {positions.map((pos,i) => (
          <button key={i} onClick={()=>tap(i)}
            className={`absolute text-3xl transition-all duration-200 ${tapped.has(i) ? 'scale-125 opacity-30' : 'hover:scale-110 active:scale-90'}`}
            style={{ left:`${pos.x}%`, top:`${pos.y}%`, transform:`translate(-50%,-50%)` }}>
            {tapped.has(i) ? '✨' : '⭐'}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Quiet Counting Rescue ───────────────────────
function QuietCountPuzzle({ onComplete }: { onComplete: () => void }) {
  const baskets = [{ id: 'two', berries: 2 }, { id: 'three', berries: 3 }, { id: 'four', berries: 4 }];
  const [message, setMessage] = useState('Count the berries slowly. Which basket has three?');
  const [chosen, setChosen] = useState<string | null>(null);
  const choose = (id: string) => {
    if (chosen) return;
    if (id === 'three') { setChosen(id); setMessage('Three berries! Daisy can have a cozy snack.'); playMatch(); setTimeout(onComplete, 650); }
    else { setMessage('That basket has a different number. Let’s count together, slowly.'); playChime(); }
  };
  return <div className="flex w-full flex-col items-center gap-3"><div className="rounded-2xl bg-white/10 px-4 py-2 text-center"><p className="font-body text-xs text-white/90">🍓 Find the basket with <strong>three</strong> berries</p></div><div className="grid w-full max-w-md grid-cols-3 gap-3">{baskets.map((basket) => <button key={basket.id} onClick={() => choose(basket.id)} disabled={Boolean(chosen)} aria-label={`Choose the basket with ${basket.berries} berries`} className={`min-h-[150px] rounded-3xl border-2 p-3 text-center shadow-lg transition-transform active:scale-95 ${chosen === basket.id ? 'border-[#F5C842] bg-[#EAF4EF]' : 'border-[#E7CFA2] bg-[#FFF8E6]'}`}><span className="grid grid-cols-2 justify-items-center gap-1 text-4xl">{Array.from({ length: basket.berries }, (_, index) => <span key={index}>🍓</span>)}</span><span className="mt-3 block font-display text-lg text-[#5C4D3C]">{Array.from({ length: basket.berries }, () => '●').join(' ')}</span></button>)}</div><p className="min-h-10 font-body text-center text-sm text-white/90">{message}</p></div>;
}

// ── Picture-Rhyme Rescue ─────────────────────────
function PictureRhymePuzzle({ onComplete }: { onComplete: () => void }) {
  const choices = [{ emoji: '🌳', label: 'tree', correct: true }, { emoji: '🐟', label: 'fish', correct: false }, { emoji: '🌸', label: 'flower', correct: false }];
  const [message, setMessage] = useState('Listen for “bee.” Which picture sounds like bee?');
  const [chosen, setChosen] = useState<string | null>(null);
  const choose = (choice: typeof choices[number]) => {
    if (chosen) return;
    if (choice.correct) { setChosen(choice.label); setMessage('Bee and tree! Those words sound alike. Finn found the safe tree.'); playMatch(); setTimeout(onComplete, 650); }
    else { setMessage('That picture makes a different sound. Let’s listen for bee one more time.'); playChime(); }
  };
  return <div className="flex w-full flex-col items-center gap-3"><div className="rounded-3xl border-2 border-[#F5C842] bg-[#FFF8E6] px-6 py-4 text-center shadow-lg"><span className="text-6xl">🐝</span><p className="mt-1 font-display text-lg text-[#5C4D3C]">Bee</p></div><p className="font-body text-sm text-white/90">Which picture rhymes with bee?</p><div className="grid w-full max-w-md grid-cols-3 gap-3">{choices.map((choice) => <button key={choice.label} onClick={() => choose(choice)} disabled={Boolean(chosen)} aria-label={`Choose ${choice.label}`} className={`min-h-[132px] rounded-3xl border-2 text-5xl shadow-lg transition-transform active:scale-95 ${chosen === choice.label ? 'border-[#F5C842] bg-[#EAF4EF]' : 'border-[#E7CFA2] bg-[#FFF8E6]'}`}><span>{chosen === choice.label ? '✓' : choice.emoji}</span><span className="mt-2 block font-body text-xs font-bold text-[#5C4D3C]">{choice.label}</span></button>)}</div><p className="min-h-10 font-body text-center text-sm text-white/90">{message}</p></div>;
}

// ── Sequence Puzzle ────────────────────────────
const SEQ_STAGES = [
  ['🌱','Seed'],['🌿','Sprout'],['🌸','Flower'],['🍎','Fruit'],['🍂','Autumn'],
];
function SequencePuzzle({ count, onComplete }: { count: number; onComplete: () => void }) {
  const stages = useMemo(() => SEQ_STAGES.slice(0,Math.min(count+1,5)), [count]);
  const [order, setOrder] = useState<number[]>(() => {
    const a = stages.map((_,i)=>i);
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  });
  const [selected, setSelected] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const pick = (idx: number) => {
    if (selected.includes(idx)) return;
    playSnap();
    const ns = [...selected, idx];
    if (ns[ns.length-1] !== ns.length-1) {
      setWrong(true); setTimeout(()=>{ setWrong(false); setSelected([]); },800);
      playError(); return;
    }
    setSelected(ns);
    if (ns.length===stages.length) setTimeout(onComplete,600);
  };
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-white/80 text-sm font-body">Put the stages in order</p>
      <div className="flex gap-2 justify-center flex-wrap">
        {order.map((stageIdx,i) => {
          const pos = selected.indexOf(i);
          const done = pos>=0;
          return (
            <button key={i} onClick={()=>pick(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95
                ${done ? 'border-[#F5C842] bg-[#F5C842]/20' : wrong ? 'border-red-400 bg-red-400/10' : 'border-white/20 bg-white/10 hover:bg-white/20'}`}>
              <span className="text-3xl">{stages[stageIdx][0]}</span>
              <span className="text-white/70 text-xs font-body">{stages[stageIdx][1]}</span>
              {done && <span className="text-[#F5C842] text-xs font-bold">#{pos+1}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Sorting Puzzle ─────────────────────────────
const SORT_CATS = [
  { label:'🌊 Water', items:['🐟','🦆','🐢','🦦','🐙'] },
  { label:'🌿 Land',  items:['🐿️','🦊','🦔','🐸','🐝'] },
];
function SortingPuzzle({ count, onComplete }: { count: number; onComplete: () => void }) {
  const allItems = useMemo(() => {
    const pool = [...SORT_CATS[0].items.slice(0,Math.ceil(count/2)), ...SORT_CATS[1].items.slice(0,Math.floor(count/2))];
    for (let i=pool.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    return pool;
  }, [count]);
  const [sorted, setSorted] = useState<Record<number,string[]>>({0:[],1:[]});
  const [dragging, setDragging] = useState<string|null>(null);
  const placed = Object.values(sorted).flat();
  const remaining = allItems.filter(i=>!placed.includes(i));
  const drop = (catIdx: number) => {
    if (!dragging) return;
    const cat = SORT_CATS[catIdx];
    const correct = cat.items.includes(dragging);
    if (correct) {
      playSnap();
      const ns = {...sorted, [catIdx]:[...sorted[catIdx],dragging]};
      setSorted(ns);
      if (Object.values(ns).flat().length===allItems.length) setTimeout(onComplete,600);
    } else { playError(); }
    setDragging(null);
  };
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-white/80 text-sm font-body">Drag each critter to the right group</p>
      <div className="flex gap-2 justify-center flex-wrap">
        {remaining.map(item => (
          <button key={item}
            draggable
            onDragStart={()=>setDragging(item)}
            onDragEnd={()=>setDragging(null)}
            onClick={()=>setDragging(dragging===item?null:item)}
            className={`text-3xl p-2 rounded-xl border-2 transition-all active:scale-90
              ${dragging===item ? 'border-[#E66B5B] bg-[#E66B5B]/20 scale-110' : 'border-white/20 bg-white/10'}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="flex gap-3 w-full">
        {SORT_CATS.map((cat,i) => (
          <div key={i}
            onDragOver={e=>e.preventDefault()}
            onDrop={()=>drop(i)}
            onClick={()=>{ if(dragging) drop(i); }}
            className="flex-1 min-h-[80px] rounded-2xl border-2 border-dashed border-white/30 bg-white/5 p-2 flex flex-col items-center gap-1">
            <span className="text-white/70 text-xs font-body">{cat.label}</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {sorted[i].map(item=><span key={item} className="text-2xl">{item}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Find Tools Puzzle ──────────────────────────
const TOOLS = ['🔦','🪣','🩹','🌡️','🧤','🔧','🪝','🧲'];
function FindToolsPuzzle({ count, onComplete }: { count: number; onComplete: () => void }) {
  const targets = useMemo(() => TOOLS.slice(0,count), [count]);
  const decoys = ['🍂','🍃','🌾','🪨','🌰','🍄','🌿','🌱','🍁','🌼'];
  const allItems = useMemo(() => {
    const pool = [...targets, ...decoys.slice(0,count+3)];
    for (let i=pool.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    return pool;
  }, [targets]);
  const positions = useMemo(() => allItems.map(()=>({ x:5+Math.random()*85, y:5+Math.random()*85 })), [allItems]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const tap = (item: string) => {
    if (targets.includes(item) && !found.has(item)) {
      playSnap();
      const nf = new Set(found); nf.add(item); setFound(nf);
      if (nf.size===targets.length) setTimeout(onComplete,600);
    } else { playError(); }
  };
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-white/80 text-sm font-body">Find the rescue tools ({found.size}/{targets.length})</p>
      <div className="flex gap-1 justify-center flex-wrap">
        {targets.map(t=><span key={t} className={`text-xl transition-all ${found.has(t)?'opacity-100':'opacity-30'}`}>{t}</span>)}
      </div>
      <div className="relative w-full rounded-2xl bg-white/5 border border-white/10" style={{ height:220 }}>
        {allItems.map((item,i)=>(
          <button key={i} onClick={()=>tap(item)}
            className={`absolute text-2xl transition-all active:scale-75 ${found.has(item)?'opacity-20 pointer-events-none':''}`}
            style={{ left:`${positions[i].x}%`, top:`${positions[i].y}%`, transform:'translate(-50%,-50%)' }}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Drag-and-Drop Puzzle (bridge/clearPath/shelter/guidePath) ──
function DragDropPuzzle({ mission, onComplete }: { mission: MissionData; onComplete: () => void }) {
  const { type, objectCount, requiresOrder } = mission;
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState<number|null>(null);

  const ICONS: Record<string, string[]> = {
    bridge:    ['🪨','🪨','🪨','🪨','🪨','🪨'],
    clearPath: ['🌿','🌿','🌿','🌿','🌿','🌿'],
    shelter:   ['🪵','🪵','🪵','🪵','🪵','🪵'],
    guidePath: ['🏮','🏮','🏮','🏮','🏮','🏮'],
  };
  const icons = ICONS[type] || ICONS.bridge;

  const ZONE_LABELS: Record<string, string> = {
    bridge: 'Drop stones in the stream →',
    clearPath: 'Clear the path →',
    shelter: 'Stack to build shelter →',
    guidePath: 'Place lanterns along the path →',
  };

  const drop = (zoneIdx: number) => {
    if (dragging === null) return;
    const nextExpected = placed.size;
    if (requiresOrder && zoneIdx !== nextExpected) { playError(); setDragging(null); return; }
    if (placed.has(zoneIdx)) { setDragging(null); return; }
    playSnap();
    const np = new Set(placed); np.add(zoneIdx); setPlaced(np);
    setDragging(null);
    if (np.size === objectCount) setTimeout(onComplete, 600);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-white/70 text-xs font-body">{ZONE_LABELS[type]}</p>
      {/* Drop zones */}
      <div className="flex gap-2 justify-center flex-wrap">
        {Array.from({ length: objectCount }).map((_,i) => (
          <div key={i}
            onDragOver={e=>e.preventDefault()}
            onDrop={()=>drop(i)}
            onClick={()=>{ if(dragging!==null) drop(i); }}
            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl transition-all
              ${placed.has(i) ? 'border-[#F5C842] bg-[#F5C842]/20' : 'border-dashed border-white/30 bg-white/5'}`}>
            {placed.has(i) ? icons[i] : requiresOrder && i===placed.size ? <span className="text-white/40 text-xs">#{i+1}</span> : ''}
          </div>
        ))}
      </div>
      {/* Draggable items */}
      <div className="flex gap-2 justify-center flex-wrap">
        {Array.from({ length: objectCount }).map((_,i) => {
          const isUsed = placed.size > i;
          return (
            <button key={i}
              draggable={!isUsed}
              onDragStart={()=>!isUsed&&setDragging(i)}
              onDragEnd={()=>setDragging(null)}
              onClick={()=>!isUsed&&setDragging(dragging===i?null:i)}
              disabled={isUsed}
              className={`w-14 h-14 rounded-xl border-2 text-2xl flex items-center justify-center transition-all active:scale-90
                ${isUsed ? 'opacity-20 border-white/10' : dragging===i ? 'border-[#E66B5B] bg-[#E66B5B]/20 scale-110' : 'border-white/30 bg-white/10 hover:bg-white/20'}`}>
              {isUsed ? '' : icons[i]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Shape Fit Puzzle ───────────────────────────
const SHAPES = ['🔴','🟠','🟡','🟢','🔵','🟣','⬛','⬜'];
function ShapeFitPuzzle({ count, onComplete }: { count: number; onComplete: () => void }) {
  const shapes = useMemo(() => SHAPES.slice(0,count), [count]);
  const [slots] = useState<string[]>(() => [...shapes].sort(()=>Math.random()-0.5));
  const [placed, setPlaced] = useState<Record<number,string>>({});
  const [dragging, setDragging] = useState<string|null>(null);
  const remaining = shapes.filter(s=>!Object.values(placed).includes(s));
  const drop = (slotIdx: number) => {
    if (!dragging) return;
    if (slots[slotIdx]===dragging) {
      playSnap();
      const np = {...placed,[slotIdx]:dragging}; setPlaced(np);
      if (Object.keys(np).length===count) setTimeout(onComplete,600);
    } else { playError(); }
    setDragging(null);
  };
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-white/80 text-sm font-body">Match each shape to its spot</p>
      <div className="flex gap-2 justify-center flex-wrap">
        {slots.map((shape,i)=>(
          <div key={i}
            onDragOver={e=>e.preventDefault()}
            onDrop={()=>drop(i)}
            onClick={()=>{ if(dragging) drop(i); }}
            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-3xl transition-all
              ${placed[i] ? 'border-[#F5C842] bg-[#F5C842]/20' : 'border-dashed border-white/30 bg-white/5'}`}>
            {placed[i] || <span className="text-white/20 text-xs">?</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {remaining.map(shape=>(
          <button key={shape}
            draggable
            onDragStart={()=>setDragging(shape)}
            onDragEnd={()=>setDragging(null)}
            onClick={()=>setDragging(dragging===shape?null:shape)}
            className={`w-14 h-14 rounded-xl border-2 text-3xl flex items-center justify-center transition-all active:scale-90
              ${dragging===shape ? 'border-[#E66B5B] bg-[#E66B5B]/20 scale-110' : 'border-white/30 bg-white/10'}`}>
            {shape}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Spot Difference Puzzle ─────────────────────
const SCENE_ITEMS = ['🌳','🌸','🦋','🍄','🌿','🌻','🐦','🍀','🌙','⭐','🌈','🦊'];
function SpotDifferencePuzzle({ count, onComplete }: { count: number; onComplete: () => void }) {
  const baseItems = useMemo(() => SCENE_ITEMS.slice(0,8+count), [count]);
  const [diffPositions] = useState<number[]>(() => {
    const idxs = baseItems.map((_,i)=>i);
    for (let i=idxs.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [idxs[i],idxs[j]]=[idxs[j],idxs[i]]; }
    return idxs.slice(0,count);
  });
  const [found, setFound] = useState<Set<number>>(new Set());
  const tap = (i: number) => {
    if (diffPositions.includes(i) && !found.has(i)) {
      playSnap();
      const nf = new Set(found); nf.add(i); setFound(nf);
      if (nf.size===count) setTimeout(onComplete,600);
    } else { playError(); }
  };
  const altItems = baseItems.map((item,i) => diffPositions.includes(i) ? '❓' : item);
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-white/80 text-sm font-body">Tap the differences ({found.size}/{count})</p>
      <div className="flex gap-2 w-full">
        {[baseItems, altItems].map((scene,si)=>(
          <div key={si} className="flex-1 rounded-xl bg-white/5 border border-white/10 p-2 flex flex-wrap gap-1 justify-center">
            {scene.map((item,i)=>(
              <button key={i} onClick={()=>si===1&&tap(i)}
                className={`text-xl w-9 h-9 flex items-center justify-center rounded-lg transition-all
                  ${si===1&&found.has(i) ? 'bg-[#F5C842]/30 ring-2 ring-[#F5C842]' : si===1 ? 'hover:bg-white/10 active:scale-90' : ''}`}>
                {item}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tracing Puzzle ─────────────────────────────
function TracingPuzzle({ difficulty, onComplete }: { difficulty: number; onComplete: () => void }) {
  const pointCount = difficulty <= 2 ? 7 : difficulty <= 3 ? 10 : 14;
  const tolerance = difficulty <= 2 ? 36 : 28;
  const W = Math.min(window.innerWidth - 32, 360);
  const H = 180;
  const points = useMemo(() => Array.from({length:pointCount},(_,i)=>{
    const t = i/(pointCount-1);
    return { x: 20+t*(W-40), y: H/2 + Math.sin(t*Math.PI*2.5)*(H*0.35) };
  }), [pointCount, W]);
  const [traced, setTraced] = useState(0);
  const tracedRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const check = (cx: number, cy: number) => {
    const idx = tracedRef.current;
    if (idx>=points.length) return;
    const p = points[idx];
    if (Math.hypot(cx-p.x,cy-p.y)<tolerance) {
      tracedRef.current=idx+1; setTraced(idx+1);
      if (idx+1>=points.length) setTimeout(onComplete,500);
    }
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons===0) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    check(e.clientX-rect.left, e.clientY-rect.top);
  };
  const pathD = points.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-white/80 text-sm font-body">Trace the dotted path</p>
      <div className="w-full rounded-xl bg-white/5 border border-white/10 overflow-hidden" style={{height:H+16}}>
        <svg ref={svgRef} width={W} height={H} className="mx-auto block touch-none cursor-crosshair"
          onPointerMove={onPointerMove} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);check(e.nativeEvent.offsetX,e.nativeEvent.offsetY);}}>
          <path d={pathD} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={3} strokeDasharray="6 8" />
          <path d={points.slice(0,traced+1).map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ')} fill="none" stroke="#F5C842" strokeWidth={4} strokeLinecap="round" />
          {points.map((p,i)=>(
            <circle key={i} cx={p.x} cy={p.y} r={i<traced?5:8} fill={i<traced?'#F5C842':'rgba(255,255,255,0.4)'} />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── Main RescueScreen ──────────────────────────
export default function RescueScreen({ mission, companionType, bgColors, onComplete, onBack, isFirstMission, isEarlyMission }: Props) {
  const [showIntro, setShowIntro] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [critterExpr, setCritterExpr] = useState<Expression>('worried');
  const [showExit, setShowExit] = useState(false);
  const [showTrailTip, setShowTrailTip] = useState(false);
  const [tipUsed, setTipUsed] = useState(false);
  const companion = getStarterCompanion(companionType);

  const handlePuzzleComplete = useCallback(() => {
    setProgress(1);
    setCritterExpr('grateful');
    playComplete();
    setTimeout(() => setCompleted(true), 400);
  }, []);

  const useCompanionTip = () => {
    if (tipUsed) return;
    playChime();
    setTipUsed(true);
    setShowTrailTip(true);
  };

  const bgStyle: React.CSSProperties = {
    background: `linear-gradient(180deg, ${bgColors[0]} 0%, ${bgColors[Math.floor(bgColors.length/2)]} 50%, ${bgColors[bgColors.length-1]} 100%)`,
  };

  const renderPuzzle = () => {
    const { type, objectCount, difficulty } = mission;
    switch (type) {
      case 'memory':        return <MemoryPuzzle pairCount={objectCount} onComplete={handlePuzzleComplete} />;
      case 'pattern':       return <PatternPuzzle length={objectCount} onComplete={handlePuzzleComplete} />;
      case 'maze':          return <MazePuzzle difficulty={difficulty} onComplete={handlePuzzleComplete} />;
      case 'gather':        return <GatherPuzzle targetCount={objectCount} difficulty={difficulty} onComplete={handlePuzzleComplete} />;
      case 'counting':      return <CountingPuzzle count={objectCount} onComplete={handlePuzzleComplete} />;
      case 'quietCount':    return <QuietCountPuzzle onComplete={handlePuzzleComplete} />;
      case 'pictureRhyme':  return <PictureRhymePuzzle onComplete={handlePuzzleComplete} />;
      case 'sequence':      return <SequencePuzzle count={objectCount} onComplete={handlePuzzleComplete} />;
      case 'sorting':       return <SortingPuzzle count={objectCount} onComplete={handlePuzzleComplete} />;
      case 'findTools':     return <FindToolsPuzzle count={objectCount} onComplete={handlePuzzleComplete} />;
      case 'shapeFit':      return <ShapeFitPuzzle count={objectCount} onComplete={handlePuzzleComplete} />;
      case 'spotDifference':return <SpotDifferencePuzzle count={objectCount} onComplete={handlePuzzleComplete} />;
      case 'tracing':       return <TracingPuzzle difficulty={difficulty} onComplete={handlePuzzleComplete} />;
      case 'bridge':
      case 'clearPath':
      case 'shelter':
      case 'guidePath':     return <DragDropPuzzle mission={mission} onComplete={handlePuzzleComplete} />;
      default:              return <CountingPuzzle count={objectCount} onComplete={handlePuzzleComplete} />;
    }
  };

  return (
    <div className="game-screen overflow-hidden" style={bgStyle}>
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-safe pt-3 pb-2">
        <button onClick={() => { playButton(); setShowExit(true); }} className="paper-card px-3 py-1.5 text-sm font-body text-[#2D2418] active:scale-95 transition-transform">← Back</button>
        <div className="paper-card px-3 py-1.5 flex-1 mx-3">
          <div className="w-full h-2 rounded-full bg-[#E8E4DC] overflow-hidden">
            <div className="wellness-bar-fill" style={{ width: `${progress*100}%` }} />
          </div>
        </div>
        <button onClick={useCompanionTip} disabled={tipUsed} className="relative rounded-xl active:scale-95 transition-transform disabled:opacity-70" aria-label={`Use ${companion.name}'s ${companion.rescueAbility}`}>
          <CritterAvatar type={companion.type} size={38} expression={tipUsed ? 'excited' : 'happy'} />
          {!tipUsed && <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-[#E66B5B] border border-white animate-pulse" />}
        </button>
      </div>

      {/* Scenario text */}
      <div className="relative z-10 px-4 pb-2">
        <p className="font-display italic text-white text-center text-sm drop-shadow">{mission.scenarioText}</p>
        <p className="text-white/60 text-xs text-center font-body mt-0.5">{mission.hintText}</p>
        <PreReaderDirection directionKey={mission.type} className="mx-auto mt-2 max-w-sm" />
        <button onClick={useCompanionTip} disabled={tipUsed} className="mx-auto mt-2 flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-body text-[#2D2418] active:scale-95 transition-transform disabled:opacity-65" style={{ background: '#F7EBD8', border: '1px solid #D5C3A8' }}>
          <span>{companion.rescueIcon}</span><span>{tipUsed ? `${companion.name}'s tip used` : `Ask ${companion.name}`}</span>
        </button>
      </div>

      {showTrailTip && <div className="absolute z-40 top-[108px] left-1/2 -translate-x-1/2 w-[min(330px,86vw)] animate-pop-in"><div className="paper-card relative px-4 py-4 text-center shadow-xl" style={{ borderTop: '3px solid #E66B5B' }}>
        <button onClick={() => setShowTrailTip(false)} className="absolute right-2 top-1 text-[#5C4D3C]/60 text-sm">×</button>
        <div className="flex justify-center items-center gap-2"><CritterAvatar type={companion.type} size={40} expression="happy" /><span className="font-body text-[10px] uppercase tracking-[.13em] text-[#E66B5B] font-bold">{companion.rescueIcon} {companion.rescueAbility}</span></div>
        <p className="font-display text-[#2D2418] text-sm italic leading-snug mt-2">“{companion.rescueHint}”</p>
        <p className="font-body text-[10px] text-[#5C4D3C] mt-2">This helper note is shown quietly so you can think at your own pace.</p>
      </div></div>}

      {isFirstMission && !showIntro && !completed && (
        <div className="relative z-10 mx-4 mb-1 rounded-2xl px-3 py-2.5 flex items-center gap-2" style={{ background: 'rgba(250,245,232,.92)', border: '1px solid rgba(255,255,255,.55)', boxShadow: '0 2px 8px rgba(0,0,0,.14)' }}>
          <span className="text-xl">👀</span>
          <p className="font-body text-xs text-[#413326] leading-snug"><strong>First, look.</strong> Then try one little move. There is no rush—and your buddy can help!</p>
        </div>
      )}

      {/* Puzzle area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4 flex flex-col items-center justify-center gap-3">
        {renderPuzzle()}
      </div>

      {/* Intro overlay */}
      {showIntro && (
        <IntroOverlay mission={mission} companionType={companionType} isFirstMission={isFirstMission} isEarlyMission={isEarlyMission} onStart={() => setShowIntro(false)} />
      )}

      {/* Completion overlay */}
      {completed && (
        <CompletionOverlay mission={mission} onDone={onComplete} />
      )}

      {/* Exit confirm */}
      {showExit && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="paper-card p-5 w-full max-w-xs text-center flex flex-col gap-3">
            <p className="font-display font-bold text-[#2D2418]">Leave the rescue?</p>
            <p className="text-[#5C4D3C] text-sm font-body">{mission.critter.name} is still waiting…</p>
            <button onClick={() => { playButton(); setShowExit(false); onBack(); }} className="btn-coral">Leave</button>
            <button onClick={() => setShowExit(false)} className="btn-parchment">Keep helping</button>
          </div>
        </div>
      )}
    </div>
  );
}
