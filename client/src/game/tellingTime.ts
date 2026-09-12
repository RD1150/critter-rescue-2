export type TellingTimeRound = {
  targetHour: number;
  choiceHours: readonly number[];
  prompt: string;
  success: string;
  gentleRetry: string;
};

export const TELLING_TIME_ROUNDS: readonly TellingTimeRound[] = [
  {
    targetHour: 7,
    choiceHours: [9, 7, 12],
    prompt: 'Brook is ready for a seven o’clock pond visit. Which clock has a short hand on seven and a long hand on twelve?',
    success: 'You found seven o’clock. Brook is ready for a calm morning visit!',
    gentleRetry: 'That clock shows a different time. Let’s look for the short hand on seven.',
  },
  {
    targetHour: 3,
    choiceHours: [1, 3, 5],
    prompt: 'Brook has a three o’clock leaf-reading rest. Which clock has a short hand on three and a long hand on twelve?',
    success: 'You found three o’clock. Brook can enjoy a quiet rest!',
    gentleRetry: 'That clock shows a different time. Let’s look for the short hand on three.',
  },
  {
    targetHour: 10,
    choiceHours: [8, 10, 12],
    prompt: 'Brook is ready for a ten o’clock sunbeam stretch. Which clock has a short hand on ten and a long hand on twelve?',
    success: 'You found ten o’clock. Brook is ready for a gentle stretch!',
    gentleRetry: 'That clock shows a different time. Let’s look for the short hand on ten.',
  },
];
