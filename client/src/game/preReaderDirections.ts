import type { MissionType } from './data';

export type PreReaderDirectionKey = 'onboarding' | 'dailyTrail' | 'learningColor' | 'learningShape' | 'learningPattern' | MissionType;

export const PRE_READER_DIRECTIONS: Record<PreReaderDirectionKey, string> = {
  onboarding: 'Tap Let’s Help a Friend.',
  dailyTrail: 'Tap Start 3 Tiny Rescues.',
  bridge: 'Drag each stone onto a water circle.',
  clearPath: 'Tap the branches to clear the path.',
  shelter: 'Drag each piece into the cozy home.',
  guidePath: 'Drag the glowing stones along the path.',
  memory: 'Tap two pictures that match.',
  pattern: 'Tap the picture that comes next.',
  maze: 'Trace the safe path with your finger.',
  gather: 'Tap every item we need.',
  tracing: 'Trace the dotted line slowly.',
  sorting: 'Drag each picture to its matching home.',
  counting: 'Tap every golden acorn star.',
  shapeFit: 'Drag each shape into its matching space.',
  spotDifference: 'Tap the picture that looks different.',
  sequence: 'Drag the pictures into the right order.',
  findTools: 'Tap every rescue tool.',
  colorMatch: 'Drag each color to the same color.',
  sizeOrdering: 'Put the pictures from small to big.',
  critterPath: 'Trace the safe path to the friend.',
  learningColor: 'Tap the red circle.',
  learningShape: 'Tap the yellow square.',
  learningPattern: 'Tap the picture that comes next.',
};
