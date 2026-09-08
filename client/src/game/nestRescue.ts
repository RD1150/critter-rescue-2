import type { SequencedRescueDefinition } from './rescueSequence';

export type NestRescueToolId = 'branchPath' | 'mossBundle' | 'nestCup';

export const NEST_RESCUE: SequencedRescueDefinition<NestRescueToolId> = {
  id: 'wren-nest-route-rescue',
  title: 'Wren’s Nest Route Rescue',
  learningFocus: 'planning',
  steps: [
    {
      id: 'branchPath',
      tool: 'Sturdy branch path',
      icon: '🌿',
      prompt: 'Wren needs a gentle way up the willow. What makes a sturdy path first?',
      success: 'The branch path is steady. Wren can flutter up one calm step.',
      gentleRetry: 'That helper will be cozy soon. First, Wren needs a sturdy way up.',
    },
    {
      id: 'mossBundle',
      tool: 'Soft moss bundle',
      icon: '🍃',
      prompt: 'The path is ready. What can Wren carry to make the nest soft?',
      success: 'The soft moss is tucked in. The nest is almost ready.',
      gentleRetry: 'That comes next. Wren needs the soft moss before settling the nest.',
    },
    {
      id: 'nestCup',
      tool: 'Cozy nest cup',
      icon: '🪺',
      prompt: 'The moss is soft. What gives Wren a cozy place to rest?',
      success: 'The little nest is cozy and safe. You planned each helpful step!',
      gentleRetry: 'That helper has already done its job. Now Wren needs the cozy nest cup.',
    },
  ],
};

export const NEST_RESCUE_STEPS = NEST_RESCUE.steps;

export const NEST_RESCUE_TOOL_ORDER: readonly NestRescueToolId[] = NEST_RESCUE_STEPS.map((step) => step.id);
