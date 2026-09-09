export type CreativeBlockPrompt = {
  id: 'littleBridge' | 'cozyHome' | 'tallTower' | 'flowerSpot' | 'sunnyWindow' | 'twoColorBuild' | 'friendlyDoor' | 'makePath';
  title: string;
  prompt: string;
  image: string;
};

export const CREATIVE_BLOCK_PROMPTS: readonly CreativeBlockPrompt[] = [
  { id: 'littleBridge', title: 'Little Bridge', prompt: 'Can you make a little bridge?', image: '/manus-storage/critter-rescue-build-prompt-little-bridge_605f6456.png' },
  { id: 'cozyHome', title: 'Cozy Home', prompt: 'Make a cozy home for a friend.', image: '/manus-storage/critter-rescue-build-prompt-cozy-home_9561c0bb.png' },
  { id: 'tallTower', title: 'Tall Tower', prompt: 'How tall would you like to build?', image: '/manus-storage/critter-rescue-build-prompt-tall-tower_9a91b4a6.png' },
  { id: 'flowerSpot', title: 'Flower Spot', prompt: 'Can you make a place for a flower?', image: '/manus-storage/critter-rescue-build-prompt-flower-spot_a7ce60de.png' },
  { id: 'sunnyWindow', title: 'Sunny Window', prompt: 'Where could a sunny window go?', image: '/manus-storage/critter-rescue-build-prompt-sunny-window_0f54b2cc.png' },
  { id: 'twoColorBuild', title: 'Two-Color Build', prompt: 'Pick two colors to build with.', image: '/manus-storage/critter-rescue-build-prompt-two-color_4d83aacf.png' },
  { id: 'friendlyDoor', title: 'Friendly Door', prompt: 'Add a door for a friend to visit.', image: '/manus-storage/critter-rescue-build-prompt-friendly-door_926d8646.png' },
  { id: 'makePath', title: 'Make a Path', prompt: 'Can you make a path to your creation?', image: '/manus-storage/critter-rescue-build-prompt-make-a-path_4c01deeb.png' },
];

export const getCreativeBlockPrompt = (id: CreativeBlockPrompt['id'] | null) => CREATIVE_BLOCK_PROMPTS.find((prompt) => prompt.id === id) ?? null;
