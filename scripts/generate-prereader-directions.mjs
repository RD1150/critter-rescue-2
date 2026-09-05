import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const outDir = '/home/ubuntu/webdev-static-assets/elevenlabs/pre-reader-directions';
const manifestPath = path.join(outDir, 'manifest.json');
const apiKey = process.env.ELEVENLABS_API_KEY;
const approvedNuttyVoiceId = 'Nggzl2QAXh3OijoXD116';
const execFileAsync = promisify(execFile);
if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not available.');

const directions = {
  onboarding: 'Tap Let’s Help a Friend.', dailyTrail: 'Tap Start 3 Tiny Rescues.', bridge: 'Drag each stone onto a water circle.', clearPath: 'Tap the branches to clear the path.', shelter: 'Drag each piece into the cozy home.', guidePath: 'Drag the glowing stones along the path.', memory: 'Tap two pictures that match.', pattern: 'Tap the picture that comes next.', maze: 'Trace the safe path with your finger.', gather: 'Tap every item we need.', tracing: 'Trace the dotted line slowly.', sorting: 'Drag each picture to its matching home.', counting: 'Tap every golden acorn star.', shapeFit: 'Drag each shape into its matching space.', spotDifference: 'Tap the picture that looks different.', sequence: 'Drag the pictures into the right order.', findTools: 'Tap every rescue tool.', colorMatch: 'Drag each color to the same color.', sizeOrdering: 'Put the pictures from small to big.', critterPath: 'Trace the safe path to the friend.', quietCount: 'Tap the basket with three berries.', pictureRhyme: 'Tap the picture that rhymes with bee.', letterSound: 'Tap the picture that starts like ball.', alliteration: 'Tap the picture that starts like cricket.', habitatMatch: 'Tap the home where the duck can rest.', syllableClap: 'Tap the picture with two claps.', riverRescue: 'Tap the log, then rope, then trail.', friendshipDuo: 'Tap the leaf, then tap the berry.', friendshipDuoNuttyPip: 'Tap the leaf, then tap the berry.', friendshipDuoSplashThistle: 'Tap the ripple, then tap the flower.', friendshipDuoCloverShadow: 'Tap the blanket, then tap the moon.', teamRescue: 'Tap one helping picture, then the next one.', weatherWonder: 'Tap the kind weather picture.', learningColor: 'Tap the red circle.', learningShape: 'Tap the yellow square.', learningPattern: 'Tap the picture that comes next.',
};

async function request(url, body) {
  const response = await fetch(url, { method: 'POST', headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response;
}

async function synthesize(voiceId, text, destination) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const body = { text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.48, similarity_boost: 0.72, style: 0.22, use_speaker_boost: true } };
  try {
    const response = await request(url, body);
    await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    const payloadPath = `${destination}.json`;
    await fs.writeFile(payloadPath, JSON.stringify(body), { mode: 0o600 });
    try {
      await execFileAsync('sh', ['-c', 'curl --http1.1 --tlsv1.2 --fail --silent --show-error --retry 3 --retry-all-errors --connect-timeout 20 -X POST -H "Content-Type: application/json" -H "xi-api-key: $ELEVENLABS_API_KEY" --data-binary @"$3" "$1" -o "$2"', 'curl', url, destination, payloadPath], { env: { ...process.env, ELEVENLABS_API_KEY: apiKey } });
    } finally {
      await fs.rm(payloadPath, { force: true });
    }
  }
}

await fs.mkdir(outDir, { recursive: true });
let manifest = {};
try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch {}
const voiceId = approvedNuttyVoiceId;
manifest.voiceId = voiceId;
manifest.files ||= {};
for (const [key, text] of Object.entries(directions)) {
  if (manifest.files[key]) continue;
  const filename = `direction-${key}.mp3`;
  await synthesize(voiceId, text, path.join(outDir, filename));
  manifest.files[key] = filename;
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Generated ${key}`);
}
