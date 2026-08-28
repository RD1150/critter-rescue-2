import React, { useMemo, useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import { playComplete, playError, playMatch } from '../game/sounds';
import PreReaderDirection from '../components/PreReaderDirection';
import type { LearningMilestoneKey } from '../game/store';
import type { LearningTheme } from '../game/learningThemes';
import { LEARNING_THEME_DETAILS } from '../game/learningThemes';

type Shape = 'circle' | 'square' | 'triangle';
type Tile = { color: string; colorName: string; shape: Shape };

const COLORS = {
  coral: { hex: '#E66B5B', name: 'red' },
  sky: { hex: '#5FAED6', name: 'blue' },
  sun: { hex: '#F3C94A', name: 'yellow' },
  leaf: { hex: '#70A85B', name: 'green' },
};

export const LEARNING_ROUNDS: { kind: 'find' | 'pattern'; title: string; prompt: string; answer: Tile; choices: Tile[]; sequence?: Tile[] }[] = [
  { kind: 'find', title: 'Color hunt', prompt: 'Can you find the red circle?', answer: { color: COLORS.coral.hex, colorName: 'red', shape: 'circle' }, choices: [{ color: COLORS.coral.hex, colorName: 'red', shape: 'circle' }, { color: COLORS.sky.hex, colorName: 'blue', shape: 'circle' }, { color: COLORS.coral.hex, colorName: 'red', shape: 'square' }, { color: COLORS.sun.hex, colorName: 'yellow', shape: 'triangle' }] },
  { kind: 'find', title: 'Shape hunt', prompt: 'Can you find the yellow square?', answer: { color: COLORS.sun.hex, colorName: 'yellow', shape: 'square' }, choices: [{ color: COLORS.sky.hex, colorName: 'blue', shape: 'square' }, { color: COLORS.sun.hex, colorName: 'yellow', shape: 'square' }, { color: COLORS.sun.hex, colorName: 'yellow', shape: 'circle' }, { color: COLORS.leaf.hex, colorName: 'green', shape: 'triangle' }] },
  { kind: 'pattern', title: 'Pattern trail', prompt: 'What comes next?', answer: { color: COLORS.sky.hex, colorName: 'blue', shape: 'square' }, choices: [{ color: COLORS.coral.hex, colorName: 'red', shape: 'circle' }, { color: COLORS.sky.hex, colorName: 'blue', shape: 'square' }, { color: COLORS.sun.hex, colorName: 'yellow', shape: 'triangle' }, { color: COLORS.leaf.hex, colorName: 'green', shape: 'circle' }], sequence: [{ color: COLORS.coral.hex, colorName: 'red', shape: 'circle' }, { color: COLORS.sky.hex, colorName: 'blue', shape: 'square' }, { color: COLORS.coral.hex, colorName: 'red', shape: 'circle' }] },
];

export function tilesMatch(a: Tile, b: Tile) { return a.color === b.color && a.shape === b.shape; }

function ShapeTile({ tile, small = false }: { tile: Tile; small?: boolean }) {
  const size = small ? 44 : 78;
  const shapeStyle: React.CSSProperties = tile.shape === 'circle'
    ? { borderRadius: '999px' }
    : tile.shape === 'triangle'
      ? { width: 0, height: 0, background: 'transparent', borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${tile.color}` }
      : { borderRadius: '14px' };
  return <span aria-label={`${tile.colorName} ${tile.shape}`} className="inline-block shadow-sm" style={{ width: tile.shape === 'triangle' ? 0 : size, height: tile.shape === 'triangle' ? 0 : size, background: tile.shape === 'triangle' ? 'transparent' : tile.color, ...shapeStyle }} />;
}

interface Props { onBack: () => void; onRoundComplete: (milestone: LearningMilestoneKey) => void; learningTheme?: LearningTheme; }

export default function CampLearningScreen({ onBack, onRoundComplete, learningTheme = 'all' }: Props) {
  const previewRound = import.meta.env.DEV ? Number(new URLSearchParams(window.location.search).get('learningRound') || '0') : 0;
  const [round, setRound] = useState(Math.max(0, Math.min(LEARNING_ROUNDS.length - 1, previewRound)));
  const [message, setMessage] = useState('Take your time. There is no rush!');
  const [finished, setFinished] = useState(false);
  const current = LEARNING_ROUNDS[round];
  const directionKey = (['learningColor', 'learningShape', 'learningPattern'] as const)[round];
  const choices = useMemo(() => current.choices, [current]);

  const choose = (tile: Tile) => {
    if (tilesMatch(tile, current.answer)) {
      playMatch();
      onRoundComplete((['color', 'shape', 'pattern'] as const)[round]);
      if (round === LEARNING_ROUNDS.length - 1) {
        setFinished(true);
        setMessage('You did three wonderful learning games!');
        playComplete();
      } else {
        setMessage('You found it! Let’s try the next one.');
        setTimeout(() => { setRound((value) => value + 1); setMessage('Take your time. You can do it!'); }, 500);
      }
    } else {
      playError();
      setMessage('Nice try! Look at the color and shape one more time.');
    }
  };

  if (finished) return <div className="game-screen forest-bg flex items-center justify-center px-5"><div className="paper-card w-full max-w-sm p-6 text-center animate-pop-in" style={{ borderTop: '4px solid #F3C94A' }}><CritterAvatar type="squirrel" size={108} expression="excited" animate /><p className="font-body text-xs uppercase tracking-[.16em] text-[#A56C20] font-bold mt-2">Learning trail complete</p><h1 className="font-display text-2xl font-bold text-[#2D2418] mt-1">Rainbow Star!</h1><p className="font-display italic text-sm text-[#5C4D3C] mt-2">{message}</p><div className="text-4xl mt-3">🌈 ⭐ 🌈</div><button onClick={onBack} className="btn-coral mt-5 w-full">Back to camp</button><button onClick={() => { setRound(0); setFinished(false); setMessage('Take your time. There is no rush!'); }} className="mt-3 font-body text-sm text-[#5C4D3C] underline">Play again</button></div></div>;

  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-7"><header className="flex items-center justify-between pt-safe pt-4 pb-3"><div className="flex items-center gap-2"><CritterAvatar type="squirrel" size={48} expression="happy" /><div><p className="font-body text-[10px] uppercase tracking-[.14em] text-white/65">Camp Learning Trail</p><h1 className="font-display text-xl font-bold text-white">Colors, shapes & patterns</h1></div></div><button onClick={onBack} className="paper-card px-3 py-1.5 text-sm font-body text-[#2D2418] active:scale-95">Camp</button></header>
    {learningTheme !== 'all' && <p className="mx-auto mb-3 max-w-md rounded-full bg-white/15 px-3 py-1.5 text-center font-body text-[11px] text-white/90">{LEARNING_THEME_DETAILS[learningTheme].icon} Family focus: {LEARNING_THEME_DETAILS[learningTheme].label}</p>}
    <main className="mx-auto max-w-md"><div className="flex gap-1.5 justify-center mb-3">{LEARNING_ROUNDS.map((_, index) => <span key={index} className={`w-8 h-2 rounded-full ${index < round ? 'bg-[#F3C94A]' : index === round ? 'bg-[#E66B5B]' : 'bg-white/25'}`} />)}</div><section className="paper-card p-5 text-center" style={{ borderTop: '3px solid #E66B5B' }}><p className="font-body text-[10px] uppercase tracking-[.15em] text-[#E66B5B] font-bold">{current.title} · Game {round + 1} of 3</p><h2 className="font-display text-2xl text-[#2D2418] font-bold mt-2">{current.prompt}</h2><PreReaderDirection directionKey={directionKey} className="mt-4" />{current.sequence && <div className="mt-5 flex items-end justify-center gap-3"><>{current.sequence.map((tile, index) => <ShapeTile key={index} tile={tile} small />)}</><span className="font-display text-4xl text-[#5C4D3C]">?</span></div>}<p className="font-body text-xs text-[#5C4D3C] mt-4">{message}</p><div className="grid grid-cols-2 gap-3 mt-5">{choices.map((tile, index) => <button key={`${tile.color}-${tile.shape}-${index}`} onClick={() => choose(tile)} className="min-h-[108px] rounded-2xl flex items-center justify-center bg-[#FAF3E5] border-2 border-[#E2D2BA] active:scale-95 transition-transform" aria-label={`Choose ${tile.colorName} ${tile.shape}`}><ShapeTile tile={tile} /></button>)}</div></section><p className="font-body text-center text-xs text-white/65 mt-4">Tap the picture that matches the question. Grown-ups can play too!</p></main></div>;
}
