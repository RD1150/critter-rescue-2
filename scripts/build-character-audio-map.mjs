import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/home/ubuntu';
const manifest = JSON.parse(await fs.readFile(path.join(root, 'webdev-static-assets', 'elevenlabs', 'characters', 'character_voice_manifest.json'), 'utf8'));
const uploadLog = await fs.readFile('/tmp/critter_character_uploads.log', 'utf8');
const uploaded = new Map();

for (const line of uploadLog.split('\n')) {
  const match = line.match(/characters\/([^\s]+\.mp3)\s+->\s+(\/manus-storage\/[^\s]+)/);
  if (match) uploaded.set(match[1], match[2]);
}

const lines = {
  Nutty: {
    intro: '/manus-storage/nutty_intro_elevenlabs_c7894963.mp3',
    help: '/manus-storage/nutty_help_elevenlabs_d8fa8e6c.mp3',
    thanks: '/manus-storage/nutty_thanks_elevenlabs_67b891b2.mp3',
  },
};

for (const entry of Object.values(manifest)) {
  if (entry.status !== 'complete') continue;
  const clips = {};
  for (const moment of ['intro', 'help', 'thanks']) {
    const filename = entry.files[moment];
    if (!uploaded.has(filename)) throw new Error(`Missing uploaded asset for ${filename}`);
    clips[moment] = uploaded.get(filename);
  }
  lines[entry.name] = clips;
}

const output = `// Recorded character dialogue is deliberately sparse and player-initiated.\n// Text always remains visible; a missing recording simply means the line stays quiet.\nexport type CharacterMoment = 'intro' | 'help' | 'thanks';\n\nconst RECORDED_LINES: Record<string, Partial<Record<CharacterMoment, string>>> = ${JSON.stringify(lines, null, 2)};\n\nexport function getCharacterAudioKey(name: string, zone?: string): string {\n  if (name === 'Everyone') return zone === 'riverside' ? 'River Friends' : 'Mountain Friends';\n  return name;\n}\n\nexport function hasCharacterAudio(name: string, moment: CharacterMoment, zone?: string): boolean {\n  return Boolean(RECORDED_LINES[getCharacterAudioKey(name, zone)]?.[moment]);\n}\n\nexport function playCharacterAudio(name: string, moment: CharacterMoment, zone?: string): void {\n  const source = RECORDED_LINES[getCharacterAudioKey(name, zone)]?.[moment];\n  if (!source || typeof Audio === 'undefined') return;\n  const audio = new Audio(source);\n  audio.volume = 0.92;\n  void audio.play().catch(() => {});\n}\n`;

await fs.writeFile(path.join(root, 'critter-rescue-game', 'client', 'src', 'game', 'characterAudio.ts'), output);
console.log(`Wrote ${Object.keys(lines).length} character audio profiles.`);
