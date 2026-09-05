import type { SequencedRescueDefinition } from './rescueSequence';

export type RiverRescueToolId = 'log' | 'rope' | 'guide';

export const RIVER_RESCUE: SequencedRescueDefinition<RiverRescueToolId> = {
  id: 'clover-river-rescue',
  title: 'Clover’s River Rescue',
  learningFocus: 'planning',
  steps: [
  {
    id: 'log',
    tool: 'Bridge log',
    icon: '🪵',
    prompt: 'Clover is safe on the river rock. What makes a steady bridge first?',
    success: 'The log makes a gentle bridge. Clover can take one safe step.',
    gentleRetry: 'That helper will be useful soon. First, Clover needs a steady bridge.',
  },
  {
    id: 'rope',
    tool: 'Rescue rope',
    icon: '🪢',
    prompt: 'The bridge is ready. What can Clover hold while crossing?',
    success: 'The soft rope reaches Clover. Now they can cross carefully.',
    gentleRetry: 'That comes next. Clover needs the soft rope before crossing.',
  },
  {
    id: 'guide',
    tool: 'Safe trail sign',
    icon: '🪧',
    prompt: 'Clover is almost across. What shows the way to the cozy bank?',
    success: 'Clover sees the safe trail and hops home. You planned each helper step!',
    gentleRetry: 'That tool helped already. Now Clover needs a sign for the safe bank.',
    },
  ],
};

export const RIVER_RESCUE_STEPS = RIVER_RESCUE.steps;

export const RIVER_RESCUE_TOOL_ORDER: readonly RiverRescueToolId[] = RIVER_RESCUE_STEPS.map((step) => step.id);
