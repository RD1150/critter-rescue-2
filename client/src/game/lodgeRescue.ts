import type { SequencedRescueDefinition } from './rescueSequence';

export type LodgeRescueToolId = 'sturdySticks' | 'leafLining' | 'roundDoor';

export const LODGE_RESCUE: SequencedRescueDefinition<LodgeRescueToolId> = {
  id: 'bark-lodge-building-rescue',
  title: 'Bark’s Lodge-Building Rescue',
  learningFocus: 'planning',
  steps: [
    {
      id: 'sturdySticks',
      tool: 'Sturdy stick bundle',
      icon: '🪵',
      prompt: 'Bark needs a firm little lodge wall. Which helper is sturdy first?',
      success: 'The sturdy sticks make a firm little wall for Bark.',
      gentleRetry: 'That helper will be cozy soon. First, Bark needs sturdy sticks.',
    },
    {
      id: 'leafLining',
      tool: 'Soft leaf lining',
      icon: '🍂',
      prompt: 'The lodge wall is firm. What makes the inside soft?',
      success: 'The soft leaves make a snug lining inside the lodge.',
      gentleRetry: 'That comes next. Bark needs the soft leaves before closing the lodge.',
    },
    {
      id: 'roundDoor',
      tool: 'Round lodge door',
      icon: '🚪',
      prompt: 'The lodge is soft inside. What helps Bark close the cozy lodge?',
      success: 'The round door is settled. Bark’s little lodge is ready!',
      gentleRetry: 'That helper has already done its job. Now Bark needs the round lodge door.',
    },
  ],
};

export const LODGE_RESCUE_STEPS = LODGE_RESCUE.steps;

export const LODGE_RESCUE_TOOL_ORDER: readonly LodgeRescueToolId[] = LODGE_RESCUE_STEPS.map((step) => step.id);
