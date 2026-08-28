// ─────────────────────────────────────────────
// Critter Rescue — Main App Router
// Hearthlight Field Journal design
// ─────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from './components/ErrorBoundary';

import StarterSelectionScreen from './screens/StarterSelectionScreen';
import CampScreen from './screens/CampScreen';
import RescueScreen from './screens/RescueScreen';
import ZoneUnlockedScreen from './screens/ZoneUnlockedScreen';
import GameCompleteScreen from './screens/GameCompleteScreen';
import CritterJournalScreen from './screens/CritterJournalScreen';
import ExitAffirmationScreen from './screens/ExitAffirmationScreen';
import NurseryScreen from './screens/NurseryScreen';
import ParentSettingsScreen from './screens/ParentSettingsScreen';
import CampLearningScreen from './screens/CampLearningScreen';
import ParentProgressScreen from './screens/ParentProgressScreen';
import CritterStorybookScreen from './screens/CritterStorybookScreen';
import CritterCarePlayScreen from './screens/CritterCarePlayScreen';
import MemoryGalleryScreen from './screens/MemoryGalleryScreen';
import BedtimeWindDownScreen from './screens/BedtimeWindDownScreen';
import NatureDiscoveryJournalScreen from './screens/NatureDiscoveryJournalScreen';
import TeamRescueScreen from './screens/TeamRescueScreen';
import WeatherWonderScreen from './screens/WeatherWonderScreen';
import CelebrationPathScreen from './screens/CelebrationPathScreen';

import { acknowledgeDailyReward, acknowledgeNurseryGraduate, buildDailyTrail, careForHome, chooseHomeDecoration, clearKeepsakes, completeBedtimeWindDown, completeCarePlay, completeDailyTrailRescue, completeFriendshipDuo, completeTeamRescue, getNextDailyMission, getSanctuarySeason, loadState, rememberSeasonalMoment, removeKeepsake, restoreKeepsakes, saveState, completeRescue, careForCritter, GameState, HomeDecoration, NurseryGraduate, recordLearningRound, LearningMilestoneKey, CarePlayKind, Keepsake, SanctuarySeason, recordNatureDiscovery, recordWeatherWonder } from './game/store';
import { CritterType, getRescuedCritters, getZoneTask, MissionData, STARTER_COMPANIONS, ZONES } from './game/data';
import { playButton } from './game/sounds';
import { getAudioPreferences, saveAudioPreferences, useAudioPreferences } from './game/audioPreferences';
import { useSeasonalSoundscape } from './game/seasonalSoundscape';
import { getKindnessMoments } from './game/sanctuaryGrowth';
import { getCareCelebration, type CareCelebration } from './game/critterCelebrations';
import { resolveCampTheme } from './game/campThemes';
import type { FriendshipDuo } from './game/friendshipDuos';
import { useGentlePlaytimeSuggestion } from './game/playtimePreference';
import type { NatureDiscoveryKey } from './game/natureDiscoveries';
import { getLearningFocusLaunch } from './game/learningFocus';
import type { TeamRescue } from './game/teamRescue';
import { getCelebrationPath } from './game/celebrationPaths';

type Scene =
  | 'loading'
  | 'starterSelection'
  | 'camp'
  | 'rescue'
  | 'zoneUnlocked'
  | 'gameComplete'
  | 'journal'
  | 'exitAffirmation'
  | 'match3'
  | 'nursery'
  | 'parentSettings'
  | 'parentProgress'
  | 'storybook'
  | 'carePlay'
  | 'gallery'
  | 'bedtime'
  | 'nature'
  | 'weather'
  | 'celebrationPath'
  | 'teamRescue'
  | 'learning';

function LoadingScreen({ online }: { online: boolean }) {
  return (
    <div className="game-screen forest-bg relative flex flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center">
      <div className="absolute -left-12 top-20 h-40 w-40 rounded-full bg-[#F5C842]/10 blur-2xl" />
      <div className="absolute -right-12 bottom-16 h-44 w-44 rounded-full bg-[#E66B5B]/15 blur-2xl" />
      <img
        src="/manus-storage/game-logo_a4abbdba.png"
        alt="Critter Rescue"
        className="relative w-20 h-20 animate-float drop-shadow-xl"
      />
      <h1 className="relative font-display text-3xl font-bold text-white drop-shadow-lg">Critter Rescue</h1>
      <div className="relative rounded-2xl px-5 py-4" style={{ background: 'rgba(250,245,232,.12)', border: '1px solid rgba(255,255,255,.18)' }}><p className="font-display text-white text-base">{online ? 'Waking up a cozy forest…' : 'Your saved camp is ready offline.'}</p><p className="font-body text-white/70 text-xs mt-1">{online ? 'We are keeping your little place in the woods safe.' : 'Reconnect whenever you like for the newest updates.'}</p><div className="mt-3 flex justify-center gap-2"><span className="h-2 w-2 rounded-full bg-[#F5C842] animate-pulse" /><span className="h-2 w-2 rounded-full bg-[#F5C842] animate-pulse" style={{ animationDelay: '120ms' }} /><span className="h-2 w-2 rounded-full bg-[#F5C842] animate-pulse" style={{ animationDelay: '240ms' }} /></div></div>
    </div>
  );
}

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => { const goOnline = () => setOnline(true); const goOffline = () => setOnline(false); window.addEventListener('online', goOnline); window.addEventListener('offline', goOffline); return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); }; }, []);
  return online;
}

export default function App() {
  const [audioPreferences] = useAudioPreferences();
  const previewTheme = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('theme') : null;
  const previewLearningTheme = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('learningFocus') : null;
  const naturePrintPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'natureprint';
  const activeCampTheme = ['spring', 'summer', 'autumn', 'winter'].includes(previewTheme ?? '') ? previewTheme as SanctuarySeason : resolveCampTheme(audioPreferences.campTheme);
  const activeLearningTheme = ['all', 'phonics', 'numbers', 'rhymes', 'nature'].includes(previewLearningTheme ?? '') ? previewLearningTheme as typeof audioPreferences.learningTheme : audioPreferences.learningTheme;
  const previewCelebrationPath = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('celebrationPath') : null;
  const activeCelebrationPath = getCelebrationPath(['pumpkinLantern', 'harvestKindness', 'winterSparkle', 'lightsKindness'].includes(previewCelebrationPath ?? '') ? previewCelebrationPath as typeof audioPreferences.celebrationPath : audioPreferences.celebrationPath);
  useSeasonalSoundscape(audioPreferences, activeCampTheme);
  const online = useOnlineStatus();
  const previewPlaytimeSuggestion = import.meta.env.DEV && new URLSearchParams(window.location.search).get('playtimeSuggestion') === '1';
  const { showSuggestion: showPlaytimeSuggestion, dismissSuggestion: dismissPlaytimeSuggestion } = useGentlePlaytimeSuggestion(audioPreferences.playtimeDurationMinutes, previewPlaytimeSuggestion);
  const [state, setState] = useState<GameState | null>(null);
  const [scene, setScene] = useState<Scene>('loading');
const [currentMission, setCurrentMission] = useState<MissionData | null>(null);
const [currentZoneBg, setCurrentZoneBg] = useState<string[]>(['#87CEEB', '#7EC8A0', '#3E6B2F']);
const [newZoneUnlocked, setNewZoneUnlocked] = useState<string | null>(null);
  const [activeDailyKey, setActiveDailyKey] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [careCelebration, setCareCelebration] = useState<CareCelebration | null>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  // Load state on mount
  useEffect(() => {
    const s = loadState();
    const previewMode = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('preview') : null;
    const preview3d = previewMode === 'camp3d';
    const previewNursery = previewMode === 'nursery3d';
    const previewJournal = previewMode === 'journal';
    const previewGraduate = previewMode === 'graduate';
    const previewFirstPlay = previewMode === 'firstplay';
    const previewRescue = previewMode === 'rescue';
    const previewRescue2 = previewMode === 'rescue2';
    const previewRescue3 = previewMode === 'rescue3';
    const previewQuietCount = previewMode === 'quietcount';
    const previewPictureRhyme = previewMode === 'picturerhyme';
    const previewLetterSound = previewMode === 'lettersound';
    const previewAlliteration = previewMode === 'alliteration';
    const previewHabitatMatch = previewMode === 'habitatmatch';
    const previewParentSettings = previewMode === 'parentsettings';
    const previewDailyProgress = previewMode === 'dailyprogress';
    const previewDailyReward = previewMode === 'dailyreward';
    const previewHomeCare = previewMode === 'homecare';
    const previewLearning = previewMode === 'learning';
    const previewParentProgress = previewMode === 'parentprogress';
    const previewStorybook = previewMode === 'storybook';
    const previewCarePlay = previewMode === 'careplay';
    const previewCampGrowth = previewMode === 'campgrowth';
    const previewGallery = previewMode === 'gallery' || previewMode === 'galleryprint';
    const previewBedtime = previewMode === 'bedtime';
    const previewCelebration = previewMode === 'celebration';
    const previewNature = previewMode === 'nature';
    const previewNaturePrint = previewMode === 'natureprint';
    const previewTeamRescue = previewMode === 'teamrescue';
    const previewSyllableClap = previewMode === 'syllableclap';
    const previewWeather = previewMode === 'weather';
    const previewCelebrationPath = previewMode === 'celebrationpath';
    const previewReducedMotion = import.meta.env.DEV && new URLSearchParams(window.location.search).get('reduceMotion') === '1';
    if (previewReducedMotion && !getAudioPreferences().reduceMotion) {
      saveAudioPreferences({ ...getAudioPreferences(), reduceMotion: true });
    }
    const previewRequested = preview3d || previewNursery || previewJournal || previewGraduate || previewFirstPlay || previewRescue || previewRescue2 || previewRescue3 || previewQuietCount || previewPictureRhyme || previewLetterSound || previewAlliteration || previewHabitatMatch || previewSyllableClap || previewWeather || previewCelebrationPath || previewParentSettings || previewDailyProgress || previewDailyReward || previewHomeCare || previewLearning || previewParentProgress || previewStorybook || previewCarePlay || previewGallery || previewCampGrowth || previewBedtime || previewCelebration || previewNature || previewNaturePrint || previewTeamRescue;
    const basePreviewState = previewRequested
      ? { ...s, selectedCompanion: s.selectedCompanion || 'fox', rescueCompletedCount: previewFirstPlay ? 0 : Math.max(s.rescueCompletedCount, 3), forestHarmony: previewFirstPlay ? 0 : Math.max(s.forestHarmony, 20), unlockedZones: previewFirstPlay ? ['meadow'] : s.unlockedZones.includes('riverside') ? s.unlockedZones : ['meadow', 'riverside'], zoneTaskProgress: previewFirstPlay ? { ...s.zoneTaskProgress, meadow: 0, riverside: 0, deepwoods: 0, mountain: 0 } : { ...s.zoneTaskProgress, meadow: Math.max(s.zoneTaskProgress.meadow ?? 0, 3) }, lastNurseryGraduate: previewGraduate ? { careKey: 'preview-ember', name: 'Ember', type: 'fox' as CritterType } : s.lastNurseryGraduate }
      : s;
    const previewTrail = (previewDailyProgress || previewDailyReward) ? buildDailyTrail(basePreviewState, '2026-08-20') : basePreviewState.dailyTrail;
    const previewState = (previewDailyProgress || previewDailyReward)
      ? { ...basePreviewState, dailyTrail: { ...previewTrail, completedKeys: previewDailyReward ? previewTrail.missions.map((mission) => mission.key) : [previewTrail.missions[0].key], rewardEarned: previewDailyReward }, lastDailyReward: previewDailyReward ? 'Trail Treasure earned: 3 camp blossoms and 5 Forest Harmony!' : null }
      : basePreviewState;
    const datedPreviewState = previewParentProgress ? { ...previewState, rescueCompletedCount: Math.max(previewState.rescueCompletedCount, 8), learningMilestones: { color: 4, shape: 3, pattern: 2 }, nurseryVisits: Math.max(previewState.nurseryVisits, 5), homeCare: { Nutty: 3, Pip: 2 }, activityLog: { ...previewState.activityLog, [new Date().toISOString().slice(0, 10)]: { rescueCount: 2, learningRounds: 3, homeCareMoments: 1, nurseryCareMoments: 1, carePlayMoments: 2, dailyTrailCompleted: false } } } : previewState;
    const storyPreviewState = previewStorybook ? { ...datedPreviewState, rescueCompletedCount: Math.max(datedPreviewState.rescueCompletedCount, 4), zoneTaskProgress: { ...datedPreviewState.zoneTaskProgress, meadow: Math.max(datedPreviewState.zoneTaskProgress.meadow ?? 0, 4) }, homeDecor: { Nutty: 'acorn-lantern' as HomeDecoration, Pip: 'cloud-pillow' as HomeDecoration } } : datedPreviewState;
    const carePreviewState = previewCarePlay ? { ...storyPreviewState, rescueCompletedCount: Math.max(storyPreviewState.rescueCompletedCount, 13), unlockedZones: ['meadow', 'riverside', 'deepwoods'], zoneTaskProgress: { ...storyPreviewState.zoneTaskProgress, meadow: Math.max(storyPreviewState.zoneTaskProgress.meadow ?? 0, 4), riverside: Math.max(storyPreviewState.zoneTaskProgress.riverside ?? 0, 3), deepwoods: Math.max(storyPreviewState.zoneTaskProgress.deepwoods ?? 0, 7) } } : storyPreviewState;
    const growthPreviewState = previewCampGrowth ? { ...carePreviewState, homeCare: { ...carePreviewState.homeCare, Nutty: 5, Splash: 3 }, nurseryVisits: Math.max(carePreviewState.nurseryVisits, 4), carePlayWins: { ...carePreviewState.carePlayWins, Nutty: 3, Splash: 2 } } : carePreviewState;
    const familyPreviewState = previewGallery ? { ...growthPreviewState, rescueCompletedCount: Math.max(growthPreviewState.rescueCompletedCount, 4), zoneTaskProgress: { ...growthPreviewState.zoneTaskProgress, meadow: Math.max(growthPreviewState.zoneTaskProgress.meadow ?? 0, 4) }, keepsakes: [{ id: 'preview-nutty', source: 'care-play' as const, critterName: 'Nutty', critterType: 'squirrel' as CritterType, title: 'Nutty: Acorns tucked away', message: 'You helped make a cozy little stash.', createdAt: Date.now() }, { id: 'preview-pip', source: 'care-play' as const, critterName: 'Pip', critterType: 'bird' as CritterType, title: 'Pip: Nest fluffed with care', message: 'You helped make a soft, safe resting place.', createdAt: Date.now() }] } : growthPreviewState;
    setState(familyPreviewState);
    if (previewCelebration) {
      const previewCareMoment = Math.max(1, Math.min(3, Number(new URLSearchParams(window.location.search).get('careMoment') ?? '1')));
      setCareCelebration(getCareCelebration('Nutty', 'squirrel', previewCareMoment));
    }
    setTimeout(() => {
      if (preview3d) {
        setScene('camp');
      } else if (previewNursery) {
        setScene('nursery');
      } else if (previewJournal) {
        setScene('journal');
      } else if (previewGraduate) {
        setScene('camp');
      } else if (previewFirstPlay) {
        setScene('camp');
      } else if (previewRescue) {
        setCurrentMission(getZoneTask('meadow', 0));
        setCurrentZoneBg(ZONES[0].bgColors);
        setScene('rescue');
      } else if (previewRescue2) {
        setCurrentMission(getZoneTask('meadow', 1));
        setCurrentZoneBg(ZONES[0].bgColors);
        setScene('rescue');
      } else if (previewRescue3) {
        setCurrentMission(getZoneTask('meadow', 2));
        setCurrentZoneBg(ZONES[0].bgColors);
        setScene('rescue');
      } else if (previewQuietCount) {
        setCurrentMission(getZoneTask('meadow', 5));
        setCurrentZoneBg(ZONES[0].bgColors);
        setScene('rescue');
      } else if (previewPictureRhyme) {
        setCurrentMission(getZoneTask('riverside', 6));
        setCurrentZoneBg(ZONES[1].bgColors);
        setScene('rescue');
      } else if (previewLetterSound) {
        setCurrentMission(getZoneTask('meadow', 8));
        setCurrentZoneBg(ZONES[0].bgColors);
        setScene('rescue');
      } else if (previewAlliteration) {
        setCurrentMission(getZoneTask('meadow', 9));
        setCurrentZoneBg(ZONES[0].bgColors);
        setScene('rescue');
      } else if (previewHabitatMatch) {
        setCurrentMission(getZoneTask('riverside', 7));
        setCurrentZoneBg(ZONES[1].bgColors);
        setScene('rescue');
      } else if (previewSyllableClap) {
        setCurrentMission(getZoneTask('meadow', 10));
        setCurrentZoneBg(ZONES[0].bgColors);
        setScene('rescue');
      } else if (previewParentSettings) {
        setScene('parentSettings');
      } else if (previewDailyProgress || previewDailyReward) {
        setScene('camp');
      } else if (previewHomeCare) {
        setScene('camp');
      } else if (previewLearning) {
        setScene('learning');
      } else if (previewParentProgress) {
        setScene('parentProgress');
      } else if (previewStorybook) {
        setScene('storybook');
      } else if (previewCarePlay) {
        setScene('carePlay');
      } else if (previewCampGrowth) {
        setScene('camp');
      } else if (previewGallery) {
        setScene('gallery');
      } else if (previewBedtime) {
        setScene('bedtime');
      } else if (previewCelebration) {
        setScene('camp');
      } else if (previewNature) {
        setScene('nature');
      } else if (previewNaturePrint) {
        setScene('nature');
      } else if (previewWeather) {
        setScene('weather');
      } else if (previewCelebrationPath) {
        setScene('celebrationPath');
      } else if (previewTeamRescue) {
        setScene('teamRescue');
      } else if (!s.selectedCompanion) {
        setScene('starterSelection');
      } else {
        setScene('camp');
      }
    }, previewRequested ? 0 : 800);
  }, []);

  const transition = useCallback((to: Scene, delay = 0) => {
    setTransitioning(true);
    setTimeout(() => {
      setScene(to);
      setTransitioning(false);
    }, delay + (audioPreferences.reduceMotion ? 0 : 200));
  }, [audioPreferences.reduceMotion]);

  const handleSelectCompanion = useCallback((companion: string) => {
    if (!state) return;
    const newState = { ...state, selectedCompanion: companion };
    setState(newState);
    saveState(newState);
    transition('camp', 100);
  }, [state, transition]);

  const handleStartRescue = useCallback((zone: string) => {
    if (!state) return;
    playButton();
    const taskIndex = state.zoneTaskProgress[zone] ?? 0;
    const mission = getZoneTask(zone, taskIndex);
    if (!mission) return;
    const zoneInfo = ZONES.find(z => z.id === zone) || ZONES[0];
    setCurrentMission(mission);
    setCurrentZoneBg(zoneInfo.bgColors);
    transition('rescue', 100);
  }, [state, transition]);

  const handleStartDailyTrail = useCallback(() => {
    if (!state) return;
    const dailyMission = getNextDailyMission(state);
    if (!dailyMission) return;
    const mission = getZoneTask(dailyMission.zone, dailyMission.taskIndex);
    if (!mission) return;
    const zoneInfo = ZONES.find((zone) => zone.id === dailyMission.zone) || ZONES[0];
    playButton();
    setCurrentMission(mission);
    setCurrentZoneBg(zoneInfo.bgColors);
    setActiveDailyKey(dailyMission.key);
    transition('rescue', 100);
  }, [state, transition]);

  const handleRescueComplete = useCallback(() => {
    if (!state || !currentMission) return;
    const normalOutcome = completeRescue(
      state,
      currentMission.zone,
      currentMission.taskIndex,
      currentMission.difficulty,
      currentMission.type,
    );
    let newState = normalOutcome.newState;
    const result = normalOutcome.result;
    if (activeDailyKey) {
      newState = completeDailyTrailRescue(newState, activeDailyKey).newState;
      setActiveDailyKey(null);
    }
    setState(newState);

    const totalTasks = ZONES.reduce((s, z) => s + z.totalTasks, 0);
    const completedCount = Object.values(result.zoneTaskProgress).reduce((s, v) => s + v, 0);

    if (result.newZoneUnlocked) {
      setNewZoneUnlocked(result.newZoneUnlocked);
      transition('zoneUnlocked', 300);
    } else if (completedCount >= totalTasks) {
      transition('gameComplete', 300);
    } else {
      transition('camp', 300);
    }
  }, [state, currentMission, transition, activeDailyKey]);

  const handleRescueBack = useCallback(() => {
    setActiveDailyKey(null);
    transition('camp', 100);
  }, [transition]);

  const handleZoneUnlockedDone = useCallback(() => {
    if (!state) return;
    const totalTasks = ZONES.reduce((s, z) => s + z.totalTasks, 0);
    const completedCount = Object.values(state.zoneTaskProgress).reduce((s, v) => s + v, 0);
    setNewZoneUnlocked(null);
    if (completedCount >= totalTasks) {
      transition('gameComplete', 100);
    } else {
      transition('camp', 100);
    }
  }, [state, transition]);

  const handleGameCompleteDone = useCallback(() => transition('camp', 100), [transition]);
  const handleOpenJournal = useCallback(() => { playButton(); transition('journal', 100); }, [transition]);
  const handleCloseJournal = useCallback(() => transition('camp', 100), [transition]);
  const handleExitDone = useCallback(() => setScene('camp'), []);
  const handleOpenMatch3 = useCallback(() => { playButton(); transition('match3', 100); }, [transition]);
  const handleCloseMatch3 = useCallback(() => transition('camp', 100), [transition]);
  const handleOpenNursery = useCallback(() => { playButton(); transition('nursery', 100); }, [transition]);
  const handleCloseNursery = useCallback(() => transition('camp', 100), [transition]);
  const handleOpenParentSettings = useCallback(() => { playButton(); transition('parentSettings', 100); }, [transition]);
  const handleCloseParentSettings = useCallback(() => transition('camp', 100), [transition]);
  const handleOpenParentProgress = useCallback(() => { playButton(); transition('parentProgress', 100); }, [transition]);
  const handleCloseParentProgress = useCallback(() => transition('parentSettings', 100), [transition]);
  const handleOpenStorybook = useCallback(() => { playButton(); transition('storybook', 100); }, [transition]);
  const handleCloseStorybook = useCallback(() => transition('camp', 100), [transition]);
  const handleOpenCarePlay = useCallback(() => { playButton(); transition('carePlay', 100); }, [transition]);
  const handleCloseCarePlay = useCallback(() => transition('camp', 100), [transition]);
  const handleOpenBedtime = useCallback(() => { playButton(); transition('bedtime', 100); }, [transition]);
  const handleCloseBedtime = useCallback(() => transition('camp', 100), [transition]);
  const handleOpenGallery = useCallback(() => { playButton(); transition('gallery', 100); }, [transition]);
  const handleCloseGallery = useCallback(() => transition('parentSettings', 100), [transition]);
  const handleOpenLearning = useCallback(() => { playButton(); transition('learning', 100); }, [transition]);
  const handleCloseLearning = useCallback(() => transition('camp', 100), [transition]);
  const handleOpenNatureJournal = useCallback(() => { playButton(); transition('nature', 100); }, [transition]);
  const handleOpenWeatherWonder = useCallback(() => { playButton(); transition('weather', 100); }, [transition]);
  const handleOpenCelebrationPath = useCallback(() => { if (activeCelebrationPath) { playButton(); transition('celebrationPath', 100); } }, [activeCelebrationPath, transition]);
  const handleOpenTeamRescue = useCallback(() => { playButton(); transition('teamRescue', 100); }, [transition]);
  const handleCloseTeamRescue = useCallback(() => transition('camp', 100), [transition]);
  const handleCloseNatureJournal = useCallback(() => transition('camp', 100), [transition]);
  const handleStartLearningFocus = useCallback(() => {
    if (!state) return;
    const launch = getLearningFocusLaunch(activeLearningTheme);
    if (!launch) return;
    if (launch.kind === 'nature') { transition('nature', 100); return; }
    const mission = getZoneTask(launch.zone, launch.taskIndex);
    if (!mission) return;
    const zoneInfo = ZONES.find((zone) => zone.id === launch.zone) || ZONES[0];
    setCurrentMission(mission);
    setCurrentZoneBg(zoneInfo.bgColors);
    transition('rescue', 100);
  }, [activeLearningTheme, state, transition]);
  const handleLearningRound = useCallback((milestone: LearningMilestoneKey) => { if (state) setState(recordLearningRound(state, milestone)); }, [state]);
  const handleNatureDiscovery = useCallback((key: NatureDiscoveryKey) => { if (state) setState(recordNatureDiscovery(state, key)); }, [state]);
  const handleWeatherWonder = useCallback(() => { if (state) setState(recordWeatherWonder(state, activeCampTheme)); }, [activeCampTheme, state]);
  const handleChooseDecor = useCallback((name: string, decoration: HomeDecoration) => { if (state) setState(chooseHomeDecoration(state, name, decoration)); }, [state]);
  const handleCelebrateSeason = useCallback(() => { if (state) setState(rememberSeasonalMoment(state, getSanctuarySeason())); }, [state]);
  const handleCompleteCarePlay = useCallback((name: string, type: CritterType, kind: CarePlayKind) => { if (state) setState(completeCarePlay(state, name, type, kind).newState); }, [state]);
  const handleCompleteFriendshipDuo = useCallback((duo: FriendshipDuo) => { if (state) setState(completeFriendshipDuo(state, duo).newState); }, [state]);
  const handleCompleteTeamRescue = useCallback((team: TeamRescue) => { if (state) setState(completeTeamRescue(state, team).newState); }, [state]);
  const handleRemoveKeepsake = useCallback((id: string): Keepsake | null => {
    if (!state) return null;
    const result = removeKeepsake(state, id);
    setState(result.newState);
    return result.removed;
  }, [state]);
  const handleRestoreKeepsakes = useCallback((keepsakes: Keepsake[]) => { if (state) setState(restoreKeepsakes(state, keepsakes)); }, [state]);
  const handleClearKeepsakes = useCallback((): Keepsake[] => {
    if (!state) return [];
    const result = clearKeepsakes(state);
    setState(result.newState);
    return result.cleared;
  }, [state]);
  const handleCareCritter = useCallback((careKey: string, graduate: NurseryGraduate) => {
    if (!state) return null;
    const result = careForCritter(state, careKey, graduate);
    setState(result.newState);
    return { careLevel: result.careLevel, graduated: result.graduated };
  }, [state]);
  const handleCareHome = useCallback((critterName: string, critterType: CritterType) => {
    if (!state) return 0;
    const result = careForHome(state, critterName);
    setState(result.newState);
    setCareCelebration(getCareCelebration(critterName, critterType, result.careCount));
    return result.careCount;
  }, [state]);
  const handleCompleteBedtime = useCallback(() => {
    if (!state) return;
    const companion = STARTER_COMPANIONS.find((entry) => entry.type === state.selectedCompanion) ?? STARTER_COMPANIONS[0];
    setState(completeBedtimeWindDown(state, companion.name, companion.type).newState);
    transition('camp', 100);
  }, [state, transition]);
  const handleAcknowledgeGraduate = useCallback(() => {
    if (!state) return;
    setState(acknowledgeNurseryGraduate(state));
  }, [state]);
  const handleAcknowledgeDailyReward = useCallback(() => {
    if (!state) return;
    setState(acknowledgeDailyReward(state));
  }, [state]);

  if (scene === 'loading' || !state) return <LoadingScreen online={online} />;

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <div
          ref={fadeRef}
          className={`w-full h-full transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${audioPreferences.largeIconMode ? 'large-icon-mode' : ''} ${audioPreferences.reduceMotion ? 'reduce-motion-mode' : ''}`}
          style={{ opacity: transitioning ? 0 : 1, transform: transitioning && !audioPreferences.reduceMotion ? 'translateY(4px) scale(.998)' : 'none' }}
        >
          {!online && <div role="status" className="fixed z-[80] bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-center shadow-lg" style={{ background: '#F7E6B8', border: '1px solid #D8B867' }}><p className="font-body text-xs font-bold text-[#4A3022]">Offline · your saved camp can still play.</p></div>}
          {scene === 'starterSelection' && (
            <StarterSelectionScreen onSelect={handleSelectCompanion} />
          )}
          {scene === 'camp' && (
            <CampScreen
              forestHarmony={state.forestHarmony}
              campFlowersCount={state.campFlowersCount}
              rescueCount={state.rescueCompletedCount}
              companionType={state.selectedCompanion || 'bunny'}
              unlockedZones={state.unlockedZones}
              zoneTaskProgress={state.zoneTaskProgress}
              onStartRescue={handleStartRescue}
              dailyTrail={state.dailyTrail}
              lastDailyReward={state.lastDailyReward}
              onStartDailyTrail={handleStartDailyTrail}
              onAcknowledgeDailyReward={handleAcknowledgeDailyReward}
              homeCare={state.homeCare}
              onCareHome={handleCareHome}
              onOpenJournal={handleOpenJournal}
              onOpenMatch3={handleOpenMatch3}
              onOpenNursery={handleOpenNursery}
              onOpenParentSettings={handleOpenParentSettings}
              onOpenLearning={handleOpenLearning}
              onOpenNatureJournal={handleOpenNatureJournal}
              onOpenWeatherWonder={handleOpenWeatherWonder}
              celebrationPath={activeCelebrationPath}
              onOpenCelebrationPath={handleOpenCelebrationPath}
              onOpenTeamRescue={handleOpenTeamRescue}
              learningTheme={activeLearningTheme}
              onStartLearningFocus={handleStartLearningFocus}
              onOpenStorybook={handleOpenStorybook}
              onOpenCarePlay={handleOpenCarePlay}
              onOpenBedtime={handleOpenBedtime}
              homeDecor={state.homeDecor}
              kindnessMoments={getKindnessMoments(state.homeCare, state.nurseryVisits, state.carePlayWins)}
              season={activeCampTheme}
              celebration={careCelebration}
              onClearCelebration={() => setCareCelebration(null)}
              keepCelebrationVisible={new URLSearchParams(window.location.search).get('preview') === 'celebration'}
              bedtimeReminderEnabled={audioPreferences.bedtimeReminderEnabled}
              showPlaytimeSuggestion={showPlaytimeSuggestion}
              onDismissPlaytimeSuggestion={dismissPlaytimeSuggestion}
              lastNurseryGraduate={state.lastNurseryGraduate}
              onAcknowledgeGraduate={handleAcknowledgeGraduate}
              reduceMotion={audioPreferences.reduceMotion}
            />
          )}
          {scene === 'rescue' && currentMission && (
            <RescueScreen
              mission={currentMission}
              companionType={state.selectedCompanion || 'bunny'}
              bgColors={currentZoneBg}
              onComplete={handleRescueComplete}
              onBack={handleRescueBack}
              isFirstMission={state.rescueCompletedCount === 0}
              isEarlyMission={currentMission.zone === 'meadow' && currentMission.taskIndex < 3}
            />
          )}
          {scene === 'zoneUnlocked' && newZoneUnlocked && (
            <ZoneUnlockedScreen
              zoneName={ZONES.find(z => z.id === newZoneUnlocked)?.name || 'New Zone'}
              zoneId={newZoneUnlocked}
              onDone={handleZoneUnlockedDone}
            />
          )}
          {scene === 'gameComplete' && (
            <GameCompleteScreen
              rescueCount={state.rescueCompletedCount}
              forestHarmony={state.forestHarmony}
              companionType={state.selectedCompanion || 'bunny'}
              onDone={handleGameCompleteDone}
            />
          )}
          {scene === 'journal' && (
            <CritterJournalScreen
              zoneTaskProgress={state.zoneTaskProgress}
              selectedCompanion={(state.selectedCompanion || 'bunny') as any}
              onClose={handleCloseJournal}
            />
          )}
          {scene === 'exitAffirmation' && (
            <ExitAffirmationScreen onDone={handleExitDone} />
          )}
          {scene === 'match3' && (
            <Match3Screen
              onClose={handleCloseMatch3}
              critterName={STARTER_COMPANIONS.find((companion) => companion.type === state.selectedCompanion)?.name || 'Clover'}
              critterEmoji={STARTER_COMPANIONS.find((companion) => companion.type === state.selectedCompanion)?.type === 'fox' ? '🦊' : STARTER_COMPANIONS.find((companion) => companion.type === state.selectedCompanion)?.type === 'owl' ? '🦉' : STARTER_COMPANIONS.find((companion) => companion.type === state.selectedCompanion)?.type === 'squirrel' ? '🐿️' : STARTER_COMPANIONS.find((companion) => companion.type === state.selectedCompanion)?.type === 'hedgehog' ? '🦔' : STARTER_COMPANIONS.find((companion) => companion.type === state.selectedCompanion)?.type === 'bear' ? '🐻' : '🐰'}
            />
          )}
          {scene === 'nursery' && (
            <NurseryScreen
              companionType={(state.selectedCompanion || 'bunny') as any}
              rescuedCritters={getRescuedCritters(state.zoneTaskProgress)}
              nurseryCare={state.nurseryCare}
              onCare={handleCareCritter}
              onBack={handleCloseNursery}
              reduceMotion={audioPreferences.reduceMotion}
            />
          )}
          {scene === 'parentSettings' && <ParentSettingsScreen onBack={handleCloseParentSettings} onOpenProgress={handleOpenParentProgress} onOpenGallery={handleOpenGallery} />}
          {scene === 'parentProgress' && <ParentProgressScreen state={state} onBack={handleCloseParentProgress} />}
          {scene === 'storybook' && <CritterStorybookScreen rescuedCritters={getRescuedCritters(state.zoneTaskProgress)} homeDecor={state.homeDecor} season={activeCampTheme} seasonalKeepsakes={state.seasonalKeepsakes} onChooseDecor={handleChooseDecor} onCelebrateSeason={handleCelebrateSeason} onBack={handleCloseStorybook} />}
          {scene === 'carePlay' && <CritterCarePlayScreen rescuedCritters={getRescuedCritters(state.zoneTaskProgress)} onComplete={handleCompleteCarePlay} onCompleteDuo={handleCompleteFriendshipDuo} onBack={handleCloseCarePlay} />}
          {scene === 'gallery' && <MemoryGalleryScreen keepsakes={state.keepsakes} onBack={handleCloseGallery} onRemove={handleRemoveKeepsake} onRestore={handleRestoreKeepsakes} onClear={handleClearKeepsakes} />}
          {scene === 'bedtime' && <BedtimeWindDownScreen companionName={STARTER_COMPANIONS.find((entry) => entry.type === state.selectedCompanion)?.name || 'Clover'} companionType={(state.selectedCompanion || 'bunny') as CritterType} reduceMotion={audioPreferences.reduceMotion} onComplete={handleCompleteBedtime} onBack={handleCloseBedtime} />}
          {scene === 'nature' && <NatureDiscoveryJournalScreen season={activeCampTheme} discoveries={state.natureDiscoveries} learningTheme={audioPreferences.learningTheme} onDiscover={handleNatureDiscovery} onBack={handleCloseNatureJournal} printPreview={naturePrintPreview} />}
          {scene === 'weather' && <WeatherWonderScreen season={activeCampTheme} onComplete={handleWeatherWonder} onBack={() => transition('camp', 100)} />}
          {scene === 'celebrationPath' && activeCelebrationPath && <CelebrationPathScreen path={activeCelebrationPath} reduceMotion={audioPreferences.reduceMotion} onBack={() => transition('camp', 100)} />}
          {scene === 'teamRescue' && <TeamRescueScreen onComplete={handleCompleteTeamRescue} onBack={handleCloseTeamRescue} reduceMotion={audioPreferences.reduceMotion} />}
          {scene === 'learning' && <CampLearningScreen onBack={handleCloseLearning} onRoundComplete={handleLearningRound} learningTheme={audioPreferences.learningTheme} />}
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
import Match3Screen from './screens/Match3Screen';
