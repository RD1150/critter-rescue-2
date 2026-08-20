// ─────────────────────────────────────────────
// Critter Rescue — Game State (localStorage)
// ─────────────────────────────────────────────
import { CritterType, ZONES, ZONE_UNLOCK_THRESHOLDS, getZoneTask, MissionData } from './data';

export interface NurseryGraduate {
  careKey: string;
  name: string;
  type: CritterType;
}

export interface DailyTrailMission {
  key: string;
  zone: string;
  taskIndex: number;
}

export interface DailyTrailState {
  dayKey: string;
  missions: DailyTrailMission[];
  completedKeys: string[];
  rewardEarned: boolean;
}

export interface GameState {
  deviceId: string;
  selectedCompanion: string | null;
  forestHarmony: number;
  campFlowersCount: number;
  rescueCompletedCount: number;
  currentZone: string;
  unlockedZones: string[];
  zoneTaskProgress: Record<string, number>;
  nurseryCare: Record<string, number>;
  nurseryVisits: number;
  lastNurseryGraduate: NurseryGraduate | null;
  dailyTrail: DailyTrailState;
  lastDailyReward: string | null;
}

const STORAGE_KEY = 'critter_rescue_v1';

function generateId(): string {
  return 'player_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<GameState>;
      const fresh = createFreshState();
      // Hydrates older local saves cleanly after new progression systems are added.
      const hydrated: GameState = {
        ...fresh,
        ...saved,
        unlockedZones: saved.unlockedZones ?? fresh.unlockedZones,
        zoneTaskProgress: { ...fresh.zoneTaskProgress, ...(saved.zoneTaskProgress ?? {}) },
        nurseryCare: saved.nurseryCare ?? {},
        nurseryVisits: saved.nurseryVisits ?? 0,
        lastNurseryGraduate: saved.lastNurseryGraduate ?? null,
        dailyTrail: saved.dailyTrail ?? fresh.dailyTrail,
        lastDailyReward: saved.lastDailyReward ?? null,
      };
      return ensureDailyTrail(hydrated);
    }
  } catch {}
  return ensureDailyTrail(createFreshState());
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
    nurseryCare: {},
    nurseryVisits: 0,
    lastNurseryGraduate: null,
    dailyTrail: { dayKey: '', missions: [], completedKeys: [], rewardEarned: false },
    lastDailyReward: null,
  };
}

export function getDailyTrailKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dailySeed(dayKey: string): number {
  return dayKey.split('').reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) >>> 0, 17);
}

export function buildDailyTrail(state: GameState, dayKey = getDailyTrailKey()): DailyTrailState {
  const allowedZones = state.unlockedZones.length > 0 ? state.unlockedZones : ['meadow'];
  const candidates = allowedZones.flatMap((zoneId) => {
    const zone = ZONES.find((entry) => entry.id === zoneId);
    return zone ? Array.from({ length: zone.totalTasks }, (_, taskIndex) => ({ key: `${zoneId}:${taskIndex}`, zone: zoneId, taskIndex })) : [];
  });
  const seed = dailySeed(dayKey);
  const used = new Set<number>();
  const missions: DailyTrailMission[] = [];
  for (let offset = 0; missions.length < 3 && candidates.length > 0; offset += 1) {
    const index = (seed + offset * 7) % candidates.length;
    if (used.has(index)) continue;
    used.add(index);
    missions.push(candidates[index]);
  }
  return { dayKey, missions, completedKeys: [], rewardEarned: false };
}

export function ensureDailyTrail(state: GameState, dayKey = getDailyTrailKey()): GameState {
  if (state.dailyTrail.dayKey === dayKey && state.dailyTrail.missions.length === 3) return state;
  return { ...state, dailyTrail: buildDailyTrail(state, dayKey), lastDailyReward: null };
}

export function getNextDailyMission(state: GameState): DailyTrailMission | null {
  const ready = ensureDailyTrail(state);
  return ready.dailyTrail.missions.find((mission) => !ready.dailyTrail.completedKeys.includes(mission.key)) ?? null;
}

export interface DailyTrailResult {
  newState: GameState;
  completed: number;
  finished: boolean;
  rewardMessage?: string;
}

export function completeDailyTrailRescue(state: GameState, missionKey: string): DailyTrailResult {
  const ready = ensureDailyTrail(state);
  if (!ready.dailyTrail.missions.some((mission) => mission.key === missionKey) || ready.dailyTrail.completedKeys.includes(missionKey)) {
    return { newState: ready, completed: ready.dailyTrail.completedKeys.length, finished: ready.dailyTrail.rewardEarned };
  }
  const completedKeys = [...ready.dailyTrail.completedKeys, missionKey];
  const finished = completedKeys.length === ready.dailyTrail.missions.length;
  const rewardMessage = finished ? 'Trail Treasure earned: 3 camp blossoms and 5 Forest Harmony!' : undefined;
  const newState: GameState = {
    ...ready,
    forestHarmony: ready.forestHarmony + 2 + (finished ? 5 : 0),
    campFlowersCount: ready.campFlowersCount + 1 + (finished ? 3 : 0),
    dailyTrail: { ...ready.dailyTrail, completedKeys, rewardEarned: finished },
    lastDailyReward: finished ? rewardMessage! : ready.lastDailyReward,
  };
  saveState(newState);
  return { newState, completed: completedKeys.length, finished, rewardMessage };
}

export function acknowledgeDailyReward(state: GameState): GameState {
  const newState = { ...state, lastDailyReward: null };
  saveState(newState);
  return newState;
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

export interface CareResult {
  newState: GameState;
  careLevel: number;
  graduated: boolean;
}

/** One kind care action per visit, capped at three actions per critter. */
export function careForCritter(state: GameState, critterKey: string, graduate?: NurseryGraduate): CareResult {
  const current = state.nurseryCare[critterKey] ?? 0;
  const careLevel = Math.min(3, current + 1);
  const newState: GameState = {
    ...state,
    nurseryCare: { ...state.nurseryCare, [critterKey]: careLevel },
    nurseryVisits: state.nurseryVisits + 1,
    lastNurseryGraduate: careLevel >= 3 ? graduate ?? state.lastNurseryGraduate : state.lastNurseryGraduate,
  };
  saveState(newState);
  return { newState, careLevel, graduated: careLevel >= 3 };
}

export function acknowledgeNurseryGraduate(state: GameState): GameState {
  const newState = { ...state, lastNurseryGraduate: null };
  saveState(newState);
  return newState;
}
