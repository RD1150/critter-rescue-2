import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = '/home/ubuntu';
const sourcePath = path.join(ROOT, 'critter_voice_profiles.csv');
const outputDir = path.join(ROOT, 'webdev-static-assets', 'elevenlabs', 'characters');
const manifestPath = path.join(outputDir, 'character_voice_manifest.json');
const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not available in the environment.');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === ',' && !quoted) { row.push(cell); cell = ''; continue; }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      if (row.length || cell) { row.push(cell); rows.push(row); }
      row = []; cell = ''; continue;
    }
    cell += char;
  }
  if (row.length || cell) { row.push(cell); rows.push(row); }
  const [header, ...data] = rows;
  return data.map((items) => Object.fromEntries(header.map((key, index) => [key, items[index] ?? ''])));
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function request(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response;
}

async function createVoice(profile) {
  const sampleText = `${profile['Introduction Line']} ${profile['Help Line']} ${profile['Thank-You Line']} I am ready to help every friendly rescuer in the forest today.`;
  const description = `Fictional cartoon Critter Rescue character. ${profile['Voice Setting']} Never imitate a real child, celebrity, or real person. Clear English for young players.`;
  const designResponse = await request('https://api.elevenlabs.io/v1/text-to-voice/design?output_format=mp3_44100_128', {
    voice_description: description,
    text: sampleText,
    model_id: 'eleven_multilingual_ttv_v2',
    guidance_scale: 4,
    loudness: 0.2,
    should_enhance: true,
  });
  const design = await designResponse.json();
  const generatedVoiceId = design.previews?.[0]?.generated_voice_id;
  if (!generatedVoiceId) throw new Error('Voice Design did not return a generated voice identifier.');
  const characterName = profile.Subject.split('|')[0].trim();
  const createResponse = await request('https://api.elevenlabs.io/v1/text-to-voice', {
    voice_name: `Critter Rescue - ${characterName}`,
    voice_description: description,
    generated_voice_id: generatedVoiceId,
    labels: { project: 'Critter Rescue', character: characterName, type: 'fictional cartoon' },
  });
  const voice = await createResponse.json();
  if (!voice.voice_id) throw new Error('Voice creation did not return a voice identifier.');
  return voice.voice_id;
}

async function synthesize(voiceId, text, destination) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const response = await request(url, {
    text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.42, similarity_boost: 0.72, style: 0.44, use_speaker_boost: true },
  });
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

await fs.mkdir(outputDir, { recursive: true });
let manifest = {};
try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch {}
const profiles = (parseCsv(await fs.readFile(sourcePath, 'utf8')))
  .filter((profile) => profile.Subject && !profile.Subject.startsWith('Nutty |'));

for (const profile of profiles) {
  const name = profile.Subject.split('|')[0].trim();
  const key = slug(name);
  if (manifest[key]?.status === 'complete') {
    console.log(`Skipping ${name}; assets already complete.`);
    continue;
  }
  console.log(`Designing and generating ${name}…`);
  try {
    const voiceId = manifest[key]?.voiceId ?? await createVoice(profile);
    const files = {
      intro: `${key}_intro.mp3`,
      help: `${key}_help.mp3`,
      thanks: `${key}_thanks.mp3`,
    };
    await synthesize(voiceId, profile['Introduction Line'], path.join(outputDir, files.intro));
    await synthesize(voiceId, profile['Help Line'], path.join(outputDir, files.help));
    await synthesize(voiceId, profile['Thank-You Line'], path.join(outputDir, files.thanks));
    manifest[key] = {
      status: 'complete',
      name,
      voiceId,
      setting: profile['Voice Setting'],
      lines: { intro: profile['Introduction Line'], help: profile['Help Line'], thanks: profile['Thank-You Line'] },
      files,
    };
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`Completed ${name}.`);
  } catch (error) {
    manifest[key] = { status: 'error', name, error: String(error).replace(apiKey, '[redacted]') };
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.error(`Failed ${name}: ${String(error).replace(apiKey, '[redacted]')}`);
    process.exitCode = 1;
    break;
  }
}
