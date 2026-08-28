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

## Pre-Reader Spoken Directions Verification
- The 23 concise direction prompts are generated with the user-approved Nutty squirrel voice (`Nggzl2QAXh3OijoXD116`), uploaded as project-storage MP3 files, and mapped in `client/src/game/characterAudio.ts`. They are player-initiated only and respect the existing voice-volume preference.
- `PreReaderDirection.tsx` supplies a preschool-sized “Hear directions” target. Captions are visible only when the persistent Parent Settings captions preference is enabled; the control itself remains visible even when captions are off.
- The full direction treatment appears in first-play camp onboarding, Today’s Tiny Trail, every rescue introduction and active rescue header, and each Camp Learning Trail round. Direct mobile browser verification confirmed the spoken-direction card and readable caption in the counting rescue, the first color-learning round, and the Daily Trail card.
- The obsolete `speechSynthesis` narration module and unused narration control were removed. A source scan confirms no browser SpeechSynthesis fallback remains in player code.

## Quiet Learning Rescue Verification
- Direct browser inspection confirmed the quiet counting rescue gives Daisy three large berry-basket choices, with the correct three-berry basket clearly distinguishable by icon count and an optional Nutty direction button.
- Direct browser interaction confirmed the picture-rhyme rescue shows a visual bee cue and three large picture choices; choosing the tree gives a calm “bee and tree” success message and completion overlay without a penalty or timer.
- Direct Critter Care Play inspection confirmed Friends Together presents rescued pairs as clear large choices. Nutty and Pip’s corrected optional direction now says “Tap the leaf, then tap the berry,” matching the visible leaf and berry cards; completing both gives a calm care-team celebration and local shared keepsake.
- Direct Parent Settings inspection confirmed the new Gentle playtime check-in is parent-only, offers Off/10/20/30-minute choices, saves the chosen duration, and explains that any subsequent rest suggestion cannot lock play or show a countdown.
- Direct quiet-count completion confirmed Daisy’s three-berry choice yields the gentle success line “Three berries! Daisy can have a cozy snack.” and the standard calm rescue completion without a failure path. The forced playtime-check-in preview also confirmed the camp now shows only this single parent-selected rest cue, rather than stacking it with the bedtime reminder.
- Direct Parent Progress inspection confirmed the Grown-up view shows separate “Quiet learning rescues” and “Friends together” rows as gentle discoveries and shared care moments, alongside existing local-only learning and kindness context. It does not display scores, ranks, or streak obligations.
- Direct Friendship Duo inspection with `reduceMotion=1` confirmed the shared-care card retains its readable leaf-and-berry instruction and large taps while the game’s nonessential movement is suppressed through the global reduced-motion path.
- Direct quiet-count and forced-playtime checks with `reduceMotion=1` confirmed the large berry choices, optional direction, and single non-blocking rest suggestion remain clear and usable while the sanctuary uses its static low-motion rendering path.
- Direct picture-rhyme completion with `reduceMotion=1` confirmed the image-led bee/tree prompt, optional Nutty direction, and calm “Bee and tree” success response remain readable and fully usable without nonessential motion.
- Direct letter-sound rescue verification confirmed Buttercup’s picture-led ball `/b/` activity presents an optional Nutty direction, large ball/sun/moon choices, and a calm correct-answer message before the ordinary rescue thank-you—without penalties or a failure state.
- Final verification: 5 Vitest files / 9 tests pass, `pnpm check` passes, and `pnpm build` completes in approximately four seconds. The only remaining build output is the existing non-blocking large-chunk warning.

## Parent Progress and Resilient Play Verification
- Direct mobile browser inspection confirmed that the new local-only Little Trail Summary presents calm daily rescue, learning, and kindness totals; growth bars; color/shape/pattern discoveries; a seven-day activity strip without streak pressure; and sanctuary milestones.
- Direct mobile browser inspection confirmed Parent Settings exposes an enabled-by-default “Offer spoken directions” checkbox, explains that visual prompts and captions remain available when it is off, and provides a clear entry point to the activity summary.
- Direct interaction testing confirmed that turning off the new setting removes the pre-reader “Hear directions” controls from the active rescue and intro card while retaining the concise captioned “Try this” prompt. The existing sparse critter introduction/help controls remain separate and unchanged.

## Sanctuary Story Expansion Verification
- Direct mobile browser inspection confirmed the Critter Storybook shows one calm visual rescue-memory page per unlocked plushie, a seasonal field note, and a compact friend selector.
- Direct mobile browser inspection confirmed the Home Decorating tab offers three large, child-safe choices (petal garland, cloud pillow, acorn lantern), visibly marks the current choice, and explains that it appears in the 3D sanctuary.
- Direct mobile browser inspection confirmed the seasonal field note offers one optional, persistent keepsake action and the Storybook now includes short grown-up-and-child activity prompts and a future-plush adoption card. The adoption card is an in-app collectible design note only, with no shop, payment, or external link.
- Direct interaction testing confirmed the grown-up prompt explicitly remains score-free and that saving a seasonal keepsake changes the action to a completed “tucked into the book” state.
- Direct browser inspection confirmed the lazy-loaded Babylon 3D camp continues to render its plushie sanctuary, Critter Homes, seasonal accent dots, and the new Critter Storybook entry without a runtime failure.
- The Storybook decoration panel was reopened for a dedicated round-trip test; Nutty’s currently saved decoration is shown as the selected acorn lantern before changing the choice and returning to the 3D camp.
- Direct round-trip testing selected Nutty’s cloud pillow in the Storybook, showed the new checkmark state, and returned to the fully rendered 3D camp where the pale cushion accent is visible beside Nutty’s Critter Home. This confirms the persistent decoration choice reaches the Babylon sanctuary renderer.

## Printable Cards and Seasonal Soundscape
- Generated four original, instrumental-only 120-second sanctuary loops for spring, summer, autumn, and winter. They were uploaded as private web assets and are intentionally off by default.
- Direct mobile browser inspection confirmed Parent Settings exposes a clearly labelled “Play gentle background sound” control and a capped 0–45% background-level slider. Direct interaction confirmed the slider becomes available only when the grown-up enables the optional soundscape.
- Direct mobile browser inspection confirmed each adoption card now includes a prominent “Print or Save as PDF” action with a concise explanation of the browser print sheet and no commerce or external-link flow.
- Direct mobile browser inspection confirmed the Home Decorating panel now lists six large choices: petal garland, cloud pillow, acorn lantern, starglow mobile, mossy reading nook, and tiny tea picnic. Selecting the new starglow mobile visibly updates its selected state.
- Direct browser inspection confirmed the 3D plush sanctuary remains stable after returning from the new starglow mobile selection, with the updated decoration plan preserved into the Babylon camp render path.
- The printable adoption-card source card was opened again for the dedicated on-screen print-preview inspection; it includes Nutty’s personality, pocket detail, care idea, and the family keepsake action.
- Direct print-preview inspection confirmed the printable card renders as a clean single-page family keepsake with a title, seasonal label, plush portrait, personality, two care-detail panels, and a closing family promise. The preview uses the same DOM and print CSS as the Print or Save as PDF action.
- The decorator was reopened for focused end-to-end checks of the remaining new decoration sets; Nutty’s Home is ready for the mossy reading nook selection followed by a 3D camp return.
- Direct round-trip interaction selected the mossy reading nook and returned to the fully rendered 3D camp. The saved selection reaches the named Babylon render-plan branch for the green mat and tiny storybook accent.
- Direct Storybook interaction selected the tiny tea picnic and showed its saved checkmark state, ready for the matching 3D home render return check.
- Direct round-trip interaction selected the tiny tea picnic and returned to the fully rendered 3D camp. The saved selection reaches the named Babylon render-plan branch for its miniature picnic blanket and cup accent.
- The Storybook decorator was reopened with the active renderer-status hook available for a direct starglow mobile branch inspection.
- Direct 3D camp inspection now exposes `Nutty=starglow-mobile` together with all four corresponding created mesh identifiers (`home-starglow-string` plus three `home-starglow` meshes), providing inspectable confirmation of that live Babylon branch.
- The mossy reading nook selection was reopened with the active renderer-status hook ready to expose its exact two Babylon mesh identifiers in the next camp render.
- Direct 3D camp inspection now exposes `Nutty=mossy-reading-nook` with both created mesh identifiers (`home-reading-nook-mat-Nutty` and `home-reading-nook-book-Nutty`), providing inspectable confirmation of that live Babylon branch.
- The tiny tea picnic selection was reopened with the active renderer-status hook ready to expose its exact blanket and cup mesh identifiers in the next camp render.
- Direct 3D camp inspection now exposes `Nutty=tea-time-picnic` with both created mesh identifiers (`home-tea-picnic-blanket-Nutty` and `home-tea-picnic-cup-Nutty`), completing inspectable live-branch checks for all three new decoration sets.
- Direct mobile preview verification confirmed Critter Care Play shows each friend once, uses large three-tap acorn targets, updates a tapped item to a visible checkmark, and presents no timer, score, failure state, or pressure language.
- Completing all three Acorn Tidy targets showed a gentle celebration, a replay option, and explicit confirmation that an illustrated memory was saved to the grown-up keepsake gallery.
- Direct gallery preview verification confirmed the parent-only page states that memories use device-local Critter Rescue artwork and progress only, explicitly excludes child photo, microphone, social feed, and external upload, and offers a print/save action. The care preview was then reopened to verify a distinct bird care variant.
- The deterministic care preview now includes Shadow. Direct mobile inspection confirmed Shadow’s Gentle Brush variant uses a distinct brush prompt and three large optional brush-stroke targets, while retaining the no-score, no-timer interaction model.
- Two Gentle Brush taps visibly turn into checkmarks while leaving one clear brush target; the activity remains calm and reversible in feel, with no penalty or countdown.
- Completing Shadow’s third Brush Bloom target showed the gentle completion message and explicit illustrated-keepsake result. A dedicated gallery print preview then rendered a clean one-page keepsake with illustrated game cards and a clear statement that no child photo, voice, or personal information is included.

## Living Critters, Bedtime, and Seasonal Theme Verification
- The mobile bedtime preview renders a quiet, timer-free three-step activity with large targets, a soft moonlit palette, and a clear back-to-camp action. It is designed as an optional ending ritual rather than a game-over state.
- Direct parent-settings inspection confirmed that the existing optional soundscape settings appear once and that the new automatic-or-selected sanctuary theme control exposes spring, summer, autumn, and winter choices with concise descriptions.
- Direct interaction selected Winter moon in Parent Settings, updated the persistent parent-facing description, and then loaded the fully rendered 3D sanctuary with its winter palette and seasonal accents. The camp HUD also exposes the new reachable “Rest” entry for the quiet bedtime activity.
- Direct camp inspection confirmed Nutty’s animal-specific care celebration appears as a readable acorn-and-tail-wiggle acknowledgement above the fully rendered 3D sanctuary. Repeating the preview with Reduce Motion enabled preserved the clear acknowledgement and camp controls while the nonessential celebratory movement remains on the static rendering path.
- Direct bedtime interaction completed the lantern, blanket, and moon steps in sequence; each remained timer-free and ended in a quiet goodnight card. Choosing “Keep this quiet moment” returned to the fully rendered camp after saving the bedtime keepsake locally.
- Direct winter-theme camp inspection confirmed the theme now changes both the 3D setting and camp copy: the top sanctuary line, seasonal field-note label, and quiet winter observation all update together while rescue guidance remains intact.
- Direct 3D camp inspection verified the Spring bloom path shows its petals-and-new-blooms copy, while the Sunny camp path shows its warm-lantern and small-kind-moment copy. Both retained the same stable rescue controls and readable field-note layout.
- Direct Autumn leaves inspection completed the explicit theme-path review: its amber-leaf sanctuary line and extra-snug field note render correctly alongside the stable 3D camp. Together with the directly verified Winter moon path, all four seasonal message paths have been checked.
- Direct parent-settings and camp verification confirmed the new bedtime reminder is opt-in, clearly described as timer-free, and appears only as a small “Quiet ending, if wanted” card with an optional Rest action. Existing rescue and exploration controls remain available.
- Direct Storybook verification with the Autumn theme selected confirmed the new Season page presents “The leaf blanket” with three clear visual story moments and an explicit revisit-anytime ending. The existing rescue-memory and decoration tabs remain reachable.
- Direct camp celebration previews confirmed Nutty’s second care moment uses the distinct Cozy Nuzzle variation and the third uses Happy Scamper. The third preview with Reduce Motion enabled retained the variation name and care acknowledgement while the 3D sanctuary remained static.
- Direct Nature & Weather journal interaction verified that the Spring bud field note presents one large “I see it!” action, changes to a completed local-only observation, and marks the same seasonal page in the child’s four-card sky book without a score, timer, or external data collection.
- Direct Parent Settings inspection confirmed the new Family learning focus selector offers all, letter sounds, counting, rhymes, and nature & weather while explicitly explaining it is a spotlight, not a lock. Selecting Letter sounds persisted its description and was then shown as a small optional context chip in the fully available Colors, Shapes & Patterns learning trail.
- Direct Parent Progress inspection confirmed the new Letter sounds and Nature notes rows are presented as gentle discoveries rather than rankings. A direct Winter Nature & Weather preview with Reduce Motion enabled kept the seasonal field note and large observation action fully readable and static, while preserving the selected family focus context.
- Direct 3D camp inspection with Letter sounds selected showed a distinct “Today’s gentle focus” card—“Listen for the /b/ sound · Try this clue”—separate from ordinary camp destinations and without removing any existing play option. The browser session reset before the card’s click could be captured, so the focused-launch check is being retried.
- A repeat camp inspection confirmed the featured Letter sounds card remains visible in the live 3D sanctuary. The browser’s lazy-canvas navigation subsequently detached the clickable DOM snapshot before the action could be invoked; unit coverage verifies the phonics, counting, rhyme, and nature focus routes resolve to the intended activity targets, and stable parent-setting selections are being used for the remaining visual focus checks.
- Mobile camp checks verified each selected parent focus exposes a dedicated compact Focus action with its matching icon—letters, berries, music notes, or weather—while keeping Nursery, Learn, Nature, Stories, Rest, Match-3, and Find a Friend accessible. The parent-selected focus is now a genuine activity-launch priority rather than descriptive copy alone.
- In the actual Parent Settings flow, selecting Counting changed the saved parent description to “Gives visual counting activities a small spotlight.” The next camp navigation is being used to verify the matching berry Focus action before the same real-control check is repeated for Rhymes and Nature.
- Direct child-camp inspection after the saved Counting selection showed both the full “Count three cozy berries” card and the mobile berry Focus action, alongside all ordinary camp destinations. Returning to the actual Parent Settings selector and choosing Rhymes updated its saved parent explanation to “Gives picture-rhyme activities a small spotlight,” ready for the matching camp check.
- Direct child-camp inspection after the saved Rhymes selection showed the matching “Find a rhyme for bee” card and music-note Focus action. Returning to Parent Settings and selecting Nature & weather then updated its real saved explanation to “Gives seasonal discoveries and weather observations a small spotlight,” ready for its final camp-focus confirmation.
- Direct alliteration and habitat-rescue checks confirmed each introduction shows only one optional Nutty direction. Choosing cloud for Cricket’s /c/ pair and the pond home for Reed the duck both yielded clear, calm success text and the ordinary no-penalty rescue celebration.
- Direct Team Rescue verification confirmed the child, Nutty, and Pip help Wren through two large actions—Lift a leaf, then Show the nest. Completion shows “Wren can hear her nest now,” an empathy-centered acknowledgement, and confirms a local team-rescue gallery memory without points or pressure.
- Direct inspection of the parent-printable Nature Journal showed a clean four-season keepsake page with visual field notes and local-only discovery labels. It explicitly states that no photos or child information are included.
- Direct checks with `reduceMotion=1` confirmed that the alliteration and habitat-match rescue introductions retain their single optional Nutty direction, large visual choices, and clear child guidance while nonessential animation is suppressed.
- Direct Team Rescue completion with `reduceMotion=1` confirmed its two large actions, optional Nutty direction, empathy-centered acknowledgement, and local keepsake success path remain fully interactive and readable in the static low-motion mode.

## Syllable and Weather Expansion Verification
- Direct browser interaction verified the new picture-led syllable rescue: after the existing rescue introduction closes, it presents a single optional Nutty direction and three large turtle, butterfly, and bee picture choices. A butterfly tap gives the gentle retry text “That name has a different number of claps. Let’s say it slowly together,” while turtle produces the calm “Tur-tle! Two claps” success response and the ordinary rescue thank-you overlay.
- Direct browser interaction verified Spring sprinkle’s locked two-step flow: the leafy umbrella changes to a readable completion acknowledgement before the happy-puddle action becomes available. Completing both reveals the weather-helper thank-you card, and “Keep this weather wonder” returns to the fully rendered 3D camp with the new Weather button still reachable.
- Direct Winter glow inspection and interaction confirmed that the selected seasonal content changes to the lantern and warm-den steps. The lantern must be completed before the den action unlocks, and the final card gives a winter-specific, calm thank-you message.
- Direct Parent Settings interaction switched off “Offer spoken directions.” Reopening Spring sprinkle then removed the “Hear directions” control while retaining the concise visual “Try this” caption, its first active large target, and its locked second target.
- Direct reduced-motion previews confirmed both Winter glow and the syllable-clapping rescue remain readable and fully usable with their same large, ordered touch targets and caption-only direction treatment. The blank mobile screenshot batch was treated as a known capture-timing artifact and was superseded by direct route inspection; it was not used as validation evidence.
