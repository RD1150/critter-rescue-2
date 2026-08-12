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
