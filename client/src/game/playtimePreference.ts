import { useEffect, useRef, useState } from 'react';
import type { PlaytimeDuration } from './audioPreferences';

export function useGentlePlaytimeSuggestion(minutes: PlaytimeDuration, forceVisible = false) {
  const startedAt = useRef(Date.now());
  const [ready, setReady] = useState(forceVisible);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
    if (forceVisible) { setReady(true); return; }
    if (minutes === 0) { setReady(false); return; }
    const elapsed = Date.now() - startedAt.current;
    const delay = Math.max(0, minutes * 60_000 - elapsed);
    const timer = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(timer);
  }, [forceVisible, minutes]);

  return { showSuggestion: ready && !dismissed, dismissSuggestion: () => setDismissed(true) };
}
