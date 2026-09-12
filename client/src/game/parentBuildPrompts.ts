export type ParentBuildPrompt = {
  id: string;
  title: string;
  prompt: string;
  enabled: boolean;
  createdAt: number;
};

export type ParentBuildPromptTemplate = Pick<ParentBuildPrompt, 'title' | 'prompt'> & {
  id: string;
};

export const PARENT_BUILD_PROMPT_TEMPLATES: readonly ParentBuildPromptTemplate[] = [
  { id: 'leafy-bridge', title: 'Leafy bridge', prompt: 'Can you make a leafy bridge for a friend?' },
  { id: 'pond-lookout', title: 'Pond lookout', prompt: 'Can you build a cozy lookout by a little pond?' },
  { id: 'flower-gate', title: 'Flower gate', prompt: 'Can you make a bright flower gate to walk through?' },
  { id: 'moon-home', title: 'Moon home', prompt: 'Can you build a small moonlit home for a friend?' },
];

const STORAGE_KEY = 'critter-rescue-parent-build-prompts';
const MAX_PROMPTS = 8;
const cleanText = (value: string, max: number) => value.trim().replace(/\s+/g, ' ').slice(0, max);

const isPrompt = (value: unknown): value is ParentBuildPrompt => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ParentBuildPrompt>;
  return typeof item.id === 'string'
    && typeof item.title === 'string' && item.title.length >= 3 && item.title.length <= 32
    && typeof item.prompt === 'string' && item.prompt.length >= 8 && item.prompt.length <= 90
    && typeof item.enabled === 'boolean' && typeof item.createdAt === 'number';
};

export function loadParentBuildPrompts(): ParentBuildPrompt[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isPrompt).slice(0, MAX_PROMPTS) : [];
  } catch { return []; }
}

function writeParentBuildPrompts(prompts: ParentBuildPrompt[]): ParentBuildPrompt[] {
  const next = prompts.slice(0, MAX_PROMPTS);
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function createParentBuildPrompt(title: string, prompt: string, enabled = true): ParentBuildPrompt[] {
  const cleanTitle = cleanText(title, 32);
  const cleanPrompt = cleanText(prompt, 90);
  if (cleanTitle.length < 3 || cleanPrompt.length < 8) return loadParentBuildPrompts();
  const item: ParentBuildPrompt = { id: `parent-prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: cleanTitle, prompt: cleanPrompt, enabled, createdAt: Date.now() };
  return writeParentBuildPrompts([item, ...loadParentBuildPrompts()]);
}

export function setParentBuildPromptEnabled(id: string, enabled: boolean): ParentBuildPrompt[] {
  return writeParentBuildPrompts(loadParentBuildPrompts().map((item) => item.id === id ? { ...item, enabled } : item));
}

export function removeParentBuildPrompt(id: string): ParentBuildPrompt[] {
  return writeParentBuildPrompts(loadParentBuildPrompts().filter((item) => item.id !== id));
}

export const MAX_PARENT_BUILD_PROMPTS = MAX_PROMPTS;
