import React, { useState } from 'react';
import { playButton, playSnap } from '../game/sounds';

type BlockId = 'skyBase' | 'coralWall' | 'sunWindow' | 'mossRoof' | 'woodDoor' | 'lavenderFlower';
type Block = { id: BlockId; label: string; color: string; symbol: string };

const BLOCKS: readonly Block[] = [
  { id: 'skyBase', label: 'Sky base', color: '#62A7D9', symbol: '▰' },
  { id: 'coralWall', label: 'Coral wall', color: '#E98978', symbol: '■' },
  { id: 'sunWindow', label: 'Sun window', color: '#F5C842', symbol: '●' },
  { id: 'mossRoof', label: 'Moss roof', color: '#83A86A', symbol: '⌂' },
  { id: 'woodDoor', label: 'Wood door', color: '#B7825E', symbol: '▯' },
  { id: 'lavenderFlower', label: 'Lavender flower', color: '#A98BC5', symbol: '✦' },
];

const getBlock = (id: BlockId | null) => BLOCKS.find((block) => block.id === id) ?? null;

export default function CreativeBlockBuilderScreen({ onBack }: { onBack: () => void }) {
  const [selectedBlock, setSelectedBlock] = useState<BlockId>('skyBase');
  const [spaces, setSpaces] = useState<(BlockId | null)[]>(Array(9).fill(null));
  const [message, setMessage] = useState('Pick a block, then tap an open space. There is no wrong way to build.');

  const placeBlock = (index: number) => {
    if (spaces[index]) { setMessage('That space is already cozy. Try another open space, or clear the mat.'); return; }
    const block = getBlock(selectedBlock);
    if (!block) return;
    playSnap();
    setSpaces((current) => current.map((item, currentIndex) => currentIndex === index ? selectedBlock : item));
    setMessage(`${block.label} is on the play mat. What would you like to add next?`);
  };

  const clearMat = () => { playButton(); setSpaces(Array(9).fill(null)); setMessage('The play mat is clear. Pick any block and begin again.'); };

  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8">
    <header className="mx-auto flex w-full max-w-lg items-center justify-between pb-3 pt-[max(1rem,env(safe-area-inset-top))]"><div><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-white/70">Creative play</p><h1 className="font-display text-xl font-bold text-white">Cozy Block Studio</h1></div><button type="button" onClick={() => { playButton(); onBack(); }} className="paper-card min-h-11 px-3 py-1.5 font-body text-sm text-[#2D2418] active:scale-95">Back</button></header>
    <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-3">
      <section className="w-full rounded-2xl border border-[#C2D9A9] bg-[#FFF8E6] px-4 py-3 text-center shadow-md" aria-live="polite"><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#55734A]">Build your own cozy place</p><p className="mt-1 font-display text-base leading-snug text-[#49392C]">{message}</p></section>
      <section className="w-full rounded-[28px] border-2 border-[#C8A981] bg-[#F7EBD8] p-3 shadow-lg" aria-label="Creative building play mat"><div className="grid grid-cols-3 gap-2">{spaces.map((blockId, index) => { const block = getBlock(blockId); return <button key={index} type="button" onClick={() => placeBlock(index)} aria-label={block ? `${block.label} in build space ${index + 1}. Choose a different open space to add another block.` : `Open build space ${index + 1}. Place ${getBlock(selectedBlock)?.label}.`} className={`relative flex min-h-[74px] items-center justify-center rounded-2xl border-2 transition-transform active:scale-95 ${block ? 'border-[#B78E72] bg-[#FFF9EF]' : 'border-dashed border-[#C8A981] bg-white/65'}`}>{block ? <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-xl text-3xl text-white shadow-sm" style={{ background: block.color }}>{block.symbol}</span> : <span aria-hidden="true" className="font-display text-xl text-[#B78E72]">+</span>}</button>; })}</div></section>
      <section className="w-full" aria-labelledby="block-shelf-title"><div className="mb-2 flex items-center justify-between"><h2 id="block-shelf-title" className="font-display text-base font-bold text-white">Choose a big block</h2><span className="font-body text-[10px] font-bold text-white/85">Tap a block, then a space</span></div><div className="grid grid-cols-3 gap-2">{BLOCKS.map((block) => <button key={block.id} type="button" onClick={() => { playButton(); setSelectedBlock(block.id); setMessage(`${block.label} is ready. Tap an open space on the play mat.`); }} aria-pressed={selectedBlock === block.id} className={`min-h-[84px] rounded-2xl border-2 px-2 py-2 text-center shadow-md transition-transform active:scale-95 ${selectedBlock === block.id ? 'border-[#F5C842] bg-[#FFF8E6] ring-2 ring-[#F4DEB6]' : 'border-white/40 bg-white/90'}`}><span aria-hidden="true" className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-xl text-white shadow-sm" style={{ background: block.color }}>{block.symbol}</span><span className="mt-1 block font-body text-[10px] font-bold text-[#49392C]">{block.label}</span></button>)}</div></section>
      <button type="button" onClick={clearMat} className="min-h-11 rounded-xl border border-white/45 bg-white/15 px-4 py-2.5 font-body text-sm font-bold text-white active:scale-95">Clear play mat</button>
      <p className="max-w-sm text-center font-body text-xs text-white/90">Make a cottage, a bridge, a tower, or something brand new. There are no scores or wrong builds.</p>
    </main>
  </div>;
}
