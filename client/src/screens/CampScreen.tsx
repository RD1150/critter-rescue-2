// Hearthlight Field Journal — 3D camp hub backed by Babylon.js.
// The living diorama is the game world; React remains the tactile journal HUD and puzzle launcher.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BabylonCampScene from '../components/BabylonCampScene';
import CritterAvatar from '../components/CritterAvatar';
import { CritterData, CritterType, getRescuedCritters, getZoneTask, ZONES } from '../game/data';
import { playButton, playComplete, playNibble, playPet, playTrailStart, playTrailTreasure, playWelcome } from '../game/sounds';
import { playDailyTrailVoice } from '../game/characterAudio';
import { DailyTrailState, HomeDecoration, NurseryGraduate, SanctuarySeason } from '../game/store';
import type { CareCelebration } from '../game/critterCelebrations';
import PreReaderDirection from '../components/PreReaderDirection';
import type { LearningTheme } from '../game/learningThemes';
import { LEARNING_THEME_DETAILS } from '../game/learningThemes';
import { getLearningFocusLaunch } from '../game/learningFocus';
import type { CelebrationPath } from '../game/celebrationPaths';
import { BookOpen, MapPinned, Settings } from 'lucide-react';

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
  onCareHome: (critter: CritterData) => number;
  onOpenJournal: () => void;
  onOpenMatch3: () => void;
  onOpenNursery: () => void;
  onOpenParentSettings: () => void;
  onOpenLearning: () => void;
  onOpenNatureJournal: () => void;
  onOpenWeatherWonder: () => void;
  celebrationPath: CelebrationPath | null;
  holidayEditionEnabled?: boolean;
  onOpenCelebrationPath: () => void;
  onOpenTeamRescue: () => void;
  learningTheme: LearningTheme;
  onStartLearningFocus: () => void;
  onOpenStorybook: () => void;
  onOpenCarePlay: () => void;
  onOpenBedtime: () => void;
  homeDecor: Record<string, HomeDecoration>;
  kindnessMoments: number;
  season: SanctuarySeason;
  celebration: CareCelebration | null;
  onClearCelebration: () => void;
  keepCelebrationVisible?: boolean;
  bedtimeReminderEnabled: boolean;
  showPlaytimeSuggestion: boolean;
  onDismissPlaytimeSuggestion: () => void;
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
  onOpenNatureJournal,
  onOpenWeatherWonder,
  celebrationPath,
  holidayEditionEnabled = false,
  onOpenCelebrationPath,
  onOpenTeamRescue,
  learningTheme,
  onStartLearningFocus,
  onOpenStorybook,
  onOpenCarePlay,
  onOpenBedtime,
  homeDecor,
  kindnessMoments,
  season,
  celebration,
  onClearCelebration,
  keepCelebrationVisible = false,
  bedtimeReminderEnabled,
  showPlaytimeSuggestion,
  onDismissPlaytimeSuggestion,
  lastNurseryGraduate,
  onAcknowledgeGraduate,
  reduceMotion,
}: Props) {
  const [showZoneSelect, setShowZoneSelect] = useState(() => import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'zoneselector');
  const [showMobilePlayMenu, setShowMobilePlayMenu] = useState(false);
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [friendNote, setFriendNote] = useState<CritterData | null>(null);
  const [selectedHomeFriend, setSelectedHomeFriend] = useState<CritterData | null>(null);
  const [homeCareMessage, setHomeCareMessage] = useState('');
  const [campArrival, setCampArrival] = useState<NurseryGraduate | null>(lastNurseryGraduate);
  const [showFirstGuide, setShowFirstGuide] = useState(() => rescueCount === 0);
  const [logoFailed, setLogoFailed] = useState(false);
  const dialogueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dailyRewardVoicePlayed = useRef<string | null>(null);

  const rescuedCritters = useMemo(() => getRescuedCritters(zoneTaskProgress), [zoneTaskProgress]);
  const totalTasks = ZONES.reduce((sum, zone) => sum + zone.totalTasks, 0);
  const completedTasks = Object.values(zoneTaskProgress).reduce((sum, value) => sum + value, 0);
  const allComplete = completedTasks >= totalTasks;
  const nextTrailZone = ZONES.find((zone) => unlockedZones.includes(zone.id) && (zoneTaskProgress[zone.id] ?? 0) < zone.totalTasks) ?? null;
  const nextRescue = nextTrailZone ? getZoneTask(nextTrailZone.id, zoneTaskProgress[nextTrailZone.id] ?? 0) : null;
  const dailyCompleted = dailyTrail.completedKeys.length;
  const dailyDone = dailyTrail.rewardEarned;
  const learningFocus = getLearningFocusLaunch(learningTheme);

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
    const total = onCareHome(selectedHomeFriend);
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
    return 'A new little friend is waiting on the trail.';
  };
  const beginFirstRescue = () => {
    playButton();
    setShowFirstGuide(false);
    setTimeout(() => onStartRescue('meadow'), 180);
  };
  const beginNextRescue = () => {
    if (allComplete || !nextTrailZone) return;
    playButton();
    setTimeout(() => onStartRescue(nextTrailZone.id), 180);
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
        rescueFriend={nextRescue?.critter ?? null}
        onRescueTrailClick={beginNextRescue}
        homeDecor={homeDecor}
        kindnessMoments={kindnessMoments}
        season={season}
        celebration={celebration}
        reduceMotion={reduceMotion}
      />

      {/* Gentle visual vignette lets the journal controls remain legible without hiding the 3D world. */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(12,47,34,.34) 0%, transparent 28%, transparent 66%, rgba(12,47,34,.5) 100%)' }} />


      {/* A deliberately quiet top bar: the sanctuary world is the main screen. */}
      <div className="absolute z-20 top-0 left-0 right-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{ background: 'oklch(0.97 0.02 80 / 0.93)', border: '1.5px solid oklch(0.85 0.03 75)', boxShadow: '0 4px 16px oklch(0 0 0 / 0.2)', borderTop: '2.5px solid #E66B5B' }}>
          {logoFailed ? <div role="img" aria-label="Critter Rescue" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D8B867] bg-[#F7EBD8] font-display text-xs font-bold text-[#5D3D2A]">CR</div> : <img src="/manus-storage/game-logo_a4abbdba.png" alt="Critter Rescue" className="w-8 h-8 shrink-0 object-contain" onError={() => setLogoFailed(true)} />}
          <div className="min-w-0 flex-1">
            <p className="font-display text-[#2D2418] font-bold text-sm leading-none">Critter Rescue</p>
            <p className="font-body text-[#49392C] text-[10px] mt-0.5">{holidayEditionEnabled ? 'A cozy celebration trail' : 'Plushie sanctuary'}</p>
          </div>
          <button onClick={() => { playButton(); onOpenStorybook(); }} className="min-h-11 min-w-11 shrink-0 rounded-xl px-2 py-1 text-[#5D3D2A] hover:bg-[#E66B5B]/10 active:scale-95 transition-transform" aria-label="Open storybook" title="Storybook">
            <BookOpen size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
          <button onClick={() => { playButton(); onOpenParentSettings(); }} className="min-h-11 min-w-11 shrink-0 rounded-lg px-2 py-1 text-[#5D3D2A] hover:bg-[#E66B5B]/10 active:scale-95 transition-transform" aria-label="Open parent settings" title="Parent Settings">
            <Settings size={19} strokeWidth={2.2} aria-hidden="true" />
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
            <p className="font-body text-[10px] font-bold uppercase tracking-[.11em] text-[#A56C20] mt-1">{celebration.variationName}</p>
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
            <p className="font-body text-[10px] text-[#5C4D3C]/70 mt-2">{homeCare[selectedHomeFriend.id] ?? 0} kind care moments at this home</p>
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
            <p className="font-body text-xs text-[#5C4D3C] mt-3">Whenever you visit again, more little rescues will be ready.</p>
            <button onClick={() => { playComplete(); onAcknowledgeDailyReward(); }} className="btn-coral mt-4 w-full">Place a new bloom in camp</button>
          </div>
        </div>
      )}
      {showFirstGuide && !campArrival && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#082419]/75 px-4 backdrop-blur-[3px] sm:px-5">
          <div role="dialog" aria-modal="true" aria-labelledby="first-rescue-title" aria-describedby="first-rescue-reassurance" className={`paper-card relative w-full max-w-sm px-5 py-5 text-center shadow-2xl ${reduceMotion ? '' : 'animate-pop-in'}`} style={{ borderTop: '4px solid #D75B50' }}>
            <div className="flex items-center justify-center gap-3"><CritterAvatar type={companionType as CritterType} size={54} expression="excited" animate={!reduceMotion} /><CritterAvatar type="bird" size={66} expression="worried" animate={!reduceMotion} /></div>
            <p className="mt-2 font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#9A4038]">Sunny Meadow</p>
            <h2 id="first-rescue-title" className="font-display mt-1 text-xl font-bold leading-tight text-[#2D2418]">Pip needs a little path.</h2>
            <p id="first-rescue-reassurance" className="font-display mt-2 italic text-sm text-[#49392C]">“We’ll do this together.”</p>
            <PreReaderDirection directionKey="onboarding" minimal className="mt-3" />
            <button onClick={beginFirstRescue} className="btn-coral mt-4 w-full text-base">Help Pip</button>
            <button onClick={() => setShowFirstGuide(false)} className="mt-2 w-full rounded-xl border border-[#B99773] bg-[#FFF9EF] px-3 py-2.5 font-body text-sm font-bold text-[#5D3D2A] shadow-sm active:scale-95">Explore the sanctuary</button>
          </div>
        </div>
      )}

      {/* One child-facing next step stays large; quieter choices live behind a single "More play" pocket. */}
      <div className="absolute z-20 bottom-0 left-0 right-0 px-3 pb-3 pointer-events-none">
        {showPlaytimeSuggestion && <div className="pointer-events-auto mb-2 ml-auto w-[min(270px,78vw)] rounded-2xl px-3 py-2" style={{ background: 'rgba(255,249,239,.96)', border: '1px solid #E2C9AB', boxShadow: '0 5px 14px rgba(0,0,0,.22)' }}><div className="flex items-center gap-2"><span className="text-xl">🍃</span><div className="min-w-0 flex-1"><p className="font-body text-[9px] uppercase tracking-[.12em] font-bold text-[#A85C41]">Grown-up time check</p><p className="font-body text-[10px] leading-snug text-[#5C4D3C]">Would a cuddle, stretch, or quiet rest feel good now?</p></div><button onClick={onDismissPlaytimeSuggestion} className="rounded-lg bg-[#EAF4EF] px-2 py-1.5 font-body text-[10px] font-bold text-[#3D7A58] active:scale-95">Not yet</button></div></div>}
        {bedtimeReminderEnabled && rescueCount > 0 && !showPlaytimeSuggestion && <div className="pointer-events-auto mb-2 ml-auto w-[min(250px,72vw)] rounded-2xl px-3 py-2" style={{ background: 'rgba(32,50,86,.92)', border: '1px solid rgba(255,245,194,.38)', boxShadow: '0 5px 14px rgba(0,0,0,.22)' }}><div className="flex items-center gap-2"><span className="text-xl">🌙</span><div className="min-w-0 flex-1"><p className="font-body text-[9px] uppercase tracking-[.12em] font-bold text-[#FFF5C2]">Quiet ending, if wanted</p><p className="font-body text-[10px] leading-snug text-white/82">A grown-up asked us to offer a calm goodnight whenever play feels complete.</p></div><button onClick={() => { playButton(); onOpenBedtime(); }} className="rounded-lg bg-[#FFF9EF] px-2 py-1.5 font-body text-[10px] font-bold text-[#31446C] active:scale-95">Rest</button></div></div>}
        {showMobilePlayMenu && <section id="camp-more-play" aria-label="More gentle play" className="pointer-events-auto mb-2 ml-auto w-full max-w-xl rounded-3xl border border-[#D9C8A8] bg-[#FFF8E6]/95 p-3 shadow-lg"><p className="font-display text-base font-bold text-[#2D2418]">More play</p><p className="mt-0.5 font-body text-[10px] text-[#5C4D3C]">Choose a little activity when you are ready.</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{learningFocus && <button onClick={() => { playButton(); onStartLearningFocus(); }} aria-label={`Start today’s ${LEARNING_THEME_DETAILS[learningTheme].label.toLowerCase()} focus`} className="btn-parchment px-3 py-2.5 text-xs">{LEARNING_THEME_DETAILS[learningTheme].icon} Today’s focus</button>}<button onClick={beginDailyTrail} disabled={dailyDone} className="btn-parchment px-3 py-2.5 text-xs disabled:opacity-60">🎒 {dailyDone ? 'Trail resting' : 'Little trail'}</button><button onClick={() => { playButton(); onOpenNursery(); }} className="btn-parchment px-3 py-2.5 text-xs">🧸 Cozy homes</button><button onClick={() => { playButton(); onOpenCarePlay(); }} className="btn-parchment px-3 py-2.5 text-xs">🫶 Care time</button><button onClick={() => { playButton(); onOpenLearning(); }} className="btn-parchment px-3 py-2.5 text-xs">🌈 Little learning</button><button onClick={() => { playButton(); onOpenMatch3(); }} className="btn-parchment px-3 py-2.5 text-xs">🧩 Care pairs</button><button onClick={() => { playButton(); onOpenStorybook(); }} className="btn-parchment px-3 py-2.5 text-xs">📚 Storybook</button><button onClick={() => { playButton(); onOpenJournal(); }} className="btn-parchment px-3 py-2.5 text-xs">🍃 Nature journal</button><button onClick={() => { playButton(); onOpenNatureJournal(); }} className="btn-parchment px-3 py-2.5 text-xs">🌦️ Nature play</button><button onClick={() => { playButton(); onOpenWeatherWonder(); }} className="btn-parchment px-3 py-2.5 text-xs">☁️ Weather</button>{celebrationPath && <button onClick={() => { playButton(); onOpenCelebrationPath(); }} className="btn-parchment px-3 py-2.5 text-xs">{celebrationPath.icon} Celebration trail</button>}<button onClick={() => { playButton(); onOpenTeamRescue(); }} className="btn-parchment px-3 py-2.5 text-xs">🤝 Help together</button><button onClick={() => { playButton(); setShowZoneSelect(true); }} className="btn-parchment px-3 py-2.5 text-xs">🗺️ Choose a trail</button></div></section>}
        <div className="flex items-end gap-2">
          <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-3 rounded-3xl px-3 py-3" style={{ background: 'oklch(0.97 0.02 80 / 0.96)', border: '1.5px solid oklch(0.85 0.03 75)', boxShadow: '0 4px 16px oklch(0 0 0 / 0.22)', borderTop: '2.5px solid #E66B5B' }}>{!allComplete && nextRescue && <CritterAvatar type={nextRescue.critter.type} size={43} expression="worried" animate={!reduceMotion} />}<div className="min-w-0 flex-1"><p className="font-display text-sm text-[#2D2418]">{allComplete ? 'Every friend is cozy at camp.' : `${nextRescue?.critter.name ?? 'A friend'} needs help.`}</p><p className="font-body text-[10px] text-[#5C4D3C]">{allComplete ? 'Choose any calm activity you like.' : nextRescue?.zone === 'meadow' ? 'Follow the flower path together.' : 'One small kind thing at a time.'}</p></div>{!allComplete && <button onClick={beginNextRescue} className="btn-coral min-h-14 shrink-0 px-4 py-3 text-sm shadow-xl">{nextRescue?.critter.name ? `Help ${nextRescue.critter.name}` : 'Help a friend'}</button>}</div>
          <button onClick={() => { playButton(); setShowMobilePlayMenu((shown) => !shown); }} aria-expanded={showMobilePlayMenu} aria-controls="camp-more-play" className="pointer-events-auto btn-parchment min-h-14 shrink-0 px-3 py-2.5 text-xs shadow-lg">{showMobilePlayMenu ? 'Close' : 'More play'}</button>
        </div>
      </div>

      {/* Zone selector remains a tangible journal drawer layered over the 3D world. */}
      {showZoneSelect && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-[#082419]/70 px-2 backdrop-blur-sm sm:px-4" onClick={() => setShowZoneSelect(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="trail-picker-title" aria-describedby="trail-picker-help" className="max-h-[76vh] overflow-y-auto rounded-t-3xl px-4 pb-6 pt-3"
            style={{ background: 'linear-gradient(180deg, #3F2B1B 0%, #2B1D12 100%)', borderTop: '3px solid #E66B5B' }}
            onClick={(event) => event.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-2" />
            <div className="flex items-center justify-center gap-2">
              <MapPinned size={20} className="text-[#F5C842]" aria-hidden="true" />
              <h2 id="trail-picker-title" className="font-display text-xl font-bold text-white">Pick a rescue trail</h2>
            </div>
            <p id="trail-picker-help" className="mb-3 mt-1 font-body text-center text-xs text-white/80">Start with the card that says <strong className="text-[#FFF1BE]">Ready now</strong>.</p>
            <div className="flex flex-col gap-2.5">
              {ZONES.map((zone) => {
                const unlocked = unlockedZones.includes(zone.id);
                const completed = zoneTaskProgress[zone.id] ?? 0;
                const done = completed >= zone.totalTasks;
                const isNextTrail = zone.id === nextTrailZone?.id;
                const status = !unlocked ? 'Not ready yet' : done ? 'All friends safe' : isNextTrail ? 'Ready now' : 'Ready to explore';
                const guidance = !unlocked ? 'Keep helping friends to open this trail.' : done ? 'Every friend is safe here.' : isNextTrail ? 'A little friend is waiting here.' : 'You can visit this trail next.';
                return (
                  <button
                    key={zone.id}
                    disabled={!unlocked || done}
                    onClick={() => { playButton(); setShowZoneSelect(false); setTimeout(() => onStartRescue(zone.id), 180); }}
                    aria-label={`${zone.name}: ${status}. ${guidance}`}
                    className={`rounded-2xl overflow-hidden text-left transition-transform active:scale-[0.98] ${!unlocked || done ? 'opacity-55' : 'hover:scale-[1.01]'} ${isNextTrail ? 'ring-2 ring-[#F5C842] ring-offset-2 ring-offset-[#3F2B1B]' : ''}`}
                    style={{ background: `linear-gradient(135deg, ${zone.bgColors[0]}, ${zone.bgColors[2]})`, border: '1px solid rgba(255,255,255,.2)' }}>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <span className="text-3xl">{zone.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-bold text-white text-base">{zone.name}</span>
                          <span className={`rounded-full px-2 py-0.5 font-body text-[10px] font-bold ${isNextTrail ? 'bg-[#FFF1BE] text-[#5D3D2A]' : 'bg-black/20 text-white'}`}>{status}</span>
                        </div>
                        <p className="mt-0.5 font-body text-xs text-white/90">{guidance}</p>
                        {unlocked && <div className="mt-1.5 flex items-center gap-2">
                          <span className="whitespace-nowrap font-body text-[10px] font-bold text-white/90">Cozy trail notes</span>
                          <div className="flex gap-1" aria-hidden="true">
                            {Array.from({ length: zone.totalTasks }).map((_, index) => (
                              <div key={index} className={`h-2 w-2 rounded-full ${index < completed ? 'bg-[#F5C842]' : index === completed && !done ? 'bg-white ring-1 ring-[#F5C842]' : 'bg-white/30'}`} />
                            ))}
                          </div>
                        </div>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowZoneSelect(false)} className="mt-4 w-full rounded-xl border border-white/35 bg-white/10 py-2.5 font-body text-sm font-bold text-white active:scale-95">Back to camp</button>
          </div>
        </div>
      )}
    </div>
  );
}
