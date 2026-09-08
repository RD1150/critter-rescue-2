export const TELLING_TIME_ROUND = {
  targetHour: 7,
  choiceHours: [9, 7, 12] as const,
  prompt: 'Brook is ready for a seven o’clock pond visit. Which clock has a short hand on seven and a long hand on twelve?',
  success: 'You found seven o’clock. Brook is ready for a calm morning visit!',
  gentleRetry: 'That clock shows a different time. Let’s look for the short hand on seven.',
};
