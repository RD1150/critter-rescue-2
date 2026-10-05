# Critter Rescue — Asset Rights Register Template

**Purpose:** Complete this register before external beta distribution and public-store submission. Keep source licenses, generation records, vendor receipts, and permission emails outside the repository when they include personal or billing data.

> Do not ship an asset because it is visually present in `/manus-storage` or a development workspace. Each asset needs a documented commercial-use basis and any required attribution.

## Completion rules

1. Assign an owner and evidence link/reference for every row.
2. Record the actual source, not a vague label such as “online image.”
3. Confirm commercial/mobile-app/store-listing rights, territory, duration, exclusivity limits, and attribution requirements.
4. Treat AI-generated outputs as assets requiring records of the generation tool, terms in force at generation, prompt/source-material review, and any human edits.
5. Verify that voices, sound effects, and music do not use an unlicensed performer, protected character, or disallowed voice clone.
6. Recheck third-party code licenses and the platform/SDK terms for the exact shipped version.
7. Use the final row below as a release sign-off only after all open rows are cleared.

## Asset inventory register

| ID / filename or group | Type | Where used | Source / generator | Commercial-use evidence | Attribution required? | Owner / status | Notes / restrictions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `game-logo_a4abbdba.png` | Logo/art | Boot screen, app favicon | `[COMPLETE]` | `[LINK/REFERENCE]` | `[YES/NO]` | `[OWNER / OPEN]` |  |
| `plush-*` assets | Character art group | Critter avatars and game scenes | `[COMPLETE]` | `[LINK/REFERENCE]` | `[YES/NO]` | `[OWNER / OPEN]` | Include every species/file. |
| `critter-rescue-*` visual assets | Environment/prompt/loading art group | Screens, storybook, activities | `[COMPLETE]` | `[LINK/REFERENCE]` | `[YES/NO]` | `[OWNER / OPEN]` | Expand into separate rows if source differs. |
| `*_intro_*`, `*_help_*`, `*_thanks_*`, `direction-*` | Voice assets | Optional tap-to-play spoken direction | `[COMPLETE]` | `[LINK/REFERENCE]` | `[YES/NO]` | `[OWNER / OPEN]` | Record voice provider, voice/license, generation date, and no-cloning authorization. |
| `critter-rescue-*.mp3/.wav` | Music/soundscape | Optional parent-enabled background sound | `[COMPLETE]` | `[LINK/REFERENCE]` | `[YES/NO]` | `[OWNER / OPEN]` | Confirm distribution and synchronization rights. |
| `playCarePairCelebrationSound()` | Synthesized sound | Local Web Audio completion cue | Original code | Source in repository | No | Engineering / verified | Generated locally at runtime; no external audio asset. |
| Babylon.js | Code dependency | 3D camp/nursery | npm package | Apache-2.0 license record | License notice if required | Engineering / verify exact version | Web uses CDN runtime; native bundles package. |
| React, Capacitor, Express, UI packages | Code dependencies | App and native wrapper | `package.json` / lockfile | Dependency license audit | Per license | Engineering / open | Perform final automated license inventory and verify obligations. |
| System/device fonts | Typography | UI | Device OS | Platform terms | No external font attribution expected | Engineering / verify | No external web fonts in shipped HTML. |
| Store screenshots and marketing copy | Marketing asset | App Store/Google Play | Original team work | Working-source record | N/A | Publisher / open | Must accurately depict the shipped product. |

## License/dependency verification log

| Date | Package / asset | Version or asset hash | License / terms checked | Reviewer | Result / follow-up |
| --- | --- | --- | --- | --- | --- |
| `[DATE]` | `[ITEM]` | `[VERSION]` | `[LICENSE/URL]` | `[NAME]` | `[PASS / OPEN]` |

## AI-generated asset record (repeat for each distinct asset batch)

| Field | Record |
| --- | --- |
| Asset batch / filenames | `[COMPLETE]` |
| Tool/model and account owner | `[COMPLETE]` |
| Date generated | `[COMPLETE]` |
| Terms/version reviewed | `[COMPLETE]` |
| Prompt/source references checked for third-party IP | `[COMPLETE]` |
| Human edits | `[COMPLETE]` |
| Commercial/mobile distribution permitted | `[YES/NO + EVIDENCE]` |
| Attribution/label requirement | `[COMPLETE]` |
| Reviewer/sign-off | `[COMPLETE]` |

## Final release sign-off

| Check | Owner | Date | Result |
| --- | --- | --- | --- |
| All shipped visual, voice, audio, and code assets are listed | `[NAME]` | `[DATE]` | `[PASS/OPEN]` |
| Commercial-use basis is saved outside repo for every asset | `[NAME]` | `[DATE]` | `[PASS/OPEN]` |
| Attribution and notices are included where required | `[NAME]` | `[DATE]` | `[PASS/OPEN]` |
| No asset suggests an unlicensed brand, character, performer, or voice clone | `[NAME]` | `[DATE]` | `[PASS/OPEN]` |
| Store media accurately represents the final build | `[NAME]` | `[DATE]` | `[PASS/OPEN]` |
