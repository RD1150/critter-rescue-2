# Critter Rescue — Pre-Beta Data-Flow and Vendor Register

**Prepared:** October 5, 2026
**Scope:** Current source branch and planned free, closed iOS/Android beta
**Status:** Technical inventory, not legal advice or a completed store declaration

> **Product rule:** Critter Rescue is a local-first preschool game. It does not create child accounts or profiles, request child names or contact details, accept photos or voice recordings, use child-facing advertising or purchases, or transmit gameplay progress to the project server.

## Decision summary

| Area | Current technical finding | Pre-beta decision |
| --- | --- | --- |
| Child personal data | No child-data input surface found in the shipped game flow. | Keep this prohibition. Do not add accounts, uploads, recordings, chat, sharing, cloud saves, or generative child input without a fresh review. |
| Game progress and preferences | Stored locally on the current device/browser only. The unused pseudo-device ID was removed from source on October 5, 2026. | Do not describe the game as cross-device or cloud-synced. Clearing app/browser data or uninstalling can erase progress. |
| Remote game media | Art and pre-generated audio are requested from `/manus-storage/...`; 166 current source references were found. | State that some art/audio may need an internet connection. Do **not** claim complete airplane-mode media availability. |
| Adult support | Parent-gated contact form sends adult email, selected category, and message to the server database. | Keep it adult-only, minimum-data, and schedule records for automatic deletion after 30 days. Verify it in production before beta invitations. |
| Tracking and ads | No active analytics tag, advertising SDK, crash SDK, Google Font request, or ad-ID use was found in the shipped runtime source. | Do not add analytics, ads, pixels, remarketing, or third-party child profiling to the beta. |
| Native wrapper | Capacitor bundles the core UI locally; native-mode Babylon is bundled locally. | This supports local core UI/state, but does not make remote art/audio offline. |

## Source-backed data-flow inventory

| Flow | Data categories | Origin → destination | Purpose | Persistence | Child-facing? | Current safeguards / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Core game state | Selected companion, non-identifying rescue/care progress, game choices, locally generated keepsake details, local activity summaries | Device/app local storage only | Continue play on the same device | Until a parent clears app/browser data or uninstalls | Yes | `client/src/game/store.ts`; no application API call reads or sends this state. |
| Accessibility and sound preferences | Voice/sound volume, captions, Reduce Motion, visual themes, parent-set learning/play preferences | Device/app local storage only | Remember family settings | Until local data is cleared/reset | Parent-controlled | `client/src/game/audioPreferences.ts`. |
| Local builds and parent prompts | Child-safe build name/layout; parent-authored prompt text and enabled state | Device/app local storage only | Save local creative work and parent-selected ideas | Until removed/cleared locally | Builds: yes; prompts: parent-controlled | `creativeBlockCreations.ts` and `parentBuildPrompts.ts`; no uploads. |
| Parental-gate session | A short expiry timestamp only | Browser/app session storage only | Hold a 15-minute adult session after math gate | Ends on expiry, lock, or session clear | No | `client/src/game/parentalGate.ts`; no identity or answer is stored. |
| Optional adult contact | Adult email; category (`support`, `bug`, or `suggestion`); free-form parent message; transient request IP for throttle | Parent-gated form → `POST /api/parent-contact` → project MySQL table | Adult support, bug reports, and beta ideas | Scheduled for automatic deletion after 30 days; in-memory throttle is temporary | No | Client/server validation; child-data warning; honeypot; 10 KB body limit; 60-second IP throttle; 30-day scheduled purge. See `ParentContactModal.tsx`, `server/index.ts`, `server/betaFeedback.ts`. |
| Hosted art/audio/logo | Ordinary request metadata handled by the hosting path; no form data in asset URL | App/browser → project host and `/manus-storage` media delivery | Display pre-generated art, logo, voice, and sound assets | Not retained by game code; hosting/CDN logging practices require vendor confirmation | Yes | Static source references only. Some media may be unavailable offline. |
| Web-only 3D engine | Ordinary request metadata handled by CDN | Browser web build → jsDelivr Babylon script | Load 3D engine on the standard web build | No application persistence | Yes on web | `client/src/lib/babylonRuntime.ts`. Native build does **not** use this CDN; it bundles Babylon locally. |
| Production static host/server | Standard infrastructure request metadata may be handled by the deployment host | Device/app → Critter Rescue HTTPS origin | Serve app shell, parent contact API, and hosted assets | Not determined from application source | Yes | Application source does not add analytics or a client identifier. Confirm host logs, retention, subprocessors, and region before declaring final store answers. |
| Development-only diagnostics | Browser console/network/session debug payloads | Local Vite development process → ignored `.manus-logs/` workspace files | Development troubleshooting only | Local development files, size-trimmed | No production use | `vite.config.ts` injects the collector only outside production. It is not part of the production HTML path. |

## Local storage keys

| Key | Purpose | Data category | Sent to project server? |
| --- | --- | --- | --- |
| `critter_rescue_v1` | Game state and locally generated in-game keepsakes/activity summaries | Local gameplay content; no direct child identity field | No |
| `critter-rescue-audio-preferences` | Accessibility, audio, theme, and parent-play preferences | Local preferences | No |
| `critter-rescue-creative-block-builds` | Saved 3×3 block layouts and local build name | Local creation content | No |
| `critter-rescue-parent-build-prompts` | Parent-authored child-safe prompt text and selection state | Parent-entered local text | No |
| `critter-rescue-parent-gate-expires-at` (session storage) | Parent-gate session expiry | Timestamp only | No |
| `theme` | Dormant UI-theme module key; not part of the game state model | Local UI preference if legacy module is mounted | No |

## Confirmed exclusions in current runtime source

The following are not present in the shipped gameplay path as of this audit:

- Child registration, login, account recovery, cloud saves, or cross-device profile sync.
- Child name, date of birth, contact, location, contact-book, camera, photo, microphone, or voice-recording fields.
- Advertising SDKs, advertising identifiers, pixels, behavioral analytics, retargeting, social sharing, child chat, or public leaderboards.
- Real-time AI prompts or AI-generated child content during play.
- Google Maps calls or an active map component in the game flow. The unused Map component and Google Maps type dependency are removed as part of this package.
- External web-font requests in the shipped `client/index.html`.

## Vendors and services requiring release confirmation

| Service category | Known role | Is it in the player data path? | What must be confirmed before store submission |
| --- | --- | --- | --- |
| Manus/web deployment provider | Hosts the HTTPS game origin and server | Yes | Production access-log fields, retention, region, security controls, subprocessors, and whether contact-service database backups carry the 30-day deletion window. |
| Manus storage/media delivery | Delivers referenced art/audio/logo media | Yes | Logging/retention and subprocessor details, asset ownership, and whether remote media can be independently moved to release-controlled storage. |
| MySQL contact database | Stores adult support form rows | Yes, adult-only | Access limited to named operator(s), encrypted connection/at-rest posture, backup retention, and verified 30-day purge behavior. |
| jsDelivr | Loads Babylon engine only in standard web builds | Yes, web only | CDN request logging/privacy terms and whether the web app will remain distributed outside the native beta. Native build bundles Babylon instead. |
| Apple App Store / TestFlight | TestFlight distribution, crash/reporting behavior governed by Apple | Planned | Complete App Store Connect privacy/review information based on actual build and Apple-provided services. |
| Google Play / Play Console | Closed-test distribution and store disclosures | Planned | Complete account verification, Data Safety, target-audience, and Families declarations based on actual `.aab` and Google-provided services. |

## Risk controls required for the closed beta

1. **Free beta, no monetization:** no subscription, in-app purchase, restore purchase, paywall, or child-facing commercial prompt.
2. **Access control:** only the owner and a minimal trusted support group may access adult contact records.
3. **Retention:** automated database cleanup is scheduled at startup and every 24 hours for records older than 30 days; verify its deployed behavior before inviting testers. Avoid manual exports, screenshots, mailbox copies, or downloads; if any are necessary to answer a request, delete them on the same 30-day schedule.
4. **Support address:** before external beta, publish a monitored adult support/privacy email and a simple deletion-request workflow. Do not promise a deletion request channel until it exists.
5. **Hosting evidence:** obtain the host/storage provider’s current privacy, logging, and data-processing information. Do not mark App Privacy/Data Safety as “no data collected” until access-log and infrastructure handling are confirmed.
6. **No feature creep:** any future analytics, crash tool, payment SDK, cloud backup, social feature, upload, AI feature, or third-party SDK triggers a new register and disclosure review.
7. **Asset proof:** complete the asset-rights register before a public build; every image, voice, sound, font, and code dependency needs a traceable commercial-use basis.

## Evidence and limitations

This register is based on static source inspection and a live development-preview resource-origin check on October 5, 2026. The public Privacy page loaded resources only from the Critter Rescue preview origin. The first child entry loaded the preview origin and `cdn.jsdelivr.net`, consistent with the web-only Babylon runtime. No advertising or analytics origin was observed in those checks. This is not proof of third-party infrastructure behavior or a substitute for signed-device/production verification.

Recheck the register after the iOS and Android native projects are generated, after any dependency upgrade, and before each production-store submission.

> **Do not use this document to claim “COPPA certified,” “fully offline,” “no data is ever processed,” or “no data collected” without completing the vendor and deployment confirmations above.**
