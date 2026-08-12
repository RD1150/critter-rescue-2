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

import { loadState, saveState, completeRescue, GameState } from './game/store';
import { getZoneTask, MissionData, ZONES } from './game/data';
import { playButton } from './game/sounds';

type Scene =
  | 'loading'
  | 'starterSelection'
  | 'camp'
  | 'rescue'
  | 'zoneUnlocked'
  | 'gameComplete'
  | 'journal'
  | 'exitAffirmation'
  | 'match3';

function LoadingScreen() {
  return (
    <div className="game-screen forest-bg flex flex-col items-center justify-center gap-4">
      <img
        src="/manus-storage/game-logo_a4abbdba.png"
        alt="Critter Rescue"
        className="w-20 h-20 animate-float drop-shadow-xl"
      />
      <h1 className="font-display text-3xl font-bold text-white drop-shadow-lg">Critter Rescue</h1>
      <p className="text-white/60 font-body text-sm animate-pulse">Loading the forest…</p>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [scene, setScene] = useState<Scene>('loading');
  const [currentMission, setCurrentMission] = useState<MissionData | null>(null);
  const [currentZoneBg, setCurrentZoneBg] = useState<string[]>(['#87CEEB', '#7EC8A0', '#3E6B2F']);
  const [newZoneUnlocked, setNewZoneUnlocked] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const fadeRef = useRef<HTMLDivElement>(null);

  // Load state on mount
  useEffect(() => {
    const s = loadState();
    const preview3d = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'camp3d';
    const previewState = preview3d && !s.selectedCompanion
      ? { ...s, selectedCompanion: 'fox', rescueCompletedCount: 3, forestHarmony: 20, unlockedZones: ['meadow', 'riverside'], zoneTaskProgress: { ...s.zoneTaskProgress, meadow: 3 } }
      : s;
    setState(previewState);
    setTimeout(() => {
      if (preview3d) {
        setScene('camp');
      } else if (!s.selectedCompanion) {
        setScene('starterSelection');
      } else {
        setScene('camp');
      }
    }, 800);
  }, []);

  const transition = useCallback((to: Scene, delay = 0) => {
    setTransitioning(true);
    setTimeout(() => {
      setScene(to);
      setTransitioning(false);
    }, delay + 200);
  }, []);

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

  const handleRescueComplete = useCallback(() => {
    if (!state || !currentMission) return;
    const { newState, result } = completeRescue(
      state,
      currentMission.zone,
      currentMission.taskIndex,
      currentMission.difficulty,
    );
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
  }, [state, currentMission, transition]);

  const handleRescueBack = useCallback(() => {
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

  if (scene === 'loading' || !state) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <div
          ref={fadeRef}
          className="w-full h-full transition-opacity duration-200"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
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
              onOpenJournal={handleOpenJournal}
              onOpenMatch3={handleOpenMatch3}
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
              onClose={handleCloseJournal}
            />
          )}
          {scene === 'exitAffirmation' && (
            <ExitAffirmationScreen onDone={handleExitDone} />
          )}
          {scene === 'match3' && (
            <Match3Screen
              onClose={handleCloseMatch3}
              critterName={state.selectedCompanion === 'fox' ? 'Ember' : state.selectedCompanion === 'owl' ? 'Sage' : 'Clover'}
              critterEmoji={state.selectedCompanion === 'fox' ? '🦊' : state.selectedCompanion === 'owl' ? '🦉' : '🐰'}
            />
          )}
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
import Match3Screen from './screens/Match3Screen';
