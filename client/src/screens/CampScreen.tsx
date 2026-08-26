// Hearthlight Field Journal — 3D camp hub backed by Babylon.js.
// The living diorama is the game world; React remains the tactile journal HUD and puzzle launcher.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BabylonCampScene from '../components/BabylonCampScene';
import CritterAvatar from '../components/CritterAvatar';
import { CritterData, CritterType, getRescuedCritters, getStarterCompanion, ZONES } from '../game/data';
import { playButton, playComplete, playNibble, playPet, playTrailStart, playTrailTreasure, playWelcome } from '../game/sounds';
import { playDailyTrailVoice } from '../game/characterAudio';
import { DailyTrailState, HomeDecoration, NurseryGraduate, SanctuarySeason } from '../game/store';
import { getNextSanctuaryGrowth, getSanctuaryGrowth } from '../game/sanctuaryGrowth';
import type { CareCelebration } from '../game/critterCelebrations';
import PreReaderDirection from '../components/PreReaderDirection';
import { getCampThemeFieldNote } from '../game/campThemeMessaging';

interface Props {
  forestHarmony: number;
  campFlowersCount: number;
  rescueCount: number;
  companionType: string;
  unlockedZones: string[];
  zoneTaskProgress: Record<string, number>;
  onStartRescue: (zone: string) => void;
  dailyTrail: DailyTrailState;
  lastDailyReward: string | null;
  onStartDailyTrail: () => void;
  onAcknowledgeDailyReward: () => void;
  homeCare: Record<string, number>;
  onCareHome: (critterName: string, type: CritterType) => number;
  onOpenJournal: () => void;
  onOpenMatch3: () => void;
  onOpenNursery: () => void;
  onOpenParentSettings: () => void;
  onOpenLearning: () => void;
  onOpenStorybook: () => void;
  onOpenCarePlay: () => void;
  onOpenBedtime: () => void;
  homeDecor: Record<string, HomeDecoration>;
  kindnessMoments: number;
  season: SanctuarySeason;
  celebration: CareCelebration | null;
  onClearCelebration: () => void;
  keepCelebrationVisible?: boolean;
  lastNurseryGraduate: NurseryGraduate | null;
  onAcknowledgeGraduate: () => void;
  reduceMotion: boolean;
}

export default function CampScreen({
  forestHarmony,
  rescueCount,
  companionType,
  unlockedZones,
  zoneTaskProgress,
  onStartRescue,
  dailyTrail,
  lastDailyReward,
  onStartDailyTrail,
  onAcknowledgeDailyReward,
  homeCare,
  onCareHome,
  onOpenJournal,
  onOpenMatch3,
  onOpenNursery,
  onOpenParentSettings,
  onOpenLearning,
  onOpenStorybook,
  onOpenCarePlay,
  onOpenBedtime,
  homeDecor,
  kindnessMoments,
  season,
  celebration,
  onClearCelebration,
  keepCelebrationVisible = false,
  lastNurseryGraduate,
  onAcknowledgeGraduate,
  reduceMotion,
}: Props) {
  const [showZoneSelect, setShowZoneSelect] = useState(false);
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [friendNote, setFriendNote] = useState<CritterData | null>(null);
  const [selectedHomeFriend, setSelectedHomeFriend] = useState<CritterData | null>(null);
  const [homeCareMessage, setHomeCareMessage] = useState('');
  const [campArrival, setCampArrival] = useState<NurseryGraduate | null>(lastNurseryGraduate);
  const [showFirstGuide, setShowFirstGuide] = useState(() => rescueCount === 0);
  const [renderedDecorations, setRenderedDecorations] = useState<Record<string, { decoration: HomeDecoration; meshIds: string[] }>>({});
  const dialogueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dailyRewardVoicePlayed = useRef<string | null>(null);

  const rescuedCritters = useMemo(() => getRescuedCritters(zoneTaskProgress), [zoneTaskProgress]);
  const harmonyPct = Math.min(100, forestHarmony);
  const totalTasks = ZONES.reduce((sum, zone) => sum + zone.totalTasks, 0);
  const completedTasks = Object.values(zoneTaskProgress).reduce((sum, value) => sum + value, 0);
  const allComplete = completedTasks >= totalTasks;
  const dailyCompleted = dailyTrail.completedKeys.length;
  const dailyDone = dailyTrail.rewardEarned;
  const sanctuaryGrowth = getSanctuaryGrowth(kindnessMoments);
  const nextSanctuaryGrowth = getNextSanctuaryGrowth(kindnessMoments);
  const themeNote = getCampThemeFieldNote(season);
  const handleDecorationRendered = useCallback((critterName: string, decoration: HomeDecoration, meshIds: string[]) => {
    setRenderedDecorations((previous) => previous[critterName]?.decoration === decoration && previous[critterName]?.meshIds.join('|') === meshIds.join('|') ? previous : { ...previous, [critterName]: { decoration, meshIds } });
  }, []);

  const companionLines = useMemo(() => {
    if (rescueCount === 0) return ['Hi, friend! We help little animals. Tap the big red Follow Trail button, and I will show you where to go!', 'This is our cozy camp. You can move it by dragging, but you do not need to. Let’s help a friend first!', 'A little friend is waiting in Sunny Meadow. Let’s go together!'];
    if (rescueCount < 4) return ['Look at this little camp growing!', 'Every rescued friend makes the forest brighter.', 'Let’s see who needs help next.'];
    if (allComplete) return ['Every critter has a safe place here.', 'You made this sanctuary possible.', 'The forest is singing for you today.'];
    return ['Our plushie friends are so happy here.', 'There is always room for one more friend.', 'The rescue trail is waiting.'];
  }, [allComplete, rescueCount]);

  useEffect(() => {
    playWelcome();
    return () => { if (dialogueTimer.current) clearTimeout(dialogueTimer.current); };
  }, []);
  useEffect(() => { setCampArrival(lastNurseryGraduate); }, [lastNurseryGraduate]);
  useEffect(() => {
    if (!lastDailyReward || dailyRewardVoicePlayed.current === lastDailyReward) return;
    dailyRewardVoicePlayed.current = lastDailyReward;
    const timer = setTimeout(() => { playTrailTreasure(); playDailyTrailVoice('reward'); }, 260);
    return () => clearTimeout(timer);
  }, [lastDailyReward]);
  useEffect(() => {
    if (!celebration || keepCelebrationVisible) return;
    const timer = setTimeout(onClearCelebration, reduceMotion ? 2600 : 2100);
    return () => clearTimeout(timer);
  }, [celebration, keepCelebrationVisible, onClearCelebration, reduceMotion]);

  const revealDialogue = useCallback((text: string) => {
    setDialogue(text);
    if (dialogueTimer.current) clearTimeout(dialogueTimer.current);
    dialogueTimer.current = setTimeout(() => setDialogue(null), 3600);
  }, []);

  const handleCompanionClick = useCallback(() => {
    playButton();
    revealDialogue(companionLines[Math.floor(Math.random() * companionLines.length)]);
  }, [companionLines, revealDialogue]);

  const handleFriendClick = useCallback((critter: CritterData) => {
    playButton();
    setFriendNote(critter);
    setTimeout(() => setFriendNote(null), 3500);
  }, []);
  const handleHomeClick = useCallback((critter: CritterData) => {
    playButton();
    setSelectedHomeFriend(critter);
    setHomeCareMessage(`Tap a kind action for ${critter.name}.`);
  }, []);
  useEffect(() => {
    const previewHomeCare = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'homecare';
    if (previewHomeCare && rescuedCritters[0] && !selectedHomeFriend) handleHomeClick(rescuedCritters[0]);
  }, [handleHomeClick, rescuedCritters, selectedHomeFriend]);
  const doHomeCare = (kind: 'feed' | 'pet') => {
    if (!selectedHomeFriend) return;
    const total = onCareHome(selectedHomeFriend.name, selectedHomeFriend.type);
    if (kind === 'feed') {
      playNibble();
      setHomeCareMessage(`${selectedHomeFriend.name} had a tiny snack. Yum!`);
    } else {
      playPet();
      setHomeCareMessage(`${selectedHomeFriend.name} feels soft, safe, and loved.`);
    }
    if (total % 3 === 0) playComplete();
  };

  const getWelcome = () => {
    if (rescueCount === 0) return 'A tiny friend needs you.';
    if (allComplete) return 'Every friend is safe in the sanctuary.';
    return `${rescueCount} friends are safe. The trail continues.`;
  };
  const companionCard = getStarterCompanion(companionType);
  const beginFirstRescue = () => {
    playButton();
    setShowFirstGuide(false);
    setTimeout(() => onStartRescue('meadow'), 180);
  };
  const beginDailyTrail = () => {
    playTrailStart();
    playDailyTrailVoice('welcome');
    onStartDailyTrail();
  };

  return (
    <div className="game-screen overflow-hidden bg-[#103B2A] select-none">
      <BabylonCampScene
        companionType={companionType as CritterType}
        rescuedCritters={rescuedCritters}
        onCompanionClick={handleCompanionClick}
        onCritterClick={handleFriendClick}
        onHomeClick={handleHomeClick}
        onDecorationRendered={handleDecorationRendered}
        homeDecor={homeDecor}
        kindnessMoments={kindnessMoments}
        season={season}
        celebration={celebration}
        reduceMotion={reduceMotion}
      />

      {/* Gentle visual vignette lets the journal controls remain legible without hiding the 3D world. */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(12,47,34,.34) 0%, transparent 28%, transparent 66%, rgba(12,47,34,.5) 100%)' }} />

      {import.meta.env.DEV && Object.keys(renderedDecorations).length > 0 && <output data-testid="rendered-home-decoration-status" className="absolute z-20 left-3 bottom-[94px] max-w-[68vw] rounded-lg bg-[#FFF9EF]/90 px-2 py-1 font-body text-[9px] text-[#49392C] shadow-sm">3D home accents: {Object.entries(renderedDecorations).map(([name, status]) => `${name}=${status.decoration} (${status.meshIds.join(', ')})`).join(' · ')}</output>}

      {/* Top field-journal HUD */}
      <div className="absolute z-20 top-0 left-0 right-0 px-3 pt-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{ background: 'oklch(0.97 0.02 80 / 0.93)', border: '1.5px solid oklch(0.85 0.03 75)', boxShadow: '0 4px 16px oklch(0 0 0 / 0.2)', borderTop: '2.5px solid #E66B5B' }}>
          <img src="/manus-storage/game-logo_a4abbdba.png" alt="Critter Rescue" className="w-8 h-8 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[#2D2418] font-bold text-sm leading-none">Plushie Sanctuary</p>
            <p className="font-body text-[#5C4D3C] text-[10px] mt-0.5">{themeNote.icon} {themeNote.campLine}</p>
          </div>
          <div className="flex flex-col items-center px-1">
            <span className="font-display font-bold text-[#E66B5B] leading-none">{rescueCount}</span>
            <span className="font-body text-[8px] text-[#5C4D3C] uppercase tracking-wide">saved</span>
          </div>
          <button onClick={() => { playButton(); onOpenJournal(); }} className="rounded-lg px-2 py-1 hover:bg-[#E66B5B]/10 active:scale-95 transition-transform" aria-label="Open critter journal">
            <span className="text-lg">📖</span>
          </button>
          <button onClick={() => { playButton(); onOpenNursery(); }} className="rounded-lg px-2 py-1 hover:bg-[#E66B5B]/10 active:scale-95 transition-transform" aria-label="Open the Critter Nursery">
            <span className="text-lg">🧸</span>
          </button>
          <button onClick={() => { playButton(); onOpenParentSettings(); }} className="rounded-lg px-2 py-1 hover:bg-[#E66B5B]/10 active:scale-95 transition-transform" aria-label="Open parent settings">
            <span className="text-lg">⚙️</span>
          </button>
          <button onClick={() => { playButton(); onOpenLearning(); }} className="rounded-lg px-2 py-1 hover:bg-[#E66B5B]/10 active:scale-95 transition-transform" aria-label="Open colors shapes and patterns game">
            <span className="text-lg">🌈</span>
          </button>
          <button onClick={() => { playButton(); onOpenStorybook(); }} className="rounded-lg px-2 py-1 hover:bg-[#E66B5B]/10 active:scale-95 transition-transform" aria-label="Open Critter Storybook">
            <span className="text-lg">✨</span>
          </button>
        </div>
      </div>

      {/* Dialogue from an interactive 3D companion */}
      {dialogue && (
        <div className="absolute z-20 top-[86px] left-1/2 -translate-x-1/2 w-[min(300px,84vw)] pointer-events-none animate-pop-in">
          <div className="paper-card px-4 py-3 text-center relative shadow-xl">
            <p className="font-display italic text-[#2D2418] text-sm leading-snug">“{dialogue}”</p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[oklch(0.98_0.015_75)]" />
          </div>
        </div>
      )}

      {/* Clicked 3D friend acknowledgement */}
      {friendNote && (
        <div className="absolute z-20 top-[86px] right-3 w-44 pointer-events-none animate-rise-in">
          <div className="paper-card p-2.5 flex gap-2 shadow-lg">
            <CritterAvatar type={friendNote.type} size={38} expression="happy" />
            <div className="min-w-0">
              <p className="font-display text-[#2D2418] font-bold text-sm">{friendNote.name}</p>
              <p className="font-body text-[#5C4D3C] text-[10px] leading-snug">{friendNote.thanksLine}</p>
            </div>
          </div>
        </div>
      )}

      {celebration && (
        <div className={`absolute z-30 top-[98px] left-1/2 w-[min(300px,84vw)] -translate-x-1/2 ${reduceMotion ? '' : 'animate-pop-in'}`}>
          <div className="paper-card px-4 py-3 text-center shadow-xl" style={{ borderTop: '3px solid #F5C842' }}>
            <p className="text-2xl">{celebration.icon}</p>
            <p className="font-display text-[#2D2418] font-bold text-base">{celebration.name} feels cared for!</p>
            <p className="font-body text-xs text-[#5C4D3C] mt-1">{celebration.line}</p>
          </div>
        </div>
      )}

      {selectedHomeFriend && (
        <div className="absolute z-40 left-1/2 top-[94px] -translate-x-1/2 w-[min(330px,88vw)] animate-pop-in">
          <div className="paper-card relative px-4 py-4 text-center shadow-xl" style={{ borderTop: '3px solid #E66B5B' }}>
            <button onClick={() => setSelectedHomeFriend(null)} className="absolute right-2 top-1.5 text-[#5C4D3C]/60 text-lg" aria-label="Close home care">×</button>
            <div className="flex items-center justify-center gap-2"><CritterAvatar type={selectedHomeFriend.type} size={48} expression="happy" animate={!reduceMotion} /><div className="text-left"><p className="font-body text-[10px] uppercase tracking-[.12em] font-bold text-[#E66B5B]">Critter Home Care</p><h2 className="font-display text-[#2D2418] font-bold text-lg">{selectedHomeFriend.name}'s cozy home</h2></div></div>
            <p className="font-body text-xs text-[#5C4D3C] mt-2">{homeCareMessage}</p>
            <div className="grid grid-cols-2 gap-2 mt-3"><button onClick={() => doHomeCare('feed')} className="rounded-xl bg-[#F7E6B8] px-3 py-2.5 font-body text-sm font-bold text-[#4A3022] active:scale-95">🍓 Give a snack</button><button onClick={() => doHomeCare('pet')} className="rounded-xl bg-[#F6D9DD] px-3 py-2.5 font-body text-sm font-bold text-[#4A3022] active:scale-95">🖐️ Gentle pet</button></div>
            <button onClick={() => { playButton(); setSelectedHomeFriend(null); onOpenCarePlay(); }} className="mt-3 w-full rounded-xl bg-[#6EB9CE] px-3 py-3 font-body text-sm font-bold text-white active:scale-95">✨ Play a cozy care game</button>
            <p className="font-body text-[10px] text-[#5C4D3C]/70 mt-2">{homeCare[selectedHomeFriend.name] ?? 0} kind care moments at this home</p>
          </div>
        </div>
      )}
      {campArrival && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-[#103B2A]/50">
          <div className="paper-card relative w-full max-w-sm px-6 py-6 text-center overflow-hidden animate-pop-in" style={{ borderTop: '4px solid #E66B5B' }}>
            <div className="absolute inset-x-0 top-0 h-10 bg-[#E66B5B]/10" />
            <p className="relative font-body text-xs uppercase tracking-[.15em] text-[#E66B5B] font-bold">Camp Arrival</p>
            <CritterAvatar type={campArrival.type} size={96} expression="excited" animate />
            <h2 className="font-display text-2xl font-bold text-[#2D2418]">Welcome, {campArrival.name}!</h2>
            <p className="font-display italic text-[#5C4D3C] text-sm mt-2">A nursery graduate has joined the plushie sanctuary.</p>
            <div className="mt-3 flex justify-center gap-1 text-[#E66B5B]">♥ ♥ ♥</div>
            <button onClick={() => { playComplete(); onAcknowledgeGraduate(); setCampArrival(null); }} className="btn-coral mt-4 w-full">Celebrate together</button>
          </div>
        </div>
      )}

      {lastDailyReward && !campArrival && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-[#103B2A]/50">
          <div className="paper-card relative w-full max-w-sm px-6 py-6 text-center overflow-hidden animate-pop-in" style={{ borderTop: '4px solid #F5C842' }}>
            <div className="absolute inset-x-0 top-0 h-12 bg-[#F5C842]/15" />
            <p className="relative font-body text-xs uppercase tracking-[.15em] text-[#A56C20] font-bold">Daily Trail Complete</p>
            <div className="text-5xl mt-2">🎒</div>
            <h2 className="font-display text-2xl font-bold text-[#2D2418] mt-2">Trail Treasure!</h2>
            <p className="font-display italic text-[#5C4D3C] text-sm mt-2">{lastDailyReward}</p>
            <p className="font-body text-xs text-[#5C4D3C] mt-3">Come back tomorrow for three new tiny rescues.</p>
            <button onClick={() => { playComplete(); onAcknowledgeDailyReward(); }} className="btn-coral mt-4 w-full">Put treasure in camp</button>
          </div>
        </div>
      )}
      {showFirstGuide && !campArrival && (
        <div className="absolute inset-0 z-40 flex items-center justify-center px-5 bg-[#103B2A]/45">
          <div className="paper-card relative w-full max-w-md p-5 text-center animate-pop-in" style={{ borderTop: '4px solid #E66B5B' }}>
            <div className="flex items-center justify-center gap-2"><CritterAvatar type={companionType as CritterType} size={52} expression="excited" animate /><div className="text-left"><p className="font-body text-[10px] uppercase tracking-[.14em] text-[#E66B5B] font-bold">Your Rescue Buddy</p><h2 className="font-display font-bold text-[#2D2418] text-xl">Let’s help a friend!</h2></div></div>
            <p className="font-display italic text-[#5C4D3C] text-sm mt-3">“You do not need to know everything. We will do this together.”</p>
            <PreReaderDirection directionKey="onboarding" className="mt-3" />
            <div className="mt-4 grid grid-cols-3 gap-2 text-left">
              <div className="rounded-xl bg-[#F8E8D8] p-2"><span className="block text-lg">1. 🧭</span><p className="font-body text-[10px] font-bold text-[#4A3022] mt-1">Go to Sunny Meadow</p></div>
              <div className="rounded-xl bg-[#E2EEDB] p-2"><span className="block text-lg">2. 🧩</span><p className="font-body text-[10px] font-bold text-[#4A3022] mt-1">Do the little rescue game</p></div>
              <div className="rounded-xl bg-[#F9DDE0] p-2"><span className="block text-lg">3. 🏕️</span><p className="font-body text-[10px] font-bold text-[#4A3022] mt-1">Bring your friend home</p></div>
            </div>
            <button onClick={beginFirstRescue} className="btn-coral mt-4 w-full text-base">Let’s Help a Friend!</button>
            <button onClick={() => setShowFirstGuide(false)} className="mt-2 font-body text-xs text-[#5C4D3C] underline">I want to look around first</button>
          </div>
        </div>
      )}

      {/* 3D interaction cue */}
      <div className="absolute z-10 left-3 top-[116px] pointer-events-none">
        <div className="rounded-full px-3 py-1.5 bg-[#173D2C]/75 border border-white/15 backdrop-blur-sm">
          <span className="font-body text-[10px] text-white/80">🧸 Tap a plushie to say hello · red button starts a rescue</span>
        </div>
      </div>

      {/* Desktop field-journal satellites: map notes and a physical pocket panel, intentionally asymmetric. */}
      <aside className="absolute z-10 top-[177px] left-4 hidden md:block w-52 pointer-events-none animate-rise-in">
        <div className="relative rounded-2xl px-4 py-3 rotate-[-2deg]"
          style={{ background: 'oklch(0.97 0.02 80 / 0.93)', border: '1px solid oklch(0.84 0.03 75)', boxShadow: '0 8px 18px oklch(0 0 0 / .18)', borderTop: '3px solid #E66B5B' }}>
          <div className="absolute -top-2 left-7 h-4 w-12 bg-[#E66B5B]/60 rotate-[-5deg]" />
          <p className="font-body text-[9px] uppercase tracking-[0.14em] text-[#E66B5B] font-bold">{themeNote.icon} {themeNote.label}</p>
          <p className="font-display text-[#2D2418] font-bold text-base leading-tight mt-1">{getWelcome()}</p>
          <p className="font-body text-[#5C4D3C] text-[11px] leading-snug mt-1.5"><strong>{companionCard.rescueIcon} {companionCard.rescueAbility}:</strong> {companionCard.rescueHint}</p>
          <p className="font-body text-[#5C4D3C]/80 text-[10px] italic leading-snug mt-1.5">{themeNote.note}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[#5C4D3C]/60 text-xs">
            <span>🐾</span><span className="w-5 h-px bg-[#5C4D3C]/25" /><span>🪶</span><span className="w-5 h-px bg-[#5C4D3C]/25" /><span>🌼</span>
          </div>
        </div>
      </aside>

      <aside className="absolute z-10 top-[184px] right-4 hidden md:block w-44 pointer-events-none animate-rise-in" style={{ animationDelay: '90ms' }}>
        <div className="relative rounded-2xl px-3 py-3 rotate-[2deg]"
          style={{ background: 'oklch(0.95 0.02 75 / 0.92)', border: '1px dashed oklch(0.65 0.05 70)', boxShadow: '0 7px 16px oklch(0 0 0 / .16)' }}>
          <div className="absolute -top-2 right-5 w-5 h-5 rounded-full bg-[#E66B5B] border-2 border-[#F7EBD3] shadow-sm" />
          <p className="font-display text-[#2D2418] font-bold text-sm">Trail Map</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {ZONES.slice(0, 4).map((zone) => (
              <div key={zone.id} className="flex items-center gap-1.5">
                <span className="text-xs">{zone.emoji}</span>
                <span className={`h-1.5 flex-1 rounded-full ${unlockedZones.includes(zone.id) ? 'bg-[#E66B5B]/70' : 'bg-[#B9AD97]/45'}`} />
                <span className="font-body text-[9px] text-[#5C4D3C]">{unlockedZones.includes(zone.id) ? 'marked' : 'mist'}</span>
              </div>
            ))}
          </div>
          <p className="font-body text-[9px] italic text-[#5C4D3C]/70 mt-2">Pinned beside the campfire.</p>
        </div>
      </aside>

      {/* Bottom controls float above the dimensional world, like pinned rescue notes. */}
      <div className="absolute z-20 bottom-0 left-0 right-0 px-3 pb-3 pointer-events-none">
        <div className="flex items-end gap-2">
          <div className="pointer-events-auto rounded-xl px-3 py-2 min-w-[130px]"
            style={{ background: 'oklch(0.97 0.02 80 / 0.93)', border: '1px solid oklch(0.85 0.03 75)', boxShadow: '0 3px 12px oklch(0 0 0 / 0.2)' }}>
            <p className="font-display text-[#2D2418] text-xs leading-tight">Forest Harmony</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-[#E6D9C5] overflow-hidden">
                <div className="h-full rounded-full bg-[#E66B5B] transition-all duration-500" style={{ width: `${harmonyPct}%` }} />
              </div>
              <span className="font-display text-[#E66B5B] text-xs">{forestHarmony}</span>
            </div>
          </div>
          {rescuedCritters.length > 0 && <div className="pointer-events-auto hidden sm:block rounded-xl px-3 py-2" style={{ background: 'oklch(0.97 0.02 80 / 0.93)', border: '1px solid oklch(0.85 0.03 75)', boxShadow: '0 3px 12px oklch(0 0 0 / 0.2)' }}>
            <p className="font-display text-[#2D2418] text-xs leading-tight">Critter Homes</p>
            <p className="font-body text-[10px] text-[#5C4D3C] mt-0.5">{rescuedCritters.length} cozy corners found</p>
          </div>}
          <div className="pointer-events-auto hidden lg:block rounded-xl px-3 py-2 max-w-[175px]" style={{ background: 'oklch(0.97 0.02 80 / 0.93)', border: '1px solid oklch(0.85 0.03 75)', boxShadow: '0 3px 12px oklch(0 0 0 / 0.2)' }}>
            <p className="font-display text-[#2D2418] text-xs leading-tight">{sanctuaryGrowth.icon} {sanctuaryGrowth.title}</p>
            <p className="font-body text-[10px] text-[#5C4D3C] mt-0.5">{nextSanctuaryGrowth ? `${nextSanctuaryGrowth.icon} More gentle care helps the camp grow.` : 'Every gentle care moment helps this place shine.'}</p>
          </div>
          <div className="pointer-events-auto rounded-xl px-3 py-2 min-w-[210px]" style={{ background: 'oklch(0.97 0.02 80 / 0.93)', border: '1px solid oklch(0.85 0.03 75)', boxShadow: '0 3px 12px oklch(0 0 0 / 0.2)' }}>
            <p className="font-display text-[#2D2418] text-xs leading-tight">Today’s Tiny Trail</p>
            <div className="flex gap-1 mt-1">{[0, 1, 2].map((step) => <span key={step} className={`w-2.5 h-2.5 rounded-full ${step < dailyCompleted ? 'bg-[#F5C842]' : 'bg-[#E6D9C5]'}`} />)}</div>
            <PreReaderDirection directionKey="dailyTrail" className="mt-2" />
            <button onClick={beginDailyTrail} disabled={dailyDone} className="mt-1.5 font-body text-[10px] font-bold text-[#E66B5B] disabled:text-[#837260]">{dailyDone ? 'Treasure found today!' : dailyCompleted ? 'Help the next friend' : 'Start 3 tiny rescues'}</button>
          </div>
          <div className="flex-1" />
          <div className="pointer-events-auto flex gap-2 items-end">
            <button onClick={() => { playButton(); onOpenNursery(); }} className="btn-parchment text-xs px-3 py-2.5 shadow-lg">🧸 Nursery</button>
            <button onClick={() => { playButton(); onOpenLearning(); }} className="btn-parchment text-xs px-3 py-2.5 shadow-lg">🌈 Learn</button>
            <button onClick={() => { playButton(); onOpenStorybook(); }} className="btn-parchment text-xs px-3 py-2.5 shadow-lg">📚 Stories</button>
            <button onClick={() => { playButton(); onOpenBedtime(); }} className="btn-parchment text-xs px-3 py-2.5 shadow-lg">🌙 Rest</button>
            <button onClick={() => { playButton(); onOpenMatch3(); }} className="btn-parchment text-xs px-3 py-2.5 shadow-lg">🎮 Match-3</button>
            {!allComplete ? (
              <button onClick={() => { playButton(); setShowZoneSelect(true); }} className="btn-coral px-4 py-2.5 shadow-xl text-sm">
                {rescueCount === 0 ? 'Follow Trail' : 'Find a Friend'}
              </button>
            ) : (
              <div className="pointer-events-auto rounded-xl bg-[#F5C842] px-3 py-2.5 text-[#2D2418] font-display font-bold text-xs shadow-lg">All safe! 🌟</div>
            )}
          </div>
        </div>
      </div>

      {/* Zone selector remains a tangible journal drawer layered over the 3D world. */}
      {showZoneSelect && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/35" onClick={() => setShowZoneSelect(false)}>
          <div className="rounded-t-3xl px-4 pt-3 pb-6 max-h-[70vh] overflow-y-auto"
            style={{ background: 'linear-gradient(180deg, #3F2B1B 0%, #2B1D12 100%)', borderTop: '3px solid #E66B5B' }}
            onClick={(event) => event.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-2" />
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-base">🧭</span>
              <h2 className="font-display text-xl font-bold text-white">Choose a rescue trail</h2>
            </div>
            <p className="font-body text-white/55 text-xs text-center mb-3">Every glowing path leads to a friend in need.</p>
            <div className="flex flex-col gap-2.5">
              {ZONES.map((zone) => {
                const unlocked = unlockedZones.includes(zone.id);
                const completed = zoneTaskProgress[zone.id] ?? 0;
                const done = completed >= zone.totalTasks;
                return (
                  <button
                    key={zone.id}
                    disabled={!unlocked || done}
                    onClick={() => { playButton(); setShowZoneSelect(false); setTimeout(() => onStartRescue(zone.id), 180); }}
                    className={`rounded-2xl overflow-hidden text-left transition-transform active:scale-[0.98] ${!unlocked || done ? 'opacity-55' : 'hover:scale-[1.01]'}`}
                    style={{ background: `linear-gradient(135deg, ${zone.bgColors[0]}, ${zone.bgColors[2]})`, border: '1px solid rgba(255,255,255,.15)' }}>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <span className="text-3xl">{zone.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-white text-base">{zone.name}</span>
                          {!unlocked && <span className="text-sm">🔒</span>}
                          {done && <span className="text-sm">💚</span>}
                        </div>
                        <p className="text-white/70 text-xs font-body mt-0.5">
                          {!unlocked ? `Unlocks at ${zone.unlockHarmony} harmony` : done ? 'Every friend is safe here!' : `${zone.totalTasks - completed} friends need help`}
                        </p>
                        {unlocked && <div className="flex gap-1 mt-1.5">
                          {Array.from({ length: zone.totalTasks }).map((_, index) => (
                            <div key={index} className={`w-2 h-2 rounded-full ${index < completed ? 'bg-[#F5C842]' : index === completed && !done ? 'bg-white/70 ring-1 ring-[#F5C842]' : 'bg-white/20'}`} />
                          ))}
                        </div>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowZoneSelect(false)} className="mt-4 w-full text-white/55 text-sm font-body py-2">Close journal</button>
          </div>
        </div>
      )}
    </div>
  );
}
