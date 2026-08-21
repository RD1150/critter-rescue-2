# Critter Rescue — Build Memory

## Plush Image URLs (all generated, auto-replace when ready)
- bunny:    /manus-storage/plush-bunny_f8d3b5e8.png
- fox:      /manus-storage/plush-fox_a58c237d.png
- owl:      /manus-storage/plush-owl_2c50e902.png
- squirrel: /manus-storage/plush-squirrel_257a2d01.png
- frog:     /manus-storage/plush-frog_bca4cdce.png
- hedgehog: /manus-storage/plush-hedgehog_c818580b.png
- bear:     /manus-storage/plush-bear_3bb730a3.png
- duck:     /manus-storage/plush-duck_093868b6.png
- turtle:   /manus-storage/plush-turtle_0c0ee063.png
- bee:      /manus-storage/plush-bee_10b0dc79.png
- otter:    /manus-storage/plush-otter_91c587ed.png
- eagle:    /manus-storage/plush-eagle_e476ac8f.png
- bird:     /manus-storage/plush-bird_f1f08383.png
- goat:     /manus-storage/plush-goat_7327836e.png
- beaver:   /manus-storage/plush-beaver_200ccf5b.png
- fish:     /manus-storage/plush-fish_abf50122.png
- lizard:   /manus-storage/plush-lizard_2eb476c2.png
- snail:    /manus-storage/plush-snail_bc5b84d6.png
- ladybug:  /manus-storage/plush-ladybug_508df29a.png
- camp-bg:  /manus-storage/plush-camp-bg_f8914b83.png
- logo:     /manus-storage/game-logo_a4abbdba.png

## Key Design Tokens
- Foxglove Coral: #E66B5B (primary action, brand)
- Forest dark: oklch(0.26 0.07 145)
- Parchment: oklch(0.97 0.02 80)
- Fonts: Fraunces (display), Nunito Sans (body)

## Game Data
- 4 zones: meadow (0 harmony), riverside (15), deepwoods (40), mountain (75)
- 8 tasks per zone = 32 total
- 19 critter types, 24 named critters
- State saved to localStorage key: critter_rescue_v1

## Architecture
- client/src/game/data.ts — all missions, zones, critters
- client/src/game/store.ts — localStorage state management
- client/src/game/sounds.ts — Web Audio API sounds
- client/src/screens/ — all UI screens
- client/src/components/CritterAvatar.tsx — plush image renderer
- client/src/App.tsx — main router (scene state machine)

## Babylon.js 3D Plan (current phase)
- Install: @babylonjs/core @babylonjs/loaders (done)
- GameCanvas.tsx: full-screen Babylon canvas, lifecycle-safe
- CampScene3D.ts: 3D forest diorama — ground plane, trees, campfire, critter billboards
- Plush critters: Babylon planes with plush PNG textures + soft shadow
- Lighting: warm HemisphericLight (amber from above) + PointLight (campfire glow)
- Camera: ArcRotateCamera, fixed angle, gentle auto-rotate
- Puzzle screens: React overlays (z-index above canvas), canvas paused while overlay open
- All existing puzzle types preserved unchanged
- CampScreen.tsx replaced by 3D scene + React HUD overlay

## 3D Verification Notes
- First desktop preview confirmed the Babylon canvas renders a dimensional woodland camp with trees, felt ground, campfire, interactive plushie placements, fireflies, and HUD overlays.
- A visual pass found the plush image planes were vertically inverted and the campfire light overexposed the clearing. `BabylonCampScene.tsx` now flips the image texture V coordinate and reduces ambient/fire-light intensity for a softer product-diorama look.
- The corrected desktop preview shows upright, readable plush critters in a warm forest clearing. The mobile viewport also preserves the close-up plushie diorama composition and keeps the Match-3 and Find a Friend controls visible and tappable above the canvas.
- A reviewer screenshot pass returned a blank render despite the direct desktop and mobile preview captures rendering successfully. The valid visual passes were used for quality decisions. The accepted design refinement strengthens the field-journal identity with pinned desktop field-note and trail-map pocket surfaces, while preserving the 3D plushie world as the primary canvas.

## Follow-up Upgrade Verification Notes
- The new 3D nursery preview renders a warm toy-room care space with a plush bed, pillow, moonlit window, shelf, care controls, care-list panel, and the selected plush character as the focal point.
- The revised mobile starter screen cleanly fits all six plush companions in a readable 3-by-2 journal-card grid: Clover, Ember, Sage, Nutty, Shadow, and Summit.
- The journal preview confirms that all six companion cards render as a mobile-friendly collection, with the active companion clearly marked and rescued-friend records retained below.
- TypeScript verification passed after the ordered upgrade. A production-bundle command was stopped when it exceeded the execution window under sandbox memory pressure; this did not affect the running development server or the verified browser rendering.

## Celebration and Companion Polish Verification
- The graduation preview confirmed a full camp-arrival overlay with the graduated plushie, the Camp Arrival field label, a welcome message, the three-heart care stamp, and an explicit celebration action.
- Each starter companion now carries a distinct rescue ability and narrated trail tip: Clover’s Meadow Pause, Ember’s Scout’s Lookout, Sage’s Moon Map, Nutty’s Acorn Tally, Shadow’s Quiet Moment, and Summit’s Courage Stamp.

## First-Play Clarity Verification
- The mobile first-play preview now opens with a clear child-friendly rescue guide: an encouraging rescue-buddy message, three visual steps (go to Sunny Meadow, do the little rescue game, bring the friend home), a narrated read-aloud option, and a single prominent “Let’s Help a Friend!” action.
- The prior vague “drag around the camp” instruction has been replaced by a low-pressure optional exploration cue; starting a rescue is now the primary task explained in both the text and spoken narration.

## Deployment Recovery
- Publishing timed out while Vite processed more than 3,400 modules from the root `@babylonjs/core` entry. The 3D runtime is now lazy-loaded from the reachable jsDelivr prebuilt Babylon.js distribution, leaving only erased type imports in the application bundle.
- The repaired build transforms 1,625 modules and completes in roughly four seconds. The 3D camp and nursery previews both render correctly after the change; the camp shows the plush forest, companions, trees, campfire, and interactive HUD.

## Complete Character Voice System
- ElevenLabs Voice Design and Text-to-Speech successfully produced distinct fictional cartoon character profiles for 24 rescue critters plus two finale ensembles. Each has three short clips only: introduction, task-focused help, and thank-you.
- All 78 clips are uploaded to project storage and mapped through `client/src/game/characterAudio.ts`. The rescue UI presents them as optional tap-to-play buttons next to the corresponding written line; browser speech synthesis is no longer player-facing.
- The final mobile Nutty rescue preview shows a readable two-line character card with separate “Hear Nutty” controls for the introduction and the simple task instruction. The production build completes successfully in under four seconds.

## Accessibility Work in Progress
- Journal replay controls and persistent voice-volume/captions preferences have compiled successfully. Two preview captures of the development-only journal route returned only the parchment background without a current browser-console exception, so the journal route requires a focused rendering check before delivery.
- Direct browser inspection confirmed that the journal renders correctly with replay controls for every rescued critter, a character voice-volume slider, and a captions checkbox. The earlier blank screenshots were a capture timing artifact, not a runtime issue.
- First-three-rescue mobile previews confirmed clear three-step cards for Nutty’s acorn count, Pip’s dotted-path trace, and Nutty’s stepping-stone bridge. The cards use brief imperative sentences and match the revised mission text.

## Reduce Motion Verification
- Parent Settings now visibly includes a persistent “Reduce motion” switch with clear text describing what changes. It sits alongside character volume, captions, and large-icon settings on mobile.
- The preference is propagated through React screen transitions, global CSS animation safeguards, and both Babylon 3D environments. In reduced-motion mode, decorative DOM motion, camp firefly/flame/companion movement, and nursery plush/heart/care-token movement remain static while all interaction stays available.

## Interactive Homes and Preschool Learning Verification
- The 3D Critter Home care card appears clearly in the mobile camp after tapping a rescued plushie or its marked home. It has large Give a snack and Gentle pet actions, gentle sounds, persisted kindness counts, and no failure state.
- Daily Trail now uses a gentle welcome line when a child starts the first trail rescue and a warm reward line with soft chimes when all three tiny rescues are complete.
- The Camp Learning Trail was visually verified across all three mobile rounds: Color Hunt asks for a red circle, Shape Hunt asks for a yellow square, and Pattern Trail asks for the next item in a red-circle/blue-square sequence. All choices are large, four-option touch targets with child-friendly calm feedback.
- Both the 3D camp and Cozy Nursery rendered successfully in the dedicated `reduceMotion=1` development preview. The static preview states retained their essential rescue, care, and navigation controls while decorative scene movement was routed through the reduced-motion path.

## Critter Homes and Daily Trail Verification
- A populated 3D camp preview rendered successfully after adding Critter Homes, with the three saved plushies and a clear “Critter Homes — 3 cozy corners found” HUD card.
- The daily system now builds three deterministic missions from unlocked zones for the current calendar day. The populated camp preview displays a “Today’s Tiny Trail” card with three progress dots and the child-friendly “Start 3 tiny rescues” action.
- Unit tests confirm that daily missions remain stable on the same day and award the Trail Treasure only after all three rescue keys have been completed.
- Mobile daily-trail previews verify that after one rescue the camp card shows one filled progress dot and “Help the next friend,” and after all three rescues it presents a clear Trail Treasure overlay with the 3 camp blossoms and 5 Forest Harmony reward.
- The mobile home-care preview confirms that tapping a rescued plushie or its marked 3D home opens Nutty’s cozy-home card with large Give a snack and Gentle pet actions, a clear close control, and a visible per-home kindness counter.
- The automated screenshot utility again returned blank parchment captures for the development-only parent-settings and journal query previews; direct browser inspection is required for visual verification because the app content is known to render after the preview query initialization.
- Direct browser inspection confirmed the Parent Settings screen renders the voice volume slider, captions checkbox, large-icon toggle, reset control, and return-to-camp action. Toggling large-icon mode immediately enlarged the parent-screen plushie, confirming the preference is active.
- Direct journal inspection confirmed every rescued card presents the new one-tap “Hear story” control plus individual Hi, Help, and Thanks replay buttons. Triggering “Hear story” initiated the complete queued playback flow without a browser error.
