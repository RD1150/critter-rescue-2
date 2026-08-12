// ─────────────────────────────────────────────
// Critter Rescue — Game State (localStorage)
// ─────────────────────────────────────────────
import { ZONES, ZONE_UNLOCK_THRESHOLDS, getZoneTask, MissionData } from './data';

export interface GameState {
  deviceId: string;
  selectedCompanion: string | null;
  forestHarmony: number;
  campFlowersCount: number;
  rescueCompletedCount: number;
  currentZone: string;
  unlockedZones: string[];
  zoneTaskProgress: Record<string, number>;
}

const STORAGE_KEY = 'critter_rescue_v1';

function generateId(): string {
  return 'player_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GameState;
  } catch {}
  return createFreshState();
}

export function saveState(state: GameState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function createFreshState(): GameState {
  return {
    deviceId: generateId(),
    selectedCompanion: null,
    forestHarmony: 0,
    campFlowersCount: 0,
    rescueCompletedCount: 0,
    currentZone: 'meadow',
    unlockedZones: ['meadow'],
    zoneTaskProgress: { meadow: 0, riverside: 0, deepwoods: 0, mountain: 0 },
  };
}

export function resetState(): GameState {
  const fresh = createFreshState();
  saveState(fresh);
  return fresh;
}

export interface CompleteRescueResult {
  forestHarmony: number;
  campFlowersCount: number;
  rescueCompletedCount: number;
  newZoneUnlocked?: string;
  unlockedZones: string[];
  zoneTaskProgress: Record<string, number>;
}

export function completeRescue(
  state: GameState,
  zone: string,
  taskIndex: number,
  difficulty: number
): { newState: GameState; result: CompleteRescueResult } {
  const progress = state.zoneTaskProgress[zone] ?? 0;
  // Idempotency guard
  if (taskIndex !== progress) {
    return {
      newState: state,
      result: {
        forestHarmony: state.forestHarmony,
        campFlowersCount: state.campFlowersCount,
        rescueCompletedCount: state.rescueCompletedCount,
        unlockedZones: state.unlockedZones,
        zoneTaskProgress: state.zoneTaskProgress,
      },
    };
  }

  const harmonyGain = 3 + difficulty * 2;
  const newHarmony = state.forestHarmony + harmonyGain;
  const newFlowers = state.campFlowersCount + 1;
  const newRescues = state.rescueCompletedCount + 1;

  const newProgress = { ...state.zoneTaskProgress, [zone]: progress + 1 };

  const currentUnlocked = [...state.unlockedZones];
  let newZoneUnlocked: string | undefined;
  for (const [z, threshold] of Object.entries(ZONE_UNLOCK_THRESHOLDS)) {
    if (newHarmony >= threshold && !currentUnlocked.includes(z)) {
      currentUnlocked.push(z);
      if (!newZoneUnlocked) newZoneUnlocked = z;
    }
  }

  const newState: GameState = {
    ...state,
    forestHarmony: newHarmony,
    campFlowersCount: newFlowers,
    rescueCompletedCount: newRescues,
    unlockedZones: currentUnlocked,
    zoneTaskProgress: newProgress,
  };

  saveState(newState);
  return {
    newState,
    result: {
      forestHarmony: newHarmony,
      campFlowersCount: newFlowers,
      rescueCompletedCount: newRescues,
      newZoneUnlocked,
      unlockedZones: currentUnlocked,
      zoneTaskProgress: newProgress,
    },
  };
}
