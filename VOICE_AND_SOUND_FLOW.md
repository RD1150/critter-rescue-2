# Critter Rescue — Character Voice and Sound Flow

## Design Rule

The game is intentionally **quiet and readable**. A critter speaks only at three story moments: their introduction, one short task-specific help call, and their thank-you after a successful rescue. Movement, tapping, matching, and care actions use gentle nonverbal sounds only. If a recorded voice is unavailable, the same line remains visible as text and the game proceeds silently.

## Rescue Sequence

| Moment | Player hears or sees | Existing sound cue |
|---|---|---|
| Rescue card opens | Critter introduction and one simple task request shown as text; approved recording may play once | `playWelcome` only when entering camp; no automatic browser speech |
| Correct move | Brief visual confirmation | `playSnap`, `playPickup`, `playMatch`, `playCatch`, or `playPatternNote` by mini-game |
| Incorrect move | Gentle retry cue, never a scolding message | `playError` |
| Rescue complete | Thank-you line shown; approved recording may play once | `playComplete` followed by `playMilestone` where applicable |
| Nursery care | Written care response | `playButton`, `playChime`, then `playComplete` at graduation |
| Camp navigation | Visual field note and text hint | `playButton` |

## Character Voice Settings and Script

| Critter | Introduction | Typical task call | Thank-you | Voice-design setting |
|---|---|---|---|---|
| Nutty — squirrel | “Hi, I’m Nutty, your brave squirrel friend!” | “Help me count and tap them all!” | “You found all my acorns! Thank you!” | Bright high cartoon squirrel; bouncy, warm, lightly squeaky, crisp words. |
| Pip — bird | “Hi, I’m Pip, your little bird buddy!” | “Help me trace the dotted path!” | “Yay! Thank you so much for your help!” | Tiny bubbly cartoon bird; bright, chirpy, eager, easy to understand. |
| Daisy — ladybug | “Hi, I’m Daisy, your tiny spotty friend!” | “Help me put the pictures in order!” | “You found my dots! Thank you so much!” | Curious tiny bug; sparkling, friendly, quick, soft cartoon energy. |
| Clover — frog | “Hi, I’m Clover, your hopper buddy!” | “Help me put every shape in its home!” | “My lily pads! Thank you so much, friend!” | Bubbly cartoon frog; cheerful, giggly, rounded, playful delivery. |
| Buttercup — butterfly | “Hi, I’m Buttercup, your fluttery friend!” | “Help me find what changed!” | “You found my dewdrop! Thank you so much!” | Light, airy, melodic, gentle, sweet cartoon delivery. |
| Cricket — cricket | “Hi, I’m Cricket, your bouncy friend!” | “Help me find all the rescue tools!” | “You found my leaf! Thank you so much!” | Chirpy, bright, energetic woodland-bug character voice. |
| Splash — otter | “Hi, I’m Splash, your river buddy!” | “Help me trace the dotted path!” | “You found my pebbles! Thank you so much!” | Splashy playful otter; bright, bouncy, friendly, upbeat delivery. |
| Brook — turtle | “Hello, I am Brook, your patient guide!” | “Help me put each thing in the right place!” | “Thank you for helping me, dear friend!” | Patient cartoon turtle; soft low warmth and a reassuring pace. |
| Finn — fish | “Hello! I am Finn, your sparkling swim buddy!” | “Help me light the way home!” | “All bubbles caught! Thank you so much, friend!” | Sparkly little fish; bright, quick, delighted, clear bubbly delivery. |
| Reed — duck | “Hello! I’m Reed, your cozy duck friend!” | “Help me find what changed!” | “All my ducklings are safe! Thank you so much!” | Cozy caring duck; warm, gentle, comforting storybook delivery. |
| Bubbles — octopus | “Hi! I’m Bubbles, your artistic sea pal!” | “Help me collect the good things!” | “You found my colors! Thank you so much!” | Bouncy, cheerful, imaginative sea-creature cartoon voice. |
| Piper — swan | “Hello, I am Piper, your graceful swan guide!” | “Help me collect the good things!” | “These lily petals are wonderful! Thank you, friend!” | Soft, calm, melodic, peaceful high cartoon delivery. |
| Shadow — hedgehog | “Hello, I am Shadow, your quiet woodland friend!” | “Help me put each thing in the right place!” | “Thank you so much for your kind help!” | Quiet cartoon hedgehog; shy, soft, kind, gentle low warmth. |
| Mossy — snail | “Hi, I am Mossy, your gentle garden snail.” | “Help me find all the rescue tools!” | “You found my dewdrops! Thank you so much!” | Thoughtful garden snail; warm, unhurried, sweet, clear pauses. |
| Ember — lizard | “Hello! I’m Ember, your curious lizard guide!” | “Help me make a cozy, dry shelter!” | “You found them! Thank you so much, friend!” | Curious cartoon lizard; sunny, energetic, bold, friendly warmth. |
| Thistle — bee | “Hi, I’m Thistle, your buzzing buddy!” | “Help me watch and copy the pattern!” | “You found the sweet nectar! Thank you, friend!” | Busy bright bee; brisk, playful, high and cheerful delivery. |
| Bark — fox | “Hi, I’m Bark, your clever fox friend!” | “Help me clear the safe way home!” | “You found my berries! Thank you so much!” | Clever woodland fox; warm medium pitch, playful and lightly mischievous. |
| Ferns — swan | “Hi, I’m Ferns, your tiny swan friend!” | “Help me find what changed!” | “You found them! Thank you so much!” | Small brave bird; bright, clear, cheerful medium-high delivery. |
| Rocky — eagle | “Hi, I am Rocky, your soaring friend!” | “Help me count and tap them all!” | “My nest is safe! Thank you so much, friend!” | Proud friendly eagle; clear, noble, warm, encouraging medium pitch. |
| Pebble — goat | “Hi, I’m Pebble, your sweet goat friend!” | “Help me find all the rescue tools!” | “Yay! Thank you for helping me down!” | Sweet stubborn goat; bouncy, cheerful, determined cartoon voice. |
| Flint — beaver | “Hello! I am Flint, your beaver friend!” | “Help me find what changed!” | “My dam is safe! Thank you, friend!” | Steady little builder; warm lower pitch, industrious, kind, calm. |
| Summit — bear | “Hi, I’m Summit, your gentle bear friend!” | “Help me collect the good things!” | “You found my honey! Thank you so much!” | Cozy gentle bear; warm, rich, unhurried, safe storybook delivery. |
| Zephyr — crow | “Hello! I am Zephyr, your sky guide!” | “Help me build a safe path across!” | “You found them all! Thank you so much!” | Breezy whimsical bird; melodic, wise, cheerful, clear delivery. |
| Alpaca — alpaca | “Hi! I’m Alpaca, your calm trail friend!” | “Help me find the safe trail!” | “My wool is safe! Thank you so much!” | Calm alpaca; warm medium pitch, steady, soothing, gentle delivery. |
| River Friends — finale | “Hello! We are your friendly river critters!” | “Help us light the way home!” | “You lit our river! Thank you, friend!” | Small joyful ensemble, splashing warmth, light group harmony. |
| Mountain Friends — finale | “We are the Mountain Friends, ready to help!” | “Help us build a safe path across!” | “You brought us home! Thank you so much!” | Brave warm ensemble, clear united delivery with hopeful lift. |

## Voice Asset Checklist

Nutty’s approved preview establishes the desired standard: high, warm, playful, cartoonish, and clear. Each remaining character requires only three short recorded files (`intro`, `help`, and `thanks`) using the corresponding setting above. No long-form narration, repeated commentary, or automatic browser synthesizer voice should be used.

## Current Recorded-Voice Integration

Nutty’s three approved **ElevenLabs** recordings are integrated as **tap-to-play** buttons beside the exact written line. They are never autoplayed. The first Sunny Meadow counting rescue can therefore play Nutty’s introduction, “Help me count and tap them all!”, and thank-you. The remaining rescue lines are fully integrated as text and remain intentionally silent until their corresponding character voice is generated and approved.
