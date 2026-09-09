import React, { useState } from 'react';
import { loadCreativeBlockBuilds, removeCreativeBlockBuild, saveCreativeBlockBuild, type CreativeBlockId, type SavedCreativeBlockBuild } from '../game/creativeBlockCreations';
import { CREATIVE_BLOCK_PROMPTS, getCreativeBlockPrompt, type CreativeBlockPrompt } from '../game/creativeBlockPrompts';
import { playButton, playSnap } from '../game/sounds';

type Block = { id: CreativeBlockId; label: string; color: string; symbol: string };

const BLOCKS: readonly Block[] = [
  { id: 'skyBase', label: 'Sky base', color: '#62A7D9', symbol: '▰' },
  { id: 'coralWall', label: 'Coral wall', color: '#E98978', symbol: '■' },
  { id: 'sunWindow', label: 'Sun window', color: '#F5C842', symbol: '●' },
  { id: 'mossRoof', label: 'Moss roof', color: '#83A86A', symbol: '⌂' },
  { id: 'woodDoor', label: 'Wood door', color: '#B7825E', symbol: '▯' },
  { id: 'lavenderFlower', label: 'Lavender flower', color: '#A98BC5', symbol: '✦' },
];

const getBlock = (id: CreativeBlockId | null) => BLOCKS.find((block) => block.id === id) ?? null;

export default function CreativeBlockBuilderScreen({ onBack }: { onBack: () => void }) {
  const [selectedBlock, setSelectedBlock] = useState<CreativeBlockId>('skyBase');
  const [selectedPromptId, setSelectedPromptId] = useState<CreativeBlockPrompt['id'] | null>(null);
  const [spaces, setSpaces] = useState<(CreativeBlockId | null)[]>(Array(9).fill(null));
  const [message, setMessage] = useState('Pick a block, then tap an open space. There is no wrong way to build.');
  const [creationName, setCreationName] = useState('');
  const [savedBuilds, setSavedBuilds] = useState<SavedCreativeBlockBuild[]>(loadCreativeBlockBuilds);

  const placeBlock = (index: number) => {
    if (spaces[index]) { setMessage('That space is already cozy. Try another open space, or clear the mat.'); return; }
    const block = getBlock(selectedBlock);
    if (!block) return;
    playSnap();
    setSpaces((current) => current.map((item, currentIndex) => currentIndex === index ? selectedBlock : item));
    setMessage(`${block.label} is on the play mat. What would you like to add next?`);
  };

  const clearMat = () => { playButton(); setSpaces(Array(9).fill(null)); setMessage('The play mat is clear. Pick any block and begin again.'); };
  const choosePrompt = (promptId: CreativeBlockPrompt['id']) => {
    const prompt = getCreativeBlockPrompt(promptId);
    if (!prompt) return;
    playButton();
    setSelectedPromptId(prompt.id);
    setMessage(`${prompt.prompt} You can use any blocks you like.`);
  };
  const chooseOwnIdea = () => { playButton(); setSelectedPromptId(null); setMessage('Your own idea is ready. Pick any block and make it your way.'); };
  const saveCreation = () => {
    playButton();
    const next = saveCreativeBlockBuild(creationName, spaces);
    setSavedBuilds(next);
    const saved = next[0];
    setCreationName('');
    setMessage(`${saved.name} is saved on this device. You can open it anytime from My creations.`);
  };
  const openCreation = (build: SavedCreativeBlockBuild) => {
    playButton();
    setSpaces(build.spaces);
    setMessage(`${build.name} is open on the play mat. You can keep building or make it your own.`);
  };
  const removeCreation = (build: SavedCreativeBlockBuild) => {
    playButton();
    setSavedBuilds(removeCreativeBlockBuild(build.id));
    setMessage(`${build.name} was removed from this device.`);
  };

  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8">
    <header className="mx-auto flex w-full max-w-lg items-center justify-between pb-3 pt-[max(1rem,env(safe-area-inset-top))]"><div><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-white/70">Creative play</p><h1 className="font-display text-xl font-bold text-white">Cozy Block Studio</h1></div><button type="button" onClick={() => { playButton(); onBack(); }} className="paper-card min-h-11 px-3 py-1.5 font-body text-sm text-[#2D2418] active:scale-95">Back</button></header>
    <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-3">
      <section className="w-full rounded-2xl border border-[#C2D9A9] bg-[#FFF8E6] px-4 py-3 text-center shadow-md" aria-live="polite"><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#55734A]">Build your own cozy place</p><p className="mt-1 font-display text-base leading-snug text-[#49392C]">{message}</p></section>
      <section className="w-full rounded-2xl border border-[#C7D8E8] bg-[#EEF7FB] px-3 py-3 shadow-sm" aria-labelledby="inspiration-title"><div className="flex items-center justify-between gap-2"><div><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#3B7699]">Optional idea cards</p><h2 id="inspiration-title" className="font-display text-base font-bold text-[#2D2418]">Need a build idea?</h2></div><button type="button" onClick={chooseOwnIdea} aria-pressed={selectedPromptId === null} className={`min-h-11 rounded-xl px-3 py-2 font-body text-xs font-bold active:scale-95 ${selectedPromptId === null ? 'bg-[#3D7A58] text-white' : 'border border-[#B8CFE0] bg-white text-[#315D76]'}`}>Build my own</button></div><p className="mt-1 font-body text-[11px] leading-snug text-[#4F5D65]">Tap a picture for an idea, or make anything you like.</p><div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1" aria-label="Optional build inspiration cards">{CREATIVE_BLOCK_PROMPTS.map((prompt) => <button key={prompt.id} type="button" onClick={() => choosePrompt(prompt.id)} aria-pressed={selectedPromptId === prompt.id} aria-label={`${prompt.title}. ${prompt.prompt}`} className={`w-32 shrink-0 snap-start overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm active:scale-95 ${selectedPromptId === prompt.id ? 'border-[#F5C842] ring-2 ring-[#F4DEB6]' : 'border-[#C7D8E8]'}`}><img src={prompt.image} alt="" className="h-20 w-full object-cover" /><span className="block px-2 pb-2 pt-1.5"><strong className="block font-display text-sm text-[#2D2418]">{prompt.title}</strong><span className="mt-0.5 block font-body text-[10px] leading-tight text-[#4F5D65]">{prompt.prompt}</span></span></button>)}</div></section>
      <section className="w-full rounded-[28px] border-2 border-[#C8A981] bg-[#F7EBD8] p-3 shadow-lg" aria-label="Creative building play mat"><div className="grid grid-cols-3 gap-2">{spaces.map((blockId, index) => { const block = getBlock(blockId); return <button key={index} type="button" onClick={() => placeBlock(index)} aria-label={block ? `${block.label} in build space ${index + 1}. Choose a different open space to add another block.` : `Open build space ${index + 1}. Place ${getBlock(selectedBlock)?.label}.`} className={`relative flex min-h-[74px] items-center justify-center rounded-2xl border-2 transition-transform active:scale-95 ${block ? 'border-[#B78E72] bg-[#FFF9EF]' : 'border-dashed border-[#C8A981] bg-white/65'}`}>{block ? <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-xl text-3xl text-white shadow-sm" style={{ background: block.color }}>{block.symbol}</span> : <span aria-hidden="true" className="font-display text-xl text-[#B78E72]">+</span>}</button>; })}</div></section>
      <section className="w-full" aria-labelledby="block-shelf-title"><div className="mb-2 flex items-center justify-between"><h2 id="block-shelf-title" className="font-display text-base font-bold text-white">Choose a big block</h2><span className="font-body text-[10px] font-bold text-white/85">Tap a block, then a space</span></div><div className="grid grid-cols-3 gap-2">{BLOCKS.map((block) => <button key={block.id} type="button" onClick={() => { playButton(); setSelectedBlock(block.id); setMessage(`${block.label} is ready. Tap an open space on the play mat.`); }} aria-pressed={selectedBlock === block.id} className={`min-h-[84px] rounded-2xl border-2 px-2 py-2 text-center shadow-md transition-transform active:scale-95 ${selectedBlock === block.id ? 'border-[#F5C842] bg-[#FFF8E6] ring-2 ring-[#F4DEB6]' : 'border-white/40 bg-white/90'}`}><span aria-hidden="true" className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-xl text-white shadow-sm" style={{ background: block.color }}>{block.symbol}</span><span className="mt-1 block font-body text-[10px] font-bold text-[#49392C]">{block.label}</span></button>)}</div></section>
      <section className="w-full rounded-2xl border border-[#D9C3A1] bg-[#FFF8E8] p-3 shadow-sm" aria-labelledby="save-build-title"><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#8C5A35]">On this device only</p><h2 id="save-build-title" className="font-display text-base font-bold text-[#2D2418]">Keep this creation</h2><p className="mt-1 font-body text-[11px] leading-snug text-[#5C4D3C]">Saved builds stay in this browser. Nothing is uploaded or shared.</p><label className="mt-3 block"><span className="sr-only">Name this build</span><input value={creationName} onChange={(event) => setCreationName(event.target.value)} maxLength={28} placeholder="Name this build (optional)" className="min-h-11 w-full rounded-xl border border-[#C8A981] bg-white px-3 font-body text-sm text-[#2D2418] placeholder:text-[#8B7968]" /></label><button type="button" onClick={saveCreation} className="mt-2 min-h-11 w-full rounded-xl bg-[#B85D47] px-3 py-2 font-display text-sm font-bold text-white active:scale-[.98]">Save this creation</button></section>
      <section className="w-full rounded-2xl border border-[#B8D0BD] bg-[#EDF6EF] p-3 shadow-sm" aria-labelledby="saved-builds-title"><div className="flex items-center justify-between"><div><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#3D7A58]">Local shelf</p><h2 id="saved-builds-title" className="font-display text-base font-bold text-[#2D2418]">My creations</h2></div><span className="rounded-full bg-white px-2 py-1 font-body text-[10px] font-bold text-[#3D7A58]">{savedBuilds.length} saved</span></div>{savedBuilds.length === 0 ? <p className="mt-2 font-body text-xs text-[#5C4D3C]">Save a creation to keep it here on this device.</p> : <div className="mt-3 space-y-2">{savedBuilds.map((build) => <article key={build.id} className="flex items-center gap-2 rounded-xl border border-[#C9DDCD] bg-white p-2"><div aria-hidden="true" className="grid h-12 w-12 shrink-0 grid-cols-3 gap-0.5 rounded-lg bg-[#F7EBD8] p-1">{build.spaces.map((blockId, index) => <span key={index} className="rounded-sm" style={{ background: getBlock(blockId)?.color ?? '#FFF9EF' }} />)}</div><div className="min-w-0 flex-1"><h3 className="truncate font-display text-sm font-bold text-[#2D2418]">{build.name}</h3><p className="font-body text-[10px] text-[#5C4D3C]">Saved only on this device</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => openCreation(build)} className="min-h-10 rounded-lg bg-[#3D7A58] px-2.5 font-body text-[11px] font-bold text-white active:scale-95" aria-label={`Open ${build.name}`}>Open</button><button type="button" onClick={() => removeCreation(build)} className="min-h-10 rounded-lg border border-[#C99281] bg-[#FFF7F4] px-2.5 font-body text-[11px] font-bold text-[#874134] active:scale-95" aria-label={`Remove ${build.name}`}>Remove</button></div></article>)}</div>}</section>
      <button type="button" onClick={clearMat} className="min-h-11 rounded-xl border border-white/45 bg-white/15 px-4 py-2.5 font-body text-sm font-bold text-white active:scale-95">Clear play mat</button>
      <p className="max-w-sm text-center font-body text-xs text-white/90">Make a cottage, a bridge, a tower, or something brand new. There are no scores or wrong builds.</p>
    </main>
  </div>;
}
