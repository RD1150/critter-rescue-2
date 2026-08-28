// ─────────────────────────────────────────────
// Critter Rescue — Game Data
// Zones, critters, missions, and progression
// ─────────────────────────────────────────────

export type MissionType =
  | 'bridge' | 'clearPath' | 'shelter' | 'guidePath'
  | 'memory' | 'pattern' | 'maze' | 'gather'
  | 'tracing' | 'sorting' | 'counting' | 'shapeFit'
  | 'spotDifference' | 'sequence' | 'findTools'
  | 'colorMatch' | 'sizeOrdering' | 'critterPath' | 'quietCount' | 'pictureRhyme' | 'letterSound' | 'alliteration' | 'habitatMatch';

export interface CritterData {
  name: string;
  emoji: string;
  personality: string;
  introLine: string;
  helpLine: string;
  thanksLine: string;
  secondLine: string;
  encourageLine: string;
  stuckLine: string;
  type: CritterType;
}

export type CritterType =
  | 'bunny' | 'fox' | 'owl' | 'squirrel' | 'bird' | 'ladybug' | 'frog'
  | 'otter' | 'turtle' | 'fish' | 'duck' | 'hedgehog' | 'snail'
  | 'lizard' | 'bee' | 'eagle' | 'goat' | 'beaver' | 'bear';

export interface StarterCompanion {
  type: CritterType;
  name: string;
  personality: string;
  note: string;
  badge: string;
  rescueIcon: string;
  rescueAbility: string;
  rescueHint: string;
}

export const STARTER_COMPANIONS: StarterCompanion[] = [
  { type: 'bunny', name: 'Clover', personality: 'Gentle & curious', note: 'A soft-hearted trail guide who notices every tiny pawprint.', badge: 'Meadow Guide', rescueIcon: '🌼', rescueAbility: 'Meadow Pause', rescueHint: 'Start with the nearest piece, then let each small success point you toward the next one.' },
  { type: 'fox', name: 'Ember', personality: 'Clever & bold', note: 'A bright-eyed scout with a warm campfire spirit.', badge: 'Trail Scout', rescueIcon: '🧭', rescueAbility: 'Scout’s Lookout', rescueHint: 'Before making a move, scan the whole puzzle from left to right. The clearest route usually appears first.' },
  { type: 'owl', name: 'Sage', personality: 'Wise & calm', note: 'A patient moonlit friend who hears the forest whisper.', badge: 'Night Watch', rescueIcon: '🌙', rescueAbility: 'Moon Map', rescueHint: 'Look for what repeats: matching shapes, familiar colors, or the same small rhythm. Patterns are quiet clues.' },
  { type: 'squirrel', name: 'Nutty', personality: 'Brave & busy', note: 'A quick little helper who always packs an extra acorn.', badge: 'Acorn Keeper', rescueIcon: '🌰', rescueAbility: 'Acorn Tally', rescueHint: 'Count the targets before you begin. A tiny tally keeps the busy parts of the trail from feeling too big.' },
  { type: 'hedgehog', name: 'Shadow', personality: 'Gentle & steady', note: 'A quiet friend with a brave heart beneath soft spines.', badge: 'Cozy Guardian', rescueIcon: '🍃', rescueAbility: 'Quiet Moment', rescueHint: 'Take one slow breath. There is no timer on kindness, and a calm look can reveal the next safe step.' },
  { type: 'bear', name: 'Summit', personality: 'Warm & strong', note: 'A big-hearted companion who makes every camp feel safe.', badge: 'Mountain Friend', rescueIcon: '⭐', rescueAbility: 'Courage Stamp', rescueHint: 'Choose one small move and make it with confidence. Brave rescues are built from one steady step at a time.' },
];

export function getStarterCompanion(type: string): StarterCompanion {
  return STARTER_COMPANIONS.find((companion) => companion.type === type) ?? STARTER_COMPANIONS[0];
}

export const EMOJI_TO_TYPE: Record<string, CritterType> = {
  '🐰': 'bunny', '🦊': 'fox', '🦉': 'owl', '🐿️': 'squirrel',
  '🐦': 'bird', '🐛': 'ladybug', '🐸': 'frog', '🦦': 'otter',
  '🐢': 'turtle', '🐟': 'fish', '🦆': 'duck', '🦔': 'hedgehog',
  '🐌': 'snail', '🦎': 'lizard', '🐝': 'bee', '🦅': 'eagle',
  '🐐': 'goat', '🦫': 'beaver', '🐻': 'bear', '🦢': 'owl',
  '🐙': 'frog', '🦙': 'goat', '🐦‍⬛': 'eagle', '🌊': 'fish', '⛰️': 'eagle',
};

export interface MissionData {
  type: MissionType;
  zone: string;
  critter: CritterData;
  scenarioText: string;
  hintText: string;
  objectCount: number;
  difficulty: number;
  requiresOrder: boolean;
  taskIndex: number;
  introText: string;
}

export interface ZoneInfo {
  id: string;
  name: string;
  description: string;
  unlockHarmony: number;
  bgColors: string[];
  missionTypes: MissionType[];
  totalTasks: number;
  emoji: string;
}

function c(
  name: string, emoji: string, personality: string,
  thanksLine: string, secondLine: string, encourageLine: string, stuckLine: string
): CritterData {
  return { name, emoji, personality, introLine: `Hi! I’m ${name}.`, helpLine: stuckLine, thanksLine, secondLine, encourageLine, stuckLine,
    type: EMOJI_TO_TYPE[emoji] || 'bunny' };
}

const MEADOW_CRITTERS: CritterData[] = [
  c('Nutty','🐿️','shy but brave','"You built that just for me..."','"I\'ll remember this forever."','"You\'re doing so well!"','"Take your time — I believe in you."'),
  c('Pip','🐦','cheerful and tiny','"My babies can sleep safe tonight!"','"You have the gentlest hands."','"Almost there! I can feel it!"','"Don\'t worry, you\'ve got this!"'),
  c('Daisy','🐛','curious and small','"I can see my home from here!"','"You made the whole world feel bigger."','"Wow, look at you go!"','"It\'s tricky, but you\'re smart."'),
  c('Clover','🐸','giggly and warm','"Ribbit! You\'re my favorite person!"','"The pond is singing because of you."','"You make everything look easy!"','"Even tricky things get solved with patience."'),
  c('Buttercup','🦋','delicate and graceful','"My wings are healing because of you!"','"Thank you for being so gentle."','"You\'re so careful and kind!"','"Take a deep breath. You\'ve got this!"'),
  c('Cricket','🦗','chirpy and helpful','"The whole meadow is singing today!"','"You\'re the best friend ever!"','"Chirp chirp — keep going!"','"Try listening to your heart!"'),
];

const RIVERSIDE_CRITTERS: CritterData[] = [
  c('Splash','🦦','playful and loyal','"My family can come home now!"','"Thank you, thank you!"','"You\'re doing it!"','"Keep trying!"'),
  c('Brook','🐢','wise and patient','"You helped me so much!"','"I\'m so happy now."','"One at a time — you got this!"','"Take your time. You can do it."'),
  c('Finn','🐟','sparkly and quick','"The water is happy again!"','"You\'re my best friend!"','"Wow, you\'re so fast!"','"Try a different way!"'),
  c('Reed','🦆','motherly and warm','"My babies are safe!"','"You\'re so kind!"','"Almost done! Keep going!"','"You can do it!"'),
  c('Bubbles','🐙','playful and artistic','"I can paint again! Thank you!"','"You made me smile so big!"','"You\'re so creative!"','"Try imagining it differently!"'),
  c('Piper','🦢','graceful and peaceful','"The river flows gently again."','"Your kindness ripples everywhere."','"You move through this so gracefully."','"Stillness brings clarity."'),
];

const DEEPWOODS_CRITTERS: CritterData[] = [
  c('Shadow','🦔','quiet and gentle','"You came to help me!"','"Now I feel safe."','"You\'re doing great!"','"I believe in you."'),
  c('Mossy','🐌','slow and thoughtful','"Thank you so much!"','"You\'re so nice."','"You\'re halfway there!"','"No rush — keep trying!"'),
  c('Ember','🦎','curious and bold','"My home is safe again!"','"You\'re the best!"','"You\'re so brave!"','"Look at it a new way!"'),
  c('Thistle','🐝','busy and grateful','"The whole hive says thank you!"','"We\'ll be friends forever!"','"Buzz buzz — keep going!"','"You\'re doing awesome!"'),
  c('Bark','🦊','clever and playful','"The forest feels like home again!"','"You outsmarted the dark!"','"I knew you could do it!"','"Think outside the box!"'),
  c('Ferns','🦢','small but mighty','"You made the forest bigger for me!"','"Big heart, you have!"','"Courage is what matters, not size!"','"One step at a time, friend."'),
];

const MOUNTAIN_CRITTERS: CritterData[] = [
  c('Rocky','🦅','proud but kind','"I can fly again!"','"I\'ll never forget you!"','"Yes! You can do it!"','"Keep trying!"'),
  c('Pebble','🐐','stubborn and sweet','"The path is open!"','"You\'re amazing!"','"One step at a time!"','"Don\'t give up!"'),
  c('Flint','🦫','hardworking and humble','"My dam is fixed!"','"You helped so much!"','"Just like me — good job!"','"Keep building!"'),
  c('Summit','🐻','big-hearted and gentle','"Thank you so much!"','"Come visit me anytime!"','"You\'re super strong!"','"You can do it!"'),
  c('Zephyr','🐦‍⬛','free-spirited and wise','"The mountain winds are clear again!"','"Freedom tastes like kindness."','"Soar with confidence!"','"See from a higher perspective."'),
  c('Alpaca','🦙','calm and steadfast','"My herd is together again."','"You have a noble heart."','"Steady, strong, and true!"','"Patience brings victory."'),
];

const EVERYONE_RIVER: CritterData = c('Everyone','🌊','all your river friends',
  '"The river path glows with your kindness."','"Every creature can find their way home now."',
  '"The whole river is cheering!"','"The river flows at its own pace. So can you."');
const EVERYONE_MOUNTAIN: CritterData = c('Everyone','⛰️','all your mountain friends',
  '"The mountain peak is open to all!"','"You\'ve connected the whole forest, from meadow to mountain."',
  '"Every friend you\'ve ever helped is cheering right now!"','"You\'ve come so far. You can do this."');

interface TaskDef {
  type: MissionType; critter: CritterData; scenarioText: string;
  hintText: string; objectCount: number; difficulty: number;
  requiresOrder: boolean; introText: string;
}

const MEADOW_TASKS: TaskDef[] = [
  { type:'counting', critter:MEADOW_CRITTERS[0], scenarioText:'Nutty lost three acorns in the meadow!', hintText:'Tap every golden acorn star.', objectCount:3, difficulty:1, requiresOrder:false, introText:'Nutty dropped three acorns. Can you tap every golden acorn star?' },
  { type:'tracing', critter:MEADOW_CRITTERS[1], scenarioText:'Pip needs a path through the flowers!', hintText:'Put your finger on the dot and follow the dotted line.', objectCount:3, difficulty:1, requiresOrder:false, introText:'Pip wants to fly through the flower garden. Can you slowly follow the dotted path?' },
  { type:'bridge', critter:MEADOW_CRITTERS[0], scenarioText:'Nutty needs stepping stones across the stream.', hintText:'Drag each stone onto an empty water circle.', objectCount:3, difficulty:1, requiresOrder:false, introText:'Nutty is too small to jump across the stream. Can you drag each stepping stone into an empty water circle?' },
  { type:'clearPath', critter:MEADOW_CRITTERS[1], scenarioText:"Pip's babies can't find their way home!", hintText:'Clear the fallen branches from the path', objectCount:3, difficulty:1, requiresOrder:false, introText:"Pip's little ones are chirping for dinner, but branches have fallen across the path." },
  { type:'sequence', critter:MEADOW_CRITTERS[2], scenarioText:'Daisy wants to learn how flowers grow!', hintText:'Put the pictures in the right order', objectCount:3, difficulty:1, requiresOrder:true, introText:'Can you show Daisy the right order? What comes first?' },
  { type:'quietCount', critter:MEADOW_CRITTERS[2], scenarioText:'Daisy needs three berries for a cozy snack!', hintText:'Count the berries, then tap the basket with three.', objectCount:3, difficulty:1, requiresOrder:false, introText:'Daisy has three little berries to tuck into a snack basket. Can you count with her?' },
  { type:'shapeFit', critter:MEADOW_CRITTERS[3], scenarioText:"Clover's puzzle board is all mixed up!", hintText:'Put each shape in its matching spot', objectCount:3, difficulty:1, requiresOrder:false, introText:'Oh no, all the shapes fell off! Can you put them back?' },
  { type:'maze', critter:MEADOW_CRITTERS[1], scenarioText:'Pip got lost in the tall grass maze!', hintText:'Draw a path through the maze to guide Pip home', objectCount:3, difficulty:2, requiresOrder:false, introText:"The grass has grown so tall it's like a maze! Can you trace a path to help Pip find the way?" },
  { type:'letterSound', critter:MEADOW_CRITTERS[4], scenarioText:'Buttercup needs the picture that starts like ball!', hintText:'Listen for the first sound, then tap the matching picture.', objectCount:3, difficulty:1, requiresOrder:false, introText:'Buttercup heard a bouncy ball. Can you find the picture that starts with the same sound?' },
  { type:'alliteration', critter:MEADOW_CRITTERS[5], scenarioText:'Cricket is making a silly sound song!', hintText:'Find the picture that starts like cricket.', objectCount:3, difficulty:1, requiresOrder:false, introText:'Cricket says, “cricket, cloud, cozy!” Can you find a picture that starts with the same sound?' },
];

const RIVERSIDE_TASKS: TaskDef[] = [
  { type:'tracing', critter:RIVERSIDE_CRITTERS[0], scenarioText:'Splash needs a river path drawn!', hintText:'Trace the dotted path with your finger', objectCount:3, difficulty:2, requiresOrder:false, introText:'The river is twisty today. Can you trace the path for Splash?' },
  { type:'bridge', critter:RIVERSIDE_CRITTERS[0], scenarioText:'Splash needs stepping stones across the rapids!', hintText:'Drag the stones into the rushing water', objectCount:3, difficulty:2, requiresOrder:false, introText:"The river is flowing fast today. Splash can't swim across alone." },
  { type:'sorting', critter:RIVERSIDE_CRITTERS[1], scenarioText:'Brook needs help sorting the river treasures!', hintText:'Drag each item to the right bucket', objectCount:6, difficulty:2, requiresOrder:false, introText:'The flood washed everything together! Help Brook sort it all out.' },
  { type:'memory', critter:RIVERSIDE_CRITTERS[1], scenarioText:"Brook forgot where everyone's homes are!", hintText:'Match the pairs to help Brook remember', objectCount:4, difficulty:2, requiresOrder:false, introText:'Brook is old and wise, but the flood mixed everything up. Help sort things out!' },
  { type:'guidePath', critter:RIVERSIDE_CRITTERS[2], scenarioText:"Finn can't see through the river fog!", hintText:'Place lanterns to light the way', objectCount:3, difficulty:3, requiresOrder:false, introText:'The fog is thick on the water. Finn needs a light to find the way home.' },
  { type:'spotDifference', critter:RIVERSIDE_CRITTERS[3], scenarioText:"Reed's pond changed overnight! What's different?", hintText:'Find the differences between the two pictures', objectCount:3, difficulty:2, requiresOrder:false, introText:"Something changed at Reed's pond! Can you spot what's different?" },
  { type:'pictureRhyme', critter:RIVERSIDE_CRITTERS[2], scenarioText:'Finn needs a picture rhyme to find a tall safe tree!', hintText:'Listen for the word that sounds like bee, then tap its picture rhyme.', objectCount:3, difficulty:2, requiresOrder:false, introText:'Finn heard a tiny bee beside a tall tree. Can you find the picture that rhymes with bee?' },
  { type:'habitatMatch', critter:RIVERSIDE_CRITTERS[3], scenarioText:'Reed needs help finding the cozy pond home!', hintText:'Tap the home where a duck can rest.', objectCount:3, difficulty:1, requiresOrder:false, introText:'Reed is looking for a cozy home beside the water. Can you choose the right habitat together?' },
  { type:'guidePath', critter:EVERYONE_RIVER, scenarioText:'Light the whole riverside for everyone!', hintText:'Place 5 lanterns in order along the path!', objectCount:5, difficulty:4, requiresOrder:true, introText:"It's getting dark on the river. Every friend needs to find their way home safely." },
];

const DEEPWOODS_TASKS: TaskDef[] = [
  { type:'sorting', critter:DEEPWOODS_CRITTERS[0], scenarioText:'Shadow needs help sorting forest things!', hintText:'Drag each item to the right bucket', objectCount:6, difficulty:3, requiresOrder:false, introText:'Everything got mixed up in the dark! Help Shadow sort it all.' },
  { type:'clearPath', critter:DEEPWOODS_CRITTERS[0], scenarioText:"Shadow's burrow is buried under branches!", hintText:'Clear the branches gently', objectCount:3, difficulty:2, requiresOrder:false, introText:'Shadow is scared and cold. Their home is hidden under a pile of branches.' },
  { type:'findTools', critter:DEEPWOODS_CRITTERS[1], scenarioText:'Mossy lost the rescue tools in the deep woods!', hintText:'Search the drawing carefully for hidden tools!', objectCount:4, difficulty:3, requiresOrder:false, introText:'The tools scattered in the dark forest! Look closely at the trees and bushes to find them.' },
  { type:'guidePath', critter:DEEPWOODS_CRITTERS[1], scenarioText:'Mossy is lost in the dark woods.', hintText:'Place lanterns to show the way home', objectCount:3, difficulty:3, requiresOrder:false, introText:'The deep woods are very dark. Mossy has been wandering for hours...' },
  { type:'shelter', critter:DEEPWOODS_CRITTERS[2], scenarioText:'Ember needs shelter from the cold rain!', hintText:'Stack the branches to build a cozy shelter', objectCount:4, difficulty:3, requiresOrder:false, introText:"Rain is falling and Ember's log is soaked. They need somewhere warm and dry." },
  { type:'spotDifference', critter:DEEPWOODS_CRITTERS[2], scenarioText:"Ember's forest looks different today!", hintText:'Find the differences between the two pictures', objectCount:4, difficulty:3, requiresOrder:false, introText:'Something changed in the deep woods! Can you find what\'s different?' },
  { type:'pattern', critter:DEEPWOODS_CRITTERS[3], scenarioText:"Thistle's hive entrance has a secret code!", hintText:'Watch the pattern and repeat it!', objectCount:4, difficulty:4, requiresOrder:true, introText:'The hive door only opens with the right pattern. Watch carefully!' },
  { type:'maze', critter:DEEPWOODS_CRITTERS[0], scenarioText:'Shadow is lost deep in the winding forest paths!', hintText:'Trace through the dark forest maze carefully', objectCount:5, difficulty:4, requiresOrder:false, introText:'The deep woods twist and turn in every direction. Shadow needs you to find the way out.' },
];

const MOUNTAIN_TASKS: TaskDef[] = [
  { type:'counting', critter:MOUNTAIN_CRITTERS[0], scenarioText:"Rocky dropped feathers in the wind!", hintText:'Tap the stars to find them all!', objectCount:5, difficulty:3, requiresOrder:false, introText:"The mountain wind scattered Rocky's feathers! Can you count and tap them?" },
  { type:'bridge', critter:MOUNTAIN_CRITTERS[0], scenarioText:'Rocky needs a bridge across the mountain gap!', hintText:'Drag the stones into the gap', objectCount:4, difficulty:3, requiresOrder:false, introText:"Rocky's wing is hurt and they can't fly across the gap. They need your help." },
  { type:'findTools', critter:MOUNTAIN_CRITTERS[1], scenarioText:"Pebble's rescue kit is scattered on the mountain!", hintText:'Find all the tools hidden in the rocky scene!', objectCount:5, difficulty:4, requiresOrder:false, introText:'The wind blew all the rescue tools across the mountain! Look very carefully to find them all.' },
  { type:'shelter', critter:MOUNTAIN_CRITTERS[1], scenarioText:'Pebble needs shelter from the mountain wind!', hintText:'Stack the branches to block the wind', objectCount:4, difficulty:3, requiresOrder:false, introText:'The wind is howling and Pebble is shivering. Build something to keep them warm.' },
  { type:'spotDifference', critter:MOUNTAIN_CRITTERS[2], scenarioText:"Flint's mountain view changed after the storm!", hintText:'Find the differences between the two pictures', objectCount:5, difficulty:4, requiresOrder:false, introText:'The storm changed the mountain! Can you spot what\'s different?' },
  { type:'pattern', critter:MOUNTAIN_CRITTERS[2], scenarioText:'Flint needs to remember the trail markers!', hintText:'Watch the pattern and repeat it!', objectCount:5, difficulty:4, requiresOrder:true, introText:'The mountain mist has covered the trail markers. Help Flint remember the way!' },
  { type:'gather', critter:MOUNTAIN_CRITTERS[1], scenarioText:'Pebble needs mountain herbs before the snowstorm!', hintText:'Tap the herbs and berries — watch out for rocks!', objectCount:5, difficulty:4, requiresOrder:false, introText:'The mountain wind is blowing everything around! Help Pebble catch the good herbs before the storm hits.' },
  { type:'bridge', critter:EVERYONE_MOUNTAIN, scenarioText:'Build the grand mountain bridge for every critter!', hintText:'Place 6 stones in order across the chasm!', objectCount:6, difficulty:5, requiresOrder:true, introText:"This is it — the final bridge. Every friend you've saved is watching and believing in you." },
];

const ZONE_TASKS: Record<string, TaskDef[]> = {
  meadow: MEADOW_TASKS,
  riverside: RIVERSIDE_TASKS,
  deepwoods: DEEPWOODS_TASKS,
  mountain: MOUNTAIN_TASKS,
};

export const ZONES: ZoneInfo[] = [
  { id:'meadow', name:'Sunny Meadow', description:'A gentle clearing where little ones play', unlockHarmony:0, bgColors:['#87CEEB','#A8D8F0','#7EC8A0','#4A7A35','#3E6B2F'], missionTypes:['bridge','clearPath','memory','maze','tracing','counting','quietCount','letterSound','alliteration','sequence','shapeFit','colorMatch','sizeOrdering','critterPath'], totalTasks:10, emoji:'🌸' },
  { id:'riverside', name:'Rushing River', description:'Where the water meets the trees', unlockHarmony:15, bgColors:['#6BAACC','#87CEEB','#5A9E7A','#3E6B2F','#2D5A1E'], missionTypes:['bridge','clearPath','guidePath','memory','pictureRhyme','habitatMatch','sorting','tracing','spotDifference','sizeOrdering','critterPath'], totalTasks:9, emoji:'🌊' },
  { id:'deepwoods', name:'Deep Woods', description:'Ancient trees, hidden paths, quiet friends', unlockHarmony:40, bgColors:['#5A7A5E','#3E6B2F','#2D5A1E','#1F4216','#162F10'], missionTypes:['clearPath','shelter','guidePath','pattern','maze','sorting','spotDifference','sequence','findTools','critterPath'], totalTasks:8, emoji:'🌲' },
  { id:'mountain', name:'Misty Mountain', description:'The highest peak, where the bravest friends wait', unlockHarmony:75, bgColors:['#8B9AAA','#7A8A9A','#6A7A6A','#4A6A4A','#3A5A3A'], missionTypes:['bridge','shelter','guidePath','pattern','gather','counting','shapeFit','spotDifference','findTools','colorMatch','sizeOrdering','critterPath'], totalTasks:8, emoji:'⛰️' },
];

export const ZONE_UNLOCK_THRESHOLDS: Record<string, number> = {
  meadow: 0, riverside: 15, deepwoods: 40, mountain: 75,
};

export function getZoneTask(zone: string, taskIndex: number): MissionData | null {
  const tasks = ZONE_TASKS[zone];
  if (!tasks || taskIndex < 0 || taskIndex >= tasks.length) return null;
  const t = tasks[taskIndex];
  return { type:t.type, zone, critter:t.critter, scenarioText:t.scenarioText, hintText:t.hintText, objectCount:t.objectCount, difficulty:t.difficulty, requiresOrder:t.requiresOrder, taskIndex, introText:t.introText };
}

export function getZoneTaskCount(zone: string): number {
  return ZONE_TASKS[zone]?.length ?? 0;
}

export function isZoneComplete(zone: string, completed: number): boolean {
  return completed >= getZoneTaskCount(zone);
}

export function getRescuedCritters(zoneTaskProgress: Record<string, number>): CritterData[] {
  const rescued: CritterData[] = [];
  for (const [zone, progress] of Object.entries(zoneTaskProgress)) {
    const tasks = ZONE_TASKS[zone];
    if (!tasks) continue;
    for (let i = 0; i < Math.min(progress, tasks.length); i++) {
      if (tasks[i].critter.name !== 'Everyone') rescued.push(tasks[i].critter);
    }
  }
  return rescued;
}
