# Critter Rescue: Pre-Signing Code Review

**Review date:** September 16, 2026  
**Scope:** Web release candidate and Capacitor 8 native-wrapper configuration for TestFlight and Google Play closed beta.

> **Result:** The reviewed source and configuration are suitable to proceed to release-machine signing preparation. This is not a substitute for Xcode/Android Studio archive validation, physical-device testing, App Store Connect/Play Console declarations, or legal review.

## Automated validation record

| Check | Result | Evidence |
| --- | --- | --- |
| Unit and component tests | Passed | 68 test files; 119 tests |
| TypeScript | Passed | `pnpm check` |
| Web production build | Passed | `pnpm build` completed in 4.65 seconds after keeping the Babylon engine out of the web bundle |
| Native-mode web bundle | Passed | `pnpm run build:native` packages the local Babylon runtime for offline native camp play |
| Capacitor dependency health | Passed | `pnpm exec cap doctor` reports aligned Capacitor 8.5.2 packages |
| Production dependency audit | Passed | `pnpm audit --prod` reports no known vulnerabilities |
| Source hygiene | Passed | Active-code scan found no retired feedback symbols, analytics tag, Google Font request, Phaser CDN script, score/move-limit language, or web-bundled Babylon engine |
| Live durable media delivery | Passed | Live production origin returned HTTP 200 for the app icon and a Nutty MP3 direction asset |
| Visual smoke check | Passed | Child entry, public Privacy Policy, and parent math gate remained readable on laptop and phone views |

## Findings resolved during this review

| Finding | Resolution | Release impact |
| --- | --- | --- |
| Legacy, unprotected beta-feedback component remained in the tree | Retired the unused component and its test; the gated parent-contact flow is now the only active contact path | Removes duplicate support behavior |
| Direct public legal-page return could bypass its intended parent-access request during loading | Routed all legal-page returns through the math-gate request | Preserves adult-only navigation |
| Parent-contact rate limit could see a shared proxy address in hosted deployments | Configured the Express app to trust one deployment proxy | Improves per-parent throttle behavior |
| Production audit contained avoidable dependency advisories | Removed unused packages and chart code; upgraded Express within v4 and applied verified transitive dependency resolutions | Production audit is clean |
| Analytics and external font requests added avoidable child-data and offline dependencies | Removed the analytics tag and external web-font requests; the UI uses device-available fallbacks | Reduces third-party network requests and improves offline shell resilience |
| Legacy Match-3 used a remote Phaser iframe with score, move-limit, and failure mechanics | Replaced it with local Care Pair Picnic picture matching, including gentle mismatch language and no score, timer, move limit, or failure state | Meets the preschool calm-play requirements and removes the remote Phaser dependency |
| Native local shell still depended on a CDN-loaded Babylon runtime | Split the loader by Vite build mode: web retains the prior lazy CDN strategy, while `--mode native` aliases a local bundled Babylon loader | Native camp engine can start without a CDN request; web build remains deployment-safe |

## Intentional architecture

This beta uses the existing **no-account game runtime**: the client is bundled locally into the Capacitor shell, and the lightweight Express server serves the web build and the math-gated parent-contact endpoint. Template authentication and tRPC files inherited from a prior capability upgrade are not part of the active game runtime or client bundle. The release scripts explicitly build the legacy game server and local Capacitor bundle.

The native interface is local. The Babylon camp runtime is now bundled only in the native build. Durable logo, artwork, and optional pre-generated audio are requested only from the reviewed HTTPS production origin when online. The native shell must therefore be tested both online and in airplane mode: core interface and locally saved creations should remain available, while remotely hosted media may be unavailable until connectivity returns.

## Remaining release-owner checks

| Required before distributing signed binaries | Why it remains outside this source review |
| --- | --- |
| Generate and inspect `ios/` and `android/` projects | Requires the release machine, Xcode, and Android Studio |
| Create certificates, provisioning profiles, keystore or Play App Signing configuration | Credentials must stay outside the repository |
| Perform cold-start online/offline and real-device media tests | Cannot be fully simulated without a generated signed native project and physical devices |
| Confirm production database availability for math-gated parent contact | Requires the deployed environment and monitored operational checks |
| Complete final Privacy Policy and Terms operator/contact/retention/jurisdiction fields | Requires the operator and qualified legal review |
| Complete App Privacy, Data Safety, age-rating, and store-support metadata | Requires current store-console declarations by the release owner |

## Non-blocking follow-up

The web production JavaScript bundle is approximately 1.14 MB before gzip and emits the existing chunk-size advisory. It builds successfully and does not block beta signing, but route-level code splitting should be planned before broad distribution to reduce initial download and cold-start time.

The native bundle includes the local Babylon engine and is approximately 8.85 MB before gzip in its largest emitted JavaScript asset. This is intentional for offline engine availability and does not block a closed beta, but cold-start and install-size testing on target devices are required before public distribution.
