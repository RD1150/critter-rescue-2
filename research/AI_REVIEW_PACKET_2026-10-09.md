# Critter Rescue — Independent AI Review Packet

**Prepared:** October 9, 2026
**Purpose:** Give ChatGPT, Claude, and Gemini the same safe context so their critiques can be compared fairly.

## What Critter Rescue is

Critter Rescue is a calm plushie-style preschool game for ages **3–6**. Children rescue, care for, and play with woodland-animal plushies in a gentle 3D sanctuary. It uses React, TypeScript, Babylon.js, local device storage, and a Capacitor mobile wrapper.

The game is designed to feel warm, slow, and storybook-like. It should be understandable to a pre-reader, enjoyable with or without an adult, and respectful of children who prefer less sound or movement.

## Non-negotiable design and privacy constraints

Do not recommend features that violate any of these constraints:

- No ads inside the child game.
- No child accounts, social features, chat, uploads, photographs, recordings, profiles, or child-directed commerce.
- No scores, rankings, streaks, countdowns, move limits, failure screens, or “game over” framing.
- No manipulative rewards, urgency, loot boxes, gambling mechanics, or pressure to purchase.
- Adult settings, contact, legal information, and any future purchases must remain behind a parent gate.
- Progress and preferences are local to the device; do not promise cloud transfer or complete offline media support.
- Spoken directions and audio remain optional. Reduce Motion must keep the same content usable without decorative animation.
- Maintain large touch targets, readable captions, one obvious child action at a time, and a calm plushie/storybook visual style.

## Current experience to review

The game includes a 3D sanctuary, six plush companions, rescue paths, Critter Homes, gentle care actions, Care Pair Picnic matching, phonics, rhymes, syllables, full-hour time play, sorting, weather discovery, animal-home matching, picture-led planning rescues, a Cozy Block Studio, storybook pages, optional sound, seasonal themes, and parent settings.

The latest code is **beta-preparation source**, not a signed or physical-device-tested commercial app. Native signed iOS/Android smoke testing remains incomplete. The payment and entitlement system for a paid base game or optional modules is not yet implemented.

## What to review

Please assess the game as a senior preschool-game designer and product reviewer. Focus on the following questions:

1. What are the three strongest reasons a parent might choose this game over a free early-learning app?
2. What are the three biggest reasons a child ages 3–6 might stop playing or become confused?
3. Which current activities feel duplicative, over-scoped, too advanced, or insufficiently connected to the plushie rescue story?
4. What should become the **core daily play loop** that children naturally repeat?
5. Which one to three improvements would most increase quality before any new feature is added?
6. Are the learning activities appropriate for a mixed 3–6 age range, including advanced 3-year-olds and younger 6-year-olds? Recommend differentiation without scoring, pressure, or a separate “smart kid” track.
7. Are the child flow, parent gate, audio controls, captions, and Reduce Motion approach understandable and accessible?
8. What parent-facing message would most clearly explain the game’s value without making educational, medical, privacy, or safety promises that cannot be proven?
9. Identify any feature that should be simplified, removed, delayed, or moved behind the parent area.
10. Give a prioritized 90-day product roadmap: **must improve before beta**, **test in beta**, and **build only after beta evidence**.

## Required answer format

Return:

- A short overall verdict: **ready for limited caregiver beta / needs focused improvement first**.
- The five most important observations, ranked by expected impact.
- A table with: issue or opportunity, why it matters, recommended change, child-safety/privacy risk, and priority.
- A list of no more than five new feature ideas. Each must satisfy the constraints above and explain why it improves the rescue-and-care core loop rather than adding more menu clutter.
- Separate **observations** from **assumptions** and **recommendations**.
- Do not claim that the game is legally compliant, COPPA-certified, fully offline, clinically beneficial, or guaranteed to teach skills.

## Reviewer-specific emphasis

### Prompt for ChatGPT

> Review Critter Rescue as a preschool-game product strategist. Focus on clarity of the product promise, parent willingness to pay, whether the activity library is coherent, and how to make the game feel like one memorable rescue world instead of many disconnected educational mini-games. Follow the required answer format above.

### Prompt for Claude

> Review Critter Rescue as a child-centered game designer and senior software reviewer. Focus on child flow, accessibility, complexity, feature sprawl, architectural risks from a broad activity library, and the smallest changes with the highest improvement value. Follow the required answer format above.

### Prompt for Gemini

> Review Critter Rescue as a visual game UX reviewer. Inspect the supplied screenshots, the live web experience if available, and the source overview. Focus on visual hierarchy, age-appropriate interactions, touch-target clarity, 3D plushie appeal, and whether adult-facing information stays distinct from child play. Follow the required answer format above.

## Safe materials to share

Share the review ZIP created with this brief. It contains the selected source and product documents needed for a product critique. It intentionally excludes:

- `.env` files and credentials;
- signing certificates, keys, passwords, release archives, build output, and `node_modules`;
- parent-contact database records or any user-submitted messages;
- unneeded project infrastructure and local machine files.

You may also share the public game URL with a reviewer if you want live UI feedback. Do not give a reviewer access to any Apple, Google Play, advertising, hosting, database, payment, or source-control account.

## How to use the three critiques

Do not build every suggestion. Compare the replies and mark a recommendation as a likely priority only when it is:

1. consistent with the product constraints;
2. raised by more than one reviewer or clearly supported by direct game evidence;
3. smaller and more valuable than adding another activity; and
4. testable with a caregiver beta.

The final decision should come from actual caregiver-and-child beta observation, not from any model’s opinion.
