# Critter Rescue — Expansion Module Brainstorm

*Prepared alongside the v1.0 build. Each module is self-contained and can be shipped independently.*

---

## 1. Seasonal Events System

**Concept.** A rotating calendar layer that transforms the game world four times a year — Winter Rescue (snow-covered zones, frost puzzles, holiday critters), Spring Bloom (new flower-planting mechanics, migrating birds), Summer Camp (firefly catching, river-swimming mini-games), and Autumn Harvest (gathering acorns, leaf-sorting). Each season unlocks a limited-edition critter that can only be rescued during that window, giving players a reason to return on a schedule and creating natural word-of-mouth moments around real holidays.

**New mechanics.** Seasonal tile variants (snowflakes, petals, embers, acorns) replace standard tiles in the match-3 bonus game. A "Season Pass" progress bar fills as players complete seasonal rescues, unlocking a special animated plush badge for the journal.

**Effort estimate.** Medium — reuses all existing puzzle infrastructure; requires 4 new zone skin packs and ~8 seasonal critters.

---

## 2. Critter Care & Nursery

**Concept.** After a critter is rescued it arrives at the camp in a "recovering" state. Players can visit the Nursery — a dedicated screen — to feed, groom, and play with their rescued friends over time. Each interaction fills a small "wellness meter" unique to that critter. Once fully recovered, the critter graduates to the main camp trail and unlocks a short voiced thank-you message.

**New mechanics.** Tap-to-pet gesture, a drag-to-feed mini-game (matching food items to each critter's preference), and a daily "check-in" reminder. The Nursery also introduces a simple economy: Kindness Coins earned from puzzles can buy special treats that speed recovery.

**Effort estimate.** Medium-high — requires a persistent per-critter state layer and the Nursery UI screen.

---

## 3. Critter Friendship Network

**Concept.** Rescued critters develop relationships with each other over time. The game surfaces these as short illustrated "friendship moments" — Nutty the squirrel shares an acorn with Clover the frog; Shadow the hedgehog curls up next to Summit the bear. Each friendship unlocks a collectible "bond card" in the journal and a small harmony bonus.

**New mechanics.** A relationship graph stored in local state. Friendship events trigger when two compatible critters have both been in camp for a set number of days. Bond cards form a secondary collection layer alongside the main rescue journal.

**Effort estimate.** Low-medium — primarily narrative content and a new journal tab; no new puzzle types required.

---

## 4. Habitat Builder

**Concept.** A light construction layer where players use Kindness Coins to build and upgrade structures in the camp — a cozy burrow for hedgehogs, a lily-pad pond for frogs, a tall oak perch for eagles. Each habitat attracts specific critter types and passively generates a small harmony trickle over time. The camp map visually evolves as habitats are placed, turning it from a bare clearing into a thriving sanctuary.

**New mechanics.** A grid-based placement UI (drag-and-drop tiles onto the camp canvas), a build queue, and an upgrade path (e.g., Small Burrow → Cozy Den → Grand Lodge). Habitats also serve as visual storytelling — players can see their rescued critters actually using the spaces they built.

**Effort estimate.** High — requires a persistent camp map state, a new builder UI, and a set of habitat artwork assets.

---

## 5. Daily Rescue Missions

**Concept.** Each day a new "urgent rescue" appears at the top of the camp screen — a critter in immediate distress with a 24-hour countdown. Completing it awards a bonus harmony multiplier and a rare collectible. If the player misses the window, the critter is "found by another rescuer" (no punishment, just a missed reward), keeping the tone gentle.

**New mechanics.** A server-side (or deterministic seed-based) daily mission generator, a countdown display, and a streak tracker ("3 days in a row!"). The streak system rewards consistent play without punishing breaks.

**Effort estimate.** Low — reuses existing puzzle types; the main work is the daily scheduling logic and streak UI.

---

## 6. Critter Sticker Book & Sharing

**Concept.** Every rescued critter generates a unique illustrated "sticker" — a small portrait of the plush character with their name, zone, and a one-line quote. Players collect stickers in a dedicated album and can export a shareable image of their completed album page to social media. The sticker art is generated from the same plush image assets already in the game, overlaid with a decorative frame.

**New mechanics.** A sticker album UI (grid of portrait cards, empty slots shown as faded outlines), a "Share" button that composites the album page into a PNG download, and rare "foil" sticker variants for completing a full zone.

**Effort estimate.** Low-medium — primarily a new UI screen; the share feature requires canvas compositing.

---

## 7. Multiplayer Co-op Rescue

**Concept.** Two players can join a shared rescue session via a link. One player controls the puzzle (solving the match-3 or drag-drop challenge) while the other plays the "companion role" — tapping encouragement buttons that add bonus moves or boost the wellness bar. The asymmetric roles make co-op accessible for a parent-child pair where the child does the puzzle and the parent cheers.

**New mechanics.** A real-time session code system (WebSocket or WebRTC), a companion action panel (Cheer, Boost, Heal), and a shared progress bar visible to both players. Completing a co-op rescue awards both players a "Together" badge.

**Effort estimate.** High — requires backend infrastructure for real-time sync; best implemented after upgrading to the full-stack template.

---

## 8. Critter Voice & Narration

**Concept.** Each critter's dialogue lines (thanks, encouragement, stuck hints) are read aloud by a warm, age-appropriate synthesized voice. The narration fires automatically during the intro overlay and completion screen, making the game fully accessible for pre-readers and adding emotional depth for all ages.

**New mechanics.** A TTS integration (Web Speech API for zero-cost, or a hosted TTS service for higher quality) triggered by the existing dialogue system. A settings toggle lets players turn narration on or off. The companion also narrates zone descriptions when the player opens the zone selector.

**Effort estimate.** Low — Web Speech API requires no backend; a single `speak(text)` utility wraps the existing dialogue strings.

---

## 9. Rescue Photography Album

**Concept.** After each successful rescue, the game generates a "rescue photo" — a composited scene showing the rescued critter in its zone environment, with the player's companion standing beside it. Photos are stored in a scrollable album and can be downloaded. Over time the album becomes a visual diary of the player's entire rescue journey.

**New mechanics.** A canvas-based photo compositor that layers the zone background, critter image, companion image, and a decorative frame. A "Photo of the Day" feature highlights one rescue photo on the camp screen. Photos can be captioned with the critter's thanks line.

**Effort estimate.** Medium — requires canvas compositing and a photo album UI; no new puzzle logic.

---

## 10. Puzzle Creator Mode

**Concept.** An advanced mode (unlocked after completing all four zones) where players design their own rescue puzzles and share them via a short code. The creator UI exposes a subset of the existing puzzle types — counting, find-tools, sorting, memory — with adjustable difficulty and a custom critter and scenario text. Shared puzzles appear in a "Community Rescues" feed.

**New mechanics.** A drag-and-drop puzzle editor, a puzzle serialization format (compact JSON encoded as a share code), and a community feed backed by a simple read-only API. Completing a community puzzle awards the creator a small harmony bonus.

**Effort estimate.** High — the editor UI is the main investment; the serialization and community feed require backend support.

---

## Priority Matrix

| Module | Player Impact | Dev Effort | Recommended Order |
| --- | --- | --- | --- |
| Daily Rescue Missions | High | Low | **1st** |
| Critter Voice & Narration | High | Low | **2nd** |
| Seasonal Events | Very High | Medium | **3rd** |
| Critter Friendship Network | Medium | Low-Medium | **4th** |
| Critter Sticker Book | Medium | Low-Medium | **5th** |
| Critter Care & Nursery | High | Medium-High | **6th** |
| Rescue Photography Album | Medium | Medium | **7th** |
| Habitat Builder | Very High | High | **8th** |
| Multiplayer Co-op | Very High | High | **9th** |
| Puzzle Creator Mode | Medium | High | **10th** |
