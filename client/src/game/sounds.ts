// ─────────────────────────────────────────────
// Critter Rescue — Web Audio Sound System
// ─────────────────────────────────────────────
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function tone(freq: number, dur: number, vol = 0.18, type: OscillatorType = 'sine', delay = 0) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = type; osc.frequency.value = freq;
    const t = c.currentTime + delay;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.05);
  } catch {}
}

export function playSnap() { tone(880, 0.08, 0.15, 'square'); }
export function playPickup() { tone(660, 0.12, 0.12, 'sine'); tone(880, 0.12, 0.10, 'sine', 0.06); }
export function playError() { tone(220, 0.18, 0.15, 'sawtooth'); }
export function playComplete() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, 0.15, 'sine', i * 0.12));
}
export function playButton() { tone(660, 0.08, 0.10, 'sine'); }
export function playFlip() { tone(440, 0.10, 0.10, 'triangle'); }
export function playMatch() { tone(784, 0.15, 0.15, 'sine'); tone(1047, 0.15, 0.12, 'sine', 0.08); }
export function playPatternNote(idx: number) {
  const freqs = [523, 659, 784, 880];
  tone(freqs[idx] || 523, 0.25, 0.18, 'sine');
}
export function playCatch() { tone(880, 0.10, 0.14, 'sine'); tone(1100, 0.10, 0.10, 'sine', 0.05); }
export function playMilestone() {
  [523, 659, 784].forEach((f, i) => tone(f, 0.2, 0.12, 'sine', i * 0.08));
}
export function playWelcome() {
  [523, 659, 784, 659, 523].forEach((f, i) => tone(f, 0.25, 0.10, 'sine', i * 0.15));
}
export function playChime() {
  const freqs = [1047, 1175, 1319, 1397];
  const f = freqs[Math.floor(Math.random() * freqs.length)];
  tone(f, 0.5, 0.06, 'sine');
}
export function playNibble() { tone(523, 0.10, 0.08, 'sine'); tone(659, 0.16, 0.07, 'sine', 0.09); }
export function playPet() { tone(392, 0.12, 0.07, 'sine'); tone(523, 0.22, 0.06, 'sine', 0.11); }
export function playTrailStart() { tone(659, 0.13, 0.07, 'sine'); tone(784, 0.18, 0.07, 'sine', 0.10); }
export function playTrailTreasure() { [784, 988, 1175].forEach((f, i) => tone(f, 0.22, 0.08, 'sine', i * 0.10)); }
