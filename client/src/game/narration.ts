// Critter Rescue — browser-native narration. No service, key, or generated audio is required.
const NARRATION_KEY = 'critter_rescue_narration_enabled';

export function narrationSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function isNarrationEnabled(): boolean {
  if (!narrationSupported()) return false;
  try { return localStorage.getItem(NARRATION_KEY) !== 'false'; } catch { return true; }
}

export function setNarrationEnabled(enabled: boolean): void {
  try { localStorage.setItem(NARRATION_KEY, String(enabled)); } catch {}
  if (!enabled) stopNarration();
}

export function stopNarration(): void {
  if (narrationSupported()) window.speechSynthesis.cancel();
}

function clean(text: string): string {
  return text.replaceAll('"', '').replace(/[🌟♥🐾🧸]/g, '').replace(/\s+/g, ' ').trim();
}

export function speakNarration(text: string, tone: 'critter' | 'guide' = 'guide'): void {
  if (!narrationSupported() || !isNarrationEnabled()) return;
  const phrase = clean(text);
  if (!phrase) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase);
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((voice) => /en(-|_)?(US|GB|AU|CA)/i.test(voice.lang) && /female|samantha|zira|karen|moira|ava|serena|aria|allison/i.test(voice.name))
    ?? voices.find((voice) => /^en/i.test(voice.lang));
  if (englishVoice) utterance.voice = englishVoice;
  // A slower, brighter storybook delivery is easier for early readers to follow.
  utterance.rate = tone === 'critter' ? 0.88 : 0.9;
  utterance.pitch = tone === 'critter' ? 1.28 : 1.17;
  utterance.volume = 0.9;
  window.speechSynthesis.speak(utterance);
}
