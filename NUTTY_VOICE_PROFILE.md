# Nutty — Cartoon Squirrel Guide

## Voice Intent

Nutty is a **fictional animated woodland sidekick**, not a child imitation and not a generic adult narrator. The performance should be bright and high in pitch, but comfortably clear rather than shrill. It should feel like a small squirrel bouncing between branches: warm, playful, curious, and encouraging, with quick happy energy and a tiny squeaky sparkle on excited words.

The delivery should use short, expressive phrases with natural pauses. It should never sound breathy, synthetic, overly polished, sleepy, or like an adult explaining a lesson. The player should feel that Nutty is helping alongside them, not talking at them.

## ElevenLabs Voice-Design Brief

> Native English. Fictional cartoon woodland character. Bright, high-pitched adult character voice with a light, clear, naturally squeaky timbre. Persona: cheerful squirrel sidekick. Emotion: playful, kind, curious. Quick but easy-to-follow pacing, warm smile in the delivery, animated little rises of excitement, and crisp words for young players. Studio-quality recording. Do not sound like a real child, a generic adult narrator, or a robotic assistant.

## Preview Script

> Hi, I’m Nutty! I know every acorn, shortcut, and silly little trail in these woods. Ready to help a friend? Let’s scamper!

## Sparse Character-Speech Rule

Each critter may speak only at three story moments. All other information remains on screen as text, icons, and gentle nonverbal sound effects.

| Moment | Purpose | Nutty example |
|---|---|---|
| First introduction | Make the critter memorable | “Hi, I’m Nutty! I’m so glad you’re here!” |
| Help call | Give emotional stakes to the rescue | “Oh, help! I can’t find the safe trail!” |
| Thank-you | Close the rescue warmly | “You did it! Thank you, kind friend!” |

## Implementation Rule

No voice file is added to the game until the user approves the Nutty preview. If audio cannot load, the game must show the corresponding written line and continue silently; browser speech synthesis must not play automatically as a fallback.
