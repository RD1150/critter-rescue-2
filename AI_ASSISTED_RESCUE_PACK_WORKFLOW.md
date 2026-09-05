# Curated Ten-Rescue Roadmap and AI-Assisted Authoring Workflow

## Product Decision

Critter Rescue should grow into a **curated library of ten reusable planning-and-kindness rescues**, not unlimited unreviewed runtime generation. The child experience stays finite, predictable, and safe: each rescue has three large picture choices, one active action at a time, no timer, no failure state, no random reward, and no child-facing data collection.

AI can accelerate the creator’s drafting process, but it should never select, generate, or publish a new child-facing game during a child’s play session. A parent or project editor must review every generated pack before it is released to families.

## The Ten-Rescue Library

| # | Rescue concept | Three child-led steps | Thinking skill | Status |
|---:|---|---|---|---|
| 1 | **Clover’s River Rescue** | Place bridge log → send rescue rope → show safe trail | Planning and cause-and-effect | **Built** |
| 2 | Bird’s Nest Return | Find soft basket → raise branch lift → guide nest home | Order and spatial care | Planned |
| 3 | Otter’s Pond Path | Move smooth stone → float leaf marker → guide otter to reeds | Sequencing and habitat care | Planned |
| 4 | Hedgehog’s Garden Shelter | Set leaf roof → add soft moss → place cozy lantern | Planning and empathy | Planned |
| 5 | Beaver’s Stream Fix | Gather twig → place flat board → check calm crossing | Tool purpose and cause-and-effect | Planned |
| 6 | Duckling’s Puddle Way | Choose stepping stone → make gentle ripple → point to pond | Safe choices and direction | Planned |
| 7 | Owl’s Twilight Perch | Open branch path → hang warm lantern → guide owl to perch | Planning and visual order | Planned |
| 8 | Turtle’s Garden Gate | Lift twig latch → roll pebble ramp → show flower trail | Simple problem-solving | Planned |
| 9 | Fox’s Berry Basket | Set woven basket → choose soft leaf → carry berries home | Order and care | Planned |
| 10 | Goat’s Hill Bridge | Lay grass mat → hold handrail rope → point to meadow | Planning and confidence | Planned |

The nine planned concepts deliberately reuse the same **three-step visual grammar** while changing setting, companion, tools, and learning context. This repetition is a feature: children can learn the interaction pattern, then spend their attention on the new cause-and-effect story.

## Reusable Authoring Contract

Every planned rescue must use `client/src/game/rescueSequence.ts`. The contract requires a stable ID, a title, one learning focus, and an ordered list of concise visual steps. Each step must specify an icon, a child-readable tool label, one prompt, a success acknowledgement, and a gentle retry line.

| Required field | Guardrail |
|---|---|
| `steps` | Exactly three steps for this module family. Do not add branching, timers, or memory load. |
| `prompt` | One action or question only. Do not include a hidden rule, countdown, or multiple choices in one sentence. |
| `gentleRetry` | Acknowledge that the chosen item may be useful later, then restate the current need. Never use “wrong,” loss, or a penalty. |
| `icon` and `tool` | Use a clear, consistent picture-plus-label pair. Do not rely on reading alone. |
| `learningFocus` | Limit to planning, cause-and-effect, or kindness; do not imply assessment or a child score. |

## Parent-Reviewed AI-Assisted Workflow

| Stage | Creator or AI role | Mandatory review gate | Child sees it? |
|---|---|---|---|
| Brief | A grown-up chooses a setting, critter, three tools, age range, and learning focus from an approved form. | Reject sensitive, scary, unsafe, commercial, or culturally inaccurate themes. | No |
| Draft | AI may draft a three-step JSON-like pack, short prompts, retry lines, optional direction text, and art brief. | Check that all three actions are concrete and that language is age-appropriate. | No |
| Content review | An adult editor checks emotional tone, cultural context, duplicate content, and physical safety of depicted actions. | Require a signed-off “ready for child review” state. | No |
| Art and audio preparation | A creator commissions or generates assets from the approved brief and records only approved optional guidance. | Confirm consistent visual style, licensed/commercial-use rights, captions, and no real-child imitation. | No |
| Technical review | Developer adds the new pack to the mission data, writes tests, checks accessibility and Reduce Motion, and verifies no network or private data is introduced. | Automated tests, device checks, and a code review must pass. | No |
| Publish | Parent/editor releases the approved pack in a normal versioned update. | Release checklist and rollback point. | Yes |

## Explicit Prohibitions

The future authoring studio must not generate or publish content automatically to a child. It must not accept child text, voice, photo, location, or profile information as a prompt. It must not create purchase prompts, scarcity, gambling, streaks, leaderboards, content about harm or fear, or instructions that substitute for real adult safety guidance. If a child’s message or interaction could be involved, the feature needs a new privacy, parental-gate, and legal review before it is designed.

## Next Implementation Sequence

Build the remaining packs one at a time after the River Rescue is validated with families. Each new pack should begin with an approved brief, use the shared contract, receive a visual reference, include optional pre-reader support, add deterministic tests, and be tested on a physical touch device. Avoid bulk-generating all nine at once: small family feedback should shape the next pack’s pacing and tool clarity.
