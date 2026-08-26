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
- [x] Save a deployable checkpoint and push the verified parent-progress update to GitHub.

## Sanctuary Story and Collectible Play Expansion

- [x] Build a visual Critter Storybook that unlocks a compact memory page for each rescued plushie.
- [x] Add child-safe Critter Home decorating choices that persist per rescued friend.
- [x] Add calm seasonal sanctuary moments with a clear seasonal field note and optional celebration prompt.
- [x] Add short grown-up-and-child cooperative play prompts that take about two minutes and require no score.
- [x] Add future-ready plush adoption cards with each critter’s personality, care idea, and collectible details; do not add purchasing or external links.
- [x] Test and visually verify the complete story, decorating, seasonal, grown-up, and adoption-card experience.
- [x] Verify that a selected Storybook home decoration persists and is visible on the matching 3D Critter Home after returning to camp.
- [x] Add and run a deterministic Storybook decoration-to-Babylon render-plan test for the persisted home variant.
- [x] Save a deployable checkpoint and push the verified sanctuary-story expansion to GitHub.

## Printable Cards, Seasonal Sound, and Home Décor Expansion

- [x] Add a printable adoption-card download that opens a clean family-print version without external commerce links.
- [x] Add a persistent Parent Settings toggle and volume control for optional seasonal soundscapes.
- [x] Create and integrate gentle seasonal background soundscape audio that remains fully optional.
- [x] Add three new unique decoration sets so every Critter Home has six total choices.
- [x] Render every new decoration set in the 3D sanctuary and cover its render plan with tests.
- [x] Test and visually verify printable cards, soundscape controls, and all decoration choices.
- [x] Visually verify the print-only adoption-card layout with a reproducible print-preview inspection.
- [x] Verify starglow mobile, mossy reading nook, and tiny tea picnic from Storybook selection through their corresponding 3D home render branches.
- [x] Add deterministic renderer-branch verification for starglow mobile, mossy reading nook, and tiny tea picnic.
- [x] Add an inspectable active-decoration renderer-status hook for deterministic per-home branch verification.
- [x] Save a deployable checkpoint and push the verified printable-card, soundscape, and décor expansion to GitHub.

## Competitive Feature Study, Care Play, and Family Keepsakes

- [x] Research comparable preschool animal-care and cozy collectible games, then document the feature-opportunity findings.
- [x] Design and add distinct, low-pressure care mini-games tied to rescued critter personalities and homes.
- [x] Add persistent mini-game accomplishments to the parent progress summary without scores, timers, or failure states.
- [x] Build a parent-safe local keepsake gallery of in-game moments, with clear export controls and no child photo, social sharing, or external upload.
- [x] Test and visually verify the research-driven care play, gallery privacy, and family export flows.
- [x] Visually verify the Family Keepsake Gallery export layout with a reproducible print-preview inspection.
- [x] Visually exercise the Brush Bloom care variant through completion and confirm its local keepsake result.
- [x] Save a deployable checkpoint and push the verified research, care-play, and keepsake-gallery expansion to GitHub.

## Sanctuary Growth, New Care Play, and Gallery Retention

- [x] Add gentle Sanctuary Growth rewards that turn completed care moments into visible, non-competitive camp improvements.
- [x] Add two new critter-specific, no-pressure care activities for water and garden homes.
- [x] Surface kindness growth and new care accomplishments in the parent progress summary without scores or timers.
- [x] Add parent-controlled local gallery-retention controls with clear, reversible removal actions and no external upload.
- [x] Test and visually verify sanctuary growth, both new care variants, parent progress, and gallery retention flows.
- [x] Save a deployable checkpoint and push the verified Sanctuary Growth, care-play, and gallery-controls expansion to GitHub.

## Living Critters, Bedtime Wind-Down, and Seasonal Themes

- [x] Add critter-specific care celebration animations with a complete Reduce Motion alternative.
- [x] Add an optional, timer-free bedtime wind-down activity with a gentle end-of-play transition.
- [x] Add persistent parent-controlled seasonal camp theme selection, including an automatic seasonal option.
- [x] Apply selected themes safely to 3D sanctuary accents and soundscape behavior.
- [x] Apply the selected camp theme to season-specific camp messaging and verify every theme path.
- [x] Add deterministic coverage for Spring, Summer, Autumn, Winter, and automatic camp-message mapping.
- [x] Visually verify the Spring, Summer, Autumn, and Winter camp-message paths in the 3D sanctuary.
- [x] Test and visually verify critter celebrations, bedtime wind-down, theme selection, and Reduce Motion behavior.
- [x] Remove the duplicate Seasonal soundscape section introduced while adding the sanctuary theme selector.
- [x] Save a deployable checkpoint and push the verified living-critter, bedtime, and theme-selector expansion to GitHub.
