// Hearthlight Field Journal — care loop screen layered around a 3D toy-room nursery.
import React, { useCallback, useMemo, useState } from 'react';
import BabylonNurseryScene from '../components/BabylonNurseryScene';
import CritterAvatar from '../components/CritterAvatar';
import { CritterData, CritterType } from '../game/data';
import { NurseryGraduate } from '../game/store';
import { playButton, playChime, playComplete } from '../game/sounds';

type NurseryFriend = CritterData & { careKey: string; isCompanion?: boolean };

const COMPANION_DETAILS: Record<CritterType, Pick<CritterData, 'name' | 'emoji' | 'personality' | 'thanksLine' | 'secondLine' | 'encourageLine' | 'stuckLine' | 'type'>> = {
  bunny: { name: 'Clover', emoji: '🐰', personality: 'gentle and curious', thanksLine: '"I feel so cozy now!"', secondLine: '"Thank you for looking after me."', encourageLine: '"A kind heart makes the best home."', stuckLine: '"We can take it slow."', type: 'bunny' },
  fox: { name: 'Ember', emoji: '🦊', personality: 'clever and bold', thanksLine: '"This is the coziest corner in the forest!"', secondLine: '"You always know how to help."', encourageLine: '"Let’s make this nursery shine!"', stuckLine: '"A little care goes a long way."', type: 'fox' },
  owl: { name: 'Sage', emoji: '🦉', personality: 'wise and calm', thanksLine: '"The moonlight feels safe here."', secondLine: '"Your kindness is a quiet magic."', encourageLine: '"Every gentle action matters."', stuckLine: '"We can listen for the next step."', type: 'owl' },
  squirrel: { name: 'Nutty', emoji: '🐿️', personality: 'shy but brave', thanksLine: '"I saved a little acorn for you!"', secondLine: '"This cozy place feels like home."', encourageLine: '"We make a good rescue team!"', stuckLine: '"I believe in you."', type: 'squirrel' },
  hedgehog: { name: 'Shadow', emoji: '🦔', personality: 'quiet and gentle', thanksLine: '"I feel safe enough to uncurl."', secondLine: '"Thank you for being patient."', encourageLine: '"Gentle is strong."', stuckLine: '"No rush. I am right here."', type: 'hedgehog' },
  bear: { name: 'Summit', emoji: '🐻', personality: 'big-hearted and gentle', thanksLine: '"What a warm place to rest."', secondLine: '"You have a mighty kind heart."', encourageLine: '"Small care makes a big difference."', stuckLine: '"We can try together."', type: 'bear' },
  bird: { name: 'Pip', emoji: '🐦', personality: 'cheerful and tiny', thanksLine: '"My feathers feel fluffy again!"', secondLine: '"You are such a good friend."', encourageLine: '"Chirp chirp — wonderful!"', stuckLine: '"I know you can do it."', type: 'bird' },
  ladybug: { name: 'Daisy', emoji: '🐛', personality: 'curious and small', thanksLine: '"I am ready to explore again!"', secondLine: '"This nursery is so soft."', encourageLine: '"Look at us go!"', stuckLine: '"One small step is enough."', type: 'ladybug' },
  frog: { name: 'Clover', emoji: '🐸', personality: 'giggly and warm', thanksLine: '"Ribbit! I feel refreshed!"', secondLine: '"You are my favorite helper."', encourageLine: '"Let’s make a splash of kindness!"', stuckLine: '"Deep breath, little friend."', type: 'frog' },
  otter: { name: 'Splash', emoji: '🦦', personality: 'playful and loyal', thanksLine: '"I cannot wait to play in camp!"', secondLine: '"Thank you, thank you!"', encourageLine: '"You are doing brilliantly!"', stuckLine: '"We will figure it out."', type: 'otter' },
  turtle: { name: 'Brook', emoji: '🐢', personality: 'wise and patient', thanksLine: '"I feel steady and strong again."', secondLine: '"Care is worth taking slowly."', encourageLine: '"One kind step at a time."', stuckLine: '"There is no need to hurry."', type: 'turtle' },
  fish: { name: 'Finn', emoji: '🐟', personality: 'sparkly and quick', thanksLine: '"The nursery makes me shimmer!"', secondLine: '"You are the best friend ever."', encourageLine: '"Let’s keep glowing!"', stuckLine: '"Try a different ripple."', type: 'fish' },
  duck: { name: 'Reed', emoji: '🦆', personality: 'motherly and warm', thanksLine: '"My little ones will love this story."', secondLine: '"Thank you for your warm care."', encourageLine: '"You are doing beautifully."', stuckLine: '"You can do this."', type: 'duck' },
  snail: { name: 'Mossy', emoji: '🐌', personality: 'slow and thoughtful', thanksLine: '"This is the perfect resting place."', secondLine: '"Thank you for going gently."', encourageLine: '"Slow and steady care!"', stuckLine: '"No rush — we have time."', type: 'snail' },
  lizard: { name: 'Ember', emoji: '🦎', personality: 'curious and bold', thanksLine: '"I am warm and ready!"', secondLine: '"You made a clever little home."', encourageLine: '"You are so brave!"', stuckLine: '"A fresh idea will help."', type: 'lizard' },
  bee: { name: 'Thistle', emoji: '🐝', personality: 'busy and grateful', thanksLine: '"Buzz buzz — I am recharged!"', secondLine: '"The hive will be so glad."', encourageLine: '"A little more care!"', stuckLine: '"Take a tiny pause."', type: 'bee' },
  eagle: { name: 'Rocky', emoji: '🦅', personality: 'proud and kind', thanksLine: '"My wings feel strong again."', secondLine: '"You helped me soar."', encourageLine: '"You can do it!"', stuckLine: '"Keep your eyes on the trail."', type: 'eagle' },
  goat: { name: 'Pebble', emoji: '🐐', personality: 'stubborn and sweet', thanksLine: '"I am ready for the trail!"', secondLine: '"You made the path feel safe."', encourageLine: '"One step at a time!"', stuckLine: '"We will get there."', type: 'goat' },
  beaver: { name: 'Flint', emoji: '🦫', personality: 'hardworking and humble', thanksLine: '"I feel fit to build again."', secondLine: '"Thanks for helping me rest."', encourageLine: '"We are making progress!"', stuckLine: '"Keep building gently."', type: 'beaver' },
};

interface Props {
  companionType: CritterType;
  rescuedCritters: CritterData[];
  nurseryCare: Record<string, number>;
  onCare: (careKey: string, graduate: NurseryGraduate) => { careLevel: number; graduated: boolean } | null;
  onBack: () => void;
  reduceMotion: boolean;
}

export default function NurseryScreen({ companionType, rescuedCritters, nurseryCare, onCare, onBack, reduceMotion }: Props) {
  const companions = useMemo<NurseryFriend[]>(() => {
    const companion = COMPANION_DETAILS[companionType];
    return [{ ...companion, introLine: `Hi! I’m ${companion.name}.`, helpLine: companion.stuckLine, careKey: `companion-${companionType}`, isCompanion: true }];
  }, [companionType]);
  const friends = useMemo<NurseryFriend[]>(() => rescuedCritters.map((critter, index) => ({ ...critter, careKey: `rescued-${critter.name}-${index}` })), [rescuedCritters]);
  const careFriends = useMemo(() => [...companions, ...friends], [companions, friends]);
  const [selectedKey, setSelectedKey] = useState(() => careFriends[0]?.careKey ?? `companion-${companionType}`);
  const [carePulse, setCarePulse] = useState(0);
  const [careAction, setCareAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [graduate, setGraduate] = useState<NurseryFriend | null>(null);
  const selected = careFriends.find((friend) => friend.careKey === selectedKey) ?? careFriends[0];
  const careLevel = selected ? (nurseryCare[selected.careKey] ?? 0) : 0;

  const interact = useCallback((action: string) => {
    if (!selected || careLevel >= 3) return;
    playButton();
    const outcome = onCare(selected.careKey, { careKey: selected.careKey, name: selected.name, type: selected.type });
    if (!outcome) return;
    setCarePulse((value) => value + 1);
    setCareAction(action);
    if (outcome.graduated) {
      playComplete();
      const nextMessage = `${selected.name} is ready for camp!`;
      setMessage(nextMessage);
      setTimeout(() => setGraduate(selected), 850);
    } else {
      playChime();
      const nextMessage = action === 'Feed' ? `${selected.name} enjoyed a tiny snack.` : action === 'Groom' ? `${selected.name} feels soft and cared for.` : `${selected.name} loved that cozy story.`;
      setMessage(nextMessage);
    }
    setTimeout(() => setCareAction(null), 1600);
    setTimeout(() => setMessage(null), 3200);
  }, [careLevel, onCare, selected]);

  if (!selected) return null;
  const actionCards = [
    { id: 'Feed', icon: '🍓', copy: 'Share a berry' },
    { id: 'Groom', icon: '🪮', copy: 'Brush softly' },
    { id: 'Read', icon: '📖', copy: 'Read a story' },
  ];

  return (
    <div className="game-screen overflow-hidden bg-[#2A1B26]">
      <BabylonNurseryScene type={selected.type} name={selected.name} careLevel={careLevel} carePulse={carePulse} careAction={careAction} reduceMotion={reduceMotion} onPlushClick={() => { const line = selected.encourageLine.replaceAll('"', ''); setMessage(line); }} />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(46,26,38,.24), transparent 32%, transparent 66%, rgba(46,26,38,.55))' }} />

      <header className="absolute z-20 top-0 left-0 right-0 px-3 pt-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'oklch(0.97 0.02 80 / .94)', border: '1.5px solid oklch(0.85 0.03 75)', borderTop: '3px solid #E66B5B', boxShadow: '0 4px 16px oklch(0 0 0 / .18)' }}>
          <img src="/manus-storage/game-logo_a4abbdba.png" alt="" className="w-7 h-7" />
          <div className="flex-1 min-w-0"><p className="font-display font-bold text-[#2D2418] leading-none">The Cozy Nursery</p><p className="font-body text-[10px] text-[#5C4D3C] mt-0.5">A soft pause between adventures</p></div>
          <button onClick={() => { playButton(); onBack(); }} className="btn-parchment text-xs px-3 py-1.5">Camp</button>
        </div>
      </header>

      {message && <div className="absolute z-30 top-[82px] left-1/2 -translate-x-1/2 w-[min(320px,86vw)] animate-pop-in pointer-events-none"><div className="paper-card px-4 py-3 text-center shadow-xl"><p className="font-display italic text-[#2D2418] text-sm">{message}</p></div></div>}

      {graduate && <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-[#2A1B26]/55"><div className="relative paper-card w-full max-w-sm px-6 py-7 text-center overflow-hidden animate-pop-in" style={{ borderTop: '4px solid #E66B5B' }}>
        {Array.from({ length: 16 }).map((_, index) => <span key={index} className="absolute text-lg pointer-events-none" style={{ left: `${5 + (index * 23) % 90}%`, top: `${4 + (index * 17) % 54}%`, animation: `leaf-fall ${2 + (index % 3)}s ${index * 0.08}s linear infinite` }}>{index % 3 === 0 ? '🌼' : index % 3 === 1 ? '✨' : '🍃'}</span>)}
        <CritterAvatar type={graduate.type} size={112} expression="excited" animate />
        <p className="font-body text-xs uppercase tracking-[.14em] text-[#E66B5B] font-bold mt-2">Nursery Graduation</p>
        <h2 className="font-display text-2xl font-bold text-[#2D2418] mt-1">{graduate.name} is ready for camp!</h2>
        <p className="font-display italic text-[#5C4D3C] text-sm mt-2">“A cozy heart makes a brave explorer.”</p>
        <button onClick={() => { playButton(); onBack(); }} className="btn-coral mt-5 w-full">Welcome them to camp</button>
      </div></div>}

      <section className="absolute z-20 left-3 right-3 bottom-3 pointer-events-none flex flex-col gap-2">
        <div className="pointer-events-auto self-center rounded-2xl px-4 py-2 text-center" style={{ background: 'oklch(0.97 0.02 80 / .94)', border: '1px solid oklch(0.85 0.03 75)', boxShadow: '0 3px 12px oklch(0 0 0 / .2)' }}>
          <p className="font-display text-[#2D2418] font-bold leading-none">{selected.name}’s Cozy Care</p>
          <div className="flex justify-center gap-1 mt-1.5">{[0, 1, 2].map((index) => <span key={index} className={index < careLevel ? 'text-[#E66B5B]' : 'text-[#D7C7B2]'}>♥</span>)}</div>
        </div>
        <div className="pointer-events-auto flex gap-2 justify-center">
          {actionCards.map((action) => <button key={action.id} disabled={careLevel >= 3} onClick={() => interact(action.id)} className="rounded-2xl min-w-[94px] px-3 py-2.5 text-center transition-transform active:scale-95 disabled:opacity-55" style={{ background: action.id === 'Feed' ? '#F6D8CD' : action.id === 'Groom' ? '#DDEBD5' : '#D8E7F4', border: '1px solid rgba(95,67,48,.2)', boxShadow: '0 3px 10px rgba(0,0,0,.18)' }}><span className="block text-lg">{action.icon}</span><span className="font-body text-[10px] font-bold text-[#4A3022]">{action.copy}</span></button>)}
        </div>
      </section>

      <aside className="absolute z-20 top-[120px] right-3 pointer-events-auto w-[118px] max-h-[calc(100vh-310px)] overflow-y-auto rounded-2xl p-2" style={{ background: 'oklch(0.95 0.02 75 / .92)', border: '1px dashed oklch(0.62 0.05 70)', boxShadow: '0 4px 14px rgba(0,0,0,.16)' }}>
        <p className="font-body text-[8px] uppercase tracking-[.12em] text-[#E66B5B] font-bold text-center mb-1.5">Care List</p>
        <div className="flex flex-col gap-1">
          {careFriends.map((friend) => { const level = nurseryCare[friend.careKey] ?? 0; return <button key={friend.careKey} onClick={() => { playButton(); setSelectedKey(friend.careKey); setMessage(null); }} className={`flex items-center gap-1 rounded-xl px-1.5 py-1 text-left ${selectedKey === friend.careKey ? 'bg-[#E66B5B]/15 ring-1 ring-[#E66B5B]/60' : 'hover:bg-white/50'}`}><CritterAvatar type={friend.type} size={26} /><span className="min-w-0 flex-1"><span className="block truncate font-display text-[10px] text-[#2D2418]">{friend.name}</span><span className="block text-[8px] text-[#E66B5B]">{'♥'.repeat(level)}{'·'.repeat(3 - level)}</span></span></button>; })}
        </div>
      </aside>
    </div>
  );
}
