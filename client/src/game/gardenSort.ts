export type GardenSortCategory = 'berries' | 'leaves';

export const GARDEN_SORT_ITEMS = [
  { id: 'berryOne', icon: '🍓', label: 'Red berry', category: 'berries' as const },
  { id: 'leafOne', icon: '🍃', label: 'Green leaf', category: 'leaves' as const },
  { id: 'berryTwo', icon: '🍒', label: 'Round berry', category: 'berries' as const },
  { id: 'leafTwo', icon: '🍂', label: 'Golden leaf', category: 'leaves' as const },
];

export const GARDEN_SORT_BASKETS: Record<GardenSortCategory, { icon: string; label: string }> = {
  berries: { icon: '🧺', label: 'Berry basket' },
  leaves: { icon: '🧺', label: 'Leaf basket' },
};
