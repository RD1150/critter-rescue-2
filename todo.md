# Babylon.js 3D Rebuild Checklist

- [x] Create a lifecycle-safe Babylon.js game canvas component.
- [x] Build the plushie forest-diorama camp scene with terrain, trees, campfire, and warm lighting.
- [x] Add 3D textured plush critter characters with soft shadows and idle animations.
- [x] Replace the 2D camp view with the 3D scene while retaining the journal HUD and navigation.
- [x] Connect 3D critter interactions to rescue selection and existing progression state.
- [x] Verify desktop and mobile rendering, TypeScript checks, and core gameplay flow.
- [x] Save a final checkpoint and present the 3D version to the user.

## Requested Follow-up Upgrade

- [x] Build a persistent Critter Nursery care loop and interactive 3D nursery room.
- [x] Add an accessible browser-based narration control and wire it to companion and critter dialogue.
- [x] Expand the starter collection to six plushies and add companion collection cards to the journal.
- [x] Verify the complete expanded game flow and save a new delivery checkpoint.

## Celebration and Companion Polish

- [x] Add a nursery graduation celebration and camp-arrival feedback.
- [x] Add companion-specific rescue hints and bonus interactions for all six starters.
- [x] Verify the celebration and companion interactions, then save a publish-ready checkpoint.

## First-Play Clarity Pass

- [x] Replace vague camp narration with child-friendly spoken instructions.
- [x] Add a clear, visual three-step first-play guide from camp to rescue to reward.
- [x] Add contextual first-rescue help that explains the active puzzle in simple words.
- [x] Verify the revised first-play flow and save an updated checkpoint.

## Cartoonish Nutty Voice Preview

- [x] Define the bright, playful fictional squirrel-guide voice profile and preview script.
- [x] Restore ElevenLabs authorization and deployment stability without exposing credentials.
- [x] Generate cartoonish Nutty preview candidates and obtain approval before integration.
- [x] Integrate only the approved instructional voice with a silent, readable fallback.

## Sparse Character Dialogue

- [x] Add per-critter introduction, help-call, and thank-you dialogue data.
- [x] Restrict playback to those three story moments and keep all other guidance text-only/nonverbal.

## Complete Rescue Voice and Sound System

- [x] Inventory every rescue critter, mission type, dialogue moment, and existing sound-effect cue.
- [x] Write a concise task-specific help call, thank-you, and voice-design setting for every rescue critter.
- [x] Generate and organize the remaining sparse character voice assets.
- [x] Integrate the character cues and preserve nonverbal gameplay sound effects across all rescues.
- [x] Produce a complete dialogue-and-sound flow for review, verify the production build, and save a deployable checkpoint.

## Deployment Recovery

- [x] Identify the publishing timeout’s build, dependency, or deployment configuration cause.
- [x] Repair the deployment blocker without regressing the playable game.
- [x] Verify a production build and save a fresh deployable checkpoint.
- [x] Resolve the camp-only 3D rendering regression introduced during deployment optimization.
- [x] Re-verify both camp and nursery previews after the final Babylon runtime change.

## Audio Accessibility and First-Rescue Clarity

- [x] Add journal replay controls for each rescued critter’s introduction, help, and thank-you clips.
- [x] Add a persistent voice volume slider and a captions preference for character dialogue.
- [x] Review and refine the first three rescue instructions for child-friendly clarity.
- [x] Verify replay, accessibility settings, and the revised first three rescues, then save a deployable checkpoint.

## Parent Controls and Large-Icon Mode

- [x] Add one-tap playback of a rescued critter’s introduction, help, and thank-you clips.
- [x] Add and persist a large-icon mode for young players.
- [x] Build a dedicated parent settings page for sound and accessibility preferences.
- [x] Verify the full controls flow and save a deployable checkpoint.

## Motion Sensitivity Support

- [x] Add a persistent Reduce motion toggle to Parent Settings.
- [x] Apply the preference to disable nonessential game animations and transitions.
- [x] Verify the reduced-motion experience in camp and nursery, confirm the production build, and save a deployable checkpoint.

## Critter Homes and Daily Trail

- [x] Map camp state, rescued critters, and mission completion hooks for home and daily-trail rewards.
- [x] Add a persistent Reduce motion toggle to Parent Settings and disable nonessential animation when enabled.
- [x] Build visible Critter Homes in the 3D camp and assign rescued critters to suitable homes.
- [x] Add a daily three-rescue trail with a clear completion reward and reset logic.
- [x] Verify motion support, homes, daily rewards, and deployment, then save a checkpoint.

## Continuous GitHub Sync

- [x] Commit and push the verified Reduce motion accessibility milestone.
- [x] Commit and push the verified Critter Homes camp milestone.
- [x] Commit and push the verified daily three-rescue trail milestone.

## GitHub Backup

- [x] Verify access to RD1150/critter-rescue-2 and inspect the local Git state.
- [x] Commit the current Critter Rescue source with a descriptive message.
- [x] Push the commit to the specified GitHub repository.

## Interactive Homes and Preschool Play

- [x] Map the existing home meshes, daily trail cues, and camp navigation needed for the three requested experiences.
- [x] Add interactive feeding and petting actions for rescued plushies at their 3D Critter Homes.
- [x] Add gentle, optional daily-trail voice and nonverbal sound feedback for preschool players.
- [x] Build and verify a simple camp mini-game for color, shape, and pattern recognition for ages 3–5.
- [x] Verify all three experiences, save a deployable checkpoint, and push the completed update to GitHub.

## Pre-Reader Spoken Directions

- [x] Verify the complete pre-reader direction inventory, including the learning pattern round.
- [x] Generate gentle, optional instruction audio assets using Nutty’s approved squirrel-guide voice.
- [x] Add large tap-to-hear instruction controls with readable captions across core pre-reader play flows.
- [x] Verify the spoken-direction journey across core pre-reader play flows.
- [x] Save a deployable checkpoint for the completed pre-reader spoken-direction milestone.
- [x] Commit and push the completed pre-reader spoken-direction update to GitHub.

## Parent Progress and Resilient Play

- [x] Add a parent-facing dashboard for learning milestones, rescue activity, and daily trail progress.
- [x] Add persistent learning and daily-activity summaries to the game state.
- [x] Add a Parent Settings toggle that enables or disables optional spoken directions while preserving captions.
- [x] Build a gentle animated loading screen and offline-ready app shell for slow or interrupted connections.
- [x] Test parent controls, offline fallback, loading behavior, and new dashboard data.
- [ ] Save a deployable checkpoint and push the verified parent-progress update to GitHub.

## Sanctuary Story and Collectible Play Expansion

- [ ] Build a visual Critter Storybook that unlocks a compact memory page for each rescued plushie.
- [ ] Add child-safe Critter Home decorating choices that persist per rescued friend.
- [ ] Add calm seasonal sanctuary moments with a clear seasonal field note and optional celebration prompt.
- [ ] Add short grown-up-and-child cooperative play prompts that take about two minutes and require no score.
- [ ] Add future-ready plush adoption cards with each critter’s personality, care idea, and collectible details; do not add purchasing or external links.
- [ ] Test and visually verify the complete story, decorating, seasonal, grown-up, and adoption-card experience.
- [ ] Save a deployable checkpoint and push the verified sanctuary-story expansion to GitHub.
