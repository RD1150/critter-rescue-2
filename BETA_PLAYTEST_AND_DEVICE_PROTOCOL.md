# Critter Rescue — Caregiver Playtest and Signed-Device Protocol

**Status:** Prepared for the next beta; **not yet performed**. This record does not certify a legal review, a signed build, physical-device performance, or child testing.

## Purpose

Validate whether the core rescue path is clear and comfortable for preschoolers while preserving Critter Rescue's privacy-first boundaries:

- ages 3–6, with a range of reading comfort;
- no child accounts, names, photos, recordings, or behavioral analytics;
- no scores, leaderboards, timers, failure screens, advertising, child-directed commerce, or renewal pressure;
- a parent/caregiver remains present and gives consent.

## Before inviting families

1. Build an unsigned internal test or signed TestFlight / Google Play closed-beta build only after the native-release prerequisites are complete.
2. Give each caregiver the public Privacy Policy, Terms, and Parent FAQ links before installation.
3. Tell caregivers not to send the child’s name, photo, voice, device identifier, or a screen recording containing personal information.
4. Ask caregivers to give feedback only as an adult: broad age band (`3–4`, `5–6`), device family, optional accessibility settings used, and anonymous observations.
5. Keep any adult feedback in the existing rate-limited parent-contact workflow and apply its documented retention rule.

## Five short caregiver-child sessions

Target **5–8 voluntary caregiver-child sessions**. Stop a session immediately if the child seems uncomfortable, wants to stop, or the caregiver asks to stop. There is no right answer and no need for the child to finish anything.

| Segment | Caregiver prompt | Observe, without recording child data | Success signal |
| --- | --- | --- | --- |
| Arrival | “What do you think we can do here?” | Does the child notice the large **Help a friend** action? | Child starts or points to the rescue path without an adult explaining menus. |
| Rescue direction | “What do these pictures show?” | Does the child use the picture cue, Listen, captions, or adult co-play? | The next action is understood without repeated adult verbal explanation. |
| Care play | “Which tool belongs here?” | Does the child distinguish pick-up and use actions in brush, nest, water, or acorn play? | The child recognizes a visible cause-and-effect change. |
| Comfort | Offer optional audio, captions, and Reduce Motion | Any sound surprise, visual overload, small target, or unclear copy? | Controls remain optional, calm, and reachable. |
| Parent boundary | Caregiver alone opens Parent Settings and returns | Is the short math gate understandable and does it return safely? | Child-facing play stays separate from adult tools. |

### Adult feedback form (no child data)

Use these prompts only:

1. Did your child find the first rescue action? **Yes / needed one prompt / needed several prompts**
2. Which prompt worked best? **Pictures / spoken directions / text with adult / none**
3. Was any screen confusing, too busy, too quiet, too loud, or difficult to tap?
4. Which activity did your child choose again, if any?
5. What is one change that would make shared play calmer or clearer?

Do **not** request a child’s identity, age in months, email, voice, image, school, location, diagnosis, or free-form personal story.

## Signed iOS and Android smoke record

This section is deliberately incomplete until a release owner tests actual signed builds on physical devices.

| Device | Signed build version | Online result | Airplane-mode result | Reviewer/date | Notes |
| --- | --- | --- | --- | --- | --- |
| iPhone / iPad | _pending_ | _pending_ | _pending_ | _pending_ | _pending_ |
| Android phone / tablet | _pending_ | _pending_ | _pending_ | _pending_ | _pending_ |

For each device, verify:

1. App opens and child entry reaches Camp.
2. The large **Help a friend** route launches and completes a rescue.
3. Core local progress remains after close/reopen.
4. Care Play, Care Pair Picnic, and parent math gate can be reached.
5. Optional audio respects the saved preference; Reduce Motion remains static and readable.
6. Privacy, Terms, and FAQ direct routes open.
7. Parent contact validation and rate-limit behavior operate only with adult-provided test data.
8. In airplane mode, local UI/progress still work; remote `/manus-storage` art/audio may degrade as already documented. Record the actual result rather than promising full remote-media availability.

## Exit criteria

- Fix any repeated first-path, direction, target-size, sensory-comfort, or gate-clarity issue before expanding the beta.
- Keep this checklist **open** until both physical-device rows are completed with real signed builds.
- A caregiver test is usability feedback, not a substitute for COPPA/privacy counsel, an accessibility audit, store review, or legal advice.
