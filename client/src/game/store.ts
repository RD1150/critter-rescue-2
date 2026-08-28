// ─────────────────────────────────────────────
// Critter Rescue — Game State (localStorage)
// ─────────────────────────────────────────────
import { CritterType, MissionType, ZONES, ZONE_UNLOCK_THRESHOLDS, getZoneTask, MissionData } from './data';
import { getKindnessMoments } from './sanctuaryGrowth';
import type { FriendshipDuo } from './friendshipDuos';

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

export type LearningMilestoneKey = 'color' | 'shape' | 'pattern';
export type HomeDecoration = 'petal-garland' | 'cloud-pillow' | 'acorn-lantern' | 'starglow-mobile' | 'mossy-reading-nook' | 'tea-time-picnic';
export type SanctuarySeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type CarePlayKind = 'acorn-tidy' | 'nest-fluff' | 'brush-bloom' | 'ripple-refill' | 'garden-sprinkle';
export type QuietLearningRescueKind = 'quietCount' | 'pictureRhyme';

export interface Keepsake {
  id: string;
  source: 'care-play' | 'rescue' | 'seasonal' | 'bedtime';
  critterName: string;
  critterType: CritterType;
  title: string;
  message: string;
  createdAt: number;
}

export interface DailyActivity {
  rescueCount: number;
  learningRounds: number;
  homeCareMoments: number;
  nurseryCareMoments: number;
  carePlayMoments: number;
  dailyTrailCompleted: boolean;
}

export interface ParentProgressSummary {
  today: DailyActivity;
  recentDays: Array<{ dayKey: string; activity: DailyActivity }>;
  activeDaysInWeek: number;
  totalKindCare: number;
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
  homeCare: Record<string, number>;
  dailyTrail: DailyTrailState;
  lastDailyReward: string | null;
  learningMilestones: Record<LearningMilestoneKey, number>;
  activityLog: Record<string, DailyActivity>;
  homeDecor: Record<string, HomeDecoration>;
  seasonalKeepsakes: SanctuarySeason[];
  carePlayWins: Record<string, number>;
  friendshipDuoWins: Record<string, number>;
  quietLearningRescues: Record<QuietLearningRescueKind, number>;
  keepsakes: Keepsake[];
  bedtimeSessions: number;
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
        homeCare: saved.homeCare ?? {},
        dailyTrail: saved.dailyTrail ?? fresh.dailyTrail,
        lastDailyReward: saved.lastDailyReward ?? null,
        learningMilestones: { ...fresh.learningMilestones, ...(saved.learningMilestones ?? {}) },
        activityLog: saved.activityLog ?? {},
        homeDecor: saved.homeDecor ?? {},
        seasonalKeepsakes: saved.seasonalKeepsakes ?? [],
        carePlayWins: saved.carePlayWins ?? {},
        friendshipDuoWins: saved.friendshipDuoWins ?? {},
        quietLearningRescues: { ...fresh.quietLearningRescues, ...(saved.quietLearningRescues ?? {}) },
        keepsakes: saved.keepsakes ?? [],
        bedtimeSessions: saved.bedtimeSessions ?? 0,
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
    homeCare: {},
    dailyTrail: { dayKey: '', missions: [], completedKeys: [], rewardEarned: false },
    lastDailyReward: null,
    learningMilestones: { color: 0, shape: 0, pattern: 0 },
    activityLog: {},
    homeDecor: {},
    seasonalKeepsakes: [],
    carePlayWins: {},
    friendshipDuoWins: {},
    quietLearningRescues: { quietCount: 0, pictureRhyme: 0 },
    keepsakes: [],
    bedtimeSessions: 0,
  };
}

export function getDailyTrailKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getSanctuarySeason(date = new Date()): SanctuarySeason {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

const EMPTY_ACTIVITY: DailyActivity = { rescueCount: 0, learningRounds: 0, homeCareMoments: 0, nurseryCareMoments: 0, carePlayMoments: 0, dailyTrailCompleted: false };

function addActivity(state: GameState, contribution: Partial<DailyActivity>, dayKey = getDailyTrailKey()): GameState {
  const previous = state.activityLog[dayKey] ?? EMPTY_ACTIVITY;
  const next: DailyActivity = {
    rescueCount: previous.rescueCount + (contribution.rescueCount ?? 0),
    learningRounds: previous.learningRounds + (contribution.learningRounds ?? 0),
    homeCareMoments: previous.homeCareMoments + (contribution.homeCareMoments ?? 0),
    nurseryCareMoments: previous.nurseryCareMoments + (contribution.nurseryCareMoments ?? 0),
    carePlayMoments: previous.carePlayMoments + (contribution.carePlayMoments ?? 0),
    dailyTrailCompleted: previous.dailyTrailCompleted || Boolean(contribution.dailyTrailCompleted),
  };
  const withToday = { ...state.activityLog, [dayKey]: next };
  const keep = Object.keys(withToday).sort().slice(-14);
  return { ...state, activityLog: Object.fromEntries(keep.map((key) => [key, withToday[key]])) };
}

export function buildParentProgressSummary(state: GameState, date = new Date()): ParentProgressSummary {
  const todayKey = getDailyTrailKey(date);
  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const value = new Date(date);
    value.setDate(value.getDate() - (6 - index));
    const dayKey = getDailyTrailKey(value);
    return { dayKey, activity: state.activityLog[dayKey] ?? EMPTY_ACTIVITY };
  });
  const activeDaysInWeek = recentDays.filter(({ activity }) => activity.rescueCount + activity.learningRounds + activity.homeCareMoments + activity.nurseryCareMoments + activity.carePlayMoments > 0).length;
  return {
    today: state.activityLog[todayKey] ?? EMPTY_ACTIVITY,
    recentDays,
    activeDaysInWeek,
    totalKindCare: getKindnessMoments(state.homeCare, state.nurseryVisits, state.carePlayWins),
  };
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

export function completeDailyTrailRescue(state: GameState, missionKey: string, dayKey = getDailyTrailKey()): DailyTrailResult {
  const ready = ensureDailyTrail(state, dayKey);
  if (!ready.dailyTrail.missions.some((mission) => mission.key === missionKey) || ready.dailyTrail.completedKeys.includes(missionKey)) {
    return { newState: ready, completed: ready.dailyTrail.completedKeys.length, finished: ready.dailyTrail.rewardEarned };
  }
  const completedKeys = [...ready.dailyTrail.completedKeys, missionKey];
  const finished = completedKeys.length === ready.dailyTrail.missions.length;
  const rewardMessage = finished ? 'Trail Treasure earned: 3 camp blossoms and 5 Forest Harmony!' : undefined;
  const newState = addActivity({
    ...ready,
    forestHarmony: ready.forestHarmony + 2 + (finished ? 5 : 0),
    campFlowersCount: ready.campFlowersCount + 1 + (finished ? 3 : 0),
    dailyTrail: { ...ready.dailyTrail, completedKeys, rewardEarned: finished },
    lastDailyReward: finished ? rewardMessage! : ready.lastDailyReward,
  }, { dailyTrailCompleted: finished }, dayKey);
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
  difficulty: number,
  missionType?: MissionType,
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

  const quietLearningKind = missionType === 'quietCount' || missionType === 'pictureRhyme' ? missionType : null;
  const newState = addActivity({
    ...state,
    forestHarmony: newHarmony,
    campFlowersCount: newFlowers,
    rescueCompletedCount: newRescues,
    unlockedZones: currentUnlocked,
    zoneTaskProgress: newProgress,
    quietLearningRescues: quietLearningKind ? { ...state.quietLearningRescues, [quietLearningKind]: (state.quietLearningRescues[quietLearningKind] ?? 0) + 1 } : state.quietLearningRescues,
  }, { rescueCount: 1, learningRounds: quietLearningKind ? 1 : 0 });

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
  const newState = addActivity({
    ...state,
    nurseryCare: { ...state.nurseryCare, [critterKey]: careLevel },
    nurseryVisits: state.nurseryVisits + 1,
    lastNurseryGraduate: careLevel >= 3 ? graduate ?? state.lastNurseryGraduate : state.lastNurseryGraduate,
  }, { nurseryCareMoments: 1 });
  saveState(newState);
  return { newState, careLevel, graduated: careLevel >= 3 };
}

export function acknowledgeNurseryGraduate(state: GameState): GameState {
  const newState = { ...state, lastNurseryGraduate: null };
  saveState(newState);
  return newState;
}

export function careForHome(state: GameState, critterName: string): { newState: GameState; careCount: number } {
  const careCount = (state.homeCare[critterName] ?? 0) + 1;
  const newState = addActivity({ ...state, homeCare: { ...state.homeCare, [critterName]: careCount } }, { homeCareMoments: 1 });
  saveState(newState);
  return { newState, careCount };
}

export function recordLearningRound(state: GameState, milestone: LearningMilestoneKey): GameState {
  const updated = { ...state, learningMilestones: { ...state.learningMilestones, [milestone]: (state.learningMilestones[milestone] ?? 0) + 1 } };
  const newState = addActivity(updated, { learningRounds: 1 });
  saveState(newState);
  return newState;
}

export function chooseHomeDecoration(state: GameState, critterName: string, decoration: HomeDecoration): GameState {
  const newState = { ...state, homeDecor: { ...state.homeDecor, [critterName]: decoration } };
  saveState(newState);
  return newState;
}

export function rememberSeasonalMoment(state: GameState, season: SanctuarySeason): GameState {
  if (state.seasonalKeepsakes.includes(season)) return state;
  const newState = { ...state, seasonalKeepsakes: [...state.seasonalKeepsakes, season] };
  saveState(newState);
  return newState;
}

export function completeBedtimeWindDown(state: GameState, companionName: string, companionType: CritterType): { newState: GameState; keepsake: Keepsake } {
  const keepsake: Keepsake = {
    id: `bedtime-${Date.now()}-${companionName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    source: 'bedtime',
    critterName: companionName,
    critterType: companionType,
    title: `${companionName}: Moonlight rest`,
    message: 'You shared a quiet goodnight in the plushie sanctuary.',
    createdAt: Date.now(),
  };
  const newState = { ...state, bedtimeSessions: state.bedtimeSessions + 1, keepsakes: [keepsake, ...state.keepsakes].slice(0, 36) };
  saveState(newState);
  return { newState, keepsake };
}

const CARE_PLAY_COPY: Record<CarePlayKind, { title: string; message: string }> = {
  'acorn-tidy': { title: 'Acorns tucked away', message: 'You helped make a cozy little stash.' },
  'nest-fluff': { title: 'Nest fluffed with care', message: 'You helped make a soft, safe resting place.' },
  'brush-bloom': { title: 'A gentle brush and bloom', message: 'You helped your friend feel calm and cared for.' },
  'ripple-refill': { title: 'A quiet ripple refill', message: 'You helped make a fresh, sparkling water spot.' },
  'garden-sprinkle': { title: 'A little garden sprinkle', message: 'You helped the soft garden flowers drink.' },
};

export function completeCarePlay(state: GameState, critterName: string, critterType: CritterType, carePlay: CarePlayKind): { newState: GameState; keepsake: Keepsake } {
  const copy = CARE_PLAY_COPY[carePlay];
  const keepsake: Keepsake = {
    id: `care-${Date.now()}-${critterName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    source: 'care-play',
    critterName,
    critterType,
    title: `${critterName}: ${copy.title}`,
    message: copy.message,
    createdAt: Date.now(),
  };
  const newState = addActivity({
    ...state,
    carePlayWins: { ...state.carePlayWins, [critterName]: (state.carePlayWins[critterName] ?? 0) + 1 },
    keepsakes: [keepsake, ...state.keepsakes].slice(0, 36),
  }, { carePlayMoments: 1 });
  saveState(newState);
  return { newState, keepsake };
}

export function completeFriendshipDuo(state: GameState, duo: FriendshipDuo): { newState: GameState; keepsake: Keepsake } {
  const keepsake: Keepsake = {
    id: `duo-${Date.now()}-${duo.id}`,
    source: 'care-play',
    critterName: `${duo.names[0]} & ${duo.names[1]}`,
    critterType: duo.types[0],
    title: `${duo.names[0]} & ${duo.names[1]}: ${duo.title}`,
    message: duo.celebration,
    createdAt: Date.now(),
  };
  const newState = addActivity({
    ...state,
    carePlayWins: { ...state.carePlayWins, [duo.names[0]]: (state.carePlayWins[duo.names[0]] ?? 0) + 1, [duo.names[1]]: (state.carePlayWins[duo.names[1]] ?? 0) + 1 },
    friendshipDuoWins: { ...state.friendshipDuoWins, [duo.id]: (state.friendshipDuoWins[duo.id] ?? 0) + 1 },
    keepsakes: [keepsake, ...state.keepsakes].slice(0, 36),
  }, { carePlayMoments: 1 });
  saveState(newState);
  return { newState, keepsake };
}

export function removeKeepsake(state: GameState, id: string): { newState: GameState; removed: Keepsake | null } {
  const removed = state.keepsakes.find((keepsake) => keepsake.id === id) ?? null;
  if (!removed) return { newState: state, removed: null };
  const newState = { ...state, keepsakes: state.keepsakes.filter((keepsake) => keepsake.id !== id) };
  saveState(newState);
  return { newState, removed };
}

export function restoreKeepsakes(state: GameState, keepsakes: Keepsake[]): GameState {
  const present = new Set(state.keepsakes.map((keepsake) => keepsake.id));
  const restored = keepsakes.filter((keepsake) => !present.has(keepsake.id));
  if (!restored.length) return state;
  const newState = { ...state, keepsakes: [...restored, ...state.keepsakes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 36) };
  saveState(newState);
  return newState;
}

export function clearKeepsakes(state: GameState): { newState: GameState; cleared: Keepsake[] } {
  if (!state.keepsakes.length) return { newState: state, cleared: [] };
  const cleared = state.keepsakes;
  const newState = { ...state, keepsakes: [] };
  saveState(newState);
  return { newState, cleared };
}
