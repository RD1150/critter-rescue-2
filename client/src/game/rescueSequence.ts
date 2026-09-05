/**
 * Shared contract for calm, picture-led planning rescues.
 * Every sequence stays short, shows only one active step, and supplies a gentle retry line.
 */
export type SequencedRescueStep<TToolId extends string = string> = {
  id: TToolId;
  tool: string;
  icon: string;
  prompt: string;
  success: string;
  gentleRetry: string;
};

export type SequencedRescueDefinition<TToolId extends string = string> = {
  id: string;
  title: string;
  learningFocus: 'planning' | 'causeAndEffect' | 'kindness';
  steps: readonly SequencedRescueStep<TToolId>[];
};

export function isExpectedRescueTool<TToolId extends string>(
  sequence: SequencedRescueDefinition<TToolId>,
  stepIndex: number,
  toolId: TToolId,
): boolean {
  return sequence.steps[stepIndex]?.id === toolId;
}
