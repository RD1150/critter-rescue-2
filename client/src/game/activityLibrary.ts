export type ActivityLibraryEntry = {
  title: string;
  icon: string;
  learningFocus: string;
  findIt: string;
  coPlayPrompt: string;
};

export const ACTIVITY_LIBRARY: readonly ActivityLibraryEntry[] = [
  { title: 'River Rescue', icon: '🌊', learningFocus: 'Planning and cause-and-effect', findIt: 'Later in the Rushing River trail.', coPlayPrompt: 'Try: “What might help first?”' },
  { title: 'Telling Time', icon: '🕰️', learningFocus: 'Recognizing one full hour', findIt: 'At the end of the Rushing River trail.', coPlayPrompt: 'Try: “The little hand points to seven.”' },
  { title: 'Garden Sorting', icon: '🧺', learningFocus: 'Sorting by picture category', findIt: 'Later in the Sunny Meadow trail.', coPlayPrompt: 'Try: “Where does this picture belong?”' },
  { title: 'Nest Route', icon: '🪺', learningFocus: 'Spatial planning', findIt: 'Later in the Deep Woods trail.', coPlayPrompt: 'Try: “What helps Wren get ready first?”' },
  { title: 'Lodge Builder', icon: '🏡', learningFocus: 'Building in a helpful order', findIt: 'At the end of the Deep Woods trail.', coPlayPrompt: 'Try: “What makes a cozy home?”' },
  { title: 'Cozy Block Builder', icon: '🧱', learningFocus: 'Sequencing and creative construction', findIt: 'Later in the Misty Mountain trail.', coPlayPrompt: 'Try: “Tell me about what you built.”' },
  { title: 'Animal Home & Care Match', icon: '🏡', learningFocus: 'Matching animals with familiar homes and care places', findIt: 'At the end of the Sunny Meadow trail.', coPlayPrompt: 'Try: “Which cozy place goes with this animal?”' },
];
