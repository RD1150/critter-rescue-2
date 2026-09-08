import type { SequencedRescueDefinition } from './rescueSequence';

export type BrickBuildBlockId = 'wideBase' | 'coralWalls' | 'mossRoof';

export const BRICK_BUILD: SequencedRescueDefinition<BrickBuildBlockId> = {
  id: 'summit-cozy-block-builder',
  title: 'Summit’s Cozy Block Builder',
  learningFocus: 'planning',
  steps: [
    {
      id: 'wideBase',
      tool: 'Wide blue base block',
      icon: '🟦',
      prompt: 'Summit is building a tiny camp cottage. What wide block makes a steady bottom first?',
      success: 'The wide blue block makes a steady bottom.',
      gentleRetry: 'That block will fit soon. First, the cottage needs a wide bottom block.',
    },
    {
      id: 'coralWalls',
      tool: 'Two coral wall blocks',
      icon: '🟥',
      prompt: 'The bottom is steady. What blocks can make the cottage walls?',
      success: 'The coral wall blocks make a cozy little room.',
      gentleRetry: 'That comes next. Summit needs the wall blocks before the roof.',
    },
    {
      id: 'mossRoof',
      tool: 'Moss-green roof block',
      icon: '🟩',
      prompt: 'The walls are ready. What block can sit on top like a cozy roof?',
      success: 'The soft green roof is on top. You built a cozy cottage with Summit!',
      gentleRetry: 'That block has already helped. Now Summit needs the roof block on top.',
    },
  ],
};

export const BRICK_BUILD_STEPS = BRICK_BUILD.steps;

export const BRICK_BUILD_ORDER: readonly BrickBuildBlockId[] = BRICK_BUILD_STEPS.map((step) => step.id);
