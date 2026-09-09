export type CreativeBlockId = 'skyBase' | 'coralWall' | 'sunWindow' | 'mossRoof' | 'woodDoor' | 'lavenderFlower';

export type SavedCreativeBlockBuild = {
  id: string;
  name: string;
  spaces: (CreativeBlockId | null)[];
  createdAt: number;
};

const STORAGE_KEY = 'critter-rescue-creative-block-builds';
const MAX_SAVED_BUILDS = 12;
const VALID_BLOCK_IDS: readonly CreativeBlockId[] = ['skyBase', 'coralWall', 'sunWindow', 'mossRoof', 'woodDoor', 'lavenderFlower'];

const cleanName = (value: string) => value.trim().replace(/\s+/g, ' ').slice(0, 28);

const isBlockId = (value: unknown): value is CreativeBlockId => typeof value === 'string' && VALID_BLOCK_IDS.includes(value as CreativeBlockId);

const isBuild = (value: unknown): value is SavedCreativeBlockBuild => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SavedCreativeBlockBuild>;
  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.createdAt === 'number'
    && Array.isArray(candidate.spaces)
    && candidate.spaces.length === 9
    && candidate.spaces.every((space) => space === null || isBlockId(space));
};

export function loadCreativeBlockBuilds(): SavedCreativeBlockBuild[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isBuild).slice(0, MAX_SAVED_BUILDS) : [];
  } catch { return []; }
}

function writeCreativeBlockBuilds(builds: SavedCreativeBlockBuild[]): SavedCreativeBlockBuild[] {
  const next = builds.slice(0, MAX_SAVED_BUILDS);
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function saveCreativeBlockBuild(name: string, spaces: (CreativeBlockId | null)[]): SavedCreativeBlockBuild[] {
  const cleanSpaces = spaces.length === 9 ? spaces.map((space) => isBlockId(space) ? space : null) : Array(9).fill(null);
  const nextBuild: SavedCreativeBlockBuild = {
    id: `build-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName(name) || 'My cozy build',
    spaces: cleanSpaces,
    createdAt: Date.now(),
  };
  return writeCreativeBlockBuilds([nextBuild, ...loadCreativeBlockBuilds()]);
}

export function removeCreativeBlockBuild(id: string): SavedCreativeBlockBuild[] {
  return writeCreativeBlockBuilds(loadCreativeBlockBuilds().filter((build) => build.id !== id));
}

export const MAX_LOCAL_CREATIVE_BLOCK_BUILDS = MAX_SAVED_BUILDS;
