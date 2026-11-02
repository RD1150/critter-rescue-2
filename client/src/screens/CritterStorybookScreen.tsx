import React, { useMemo, useState } from 'react';
import CritterAvatar from '../components/CritterAvatar';
import PrintableAdoptionCard from '../components/PrintableAdoptionCard';
import type { CritterData, CritterType } from '../game/data';
import type { HomeDecoration, SanctuarySeason } from '../game/store';
import { playButton, playComplete } from '../game/sounds';
import { getSeasonalStoryPage } from '../game/seasonalStoryPages';
import { FLAGSHIP_STORIES, type FlagshipStoryId } from '../game/flagshipStories';

type Tab = 'memories' | 'homes' | 'together' | 'season' | 'adoption';

const DECORATIONS: Array<{ key: HomeDecoration; icon: string; title: string; note: string }> = [
  { key: 'petal-garland', icon: '🌸', title: 'Petal garland', note: 'A tiny welcome string above the doorway.' },
  { key: 'cloud-pillow', icon: '☁️', title: 'Cloud pillow', note: 'A soft little rest spot beside the home.' },
  { key: 'acorn-lantern', icon: '🏮', title: 'Acorn lantern', note: 'A warm glow for a cozy night.' },
  { key: 'starglow-mobile', icon: '🌟', title: 'Starglow mobile', note: 'Three gentle stars to twinkle above the home.' },
  { key: 'mossy-reading-nook', icon: '📚', title: 'Mossy reading nook', note: 'A little green mat and a tiny storybook.' },
  { key: 'tea-time-picnic', icon: '🫖', title: 'Tiny tea picnic', note: 'A very small make-believe tea party outside.' },
];

const TOGETHER_MOMENTS = [
  { icon: '👀', title: 'Spot three cozy things', note: 'Together, point to three things in the sanctuary that look soft, warm, or safe.' },
  { icon: '🖐️', title: 'Make a tiny kindness plan', note: 'Choose one kind action for a critter today: a hello, a gentle pet, or a snack.' },
  { icon: '🎵', title: 'Listen for a calm sound', note: 'Sit together for ten quiet seconds. What gentle sound can you hear around you?' },
  { icon: '🌈', title: 'Find a color match', note: 'Pick a color on screen, then find the same color somewhere nearby in your room.' },
] as const;

interface Props {
  rescuedCritters: CritterData[];
  homeDecor: Record<string, HomeDecoration>;
  season: SanctuarySeason;
  seasonalKeepsakes: SanctuarySeason[];
  selectedBestieType: CritterType;
  completedFlagshipStories: FlagshipStoryId[];
  onChooseDecor: (critter: CritterData, decor: HomeDecoration) => void;
  onCelebrateSeason: () => void;
  onBack: () => void;
}

export default function CritterStorybookScreen({
  rescuedCritters,
  homeDecor,
  season,
  seasonalKeepsakes,
  selectedBestieType,
  completedFlagshipStories,
  onChooseDecor,
  onCelebrateSeason,
  onBack,
}: Props) {
  const [tab, setTab] = useState<Tab>('memories');
  const [selectedId, setSelectedId] = useState<string | null>(rescuedCritters[0]?.id ?? null);
  const [togetherIndex, setTogetherIndex] = useState(0);
  const uniqueFriends = useMemo(
    () => rescuedCritters.filter((friend, index, list) => list.findIndex((candidate) => candidate.id === friend.id) === index),
    [rescuedCritters],
  );
  const selectedFriend = uniqueFriends.find((friend) => friend.id === selectedId) ?? uniqueFriends[0];
  const completedStories = FLAGSHIP_STORIES.filter((story) => completedFlagshipStories.includes(story.id));
  const seasonPage = getSeasonalStoryPage(season);
  const seasonalRemembered = seasonalKeepsakes.includes(season);
  const moment = TOGETHER_MOMENTS[togetherIndex];
  const tabs: Array<{ key: Tab; icon: string; label: string }> = [
    { key: 'memories', icon: '📖', label: 'Bestie Book' },
    { key: 'homes', icon: '🏡', label: 'Cozy homes' },
    { key: 'together', icon: '🤝', label: 'Together' },
    { key: 'season', icon: seasonPage.icon, label: 'Season' },
    { key: 'adoption', icon: '🧸', label: 'Keepsake' },
  ];
  const choose = (decor: HomeDecoration) => {
    if (!selectedFriend) return;
    playComplete();
    onChooseDecor(selectedFriend, decor);
  };

  return (
    <div className="game-screen forest-bg overflow-y-auto px-4 pb-8">
      <header className="relative z-10 mt-4 flex shrink-0 items-center justify-between pb-6" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F8E8D8] text-2xl shadow-lg">📚</div>
          <div>
            <p className="font-body text-[10px] uppercase tracking-[.14em] text-white/65">Our little adventures</p>
            <h1 className="font-display text-xl font-bold text-white">Bestie Book</h1>
          </div>
        </div>
        <button onClick={() => { playButton(); onBack(); }} className="paper-card px-3 py-1.5 text-sm font-body text-[#2D2418] active:scale-95">Back to camp</button>
      </header>

      <main className="mx-auto w-full max-w-md space-y-3">
        <section className="paper-card relative overflow-hidden p-4" style={{ borderTop: '3px solid #B69DE8' }}>
          <div className="absolute right-3 top-3 opacity-75"><CritterAvatar type={selectedBestieType} size={48} expression="happy" /></div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#75619C]">Your Bestie Book</p>
          <h2 className="font-display mt-1 pr-14 text-lg font-bold text-[#2D2418]">A quiet place for happy memories</h2>
          <p className="mt-1 pr-12 font-body text-xs text-[#5C4D3C]">Every rescue story stays here, along with the little change it made in your sanctuary.</p>
        </section>

        <nav aria-label="Bestie Book pages" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {tabs.map(({ key, icon, label }) => (
            <button key={key} onClick={() => { playButton(); setTab(key); }} className={`rounded-xl px-2 py-2.5 font-body text-xs font-bold ${tab === key ? 'bg-[#E66B5B] text-white' : 'bg-[#F8E8D8] text-[#4A3022]'}`}>{icon} {label}</button>
          ))}
        </nav>

        {tab === 'memories' && (
          completedStories.length === 0 ? (
            <section className="paper-card p-6 text-center" style={{ borderTop: '3px solid #F5C842' }}>
              <div className="text-4xl">🌼</div>
              <h2 className="font-display mt-2 text-lg font-bold text-[#2D2418]">Your first page is waiting</h2>
              <p className="mt-1 font-body text-sm text-[#5C4D3C]">Help Pip find a flower path, then come back to remember it with your Bestie.</p>
            </section>
          ) : (
            <section className="space-y-3" aria-label="Bestie story memories">
              {completedStories.map((story) => (
                <article key={story.id} className="paper-card relative overflow-hidden p-4" style={{ borderTop: '3px solid #F5C842' }}>
                  <div className="absolute right-4 top-3 text-3xl opacity-70">{story.icon}</div>
                  <div className="flex items-center gap-2 pr-9"><CritterAvatar type={selectedBestieType} size={42} expression="happy" /><span className="text-[#A56C20]">♥</span><CritterAvatar type={story.friend.type} size={48} expression="grateful" /></div>
                  <p className="mt-2 font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#A56C20]">{story.eyebrow}</p>
                  <h2 className="font-display mt-1 text-xl font-bold text-[#2D2418]">{story.title}</h2>
                  <p className="mt-2 font-display text-sm italic leading-relaxed text-[#5C4D3C]">“{story.memoryLine}”</p>
                  <div className="mt-3 rounded-2xl bg-[#E2EEDB] px-3 py-2.5"><p className="font-body text-[10px] font-bold uppercase tracking-[.12em] text-[#4D7A49]">Still in the sanctuary</p><p className="mt-1 font-body text-xs text-[#394E35]">You can visit {story.landmark} whenever you return to camp.</p></div>
                </article>
              ))}
              {completedStories.length < FLAGSHIP_STORIES.length && <p className="px-3 text-center font-body text-xs text-white/85">Another gentle adventure will be ready when you want it.</p>}
            </section>
          )
        )}

        {tab === 'homes' && (
          selectedFriend ? <section className="paper-card p-4"><div className="flex items-center gap-3"><CritterAvatar type={selectedFriend.type} size={54} expression="happy" /><div><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#A85C41]">Cozy choice</p><h2 className="font-display text-lg font-bold text-[#2D2418]">{selectedFriend.name}’s home</h2><p className="font-body text-xs text-[#5C4D3C]">Choose one sweet detail. You can change it anytime.</p></div></div><div className="mt-4 flex gap-2 overflow-x-auto pb-1">{uniqueFriends.map((friend) => <button key={friend.id} onClick={() => { playButton(); setSelectedId(friend.id); }} className={`shrink-0 rounded-xl px-2 py-1.5 ${friend.id === selectedFriend.id ? 'bg-[#F7E6B8] ring-2 ring-[#E66B5B]' : 'bg-[#FAF3E5]'}`} aria-label={`Choose ${friend.name}'s home`}><CritterAvatar type={friend.type} size={30} expression="happy" /></button>)}</div><div className="mt-4 grid grid-cols-1 gap-2">{DECORATIONS.map((decor) => <button key={decor.key} onClick={() => choose(decor.key)} className={`w-full rounded-2xl px-3 py-3 text-left active:scale-[.98] ${homeDecor[selectedFriend.id] === decor.key ? 'bg-[#F7E6B8] ring-2 ring-[#E66B5B]' : 'bg-[#FAF3E5]'}`} style={{ border: '1px solid #E2D2BA' }}><span className="mr-3 text-2xl">{decor.icon}</span><span className="font-display text-sm font-bold text-[#2D2418]">{decor.title}</span><span className="ml-2 font-body text-xs text-[#5C4D3C]">{decor.note}</span></button>)}</div></section> : <section className="paper-card p-6 text-center"><div className="text-4xl">🏡</div><h2 className="font-display mt-2 text-lg font-bold text-[#2D2418]">A cozy home is waiting</h2><p className="mt-1 font-body text-sm text-[#5C4D3C]">Rescue a friend to make a little home together.</p></section>
        )}

        {tab === 'together' && <section className="paper-card p-5 text-center" style={{ borderTop: '3px solid #B69DE8' }}><div className="text-4xl">{moment.icon}</div><p className="mt-2 font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#75619C]">A two-minute together moment</p><h2 className="font-display mt-1 text-xl font-bold text-[#2D2418]">{moment.title}</h2><p className="mt-3 font-display text-sm italic leading-relaxed text-[#5C4D3C]">{moment.note}</p><p className="mt-4 font-body text-xs text-[#5C4D3C]">There is nothing to win. The best part is doing it together.</p><button onClick={() => { playButton(); setTogetherIndex((index) => (index + 1) % TOGETHER_MOMENTS.length); }} className="btn-coral mt-4 w-full">Choose another small moment</button></section>}

        {tab === 'season' && <section className="paper-card relative overflow-hidden p-5" style={{ borderTop: '3px solid #6377A8' }}><div className="absolute right-3 top-2 text-4xl opacity-40">{seasonPage.icon}</div><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#6377A8]">{seasonPage.eyebrow}</p><h2 className="font-display mt-1 pr-10 text-xl font-bold text-[#2D2418]">{seasonPage.title}</h2><p className="mt-3 font-display text-sm italic leading-relaxed text-[#5C4D3C]">“{seasonPage.opening}”</p><div className="mt-4 space-y-2">{seasonPage.moments.map((item) => <div key={item.title} className="flex gap-3 rounded-2xl bg-[#EEF1FA] px-3 py-2.5"><span className="text-xl">{item.icon}</span><div><p className="font-display text-sm font-bold text-[#2D2418]">{item.title}</p><p className="mt-0.5 font-body text-xs text-[#5C4D3C]">{item.line}</p></div></div>)}</div><button onClick={() => { playComplete(); onCelebrateSeason(); }} disabled={seasonalRemembered} className="mt-4 rounded-xl bg-[#E2EEDB] px-3 py-2 font-body text-xs font-bold text-[#394E35] disabled:opacity-70">{seasonalRemembered ? 'A seasonal memory is tucked inside ✓' : 'Tuck this season into our book'}</button></section>}

        {tab === 'adoption' && (selectedFriend ? <section className="paper-card relative overflow-hidden p-5 text-center" style={{ borderTop: '3px solid #6EB9CE' }}><div className="absolute right-3 top-2 text-3xl opacity-40">🧸</div><CritterAvatar type={selectedFriend.type} size={84} expression="happy" /><p className="mt-2 font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#3E7B91]">Future plushie adoption card</p><h2 className="font-display text-2xl font-bold text-[#2D2418]">{selectedFriend.name}</h2><p className="mt-1 font-body text-xs text-[#5C4D3C]">{selectedFriend.personality}</p><button onClick={() => { playButton(); window.print(); }} className="btn-coral mt-4 w-full">🖨 Print or Save as PDF</button><p className="mt-2 font-body text-[10px] text-[#5C4D3C]/75">A family keepsake only—no store or purchase needed.</p><PrintableAdoptionCard critter={selectedFriend} season={season} /></section> : <section className="paper-card p-6 text-center"><div className="text-4xl">🧸</div><h2 className="font-display mt-2 text-lg font-bold text-[#2D2418]">A keepsake will be ready</h2><p className="mt-1 font-body text-sm text-[#5C4D3C]">Bring a friend home first.</p></section>)}
      </main>
    </div>
  );
}
