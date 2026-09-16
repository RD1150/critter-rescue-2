import React, { useState } from 'react';
import { playButton, playComplete, playError, playMatch } from '../game/sounds';

interface Props {
  onClose: () => void;
  critterName: string;
  critterEmoji: string;
  reduceMotion?: boolean;
}

export type CarePairCard = {
  id: string;
  pairId: string;
  icon: string;
  label: string;
  tone: string;
};

export const CARE_PAIR_CARDS: readonly CarePairCard[] = [
  { id: 'apple-1', pairId: 'apple', icon: '🍎', label: 'Apple', tone: 'bg-[#F9D7CE]' },
  { id: 'apple-2', pairId: 'apple', icon: '🍎', label: 'Apple', tone: 'bg-[#F9D7CE]' },
  { id: 'water-1', pairId: 'water', icon: '💧', label: 'Water drop', tone: 'bg-[#D8EDF2]' },
  { id: 'water-2', pairId: 'water', icon: '💧', label: 'Water drop', tone: 'bg-[#D8EDF2]' },
  { id: 'leaf-1', pairId: 'leaf', icon: '🌿', label: 'Leaf', tone: 'bg-[#DCEAD0]' },
  { id: 'leaf-2', pairId: 'leaf', icon: '🌿', label: 'Leaf', tone: 'bg-[#DCEAD0]' },
  { id: 'heart-1', pairId: 'heart', icon: '💗', label: 'Heart', tone: 'bg-[#F9D9E3]' },
  { id: 'heart-2', pairId: 'heart', icon: '💗', label: 'Heart', tone: 'bg-[#F9D9E3]' },
];

function cardState(card: CarePairCard, selectedId: string | null, matchedIds: readonly string[]) {
  if (matchedIds.includes(card.id)) return 'together';
  if (selectedId === card.id) return 'chosen';
  return 'ready';
}

/**
 * Kept at the legacy route so old camp callbacks remain compatible. It is now
 * a local, no-score picture-pair activity with no external game-engine script.
 */
export default function Match3Screen({ onClose, critterName, critterEmoji, reduceMotion = false }: Props) {
  const celebrationPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('carePairsCelebration') === '1';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>(() => celebrationPreview ? CARE_PAIR_CARDS.map((card) => card.id) : []);
  const [message, setMessage] = useState(celebrationPreview ? 'All the care pairs are together. You made a kind picture garden!' : 'Choose two pictures that belong together.');

  const selected = CARE_PAIR_CARDS.find((card) => card.id === selectedId) ?? null;
  const complete = matchedIds.length === CARE_PAIR_CARDS.length;

  const chooseCard = (card: CarePairCard) => {
    if (complete || matchedIds.includes(card.id)) return;

    if (!selected) {
      playButton();
      setSelectedId(card.id);
      setMessage(`You chose ${card.label}. Now find its friend.`);
      return;
    }

    if (selected.id === card.id) {
      playButton();
      setSelectedId(null);
      setMessage('That picture can rest for a moment. Choose two pictures that belong together.');
      return;
    }

    if (selected.pairId === card.pairId) {
      const nextMatched = [...matchedIds, selected.id, card.id];
      playMatch();
      setMatchedIds(nextMatched);
      setSelectedId(null);
      if (nextMatched.length === CARE_PAIR_CARDS.length) {
        playComplete();
        setMessage('All the care pairs are together. You made a kind picture garden!');
      } else {
        setMessage(`${selected.label} pictures are together. Choose another pair when you are ready.`);
      }
      return;
    }

    playError();
    setSelectedId(null);
    setMessage('Those pictures are different. That is okay—try two other pictures.');
  };

  const startAgain = () => {
    playButton();
    setSelectedId(null);
    setMatchedIds([]);
    setMessage('Choose two pictures that belong together.');
  };

  return (
    <main className="game-screen overflow-y-auto bg-[#F6E9D6] px-4 py-7 text-[#3A271B] sm:px-8" aria-label="Care Pair Picnic">
      <section className="relative mx-auto flex w-full max-w-2xl flex-col items-center overflow-hidden rounded-[2rem] border-2 border-[#D9C3A4] bg-[#FFF9F0] p-5 shadow-[0_12px_0_rgba(121,82,50,0.12)] sm:p-8">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="rounded-full bg-[#F9D9B4] p-3 text-3xl shadow-sm">{critterEmoji}</span>
            <div className="min-w-0">
              <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-[#77533A]">Calm picture play</p>
              <h1 className="font-display text-xl font-bold leading-tight text-[#3A271B] sm:text-3xl">Care Pair Picnic</h1>
            </div>
          </div>
          <button onClick={() => { playButton(); onClose(); }} className="min-h-11 rounded-xl border border-[#B89576] bg-white px-3 font-body text-sm font-bold text-[#5A3D2B] shadow-sm focus:outline-none focus:ring-4 focus:ring-[#F3C587]">
            Back
          </button>
        </div>

        <p className="mt-5 w-full rounded-2xl bg-[#E6F0D7] px-4 py-3 text-center font-body text-base font-semibold text-[#36512D]" aria-live="polite">
          {message}
        </p>

        <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Picture cards">
          {CARE_PAIR_CARDS.map((card) => {
            const state = cardState(card, selectedId, matchedIds);
            const together = state === 'together';
            const chosen = state === 'chosen';
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => chooseCard(card)}
                disabled={together || complete}
                aria-label={`${card.label} picture, ${state}`}
                className={`min-h-28 rounded-3xl border-2 p-4 text-center shadow-sm transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-[#F3C587] active:scale-[0.97] ${card.tone} ${together ? 'border-[#79A96B] opacity-75' : chosen ? 'border-[#D77B5F] ring-2 ring-[#F3C587]' : 'border-[#CDAF8D] hover:-translate-y-0.5'}`}
              >
                <span aria-hidden="true" className="block text-5xl leading-none">{card.icon}</span>
                <span className="mt-2 block font-body text-sm font-bold text-[#5A3D2B]">{together ? 'Together' : 'Tap me'}</span>
              </button>
            );
          })}
        </div>

        {complete && (
          <div className="mt-6 w-full">
            <div
              aria-label="A gentle picture-garden celebration"
              className={`care-pair-celebration ${reduceMotion ? 'care-pair-celebration--still' : 'care-pair-celebration--animated'}`}
              data-testid="care-pair-celebration"
              role="status"
            >
              <div aria-hidden="true" className="care-pair-celebration-sprigs">
                {['✦', '❀', '✦', '❀', '✦'].map((mark, index) => (
                  <span key={`${mark}-${index}`} className="care-pair-celebration-sprig" style={{ '--sprig-delay': `${index * 100}ms`, '--sprig-x': `${(index - 2) * 44}px` } as React.CSSProperties}>{mark}</span>
                ))}
              </div>
              <span aria-hidden="true" className="relative z-10 text-3xl">🌼</span>
              <div className="relative z-10">
                <p className="font-display text-lg font-bold text-[#3A6A39]">A little picture garden is blooming!</p>
                <p className="mt-1 font-body text-sm text-[#537145]">You found every caring pair.</p>
              </div>
            </div>
            <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={startAgain} className="btn-coral min-h-12 px-6 text-base shadow-lg">Play with the pictures again</button>
              <button onClick={() => { playButton(); onClose(); }} className="btn-parchment min-h-12 px-6 text-base shadow-lg">Back to Camp</button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center font-body text-sm text-[#77533A]">{critterName} is glad you are looking carefully and kindly.</p>
      </section>
    </main>
  );
}
